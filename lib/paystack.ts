import "server-only";
import crypto from "crypto";
import { supabaseAdminService } from "./supabase-server";

const BASE = "https://api.paystack.co";
const secret = () => {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return k;
};

export const REFERENCE_RE = /^NHP-[A-Za-z0-9-]{8,60}$/;

export async function paystackInitialize(args: { email: string; amountKobo: number; reference: string; callbackUrl: string; name: string }) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      currency: "NGN",
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: { customer_name: args.name },
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) throw new Error(json?.message ?? "Paystack initialize failed");
  return json.data as { authorization_url: string; access_code: string; reference: string };
}

export async function paystackVerify(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) return null;
  return json.data as { status: string; amount: number; currency: string; reference: string };
}

export function validSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Idempotently settle an order from Paystack's verified data.
 * Never trusts the client: amount and currency must match what we stored server-side.
 */
export async function settleOrder(reference: string) {
  if (!REFERENCE_RE.test(reference)) return null;
  const db = supabaseAdminService();
  const { data: order } = await db.from("orders").select("id,reference,status,total_kobo").eq("reference", reference).maybeSingle();
  if (!order) return null;
  if (order.status !== "pending") return { status: order.status as string, total_kobo: order.total_kobo as number, reference };

  const tx = await paystackVerify(reference);
  if (!tx) return { status: "pending", total_kobo: order.total_kobo as number, reference };

  if (tx.status === "success" && tx.amount === order.total_kobo && tx.currency === "NGN") {
    await db.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", order.id).eq("status", "pending");
    return { status: "paid", total_kobo: order.total_kobo as number, reference };
  }
  if (tx.status === "failed" || tx.status === "abandoned") {
    await db.from("orders").update({ status: "failed" }).eq("id", order.id).eq("status", "pending");
    return { status: "failed", total_kobo: order.total_kobo as number, reference };
  }
  return { status: "pending", total_kobo: order.total_kobo as number, reference };
}
