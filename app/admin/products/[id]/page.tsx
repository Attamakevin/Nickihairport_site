import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category, Product } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProduct({ params }: { params: { id: string } }) {
  const ctx = await requireAdmin();
  if (!ctx) redirect("/admin/login");
  if (!UUID.test(params.id)) notFound();
  const [{ data: product }, { data: cats }] = await Promise.all([
    ctx.supabase.from("products").select("*, product_variants(*)").eq("id", params.id).maybeSingle(),
    ctx.supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl"><span className="gold-text italic">Edit product</span></h1>
      <ProductForm categories={(cats ?? []) as Category[]} product={product as unknown as Product} />
    </div>
  );
}
