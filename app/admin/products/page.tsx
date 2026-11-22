import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";
import { priceRange } from "@/lib/format";
import type { Product } from "@/lib/types";

export default async function ProductsAdmin() {
  const ctx = await requireAdmin();
  if (!ctx) redirect("/admin/login");
  const { data } = await ctx.supabase
    .from("products")
    .select("id,name,slug,is_active,is_featured,images,categories(name,slug,kind),product_variants(id,price_kobo)")
    .order("created_at", { ascending: false });
  const products = (data ?? []) as unknown as Product[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl"><span className="gold-text italic">Products</span></h1>
        <Link href="/admin/products/new" className="btn btn-gold">+ Add product</Link>
      </div>
      {products.length === 0 ? (
        <div className="card p-10 text-center text-white/60">No products yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-gold-200/80">
              <tr><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Prices</th><th className="p-4">Status</th><th className="p-4" /></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-4">{p.name}{p.is_featured && <span className="ml-2 text-gold-300">★</span>}</td>
                  <td className="p-4 text-white/65">{p.categories?.name}</td>
                  <td className="p-4 text-white/65">{priceRange(p.product_variants) ?? "—"}</td>
                  <td className="p-4">{p.is_active ? "Visible" : <span className="text-white/40">Hidden</span>}</td>
                  <td className="p-4 text-right"><Link className="text-gold-300 hover:underline" href={`/admin/products/${p.id}`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
