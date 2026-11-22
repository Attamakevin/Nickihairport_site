import { NextResponse } from "next/server";
import { settleOrder, validSignature } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Paystack -> server. Authenticated ONLY by the HMAC-SHA512 signature of the raw body.
export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 100_000 || !validSignature(raw, req.headers.get("x-paystack-signature"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  try {
    const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
    if (event.event === "charge.success" && event.data?.reference) {
      // settleOrder re-verifies with Paystack and checks amount/currency before marking paid.
      await settleOrder(event.data.reference);
    }
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }
  return new NextResponse("ok", { status: 200 });
}
