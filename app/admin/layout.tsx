import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase-server";
import { logoutAction } from "./actions";
import Logo from "@/components/Logo";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin(); // login page renders without nav when not authenticated
  return (
    <div className="min-h-screen">
      {ctx && (
        <header className="border-b border-gold-500/20 bg-ink-800">
          <div className="container-x flex flex-wrap items-center justify-between gap-3 py-3">
            <Link href="/admin"><Logo /></Link>
            <nav className="flex flex-wrap items-center gap-1 text-sm">
              {[["/admin", "Dashboard"], ["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/orders", "Orders"]].map(([h, l]) => (
                <Link key={h} href={h} className="rounded-full px-4 py-2 text-white/80 hover:bg-gold-500/10 hover:text-gold-200">{l}</Link>
              ))}
              <Link href="/" target="_blank" className="rounded-full px-4 py-2 text-white/50 hover:text-gold-200">View site ↗</Link>
              <form action={logoutAction}><button className="btn btn-outline !px-4 !py-2">Sign out</button></form>
            </nav>
          </div>
        </header>
      )}
      <div className="container-x py-8">{children}</div>
    </div>
  );
}
