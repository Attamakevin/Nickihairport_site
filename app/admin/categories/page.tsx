import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";
import CategoryManager from "@/components/admin/CategoryManager";
import type { Category } from "@/lib/types";

export default async function CategoriesPage() {
  const ctx = await requireAdmin();
  if (!ctx) redirect("/admin/login");
  const { data } = await ctx.supabase.from("categories").select("*").order("sort_order");
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl"><span className="gold-text italic">Categories</span></h1>
      <CategoryManager categories={(data ?? []) as Category[]} />
    </div>
  );
}
