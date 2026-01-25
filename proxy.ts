import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { Role } from "@/app/generated/prisma";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/sign-up",
  "/verify-otp",
  "/forgot-password",
];

// Auth routes that logged-in users shouldn't access
const authRoutes = ["/login", "/sign-up", "/verify-otp", "/forgot-password"];

// Helper function to check if path matches route pattern
function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match or starts with route (for query params)
    return pathname === route || pathname.startsWith(`${route}?`);
  });
}

// Helper function to get default dashboard based on role
function getDefaultDashboard(role: Role | undefined): string {
  if (role === Role.COMPANY) {
    return "/company";
  }
  if (role === Role.APPLICANT) {
    return "/applicant";
  }
  return "/login";
}

export default auth(async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Enforce HTTPS in production
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Get session
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  // Check if current path is public or auth route
  const isPublicRoute = isRouteMatch(pathname, publicRoutes);
  const isAuthRoute = isRouteMatch(pathname, authRoutes);

  // Case 1: User is NOT logged in
  if (!isLoggedIn) {
    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect to login with callback URL for protected routes
    const callbackUrl = encodeURIComponent(pathname + request.nextUrl.search);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
  }

  // Case 2: User IS logged in
  if (isLoggedIn) {
    // Redirect away from auth routes to their dashboard
    if (isAuthRoute) {
      const defaultDashboard = getDefaultDashboard(userRole);
      return NextResponse.redirect(new URL(defaultDashboard, request.url));
    }

    // Redirect from home page to their dashboard
    if (pathname === "/") {
      const defaultDashboard = getDefaultDashboard(userRole);
      return NextResponse.redirect(new URL(defaultDashboard, request.url));
    }

    // Role-based route protection
    // Company trying to access applicant routes
    if (userRole === Role.COMPANY && pathname.startsWith("/applicant")) {
      return NextResponse.redirect(new URL("/company", request.url));
    }

    // Applicant trying to access company routes
    if (userRole === Role.APPLICANT && pathname.startsWith("/company")) {
      return NextResponse.redirect(new URL("/applicant", request.url));
    }

    // Allow access to role-appropriate routes
    return NextResponse.next();
  }

  // Fallback
  return NextResponse.next();
});

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
