import Link from "next/link";
import type { Metadata } from "next";
import { settleOrder } from "@/lib/paystack";
import { formatNaira } from "@/lib/format";
import { whatsappLink } from "@/lib/config";
import ClearCart from "@/components/ClearCart";

export const metadata: Metadata = { title: "Order status", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Success({ searchParams }: { searchParams: { reference?: string; trxref?: string } }) {
  const ref = searchParams.reference ?? searchParams.trxref ?? "";
  const result = await settleOrder(ref);

  const paid = result?.status === "paid" || result?.status === "fulfilled";
  return (
    <div className="container-x py-20 text-center">
      {paid && <ClearCart />}
      <div className="card mx-auto max-w-xl p-10">
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${paid ? "bg-gold-gradient text-black" : "bg-white/10"}`}>{paid ? "✓" : "…"}</div>
        <h1 className="font-display text-3xl">
          {!result ? "Order not found" : paid ? <span className="gold-text italic">Payment received. Thank you!</span> : result.status === "failed" ? "Payment was not completed" : "Payment pending"}
        </h1>
        {result && (
          <p className="mt-3 text-white/60">
            Reference <span className="font-mono text-gold-200">{result.reference}</span> · {formatNaira(result.total_kobo)}
          </p>
        )}
        <p className="mt-4 text-sm text-white/60">
          {paid ? "We will contact you on WhatsApp shortly to confirm delivery." : "If you were debited, don't worry: message us with your reference and we will confirm quickly."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-gold">Continue shopping</Link>
          <a className="btn btn-outline" target="_blank" rel="noopener noreferrer" href={whatsappLink(`Hello Nicki Hairport, my order reference is ${result?.reference ?? ref}.`)}>Message us</a>
        </div>
      </div>
    </div>
  );
}
