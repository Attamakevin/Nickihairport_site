export const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function priceRange(variants: { price_kobo: number }[] | undefined) {
  if (!variants || variants.length === 0) return null;
  const prices = variants.map((v) => v.price_kobo);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatNaira(min) : `${formatNaira(min)} – ${formatNaira(max)}`;
}

export const variantLabel = (v: { length_inches: number | null; color: string | null; label: string | null }) =>
  [v.length_inches ? `${v.length_inches}"` : null, v.color, v.label].filter(Boolean).join(" · ") || "Standard";
