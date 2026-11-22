import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import VariantPicker from "@/components/VariantPicker";
import type { Product } from "@/lib/types";

export const revalidate = 60;
const SLUG = /^[a-z0-9-]{1,80}$/;

async function getProduct(slug: string) {
  if (!SLUG.test(slug)) return null;
  const { data } = await supabaseServer()
    .from("products")
    .select("*, categories(name,slug,kind), product_variants(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return (data as unknown as Product) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return { title: "Not found" };
  return { title: p.name, description: p.description?.slice(0, 155) ?? undefined, openGraph: { images: p.images?.[0] ? [p.images[0]] : ["/flyer.jpg"] } };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();
  const variants = [...(p.product_variants ?? [])].sort((a, b) => (a.length_inches ?? 0) - (b.length_inches ?? 0) || a.price_kobo - b.price_kobo);

  return (
    <div className="container-x py-10 sm:py-14">
      <nav className="mb-6 text-sm text-white/50" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-gold-300">Shop</Link> / {p.categories && <Link href={`/shop?category=${p.categories.slug}`} className="hover:text-gold-300">{p.categories.name}</Link>}
      </nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-gold-500/30 bg-ink-600">
            {p.images?.[0] ? (
              <Image src={p.images[0]} alt={p.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-6xl italic text-gold-500/40">Nicki</div>
            )}
          </div>
          {p.images && p.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {p.images.slice(1, 5).map((src, i) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                  <Image src={src} alt={`${p.name} view ${i + 2}`} fill sizes="12vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {p.categories && <p className="label">{p.categories.name}</p>}
          <h1 className="font-display text-4xl sm:text-5xl">{p.name}</h1>
          {p.description && <p className="mt-4 whitespace-pre-line text-white/70">{p.description}</p>}
          <div className="my-8 h-px bg-gradient-to-r from-gold-500/60 to-transparent" />
          <VariantPicker productName={p.name} productSlug={p.slug} image={p.images?.[0] ?? null} variants={variants} />
        </div>
      </div>
    </div>
  );
}
