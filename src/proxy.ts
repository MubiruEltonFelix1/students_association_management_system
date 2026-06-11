import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminRoutes = /^\/admin/;
const memberRoutes = /^\/dashboard/;
const authPages = ["/login", "/register"];

function hasSession(req: NextRequest): boolean {
  return !!(
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value
  );
}

export default function proxy(req: NextRequest) {
  const isAuthenticated = hasSession(req);
  const path = req.nextUrl.pathname;

  // Allow public routes
  if (
    path === "/" ||
    path.startsWith("/verify") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/manifest")
  ) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (authPages.includes(path) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect admin and member routes
  if ((adminRoutes.test(path) || memberRoutes.test(path)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect API routes (except auth)
  if (path.startsWith("/api/") && !path.startsWith("/api/auth") && !isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)",
  ],
};
