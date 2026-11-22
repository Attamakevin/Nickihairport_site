import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { formatNaira } from "@/lib/format";

export default async function Dashboard() {
  const ctx = await requireAdmin();
  if (!ctx) redirect("/admin/login");
  const sb = ctx.supabase;
  const [p, c, o, paid] = await Promise.all([
    sb.from("products").select("id", { count: "exact", head: true }),
    sb.from("categories").select("id", { count: "exact", head: true }),
    sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    sb.from("orders").select("total_kobo").in("status", ["paid", "fulfilled"]),
  ]);
  const revenue = (paid.data ?? []).reduce((s, r) => s + Number(r.total_kobo), 0);

  const stats = [
    ["Products", p.count ?? 0, "/admin/products"],
    ["Categories", c.count ?? 0, "/admin/categories"],
    ["Orders to fulfil", o.count ?? 0, "/admin/orders"],
    ["Revenue", formatNaira(revenue), "/admin/orders"],
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl"><span className="gold-text italic">Dashboard</span></h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([l, v, h]) => (
          <Link key={l} href={h} className="card p-6 transition hover:border-gold-400">
            <p className="label">{l}</p>
            <p className="font-display text-3xl">{v}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn btn-gold">+ Add product</Link>
        <Link href="/admin/categories" className="btn btn-outline">Manage categories</Link>
      </div>
    </div>
  );
}
