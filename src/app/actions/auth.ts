"use server";

import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function login(formData: z.infer<typeof LoginSchema>) {
    try {
        const validated = LoginSchema.parse(formData);

        const user = await db.user.findUnique({
            where: { email: validated.email },
            include: { school: true },
        });

        if (!user) {
            return { error: "Invalid credentials" };
        }

        const passwordMatch = await bcrypt.compare(validated.password, user.password);
        if (!passwordMatch) {
            return { error: "Invalid credentials" };
        }

        // Check if school account is active (non-super-admin only)
        if (user.role !== "SUPER_ADMIN" && user.school?.status === "SUSPENDED") {
            return { error: "Your school account is suspended. Please contact support." };
        }

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId || undefined,
        });

        const cookieStore = await cookies();
        cookieStore.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        return {
            success: true,
            role: user.role,
            redirect:
                user.role === "SUPER_ADMIN"
                    ? "/super-admin/dashboard"
                    : "/admin/dashboard",
        };
    } catch (error: any) {
        console.error("Login Error:", error);
        return { error: error.message || "An unexpected error occurred" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    // Delete the auth cookie with all the same attributes it was created with
    cookieStore.set("auth-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
        expires: new Date(0),
    });
    return { success: true };
}
