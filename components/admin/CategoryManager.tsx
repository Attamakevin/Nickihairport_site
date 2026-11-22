"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { saveCategory, toggleCategory, deleteCategory } from "@/app/admin/actions";

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? null : r.error ?? "Error");
      if (r.ok) { setEditing(null); router.refresh(); }
    });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const payload = { name: f.get("name"), description: f.get("description"), kind: f.get("kind"), sort_order: f.get("sort_order") };
    run(async () => {
      const r = await saveCategory(editing?.id ?? null, payload);
      if (r.ok) form.reset();
      return r;
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form key={editing?.id ?? "new"} onSubmit={onSubmit} className="card h-fit space-y-4 p-6">
        <h2 className="font-display text-xl">{editing ? "Edit category" : "Add category"}</h2>
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required minLength={2} maxLength={80} defaultValue={editing?.name} className="input" placeholder="e.g. Kinky Curly" /></div>
        <div><label className="label" htmlFor="kind">Type</label>
          <select id="kind" name="kind" defaultValue={editing?.kind ?? "hair"} className="input">
            <option value="hair">Hair (length &amp; colour)</option>
            <option value="care">Hair care product</option>
          </select>
        </div>
        <div><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={3} maxLength={500} defaultValue={editing?.description ?? ""} className="input" /></div>
        <div><label className="label" htmlFor="sort_order">Sort order</label><input id="sort_order" name="sort_order" type="number" min={0} max={999} defaultValue={editing?.sort_order ?? 0} className="input" /></div>
        {msg && <p role="alert" className="text-sm text-red-300">{msg}</p>}
        <div className="flex gap-2">
          <button disabled={pending} className="btn btn-gold flex-1">{pending ? "Saving…" : editing ? "Update" : "Add category"}</button>
          {editing && <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>}
        </div>
      </form>

      <ul className="space-y-3">
        {categories.map((c) => (
          <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display text-lg">{c.name} {c.kind === "care" && <span className="ml-2 rounded-full bg-gold-500/20 px-2 py-0.5 text-[11px] uppercase text-gold-200">Care</span>}</p>
              <p className="text-xs text-white/45">/{c.slug} · order {c.sort_order} · {c.is_active ? "visible" : "hidden"}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <button className="btn btn-outline !px-4 !py-2" onClick={() => setEditing(c)}>Edit</button>
              <button className="btn btn-outline !px-4 !py-2" disabled={pending} onClick={() => run(() => toggleCategory(c.id, !c.is_active))}>{c.is_active ? "Hide" : "Show"}</button>
              <button className="btn !px-4 !py-2 text-red-300 hover:bg-red-500/10" disabled={pending} onClick={() => { if (confirm(`Delete "${c.name}"?`)) run(() => deleteCategory(c.id)); }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
