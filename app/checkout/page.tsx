"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/format";

export default function Checkout() {
  const { lines, ready, subtotalKobo } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <div className="container-x py-20 text-white/50">Loading…</div>;
  if (lines.length === 0)
    return (
      <div className="container-x py-20 text-center">
        <p className="text-white/60">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-gold mt-6">Shop now</Link>
      </div>
    );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: get("name"), email: get("email"), phone: get("phone"), address: get("address"), city: get("city"), state: get("state"), note: get("note") || undefined },
          items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.error ?? "Something went wrong");
      window.location.href = json.url; // Paystack hosted checkout
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="font-display text-4xl"><span className="gold-text italic">Checkout</span></h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" className="input" /></div>
            <div><label className="label" htmlFor="phone">Phone / WhatsApp</label><input id="phone" name="phone" required type="tel" maxLength={20} autoComplete="tel" className="input" /></div>
          </div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" required type="email" maxLength={200} autoComplete="email" className="input" /></div>
          <div><label className="label" htmlFor="address">Delivery address</label><input id="address" name="address" required maxLength={400} autoComplete="street-address" className="input" /></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="label" htmlFor="city">City</label><input id="city" name="city" required maxLength={80} autoComplete="address-level2" className="input" /></div>
            <div><label className="label" htmlFor="state">State</label><input id="state" name="state" required maxLength={80} autoComplete="address-level1" className="input" /></div>
          </div>
          <div><label className="label" htmlFor="note">Order note (optional)</label><textarea id="note" name="note" rows={3} maxLength={500} className="input" /></div>
          {error && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={loading} className="btn btn-gold w-full">{loading ? "Redirecting to Paystack…" : "Pay with Paystack"}</button>
          <p className="text-center text-xs text-white/40">🔒 Card details are entered on Paystack&apos;s secure page. We never see or store them.</p>
        </form>
        <aside className="card h-fit p-6">
          <h2 className="font-display text-xl">Your order</h2>
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {lines.map((l) => (
              <li key={l.variantId} className="flex justify-between gap-3 py-3">
                <span>{l.productName} <span className="text-white/50">· {l.descriptor} × {l.quantity}</span></span>
                <span className="text-gold-300">{formatNaira(l.unitPriceKobo * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gold-500/30 pt-4 font-medium"><span>Subtotal</span><span className="text-gold-300">{formatNaira(subtotalKobo)}</span></div>
          <p className="mt-2 text-xs text-white/40">Delivery fee, if any, is added automatically and confirmed before payment.</p>
        </aside>
      </div>
    </div>
  );
}
