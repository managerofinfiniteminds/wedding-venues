import { NextRequest, NextResponse } from "next/server";

// Paths that require the internal subdomain
const INTERNAL_PATHS = ["/data", "/monetize", "/architecture", "/dashboard", "/audit", "/font-preview"];

const INTERNAL_HOST = "internal.greenbowtie.com";
const PUBLIC_HOST = "greenbowtie.com";

export function middleware(req: NextRequest) {
  const { pathname, host } = req.nextUrl;
  const hostname = req.headers.get("host") ?? host;

  const isInternalPath = INTERNAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isInternalHost = hostname === INTERNAL_HOST || hostname.startsWith("internal.");
  const isLocalDev = hostname.includes("localhost") || hostname.includes("vercel.app");

  // On main domain: redirect internal paths to internal subdomain
  if (isInternalPath && !isInternalHost && !isLocalDev) {
    const url = req.nextUrl.clone();
    url.host = INTERNAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // On internal subdomain: block non-internal paths (redirect to main site)
  if (isInternalHost && !isInternalPath && pathname !== "/" && !pathname.startsWith("/api/")) {
    const url = req.nextUrl.clone();
    url.host = PUBLIC_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)",
  ],
};
