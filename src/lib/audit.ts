import { db } from "@/lib/db";

export async function createAuditLog(data: {
    userId?: string;
    schoolId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: any;
}) {
    try {
        await db.auditLog.create({
            data: {
                userId: data.userId,
                schoolId: data.schoolId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                details: data.metadata ? JSON.stringify(data.metadata) : undefined,
            }
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
}
