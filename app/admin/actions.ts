"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { requireAdmin, supabaseServer } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/format";
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from "@/lib/env";

type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });

/* ---------------- Auth ---------------- */
// Development-only helper: explains exactly which Supabase env variable is wrong.
function envProblem(): string | null {
  const url = SUPABASE_URL;
  const anon = SUPABASE_PUBLIC_KEY;
  if (!url) return "NEXT_PUBLIC_SUPABASE_URL is empty or not set. Add it to .env.local (or Codespaces secrets) and restart `npm run dev`.";
  if (/your-project|xxxx|example\.supabase/i.test(url)) return `NEXT_PUBLIC_SUPABASE_URL is still the placeholder (${url}). Paste your real Project URL from Supabase > Project Settings > API.`;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) return `NEXT_PUBLIC_SUPABASE_URL has an unexpected format: "${url}". It must look like https://abcdxyz.supabase.co with nothing after .co (no /rest/v1, no quotes, no spaces).`;
  if (!anon) return "No Supabase public key found. Set NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) and redeploy.";
  if (/your-anon|your_anon/i.test(anon) || anon.length < 20) return `The Supabase public key is still a placeholder or too short (length ${anon.length}). Paste the real anon / publishable key.`;
  return null;
}

export async function loginAction(_prev: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  // Production always returns ONE generic message (no account enumeration).
  // In development only, the real reason is shown and logged so setup problems are easy to find.
  const isDev = process.env.NODE_ENV !== "production";
  const deny = (reason: string) => {
    console.error(`[admin-login] denied: ${reason}`);
    return { error: isDev ? `Invalid email or password. [dev hint: ${reason}]` : "Invalid email or password." };
  };

  // Throttle brute force per IP and per email
  if (!rateLimit(`login-ip:${ip}`, 10, 15 * 60_000).ok || !rateLimit(`login-email:${email}`, 5, 15 * 60_000).ok) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  if (!z.string().email().safeParse(email).success || password.length < 8 || password.length > 200) {
    return deny("email format invalid or password shorter than 8 characters.");
  }

  const supabase = supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const problem = isDev ? envProblem() : null;
    if (problem) return deny(problem);
    return deny(`Supabase rejected the sign-in (${error.status ?? "no status"}: ${error.message}). Project checked: ${process.env.NEXT_PUBLIC_SUPABASE_URL}. Check the password, that this user exists in THAT project, and that the user is confirmed.`);
  }

  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  if (rpcError) {
    await supabase.auth.signOut();
    return deny(`password is correct, but the is_admin() check failed: ${rpcError.message}. Run supabase/schema.sql in the SQL Editor.`);
  }
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return deny("password is correct, but this user is NOT in the admins table. Run the 'insert into public.admins' SQL with this exact email.");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await supabaseServer().auth.signOut();
  redirect("/admin/login");
}

/* ---------------- Categories ---------------- */
const CategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  kind: z.enum(["hair", "care"]),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
});

export async function saveCategory(id: string | null, raw: unknown): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("Not authorised");
  const p = CategorySchema.safeParse(raw);
  if (!p.success) return fail("Please check the category details.");
  const slug = slugify(p.data.name);
  if (!slug) return fail("Invalid name.");

  const row = { name: p.data.name, description: p.data.description || null, kind: p.data.kind, sort_order: p.data.sort_order };
  const { error } = id
    ? await ctx.supabase.from("categories").update(row).eq("id", id)
    : await ctx.supabase.from("categories").insert({ ...row, slug });
  if (error) return fail(error.code === "23505" ? "A category with that name already exists." : "Could not save category.");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleCategory(id: string, is_active: boolean): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("Not authorised");
  const { error } = await ctx.supabase.from("categories").update({ is_active }).eq("id", id);
  if (error) return fail("Could not update.");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("Not authorised");
  const { error } = await ctx.supabase.from("categories").delete().eq("id", id);
  if (error) return fail(error.code === "23503" ? "Move or delete the products in this category first." : "Could not delete.");
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---------------- Products & variants ---------------- */
const VariantSchema = z.object({
  id: z.string().uuid().optional(),
  length_inches: z.number().int().min(1).max(80).nullable(),
  color: z.string().trim().max(40).nullable(),
  label: z.string().trim().max(60).nullable(),
  price_naira: z.number().positive().max(100_000_000),
  in_stock: z.boolean(),
});
const ProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category_id: z.string().uuid(),
  description: z.string().trim().max(4000).optional(),
  images: z.array(z.string().url().max(500)).max(8),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  variants: z.array(VariantSchema).min(1, "Add at least one price option").max(80),
});

export async function saveProduct(id: string | null, raw: unknown): Promise<Result & { id?: string }> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("Not authorised");
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the product details.");
  const d = parsed.data;

  // Only allow images from our own storage bucket
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (d.images.some((u) => !u.startsWith(`${base}/storage/v1/object/public/product-images/`))) return fail("Invalid image URL.");

  const sb = ctx.supabase;
  const fields = {
    name: d.name,
    category_id: d.category_id,
    description: d.description || null,
    images: d.images,
    is_featured: d.is_featured,
    is_active: d.is_active,
  };

  let productId = id;
  if (id) {
    const { error } = await sb.from("products").update(fields).eq("id", id);
    if (error) return fail("Could not update product.");
  } else {
    let slug = slugify(d.name) || "product";
    const { data: exists } = await sb.from("products").select("id").eq("slug", slug).maybeSingle();
    if (exists) slug = `${slug}-${crypto.randomBytes(2).toString("hex")}`;
    const { data, error } = await sb.from("products").insert({ ...fields, slug }).select("id").single();
    if (error || !data) return fail("Could not create product.");
    productId = data.id;
  }

  const rows = d.variants.map((v) => ({
    ...(v.id ? { id: v.id } : {}),
    product_id: productId!,
    length_inches: v.length_inches,
    color: v.color || null,
    label: v.label || null,
    price_kobo: Math.round(v.price_naira * 100),
    in_stock: v.in_stock,
  }));

  // remove variants that were deleted in the form
  const keepIds = rows.map((r) => ("id" in r ? r.id : null)).filter(Boolean) as string[];
  const delQ = sb.from("product_variants").delete().eq("product_id", productId!);
  const { error: delErr } = keepIds.length ? await delQ.not("id", "in", `(${keepIds.join(",")})`) : await delQ;
  if (delErr) return fail("Could not update price options.");

  const existing = rows.filter((r) => "id" in r);
  const fresh = rows.filter((r) => !("id" in r));
  if (existing.length) {
    const { error } = await sb.from("product_variants").upsert(existing);
    if (error) return fail(error.code === "23505" ? "Two price options have the same length, colour and size." : "Could not save price options.");
  }
  if (fresh.length) {
    const { error } = await sb.from("product_variants").insert(fresh);
    if (error) return fail(error.code === "23505" ? "Two price options have the same length, colour and size." : "Could not save price options.");
  }

  revalidatePath("/", "layout");
  return { ok: true, id: productId! };
}

export async function deleteProduct(id: string): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("Not authorised");
  const { error } = await ctx.supabase.from("products").delete().eq("id", id);
  if (error) return fail("Could not delete product.");
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---------------- Orders ---------------- */
export async function setOrderStatus(id: string, status: "fulfilled" | "cancelled"): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("Not authorised");
  if (!["fulfilled", "cancelled"].includes(status)) return fail("Invalid status");
  const { error } = await ctx.supabase.from("orders").update({ status }).eq("id", id);
  if (error) return fail("Could not update order.");
  revalidatePath("/admin/orders");
  return { ok: true };
}
