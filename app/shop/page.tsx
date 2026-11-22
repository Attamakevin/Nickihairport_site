import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 60;

const SLUG = /^[a-z0-9-]{1,80}$/;

export default async function Shop({ searchParams }: { searchParams: { category?: string; kind?: string } }) {
  const supabase = supabaseServer();
  const { data: cats } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
  const categories = (cats ?? []) as Category[];

  const slug = searchParams.category && SLUG.test(searchParams.category) ? searchParams.category : undefined;
  const kind = searchParams.kind === "care" ? "care" : undefined;
  const active = categories.find((c) => c.slug === slug);

  let query = supabase
    .from("products")
    .select("*, categories!inner(name,slug,kind), product_variants(id,product_id,price_kobo,length_inches,color,label,in_stock)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (active) query = query.eq("category_id", active.id);
  else if (kind) query = query.eq("categories.kind", "care");

  const { data } = await query;
  const products = (data ?? []) as unknown as Product[];
  const heading = active?.name ?? (kind ? "Hair Care" : "All Hair");

  return (
    <div className="container-x py-10 sm:py-14">
      <p className="label">Collection</p>
      <h1 className="font-display text-4xl sm:text-5xl"><span className="gold-text italic">{heading}</span></h1>
      {active?.description && <p className="mt-3 max-w-2xl text-white/65">{active.description}</p>}

      <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="navigation" aria-label="Categories">
        <Link href="/shop" className={`chip whitespace-nowrap ${!active && !kind ? "chip-active" : ""}`}>All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/shop?category=${c.slug}`} className={`chip whitespace-nowrap ${active?.id === c.id ? "chip-active" : ""}`}>
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="card mt-10 p-10 text-center text-white/60">Nothing here yet. Check back soon or message us on WhatsApp.</div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
