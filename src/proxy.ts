import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

const PREFIX = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);

// "/" and prefixed pages go through next-intl (detection only happens at
// "/"). Any other path is an old unprefixed address: 308 to the Spanish one,
// the same for every visitor and crawler (openspec i18n-storefront D1).
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/" || PREFIX.test(pathname)) return intl(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${routing.defaultLocale}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Not the API, the creator, Next internals or files (sitemap.xml, icons).
  matcher: ["/((?!api|creator|_next|_vercel|.*\\..*).*)"],
};
