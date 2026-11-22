"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/format";

export default function CartPage() {
  const { lines, ready, setQty, remove, subtotalKobo } = useCart();
  if (!ready) return <div className="container-x py-20 text-white/50">Loading cart…</div>;

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="font-display text-4xl"><span className="gold-text italic">Your cart</span></h1>
      {lines.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-white/60">Your cart is empty.</p>
          <Link href="/shop" className="btn btn-gold mt-6">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4">
            {lines.map((l) => (
              <li key={l.variantId} className="card flex gap-4 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-600">
                  {l.image && <Image src={l.image} alt={l.productName} fill sizes="96px" className="object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link href={`/product/${l.productSlug}`} className="font-display text-lg hover:text-gold-300">{l.productName}</Link>
                      <p className="text-sm text-white/55">{l.descriptor}</p>
                    </div>
                    <p className="text-gold-300">{formatNaira(l.unitPriceKobo * l.quantity)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-white/15 text-sm">
                      <button className="h-9 w-9" onClick={() => setQty(l.variantId, l.quantity - 1)} aria-label="Decrease">−</button>
                      <span className="w-6 text-center">{l.quantity}</span>
                      <button className="h-9 w-9" onClick={() => setQty(l.variantId, l.quantity + 1)} aria-label="Increase">+</button>
                    </div>
                    <button className="text-sm text-white/50 hover:text-red-400" onClick={() => remove(l.variantId)}>Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="card h-fit p-6">
            <h2 className="font-display text-xl">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-white/60">Subtotal</dt><dd>{formatNaira(subtotalKobo)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/60">Delivery</dt><dd className="text-white/60">Calculated at checkout</dd></div>
            </dl>
            <Link href="/checkout" className="btn btn-gold mt-6 w-full">Checkout securely</Link>
            <p className="mt-3 text-center text-xs text-white/40">Final prices are confirmed on our server at payment.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
