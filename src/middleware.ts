import { NextRequest, NextResponse } from "next/server";

const INTERNAL_PATHS = ["/data", "/monetize", "/architecture", "/dashboard", "/audit", "/font-preview"];
const INTERNAL_HOST = "internal.greenbowtie.com";
const PUBLIC_HOST = "greenbowtie.com";
const AUTH_COOKIE = "gb_internal_auth";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get(AUTH_COOKIE)?.value === "1";
}

function basicAuthChallenge(): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Green Bowtie Internal"' },
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";

  const isInternalHost = hostname === INTERNAL_HOST || hostname.startsWith("internal.");
  const isLocalDev = hostname.includes("localhost") || hostname.includes("vercel.app");
  const isInternalPath = INTERNAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // On main domain: redirect internal paths to internal subdomain
  if (isInternalPath && !isInternalHost && !isLocalDev) {
    const url = req.nextUrl.clone();
    url.host = INTERNAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // On internal subdomain: enforce Basic Auth
  if (isInternalHost && !isLocalDev) {
    const password = process.env.INTERNAL_PASSWORD;

    // No password set = deny access
    if (!password) return basicAuthChallenge();

    // Already authenticated via cookie
    if (isAuthenticated(req)) return NextResponse.next();

    // Check Basic Auth header
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Basic ")) {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
      const [, pass] = decoded.split(":");
      if (pass === password) {
        // Set auth cookie and proceed
        const res = NextResponse.next();
        res.cookies.set(AUTH_COOKIE, "1", {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        return res;
      }
    }

    return basicAuthChallenge();
  }

  // On internal subdomain: keep non-internal paths on main site
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
