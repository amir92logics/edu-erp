import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;

    // 1. Tenant Detection
    // Example: school1.example.com -> school1
    // For local development, we might use a header or a cookie if subdomains are hard to test
    let tenantSlug = "";

    // Logic for subdomain (production)
    const isLocalhost = hostname.includes("localhost");
    if (!isLocalhost) {
        const parts = hostname.split(".");
        if (parts.length > 2) {
            tenantSlug = parts[0];
        }
    }

    // Fallback for development/testing: Check header or cookie
    if (!tenantSlug) {
        tenantSlug = request.headers.get("x-school-id") || "";
    }

    // 2. Authentication & RBAC
    const token = request.cookies.get("auth-token")?.value;

    const session = token ? await verifyToken(token) : null;

    // Path protection
    const isSuperAdminPath = pathname.startsWith("/super-admin");
    const isAdminPath = pathname.startsWith("/admin");
    const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isPublicPath = pathname === "/" || pathname.startsWith("/api/public");

    // Redirect unauthenticated users
    if ((isSuperAdminPath || isAdminPath) && !session) {
        const url = new URL("/login", request.url);
        return NextResponse.redirect(url);
    }

    // Super Admin Check
    if (isSuperAdminPath && session?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Admin Check
    if (isAdminPath && session?.role !== "SCHOOL_ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Prevent multiple logins
    if (isAuthPath && session) {
        const target = session.role === "SUPER_ADMIN" ? "/super-admin" : "/admin";
        return NextResponse.redirect(new URL(target, request.url));
    }

    // Tenant Isolation: Inject school-id into headers for downstream processing
    const response = NextResponse.next();
    if (session?.schoolId) {
        response.headers.set("x-school-id", session.schoolId);
    } else if (tenantSlug) {
        // If not logged in but tenant detected, we might need it for public school pages
        response.headers.set("x-school-slug", tenantSlug);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (authentication routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};
