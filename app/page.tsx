import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";
import { SITE } from "@/lib/config";
import type { Category, Product } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const supabase = supabaseServer();
  const [{ data: cats }, { data: featured }] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    supabase
      .from("products")
      .select("*, categories(name,slug,kind), product_variants(id,price_kobo,length_inches,color,label,in_stock,product_id)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <>
      <Hero />

      <section className="container-x mt-20">
        <h2 className="font-display text-3xl sm:text-4xl">Shop by <span className="gold-text italic">texture</span></h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(cats as Category[] | null)?.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="card group p-5 text-center transition hover:border-gold-400 hover:shadow-gold">
              <span className="font-display text-lg group-hover:text-gold-300">{c.name}</span>
              {c.kind === "care" && <span className="mt-1 block text-[11px] uppercase tracking-wider text-gold-400">Care</span>}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x mt-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl sm:text-4xl">Featured <span className="gold-text italic">pieces</span></h2>
          <Link href="/shop" className="text-sm text-gold-300 hover:underline">View all →</Link>
        </div>
        {featured && featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(featured as Product[]).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="mt-8 text-white/60">New arrivals are being added. Chat with us on WhatsApp to see what is in stock.</p>
        )}
      </section>

      <section id="about" className="container-x mt-24">
        <div className="card grid gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="label">About us</p>
            <h2 className="font-display text-3xl sm:text-4xl">Home of quality & <span className="gold-text italic">reliable hair</span></h2>
          </div>
          <p className="text-white/70">
            Nicki Hairport is Abuja&apos;s home for dealers of all raw donor hair. Visit us at {SITE.address}, or order online and
            we will deliver. Every unit is carefully selected so you get hair that lasts, looks natural and makes you feel unstoppable.
          </p>
        </div>
      </section>
    </>
  );
}
