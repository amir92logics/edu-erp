import { db } from "@/lib/db";

export class FeatureGuard {
    /**
     * Checks if a specific feature is enabled for a school
     */
    static async isEnabled(schoolId: string, featureName: string): Promise<boolean> {
        const flag = await db.featureFlag.findUnique({
            where: {
                schoolId_featureName: { schoolId, featureName }
            }
        });

        if (flag) return flag.isEnabled;

        // Default plan-based gating if no explicit flag exists
        const school = await db.school.findUnique({
            where: { id: schoolId },
            select: { subscriptionPlan: true }
        });

        if (!school) return false;

        // Example Gating Logic
        const plan = school.subscriptionPlan;

        if (featureName === "WHATSAPP_REMINDERS") {
            return plan === "PRO" || plan === "ENTERPRISE";
        }

        if (featureName === "ONLINE_PAYMENTS") {
            return plan !== "BASIC"; // Disabled for BASIC
        }

        return true; // Default features enabled
    }
}
