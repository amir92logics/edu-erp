import { SignJWT, jwtVerify } from "jose";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-this-in-production";
const key = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
    userId: string;
    email: string;
    role: Role;
    schoolId?: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(key);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        return payload as unknown as SessionPayload;
    } catch (error: any) {
        console.error("JWT Verification failed:", error.message);
        return null;
    }
}
