"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Variant } from "@/lib/types";
import { formatNaira, variantLabel } from "@/lib/format";
import { useCart } from "./CartProvider";
import { whatsappLink } from "@/lib/config";

type Props = { productName: string; productSlug: string; image: string | null; variants: Variant[] };

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export default function VariantPicker({ productName, productSlug, image, variants }: Props) {
  const router = useRouter();
  const { add } = useCart();
  const available = variants;

  const lengths = useMemo(() => uniq(available.map((v) => v.length_inches).filter((x): x is number => x != null)).sort((a, b) => a - b), [available]);
  const labels = useMemo(() => uniq(available.map((v) => v.label).filter((x): x is string => !!x)), [available]);

  const [length, setLength] = useState<number | null>(lengths[0] ?? null);
  const [label, setLabel] = useState<string | null>(labels[0] ?? null);

  const colorsForSelection = useMemo(
    () => uniq(available.filter((v) => (length == null || v.length_inches === length) && (label == null || v.label === label)).map((v) => v.color).filter((x): x is string => !!x)),
    [available, length, label]
  );
  const [color, setColor] = useState<string | null>(null);
  const effectiveColor = color && colorsForSelection.includes(color) ? color : colorsForSelection[0] ?? null;

  const selected = available.find(
    (v) => (length == null || v.length_inches === length) && (label == null || v.label === label) && (effectiveColor == null || v.color === effectiveColor)
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (available.length === 0) {
    return <p className="text-white/60">This item is currently unavailable.</p>;
  }

  const addToCart = () => {
    if (!selected || !selected.in_stock) return;
    add({
      variantId: selected.id,
      productName,
      productSlug,
      image,
      descriptor: variantLabel(selected),
      unitPriceKobo: selected.price_kobo,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-6">
      <p className="font-display text-4xl gold-text" aria-live="polite">{selected ? formatNaira(selected.price_kobo) : "Select options"}</p>

      {lengths.length > 0 && (
        <fieldset>
          <legend className="label">Length (inches)</legend>
          <div className="flex flex-wrap gap-2">
            {lengths.map((l) => (
              <button key={l} type="button" onClick={() => setLength(l)} className={`chip min-w-14 ${length === l ? "chip-active" : ""}`} aria-pressed={length === l}>{l}&quot;</button>
            ))}
          </div>
        </fieldset>
      )}

      {labels.length > 0 && (
        <fieldset>
          <legend className="label">Size</legend>
          <div className="flex flex-wrap gap-2">
            {labels.map((l) => (
              <button key={l} type="button" onClick={() => setLabel(l)} className={`chip ${label === l ? "chip-active" : ""}`} aria-pressed={label === l}>{l}</button>
            ))}
          </div>
        </fieldset>
      )}

      {colorsForSelection.length > 0 && (
        <fieldset>
          <legend className="label">Colour</legend>
          <div className="flex flex-wrap gap-2">
            {colorsForSelection.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`chip ${effectiveColor === c ? "chip-active" : ""}`} aria-pressed={effectiveColor === c}>{c}</button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-white/15">
          <button type="button" className="h-11 w-11 text-lg hover:text-gold-300" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
          <span className="w-8 text-center" aria-live="polite">{qty}</span>
          <button type="button" className="h-11 w-11 text-lg hover:text-gold-300" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">+</button>
        </div>
        <button type="button" onClick={addToCart} disabled={!selected || !selected.in_stock} className="btn btn-gold flex-1">
          {!selected ? "Unavailable combination" : !selected.in_stock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => { addToCart(); router.push("/cart"); }} disabled={!selected || !selected.in_stock} className="btn btn-outline">Buy now</button>
        <a
          className="btn btn-ghost !px-0 underline decoration-gold-500/50 underline-offset-4"
          target="_blank" rel="noopener noreferrer"
          href={whatsappLink(`Hello Nicki Hairport, I'm interested in ${productName}${selected ? ` (${variantLabel(selected)})` : ""}.`)}
        >
          Ask about this on WhatsApp
        </a>
      </div>
    </div>
  );
}
