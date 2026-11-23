import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from "@/lib/env";

// Refreshes the auth session and gates every /admin route (except /admin/login).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isLogin = path === "/admin/login";

  if (!isLogin) {
    let allowed = false;
    if (data.user) {
      const { data: isAdmin } = await supabase.rpc("is_admin");
      allowed = isAdmin === true;
    }
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
