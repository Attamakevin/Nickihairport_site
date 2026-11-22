import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { supabaseAdminService } from "@/lib/supabase-server";
import { paystackInitialize } from "@/lib/paystack";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { DELIVERY_FEE_KOBO, SITE } from "@/lib/config";

export const runtime = "nodejs";

const clean = (max: number) => z.string().trim().min(1).max(max);
const Body = z.object({
  customer: z.object({
    name: clean(120).min(2),
    email: z.string().trim().toLowerCase().email().max(200),
    phone: z.string().trim().regex(/^[0-9+\s()-]{7,20}$/, "Invalid phone number"),
    address: clean(400),
    city: clean(80),
    state: clean(80),
    note: z.string().trim().max(500).optional(),
  }),
  items: z.array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(20) })).min(1).max(50),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`checkout:${ip}`, 10, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  if (req.headers.get("content-length") && Number(req.headers.get("content-length")) > 50_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  const { customer, items } = parsed.data;

  // Merge duplicate variant lines
  const qtyByVariant = new Map<string, number>();
  for (const i of items) qtyByVariant.set(i.variantId, Math.min(20, (qtyByVariant.get(i.variantId) ?? 0) + i.quantity));

  const db = supabaseAdminService();
  // Prices ALWAYS come from the database, never from the browser.
  const { data: variants, error } = await db
    .from("product_variants")
    .select("id,price_kobo,length_inches,color,label,in_stock,products!inner(name,is_active)")
    .in("id", Array.from(qtyByVariant.keys()));
  if (error) return NextResponse.json({ error: "Could not load products" }, { status: 500 });

  type Row = { id: string; price_kobo: number; length_inches: number | null; color: string | null; label: string | null; in_stock: boolean; products: { name: string; is_active: boolean } | { name: string; is_active: boolean }[] };
  const rows = (variants ?? []) as unknown as Row[];
  const lines = [];
  let subtotal = 0;
  for (const id of qtyByVariant.keys()) {
    const v = rows.find((r) => r.id === id);
    const product = v ? (Array.isArray(v.products) ? v.products[0] : v.products) : null;
    if (!v || !product?.is_active || !v.in_stock) {
      return NextResponse.json({ error: "An item in your cart is no longer available. Please review your cart." }, { status: 409 });
    }
    const quantity = qtyByVariant.get(id)!;
    subtotal += Number(v.price_kobo) * quantity;
    lines.push({ variant_id: v.id, product_name: product.name, length_inches: v.length_inches, color: v.color, label: v.label, unit_price_kobo: Number(v.price_kobo), quantity });
  }
  const total = subtotal + DELIVERY_FEE_KOBO;
  const reference = `NHP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({
      reference,
      customer_name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      note: customer.note ?? null,
      subtotal_kobo: subtotal,
      delivery_kobo: DELIVERY_FEE_KOBO,
      total_kobo: total,
    })
    .select("id")
    .single();
  if (orderErr || !order) return NextResponse.json({ error: "Could not create order" }, { status: 500 });

  const { error: itemsErr } = await db.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsErr) {
    await db.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  try {
    const init = await paystackInitialize({
      email: customer.email,
      amountKobo: total,
      reference,
      callbackUrl: `${SITE.url}/order/success`,
      name: customer.name,
    });
    return NextResponse.json({ url: init.authorization_url });
  } catch {
    await db.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
  }
}
