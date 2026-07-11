import { NextRequest, NextResponse } from "next/server";

// ── Route classification ───────────────────────────────────────────────────

/** Routes anyone can visit without a token. */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/admin/login",
  "/forgot-password",
  "/verify",
];

/** Prefix → required role. Order matters: more-specific first. */
const PROTECTED_PREFIXES: Array<{ prefix: string; role: string }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/host",  role: "host"  },
  { prefix: "/home",  role: null as any }, // any authenticated user
  { prefix: "/bookings", role: null as any },
  { prefix: "/profile",  role: null as any },
  { prefix: "/wishlist",  role: null as any },
  { prefix: "/programs",  role: null as any },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/** Read the role stored in the session cookie / localStorage-forwarded header.
 *  The session is a JSON-stringified User object stored under `bookmyskill_session`.
 *  We cannot read localStorage in middleware (edge runtime), so we rely on a
 *  short-lived `bms_session` cookie that the client sets alongside the token. */
function getSessionRole(req: NextRequest): string | null {
  try {
    const raw = req.cookies.get("bms_session")?.value;
    if (!raw) return null;
    const user = JSON.parse(decodeURIComponent(raw));
    return user?.role ?? null;
  } catch {
    return null;
  }
}

function hasToken(req: NextRequest): boolean {
  return Boolean(req.cookies.get("bms_access_token")?.value);
}

// ── Middleware ─────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Always allow Next.js internals and public static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Public routes are always accessible
  if (isPublic(pathname)) {
    // If already authenticated, bounce away from auth pages
    if (hasToken(req)) {
      const role = getSessionRole(req);
      if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
        const dest =
          role === "admin" ? "/admin/dashboard"
          : role === "host"  ? "/host/dashboard"
          : "/home";
        return NextResponse.redirect(new URL(dest, req.url));
      }
      if (pathname === "/admin/login" && role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  // 3. For every protected route: require a token first
  if (!hasToken(req)) {
    const loginUrl = pathname.startsWith("/admin")
      ? new URL("/admin/login", req.url)
      : new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based access control
  const role = getSessionRole(req);
  for (const { prefix, role: required } of PROTECTED_PREFIXES) {
    if (!pathname.startsWith(prefix)) continue;

    if (required && role !== required) {
      // Wrong role → send to their own dashboard
      const dest =
        role === "admin" ? "/admin/dashboard"
        : role === "host"  ? "/host/dashboard"
        : "/home";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    break; // matched prefix, no more checks needed
  }

  return NextResponse.next();
}

// ── Matcher ────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     *  - Next.js internals (_next/static, _next/image)
     *  - favicon.ico and other static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)).*)",
  ],
};
