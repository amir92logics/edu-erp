import { cookies } from "next/headers";
import { verifyToken, SessionPayload } from "./auth";
import { redirect } from "next/navigation";

export async function getServerSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    return await verifyToken(token);
}

/**
 * Ensures the user is authenticated and part of a specific school.
 * Returns the schoolId. Redirects to "/" (login page) if not authenticated.
 */
export async function getRequiredSchoolId(): Promise<string> {
    const session = await getServerSession();

    if (!session || !session.schoolId) {
        redirect("/");
    }

    return session.schoolId;
}

export async function getRequiredSession(): Promise<SessionPayload> {
    const session = await getServerSession();

    if (!session) {
        redirect("/");
    }

    return session;
}

/**
 * Helper to include schoolId in all Prisma queries for multi-tenancy.
 */
export function withSchool(schoolId: string, query: any = {}) {
    return {
        ...query,
        where: {
            ...query.where,
            schoolId,
        },
    };
}
