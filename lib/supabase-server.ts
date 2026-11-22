import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Per-request client acting as the signed-in user (or anon). RLS applies. */
export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* called from a Server Component - middleware refreshes the session */
        }
      },
    },
  });
}

/** Service-role client. BYPASSES RLS. Use ONLY in trusted server code (checkout, webhook). */
export function supabaseAdminService() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Defense in depth: every admin page/action re-verifies the admin role on the server. */
export async function requireAdmin() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin === true ? { supabase, user: userData.user } : null;
}
