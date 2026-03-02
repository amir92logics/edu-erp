"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId, withSchool } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSchoolQuota } from "./quota";
import { Prisma } from "@prisma/client";

const StudentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    rollNumber: z.string().optional(),
    parentPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    classId: z.string().optional(),
});

export type StudentActionResult =
    | { success: true; student: any }
    | { success: false; error: string }
    | { success: false; limitExceeded: true; type: "students"; used: number; max: number };

export async function getStudents(query: string = "", classId: string = "") {
    const schoolId = await getRequiredSchoolId();

    return await db.student.findMany({
        where: {
            schoolId,
            ...(classId ? { classId } : {}),
            OR: query
                ? [
                    { name: { contains: query } },
                    { rollNumber: { contains: query } },
                    { parentPhone: { contains: query } },
                ]
                : undefined,
        },
        include: {
            class: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function addStudent(formData: z.infer<typeof StudentSchema>): Promise<StudentActionResult> {
    const schoolId = await getRequiredSchoolId();

    // ─── Quota guard ──────────────────────────────────────────────────────────
    const quota = await getSchoolQuota(schoolId);
    if (quota.students.exceeded) {
        return {
            success: false,
            limitExceeded: true,
            type: "students" as const,
            used: quota.students.used,
            max: quota.students.max!,
        };
    }

    const validated = StudentSchema.parse(formData);

    // Normalise: treat empty string roll number as undefined (no constraint)
    const rollNumber = validated.rollNumber?.trim() || undefined;

    // ─── Pre-check for duplicate roll number within this school ───────────────
    if (rollNumber) {
        const existing = await db.student.findUnique({
            where: {
                schoolId_rollNumber: { schoolId, rollNumber },
            },
        });
        if (existing) {
            return {
                success: false,
                error: "Roll number already exists in this school.",
            };
        }
    }

    try {
        const student = await db.student.create({
            data: { ...validated, rollNumber, schoolId },
        });

        revalidatePath("/admin/students");
        return { success: true, student };
    } catch (err) {
        // Catch Prisma unique constraint violation as a safety net
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            return {
                success: false,
                error: "Roll number already exists in this school.",
            };
        }
        throw err;
    }
}

export async function deleteStudent(studentId: string): Promise<{ success: boolean }> {
    const schoolId = await getRequiredSchoolId();

    await db.student.delete({
        where: {
            id: studentId,
            schoolId, // Strict tenant isolation
        },
    });

    revalidatePath("/admin/students");
    return { success: true };
}

export async function updateStudent(
    studentId: string,
    formData: z.infer<typeof StudentSchema>
): Promise<{ success: boolean; error?: string }> {
    const schoolId = await getRequiredSchoolId();
    const validated = StudentSchema.parse(formData);
    const rollNumber = validated.rollNumber?.trim() || undefined;

    // ─── Check uniqueness on update (exclude the current student record) ──────
    if (rollNumber) {
        const existing = await db.student.findUnique({
            where: {
                schoolId_rollNumber: { schoolId, rollNumber },
            },
        });
        if (existing && existing.id !== studentId) {
            return {
                success: false,
                error: "Roll number already exists in this school.",
            };
        }
    }

    try {
        await db.student.update({
            where: { id: studentId, schoolId },
            data: { ...validated, rollNumber },
        });

        revalidatePath("/admin/students");
        return { success: true };
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            return {
                success: false,
                error: "Roll number already exists in this school.",
            };
        }
        throw err;
    }
}
