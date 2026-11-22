import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { priceRange } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  const range = priceRange(product.product_variants);
  return (
    <Link href={`/product/${product.slug}`} className="group card block overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-gold">
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-600">
        {img ? (
          <Image src={img} alt={product.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-4xl italic text-gold-500/40">Nicki</div>
        )}
        {product.categories?.name && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] uppercase tracking-wider text-gold-200 backdrop-blur">
            {product.categories.name}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-display text-lg">{product.name}</h3>
        <p className="mt-1 text-sm text-gold-300">{range ? `From ${range.split(" – ")[0]}` : "Price on request"}</p>
      </div>
    </Link>
  );
}
