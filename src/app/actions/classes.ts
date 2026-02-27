"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSchoolQuota } from "./quota";

const ClassSchema = z.object({
    name: z.string().min(2),
    teacherName: z.string().optional(),
    monthlyFee: z.number().min(0),
});

export async function getClasses() {
    const schoolId = await getRequiredSchoolId();

    return await db.class.findMany({
        where: { schoolId },
        include: {
            _count: {
                select: { students: true }
            }
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function createClass(formData: z.infer<typeof ClassSchema>) {
    const schoolId = await getRequiredSchoolId();

    // Quota check
    const quota = await getSchoolQuota(schoolId);
    if (quota.classes.exceeded) {
        return { success: false, limitExceeded: true, type: "classes" as const, used: quota.classes.used, max: quota.classes.max! };
    }

    const validated = ClassSchema.parse(formData);

    const newClass = await db.class.create({
        data: { ...validated, schoolId },
    });

    revalidatePath("/admin/classes");
    return { success: true, class: newClass };
}
export async function updateClass(classId: string, formData: z.infer<typeof ClassSchema>) {
    const schoolId = await getRequiredSchoolId();
    const validated = ClassSchema.parse(formData);

    await db.class.update({
        where: { id: classId, schoolId },
        data: validated,
    });

    revalidatePath("/admin/classes");
    return { success: true };
}

export async function deleteClass(classId: string) {
    const schoolId = await getRequiredSchoolId();

    // Check if class has students
    const studentCount = await db.student.count({
        where: { classId, schoolId }
    });

    if (studentCount > 0) {
        throw new Error("Cannot delete class with assigned students. Reassign students first.");
    }

    await db.class.delete({
        where: { id: classId, schoolId },
    });

    revalidatePath("/admin/classes");
    return { success: true };
}
