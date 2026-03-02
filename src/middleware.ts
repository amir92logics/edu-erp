import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;

    // ─── 1. Tenant Detection ───────────────────────────────────────────────────
    let tenantSlug = "";
    const isLocalhost = hostname.includes("localhost");

    if (!isLocalhost) {
        const parts = hostname.split(".");
        if (parts.length > 2) {
            tenantSlug = parts[0];
        }
    }

    if (!tenantSlug) {
        tenantSlug = request.headers.get("x-school-id") || "";
    }

    // ─── 2. JWT Authentication ─────────────────────────────────────────────────
    const token = request.cookies.get("auth-token")?.value;
    const session = token ? await verifyToken(token) : null;

    // ─── 3. Route Classification ───────────────────────────────────────────────
    const isSuperAdminPath = pathname.startsWith("/super-admin");
    const isAdminPath = pathname.startsWith("/admin");
    // Root "/" is now the login page — treat it as auth path
    const isRootPath = pathname === "/";

    // ─── 4. Redirect unauthenticated users away from protected routes ──────────
    if ((isSuperAdminPath || isAdminPath) && !session) {
        // Clear any stale/invalid cookie
        const url = new URL("/", request.url);
        const response = NextResponse.redirect(url);
        response.cookies.delete("auth-token");
        return response;
    }

    // ─── 5. Role-based access control ─────────────────────────────────────────
    if (isSuperAdminPath && session?.role !== "SUPER_ADMIN") {
        // Wrong role — kick back to their correct dashboard
        const target = session?.role === "SCHOOL_ADMIN" ? "/admin/dashboard" : "/";
        return NextResponse.redirect(new URL(target, request.url));
    }

    if (isAdminPath && session?.role !== "SCHOOL_ADMIN") {
        const target = session?.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/";
        return NextResponse.redirect(new URL(target, request.url));
    }

    // ─── 6. Prevent authenticated users from seeing the login (root) page ──────
    if (isRootPath && session) {
        const target =
            session.role === "SUPER_ADMIN"
                ? "/super-admin/dashboard"
                : "/admin/dashboard";
        return NextResponse.redirect(new URL(target, request.url));
    }

    // ─── 7. Tenant isolation headers for downstream Server Components ──────────
    const response = NextResponse.next();

    // Prevent stale cache after logout
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    if (session?.schoolId) {
        response.headers.set("x-school-id", session.schoolId);
    } else if (tenantSlug) {
        response.headers.set("x-school-slug", tenantSlug);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static  (static files)
         * - _next/image   (image optimisation)
         * - favicon.ico
         * - public assets (svg, png, jpg, ico, webp)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
