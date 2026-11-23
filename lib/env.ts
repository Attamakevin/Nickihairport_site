// Supabase now issues "publishable" and "secret" keys (the Vercel integration uses these names).
// Older projects use "anon" and "service_role". Accept either so setup just works.
// NOTE: these must stay literal `process.env.NEXT_PUBLIC_*` reads so Next.js can inline them.

// Some integrations store the URL with a path (e.g. ".../rest/v1/"), which breaks sign-in.
// Keep only the origin: https://<project>.supabase.co
function normalizeUrl(raw: string): string {
  const v = raw.trim().replace(/^["']|["']$/g, "");
  try {
    return new URL(v).origin;
  } catch {
    return v;
  }
}

export const SUPABASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
export const SUPABASE_PUBLIC_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();
