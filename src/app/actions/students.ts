"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId, withSchool } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSchoolQuota } from "./quota";

const StudentSchema = z.object({
    name: z.string().min(2),
    rollNumber: z.string().optional(),
    parentPhone: z.string().min(10),
    classId: z.string().optional(),
});

export async function getStudents(query: string = "") {
    const schoolId = await getRequiredSchoolId();

    return await db.student.findMany({
        where: {
            schoolId,
            OR: [
                { name: { contains: query } },
                { rollNumber: { contains: query } },
                { parentPhone: { contains: query } },
            ],
        },
        include: {
            class: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function addStudent(formData: z.infer<typeof StudentSchema>) {
    const schoolId = await getRequiredSchoolId();

    // Quota check
    const quota = await getSchoolQuota(schoolId);
    if (quota.students.exceeded) {
        return { success: false, limitExceeded: true, type: "students" as const, used: quota.students.used, max: quota.students.max! };
    }

    const validated = StudentSchema.parse(formData);

    const student = await db.student.create({
        data: { ...validated, schoolId },
    });

    revalidatePath("/admin/students");
    return { success: true, student };
}

export async function deleteStudent(studentId: string) {
    const schoolId = await getRequiredSchoolId();

    // Ensure student belongs to school before deleting
    await db.student.delete({
        where: {
            id: studentId,
            schoolId, // Strict isolation
        },
    });

    revalidatePath("/admin/students");
    return { success: true };
}
export async function updateStudent(studentId: string, formData: z.infer<typeof StudentSchema>) {
    const schoolId = await getRequiredSchoolId();
    const validated = StudentSchema.parse(formData);

    await db.student.update({
        where: { id: studentId, schoolId },
        data: validated,
    });

    revalidatePath("/admin/students");
    return { success: true };
}
