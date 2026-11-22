"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import { useCart } from "./CartProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?kind=care", label: "Hair Care" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const path = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  if (path?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-ink-900/85 backdrop-blur-lg">
      <div className="container-x flex h-[68px] items-center justify-between sm:h-24">
        <Link href="/" aria-label="Nicki Hairport home"><Logo /></Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm tracking-wide text-white/80 transition hover:text-gold-300">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="btn btn-outline relative !px-4 !py-2" aria-label={`Cart, ${count} items`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
              <path d="M6 7h12l-1 12H7L6 7z M9 7a3 3 0 1 1 6 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[11px] font-bold text-black">
                {count}
              </span>
            )}
          </Link>
          <button className="btn-ghost p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle menu">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-ink-800 md:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-white/85 hover:text-gold-300">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
