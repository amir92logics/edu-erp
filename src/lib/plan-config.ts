/**
 * Subscription plan configurations defining resource limits and quotas.
 */
export const PLAN_CONFIG: Record<string, { maxWhatsappPerDay: number | null }> = {
    BASIC: {
        maxWhatsappPerDay: 50,
    },
    PRO: {
        maxWhatsappPerDay: 200,
    },
    ENTERPRISE: {
        maxWhatsappPerDay: null, // Unlimited
    },
};

export function getPlanDefaults(plan: string) {
    return PLAN_CONFIG[plan] || PLAN_CONFIG.BASIC;
}
