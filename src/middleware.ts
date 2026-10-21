import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./lib/i18n/config";

// Redirects locale-less paths to /en or /hi, using a saved choice or Accept-Language.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();

  const saved = req.cookies.get("locale")?.value;
  const accept = req.headers.get("accept-language") ?? "";
  const locale = saved && isLocale(saved) ? saved : /^hi\b/i.test(accept) ? "hi" : defaultLocale;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|brand|.*\\..*).*)"],
};
