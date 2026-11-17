import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./lib/i18n/config";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "./lib/supabase/config";

// Keeps a reviewer's Supabase session fresh on reviewer pages (Server Components can't write cookies).
async function refreshSession(req: NextRequest, res: NextResponse) {
  const sb = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        req.cookies.set({ name, value, ...options });
        res.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        req.cookies.set({ name, value: "", ...options });
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });
  await sb.auth.getUser();
  return res;
}

// Redirects locale-less paths to a language, using a saved choice or the browser's Accept-Language order.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) {
    const res = NextResponse.next({ request: req });
    return supabaseConfigured && pathname.split("/")[2] === "review" ? refreshSession(req, res) : res;
  }

  const saved = req.cookies.get("locale")?.value;
  const accept = req.headers.get("accept-language") ?? "";
  const preferred = accept.split(",").map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  // The first language in the browser's order that the site offers (e.g. "ta-IN, en" -> ta).
  const locale = saved && isLocale(saved) ? saved : (preferred.find(isLocale) ?? defaultLocale);

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|auth|_next|favicon.ico|robots.txt|sitemap.xml|brand|.*\\..*).*)"],
};
