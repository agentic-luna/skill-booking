import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Retrieve authentication credentials from cookies
  const token = request.cookies.get("bms_access_token")?.value;
  const sessionCookie = request.cookies.get("bms_session")?.value;
  
  let role: string | null = null;
  if (sessionCookie) {
    try {
      // Decode and parse the session cookie containing the user's role
      const session = JSON.parse(decodeURIComponent(sessionCookie));
      role = session.role || null;
    } catch (e) {
      // Ignore parse/decoding issues
    }
  }

  const isAuthenticated = !!token;

  // 1. Admin login page protection
  if (pathname === "/admin/login") {
    if (isAuthenticated && role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Client/Host login or registration page protection
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (role === "host") {
        return NextResponse.redirect(new URL("/host/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/programs", request.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Admin dashboard and administrative routes
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated || role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 4. Host dashboard and tools
  if (pathname.startsWith("/host")) {
    if (!isAuthenticated || role !== "host") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 5. Client dashboard and protected pages
  const clientProtectedPaths = ["/dashboard", "/programs", "/wishlist", "/liked-events", "/bookings"];
  const isClientPath = clientProtectedPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
  if (isClientPath) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/host/:path*",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/programs/:path*",
    "/bookings/:path*",
    "/wishlist/:path*",
    "/liked-events/:path*"
  ],
};
