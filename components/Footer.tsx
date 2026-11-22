"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { SITE, whatsappLink } from "@/lib/config";

export default function Footer() {
  const path = usePathname();
  if (path?.startsWith("/admin")) return null;
  return (
    <footer id="contact" className="mt-24 border-t border-gold-500/20 bg-ink-800">
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo size="lg" />
          <p className="mt-4 max-w-xs text-sm text-white/60">{SITE.tagline} Dealers of all raw donor hair.</p>
        </div>
        <div className="text-sm">
          <h3 className="label">Visit & contact</h3>
          <ul className="space-y-2 text-white/75">
            <li>{SITE.address}</li>
            <li><a className="hover:text-gold-300" href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp: {SITE.phoneDisplay}</a></li>
            <li><a className="hover:text-gold-300" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <h3 className="label">Follow us</h3>
          <ul className="space-y-2 text-white/75">
            <li><a className="hover:text-gold-300" href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram · @nicki_hairport</a></li>
            <li><a className="hover:text-gold-300" href={SITE.facebook} target="_blank" rel="noopener noreferrer">Facebook · Nickihairport</a></li>
            <li><a className="hover:text-gold-300" href={SITE.tiktok} target="_blank" rel="noopener noreferrer">TikTok · @nickihairport</a></li>
            <li><Link className="hover:text-gold-300" href="/shop">Shop all hair</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Nicki Hairport. All rights reserved. Payments secured by Paystack.
      </div>
    </footer>
  );
}
