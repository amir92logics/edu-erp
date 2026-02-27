import { cookies, headers } from "next/headers";
import { verifyToken, SessionPayload } from "./auth";
import { redirect } from "next/navigation";

export async function getServerSession(): Promise<SessionPayload | null> {
    const cookieStore = cookies();
    const token = (await cookieStore).get("auth-token")?.value;

    if (!token) return null;

    return await verifyToken(token);
}

/**
 * Ensures the user is authenticated and part of a specific school.
 * Returns the schoolId.
 */
export async function getRequiredSchoolId(): Promise<string> {
    const session = await getServerSession();

    if (!session || !session.schoolId) {
        redirect("/login");
    }

    return session.schoolId;
}

export async function getRequiredSession(): Promise<SessionPayload> {
    const session = await getServerSession();

    if (!session) {
        redirect("/login");
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
