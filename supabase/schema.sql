-- =====================================================================
-- Nicki Hairport - database schema with Row Level Security
-- Run this whole file in Supabase > SQL Editor.
-- All money is stored in KOBO (1 NGN = 100 kobo) as integers.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Admin allow-list ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Categories (admin-managed) ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 500),
  kind text not null default 'hair' check (kind in ('hair','care')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 4000),
  images text[] not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

-- ---------- Variants: price depends on length and sometimes color ----------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  length_inches int check (length_inches between 1 and 80),
  color text check (char_length(color) <= 40),
  label text check (char_length(label) <= 60),          -- e.g. "250ml" for care products
  price_kobo bigint not null check (price_kobo > 0 and price_kobo < 100000000000),
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists variants_product_idx on public.product_variants(product_id);
create unique index if not exists variants_unique_combo
  on public.product_variants (product_id, coalesce(length_inches,0), lower(coalesce(color,'')), lower(coalesce(label,'')));

-- ---------- Orders (never readable by the public) ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  email text not null check (char_length(email) <= 200),
  phone text not null check (char_length(phone) between 7 and 20),
  address text not null check (char_length(address) <= 400),
  city text not null check (char_length(city) <= 80),
  state text not null check (char_length(state) <= 80),
  note text check (char_length(note) <= 500),
  subtotal_kobo bigint not null check (subtotal_kobo > 0),
  delivery_kobo bigint not null default 0 check (delivery_kobo >= 0),
  total_kobo bigint not null check (total_kobo > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','fulfilled','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders(status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  length_inches int,
  color text,
  label text,
  unit_price_kobo bigint not null check (unit_price_kobo > 0),
  quantity int not null check (quantity between 1 and 20)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- admins: nobody can read/write through the API (managed only in SQL editor)
-- (no policies = no access, except service role which bypasses RLS)

-- categories
create policy "public read active categories" on public.categories
  for select using (is_active or public.is_admin());
create policy "admin insert categories" on public.categories
  for insert with check (public.is_admin());
create policy "admin update categories" on public.categories
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete categories" on public.categories
  for delete using (public.is_admin());

-- products
create policy "public read active products" on public.products
  for select using (is_active or public.is_admin());
create policy "admin insert products" on public.products
  for insert with check (public.is_admin());
create policy "admin update products" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete products" on public.products
  for delete using (public.is_admin());

-- variants
create policy "public read variants of active products" on public.product_variants
  for select using (
    public.is_admin() or exists (
      select 1 from public.products p where p.id = product_id and p.is_active
    )
  );
create policy "admin insert variants" on public.product_variants
  for insert with check (public.is_admin());
create policy "admin update variants" on public.product_variants
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete variants" on public.product_variants
  for delete using (public.is_admin());

-- orders & items: admin read/update only. Inserts happen server-side with the
-- service-role key after prices are recomputed from the database.
create policy "admin read orders" on public.orders
  for select using (public.is_admin());
create policy "admin update orders" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin read order items" on public.order_items
  for select using (public.is_admin());

-- =====================================================================
-- STORAGE: public-read bucket for product images, admin-only writes
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "admin upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin update product images" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "admin delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- =====================================================================
-- STARTER CATEGORIES (admin can add/rename/remove from the dashboard)
-- =====================================================================
insert into public.categories (name, slug, kind, sort_order, description) values
  ('Bone Straight', 'bone-straight', 'hair', 1, 'Silky, sleek bone straight raw donor hair.'),
  ('Pixel Curls', 'pixel-curls', 'hair', 2, 'Defined, bouncy pixel curls with natural movement.'),
  ('Body Wave', 'body-wave', 'hair', 3, 'Luxurious body wave bundles, wigs and closures.'),
  ('Deep Wave', 'deep-wave', 'hair', 4, 'Full, voluminous deep wave texture.'),
  ('Burmese Curls', 'burmese-curls', 'hair', 5, 'Soft, airy Burmese curls.'),
  ('Hair Care', 'hair-care', 'care', 99, 'Shampoos, conditioners, oils and tools to keep your hair luxurious.')
on conflict (slug) do nothing;

-- =====================================================================
-- AFTER you sign up your admin user (Supabase > Authentication > Users > Add user),
-- run this ONCE with their email to grant admin rights:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'owner@example.com';
-- =====================================================================
