import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/lib/types";

export default async function NewProduct() {
  const ctx = await requireAdmin();
  if (!ctx) redirect("/admin/login");
  const { data } = await ctx.supabase.from("categories").select("*").order("sort_order");
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl"><span className="gold-text italic">New product</span></h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </div>
  );
}
