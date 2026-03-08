import { NextRequest, NextResponse } from "next/server";

const INTERNAL_PATHS = ["/data", "/monetize", "/dashboard", "/font-preview", "/internal-home", "/seo", "/market", "/handbook", "/features", "/admin"];
const INTERNAL_HOST = "internal.greenbowtie.com";
const PUBLIC_HOST = "greenbowtie.com";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";

  // Cloudflare may pass the original host via x-forwarded-host
  const forwardedHost = req.headers.get("x-forwarded-host") ?? "";
  const effectiveHost = forwardedHost || hostname;
  const isInternalHost = effectiveHost === INTERNAL_HOST || effectiveHost.startsWith("internal.") || hostname === INTERNAL_HOST || hostname.startsWith("internal.");
  const isLocalDev = hostname.includes("localhost") || hostname.includes("vercel.app");
  const isInternalPath = INTERNAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // On main domain: redirect internal paths to internal subdomain
  // Cloudflare Access handles auth on the subdomain
  if (isInternalPath && !isInternalHost && !isLocalDev) {
    const url = req.nextUrl.clone();
    url.host = INTERNAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // On internal subdomain: redirect "/" to the internal home dashboard
  if (isInternalHost && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/internal-home";
    return NextResponse.redirect(url, 302);
  }

  // On internal subdomain: keep non-internal paths on main site
  if (isInternalHost && !isInternalPath && !pathname.startsWith("/api/")) {
    const url = req.nextUrl.clone();
    url.host = PUBLIC_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 302);
  }

  // Pass pathname to layout via request header so root layout can suppress Nav/Footer
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)",
  ],
};
