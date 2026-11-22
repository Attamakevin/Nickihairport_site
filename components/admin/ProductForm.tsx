"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Category, Product, Variant } from "@/lib/types";
import { saveProduct, deleteProduct } from "@/app/admin/actions";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Row = { id?: string; length: string; color: string; label: string; price: string; in_stock: boolean };

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

const toRow = (v: Variant): Row => ({ id: v.id, length: v.length_inches ? String(v.length_inches) : "", color: v.color ?? "", label: v.label ?? "", price: String(v.price_kobo / 100), in_stock: v.in_stock });

export default function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [featured, setFeatured] = useState(product?.is_featured ?? false);
  const [active, setActive] = useState(product?.is_active ?? true);
  const [rows, setRows] = useState<Row[]>(product?.product_variants?.length ? product.product_variants.map(toRow) : [{ length: "", color: "", label: "", price: "", in_stock: true }]);

  const isCare = categories.find((c) => c.id === categoryId)?.kind === "care";
  const update = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    const sb = supabaseBrowser(); // upload happens with the admin's session; storage RLS enforces admin-only
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED.includes(file.type)) { setError("Only JPG, PNG, WebP or AVIF images are allowed."); continue; }
      if (file.size > 5 * 1024 * 1024) { setError("Each image must be under 5MB."); continue; }
      const path = `${crypto.randomUUID()}.${EXT[file.type]}`;
      const { error: upErr } = await sb.storage.from("product-images").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (upErr) { setError("Upload failed. Are you signed in as admin?"); continue; }
      urls.push(sb.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    setImages((prev) => [...prev, ...urls].slice(0, 8));
    setUploading(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const variants = rows.map((r) => ({
      ...(r.id ? { id: r.id } : {}),
      length_inches: r.length ? Number(r.length) : null,
      color: r.color.trim() || null,
      label: r.label.trim() || null,
      price_naira: Number(r.price),
      in_stock: r.in_stock,
    }));
    start(async () => {
      const res = await saveProduct(product?.id ?? null, { name, category_id: categoryId, description, images, is_featured: featured, is_active: active, variants });
      if (!res.ok) return setError(res.error);
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="card h-fit space-y-5 p-6">
        <div><label className="label" htmlFor="pname">Product name</label><input id="pname" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. 13x4 Bone Straight Lace Frontal Wig" /></div>
        <div><label className="label" htmlFor="cat">Category</label>
          <select id="cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input" required>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}{c.kind === "care" ? " (care)" : ""}</option>)}
          </select>
        </div>
        <div><label className="label" htmlFor="desc">Description</label><textarea id="desc" rows={5} maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} className="input" /></div>

        <div>
          <span className="label">Images (up to 8)</span>
          <div className="grid grid-cols-4 gap-2">
            {images.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
                <Image src={src} alt="" fill sizes="100px" className="object-cover" />
                <button type="button" aria-label="Remove image" onClick={() => setImages((p) => p.filter((x) => x !== src))} className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/80 text-xs hover:text-red-400">✕</button>
              </div>
            ))}
            {images.length < 8 && (
              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-gold-500/50 text-center text-xs text-gold-200 hover:bg-gold-500/10">
                {uploading ? "Uploading…" : "+ Add"}
                <input type="file" accept={ALLOWED.join(",")} multiple className="sr-only" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-gold-400" /> Visible in shop</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-gold-400" /> Featured on home</label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-6">
          <h2 className="font-display text-xl">Price options</h2>
          <p className="mb-4 text-sm text-white/55">
            {isCare ? "Add one row per size (e.g. 250ml). Colour and length are optional." : "One row per length. Add the same length again with a different colour if the price differs by colour."}
          </p>
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div key={r.id ?? `n${i}`} className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[80px_1fr_1fr_110px_auto]">
                <input aria-label="Length in inches" type="number" min={1} max={80} placeholder='Length"' value={r.length} onChange={(e) => update(i, { length: e.target.value })} className="input !px-3" />
                <input aria-label="Colour" maxLength={40} placeholder="Colour" value={r.color} onChange={(e) => update(i, { color: e.target.value })} className="input !px-3" />
                <input aria-label="Size label" maxLength={60} placeholder={isCare ? "Size e.g. 250ml" : "Label (optional)"} value={r.label} onChange={(e) => update(i, { label: e.target.value })} className="input !px-3" />
                <input aria-label="Price in naira" required type="number" min={1} step="1" placeholder="₦ Price" value={r.price} onChange={(e) => update(i, { price: e.target.value })} className="input !px-3" />
                <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1">
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={r.in_stock} onChange={(e) => update(i, { in_stock: e.target.checked })} className="accent-gold-400" /> In stock</label>
                  <button type="button" aria-label="Remove option" disabled={rows.length === 1} onClick={() => setRows((p) => p.filter((_, j) => j !== i))} className="text-white/40 hover:text-red-400 disabled:opacity-30">✕</button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-outline mt-4 !py-2" onClick={() => setRows((p) => [...p, { length: "", color: "", label: "", price: "", in_stock: true }])}>+ Add option</button>
        </div>

        {error && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <div className="flex gap-3">
          <button disabled={pending || uploading} className="btn btn-gold flex-1">{pending ? "Saving…" : product ? "Save changes" : "Create product"}</button>
          {product && (
            <button type="button" disabled={pending} className="btn text-red-300 hover:bg-red-500/10" onClick={() => {
              if (!confirm("Delete this product permanently?")) return;
              start(async () => { const r = await deleteProduct(product.id); if (r.ok) { router.push("/admin/products"); router.refresh(); } else setError(r.error); });
            }}>Delete</button>
          )}
        </div>
      </div>
    </form>
  );
}
