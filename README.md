# Nicki Hairport – Online Store

Next.js 14 (App Router) · Supabase (Postgres, Auth, Storage) · Paystack · Tailwind CSS
Hosting: **Vercel (free)** + **Supabase (free)**. Brand colours: gold, black, white.

## Features
- Storefront: home, shop with category filter, product page with **length / colour / size price picker**, cart, checkout
- Categories managed by admin (Bone Straight, Pixel Curls, Body Wave, Deep Wave, Burmese Curls, **Hair Care**, plus any you add)
- Floating **WhatsApp chat button** (opens chat with 0806 984 8955)
- Paystack payments with server-side price calculation and verified webhook
- Admin dashboard: secure login, categories, products (multi-image upload), price options per length/colour, orders

## 1. Supabase setup (5 min)
1. Create a project at supabase.com.
2. **SQL Editor** → paste and run `supabase/schema.sql` (tables, RLS policies, image bucket, starter categories).
3. **Authentication → Providers → Email**: turn **off** "Allow new users to sign up" (so nobody can self-register). Turn on leaked-password protection and set min password length 12.
4. **Authentication → Users → Add user**: create the owner login (email + strong password).
5. Grant admin rights (SQL Editor):
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'OWNER_EMAIL';
   ```
6. **Project Settings → API**: copy the URL, anon key and service_role key.

## 2. Local run
```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev                  # http://localhost:3000  (admin: /admin)
```

## 3. Paystack
1. Dashboard → Settings → API Keys: copy the **secret key** (`sk_test_…` first, `sk_live_…` after go-live).
2. Settings → API Keys & Webhooks → set **Webhook URL** to `https://YOUR-DOMAIN/api/paystack/webhook`.
3. Optional: set `DELIVERY_FEE_NGN` to add a flat delivery fee to every order.

## 4. Deploy to Vercel
1. Push this folder to GitHub, import it in Vercel.
2. Add all variables from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to your live URL).
3. Deploy. Add a custom domain in Vercel → Domains.

## Security architecture
| Threat | Defence |
|---|---|
| Unauthorised admin access | Supabase Auth + `admins` allow-list; middleware gates `/admin/*`; every server action and page re-checks `is_admin()`; sign-ups disabled |
| Data theft / tampering via API | **Row Level Security** on every table; public can only read active catalogue; orders unreadable to public; image bucket writable by admin only |
| Price manipulation | Browser sends only variant IDs + quantities; server recomputes totals from the database |
| Fake payment confirmation | Webhook verified by HMAC-SHA512 signature (timing-safe); amount + currency re-checked against the stored order and re-verified with Paystack; idempotent |
| Brute force | Per-IP and per-email login throttling, generic error messages; Supabase Auth rate limits |
| XSS / clickjacking / injection | Strict CSP, X-Frame-Options DENY, HSTS, nosniff, Permissions-Policy; React escaping; zod validation; parameterised queries via Supabase |
| Secret leakage | Service-role and Paystack keys are server-only (`server-only` import); `.env.local` is git-ignored |
| Malicious uploads | MIME allow-list + 5MB limit enforced in browser and bucket; server only accepts URLs from your own bucket |

Recommended extras: enable Vercel Firewall / rate-limit rules on `/api/*` and `/admin/login`, turn on 2FA on Supabase, GitHub, Vercel and Paystack accounts, and never share the service-role key.

## Using the admin
- **Categories**: add, rename, hide or delete. Mark a category *Hair care* for non-hair products.
- **Products**: choose a category, upload images, then add price options. Each row = one length (and optionally colour/size) with its own price. Use the same length with different colours when colour changes the price.
- **Orders**: paid orders appear with customer details and a WhatsApp link; mark them fulfilled or cancelled.
