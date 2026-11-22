import Image from "next/image";
import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/config";

const SPARKLES = [
  { x: 6, y: 12, s: 22, d: 4.2, t: 0 }, { x: 14, y: 38, s: 12, d: 3.4, t: 1.1 }, { x: 22, y: 8, s: 16, d: 5, t: 2.2 },
  { x: 31, y: 24, s: 10, d: 3.8, t: 0.6 }, { x: 40, y: 6, s: 14, d: 4.6, t: 1.7 }, { x: 47, y: 30, s: 9, d: 3.2, t: 2.8 },
  { x: 55, y: 14, s: 20, d: 5.2, t: 0.3 }, { x: 63, y: 40, s: 11, d: 3.6, t: 1.4 }, { x: 70, y: 9, s: 13, d: 4.4, t: 2.5 },
  { x: 78, y: 28, s: 18, d: 4.8, t: 0.9 }, { x: 86, y: 12, s: 10, d: 3.3, t: 1.9 }, { x: 93, y: 34, s: 15, d: 5.4, t: 0.2 },
  { x: 4, y: 62, s: 11, d: 3.9, t: 2.1 }, { x: 18, y: 78, s: 17, d: 4.9, t: 0.5 }, { x: 28, y: 58, s: 9, d: 3.5, t: 1.6 },
  { x: 37, y: 86, s: 13, d: 4.3, t: 2.9 }, { x: 52, y: 70, s: 10, d: 3.7, t: 0.8 }, { x: 60, y: 90, s: 16, d: 5.1, t: 1.3 },
  { x: 72, y: 66, s: 12, d: 4.1, t: 2.4 }, { x: 81, y: 84, s: 20, d: 4.7, t: 0.1 }, { x: 90, y: 60, s: 11, d: 3.4, t: 1.8 },
  { x: 96, y: 80, s: 14, d: 5.3, t: 2.6 }, { x: 10, y: 92, s: 9, d: 3.6, t: 1.0 }, { x: 45, y: 50, s: 8, d: 3.1, t: 2.0 },
];

const DUST = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 61 + 7) % 100,
  y: 55 + ((i * 37) % 45),
  s: 4 + ((i * 7) % 9),
  d: 8 + ((i * 3) % 7),
  t: (i * 0.9) % 8,
}));

const services = ["100% Premium Raw Donor Hair", "Vietnamese & Filipino Hairs", "Wigs, Bundles & Extensions", "Hair Installation"];

function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z" fill="url(#star-g)" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* ===== Magical background ===== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="star-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff7d1" />
              <stop offset=".5" stopColor="#f0c43a" />
              <stop offset="1" stopColor="#b07f10" />
            </linearGradient>
          </defs>
        </svg>

        <div className="anim-pulse-glow absolute -left-40 -top-40 h-[780px] w-[780px] rounded-full bg-[radial-gradient(circle,rgba(245,205,80,.55)_0%,rgba(212,160,23,.18)_35%,transparent_68%)]" />
        <div className="absolute -right-48 top-10 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(212,160,23,.28)_0%,transparent_65%)]" />
        <div className="absolute bottom-[-260px] left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(212,160,23,.30)_0%,transparent_65%)]" />

        <div
          className="anim-spin-slow absolute -left-[420px] -top-[420px] h-[1000px] w-[1000px] opacity-70"
          style={{
            background: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,226,130,.22) 0deg 2deg, transparent 2deg 14deg)",
            WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
            maskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
          }}
        />

        <svg className="anim-drift absolute inset-x-[-5%] top-[18%] h-[60%] w-[110%] opacity-60" viewBox="0 0 1440 600" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="ribbon" x1="0" x2="1">
              <stop offset="0" stopColor="#d4a017" stopOpacity="0" />
              <stop offset=".5" stopColor="#f5df8a" stopOpacity=".9" />
              <stop offset="1" stopColor="#d4a017" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 380 C 220 250, 420 520, 700 360 S 1180 220, 1440 340" stroke="url(#ribbon)" strokeWidth="1.6" />
          <path d="M0 430 C 260 300, 460 560, 740 410 S 1200 280, 1440 390" stroke="url(#ribbon)" strokeWidth="1" opacity=".7" />
          <path d="M0 330 C 200 200, 400 470, 680 310 S 1160 170, 1440 290" stroke="url(#ribbon)" strokeWidth="1" opacity=".5" />
        </svg>

        {SPARKLES.map((p, i) => (
          <span key={i} className="anim-twinkle absolute drop-shadow-[0_0_8px_rgba(245,205,80,.9)]" style={{ left: `${p.x}%`, top: `${p.y}%`, ["--d" as string]: `${p.d}s`, ["--delay" as string]: `${p.t}s` }}>
            <Star size={p.s} />
          </span>
        ))}

        {DUST.map((p, i) => (
          <span key={i} className="anim-floatup absolute rounded-full bg-gold-200/80 blur-[1.5px]" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, ["--d" as string]: `${p.d}s`, ["--delay" as string]: `${p.t}s` }} />
        ))}

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,5,.85)_100%)]" />
      </div>

      {/* ===== Content ===== */}
      <div className="container-x relative grid items-center gap-4 pb-6 pt-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-2 lg:pt-12">
        {/* Model */}
        <div className="rise relative order-2 mx-auto w-full max-w-[520px] lg:order-1" style={{ ["--delay" as string]: ".15s" }}>
          <svg className="absolute left-1/2 top-[44%] h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 overflow-visible" viewBox="0 0 400 400" fill="none" aria-hidden>
            <defs>
              <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff2b0" />
                <stop offset=".45" stopColor="#d4a017" />
                <stop offset="1" stopColor="#7a520c" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="190" stroke="url(#ring-g)" strokeWidth="5" style={{ filter: "drop-shadow(0 0 14px rgba(245,205,80,.7))" }} />
            <circle cx="200" cy="200" r="178" stroke="#f5df8a" strokeOpacity=".35" strokeWidth="1" strokeDasharray="2 9" className="anim-spin-slow" style={{ transformOrigin: "200px 200px" }} />
          </svg>
          <div className="absolute inset-x-6 bottom-0 top-10 rounded-full bg-[radial-gradient(circle,rgba(245,205,80,.35),transparent_65%)] blur-2xl" aria-hidden />

          <Image
            src="/hero-model.jpg"
            alt="Nicki Hairport stylist wearing a Nicki Hairport polo and luxurious raw donor body wave hair"
            width={672}
            height={912}
            priority
            sizes="(max-width:1024px) 90vw, 520px"
            className="relative z-10 h-auto w-full"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom,transparent 0%,#000 14%,#000 82%,transparent 100%), linear-gradient(to right,transparent 0%,#000 16%,#000 84%,transparent 100%)",
              maskImage: "linear-gradient(to bottom,transparent 0%,#000 14%,#000 82%,transparent 100%), linear-gradient(to right,transparent 0%,#000 16%,#000 84%,transparent 100%)",
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            } as React.CSSProperties}
          />

          <div className="absolute bottom-6 left-0 z-20 flex items-center gap-2 rounded-full border border-gold-400/50 bg-black/70 px-4 py-2 text-xs text-gold-100 shadow-gold backdrop-blur sm:bottom-10">
            <Star size={14} /> 100% raw donor hair · Abuja
          </div>
        </div>

        {/* Brand copy (no head-and-hair drawing) */}
        <div className="relative order-1 lg:order-2 lg:pl-6">
          <h1 className="rise leading-[0.9]" style={{ ["--delay" as string]: ".15s", filter: "drop-shadow(0 4px 24px rgba(212,160,23,.45))" }}>
            <span className="shimmer-text -ml-3 block py-1 pl-4 pr-6 font-display text-[5.25rem] font-bold italic sm:text-[7.5rem] lg:text-[9rem]">Nicki</span>
            <span className="shimmer-text -ml-3 block pl-3 pr-4 font-display text-[3.4rem] font-extrabold sm:text-[5rem] lg:text-[6rem]">Hairport</span>
          </h1>

          <p className="rise mt-5 font-display text-xl italic text-white sm:text-2xl" style={{ ["--delay" as string]: ".35s" }}>
            Luxury Hair. Luxury Confidence.
          </p>
          <svg className="rise mt-1 h-4 w-72 max-w-full" viewBox="0 0 300 16" fill="none" aria-hidden style={{ ["--delay" as string]: ".4s" }}>
            <path d="M0 12 C70 0, 130 0, 150 8 S 240 14, 300 4" stroke="url(#ring-g)" strokeWidth="3" strokeLinecap="round" />
          </svg>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {services.map((s, i) => (
              <li key={s} className="rise flex items-center gap-3 text-[15px] text-white/90" style={{ ["--delay" as string]: `${0.5 + i * 0.1}s` }}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-400 bg-gold-500/15 text-gold-300 shadow-[0_0_14px_rgba(212,160,23,.5)]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="3" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {s}
              </li>
            ))}
          </ul>

          <div className="rise mt-8 flex flex-wrap gap-3" style={{ ["--delay" as string]: ".9s" }}>
            <Link href="/shop" className="btn btn-gold">Shop the collection</Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Order on WhatsApp</a>
          </div>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="rise mt-7 flex w-full max-w-xl flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-full bg-gold-gradient px-5 py-3 text-black shadow-gold ring-1 ring-gold-200/60 transition hover:brightness-110"
            style={{ ["--delay" as string]: "1s" }}
          >
            <span className="flex items-center gap-2 text-lg font-extrabold tracking-wide">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]">
                <svg viewBox="0 0 32 32" className="h-5 w-5 fill-white" aria-hidden><path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.18 1.6 6L4 28l7.2-1.88a12.02 12.02 0 0 0 4.84 1.02C22.68 27.14 28 21.74 28 15.1 28 8.4 22.68 3 16.04 3zm5.5 14.04c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.08-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.68-1.64-.93-2.25-.25-.58-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.25 5.15 4.55 2.25.97 2.7.78 3.2.73.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35z" /></svg>
              </span>
              {SITE.phoneDisplay}
            </span>
            <span className="text-sm font-semibold">{SITE.email}</span>
          </a>

          <p className="rise mt-4 flex items-center gap-2 text-sm text-white/75" style={{ ["--delay" as string]: "1.1s" }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-gold-400" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
            {SITE.address}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-center gap-4 px-4 pb-8">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/70 to-gold-300" />
        <span className="rounded-full border border-gold-400/60 bg-gradient-to-r from-ink-800 via-ink-600 to-ink-800 px-6 py-2 font-display text-lg italic text-gold-200 shadow-gold sm:text-2xl">
          Dealers of All Raw Donor Hair
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-500/70 to-gold-300" />
      </div>
    </section>
  );
}
