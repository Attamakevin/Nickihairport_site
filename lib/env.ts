// Supabase now issues "publishable" and "secret" keys (the Vercel integration uses these names).
// Older projects use "anon" and "service_role". Accept either so setup just works.
// NOTE: these must stay literal `process.env.NEXT_PUBLIC_*` reads so Next.js can inline them.
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const SUPABASE_PUBLIC_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();
