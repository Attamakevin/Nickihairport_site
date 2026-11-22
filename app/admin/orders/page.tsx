import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";
import { formatNaira, variantLabel } from "@/lib/format";
import OrderActions from "@/components/admin/OrderActions";
import type { Order } from "@/lib/types";

const badge: Record<string, string> = {
  pending: "bg-white/10 text-white/60",
  paid: "bg-gold-500/20 text-gold-200",
  fulfilled: "bg-emerald-500/20 text-emerald-300",
  failed: "bg-red-500/15 text-red-300",
  cancelled: "bg-red-500/15 text-red-300",
};

export default async function OrdersAdmin() {
  const ctx = await requireAdmin();
  if (!ctx) redirect("/admin/login");
  const { data } = await ctx.supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(100);
  const orders = (data ?? []) as Order[];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl"><span className="gold-text italic">Orders</span></h1>
      {orders.length === 0 ? (
        <div className="card p-10 text-center text-white/60">No orders yet.</div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-gold-200">{o.reference}</p>
                  <p className="mt-1 font-medium">{o.customer_name} · <a className="text-gold-300 hover:underline" href={`https://wa.me/${o.phone.replace(/\D/g, "").replace(/^0/, "234")}`} target="_blank" rel="noopener noreferrer">{o.phone}</a></p>
                  <p className="text-sm text-white/55">{o.email}</p>
                  <p className="text-sm text-white/55">{o.address}, {o.city}, {o.state}</p>
                  {o.note && <p className="mt-1 text-sm italic text-white/45">“{o.note}”</p>}
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider ${badge[o.status]}`}>{o.status}</span>
                  <p className="mt-2 font-display text-2xl">{formatNaira(o.total_kobo)}</p>
                  <p className="text-xs text-white/40">{new Date(o.created_at).toLocaleString("en-NG")}</p>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-white/5 border-t border-white/10 text-sm">
                {o.order_items?.map((i) => (
                  <li key={i.id} className="flex justify-between py-2">
                    <span>{i.product_name} <span className="text-white/50">· {variantLabel(i)} × {i.quantity}</span></span>
                    <span>{formatNaira(i.unit_price_kobo * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3"><OrderActions id={o.id} status={o.status} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
