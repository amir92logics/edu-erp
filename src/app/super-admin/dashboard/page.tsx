import { redirect } from "next/navigation";

/**
 * /super-admin/dashboard redirects to /super-admin (the actual dashboard page)
 * This allows the login redirect target to be explicit and readable.
 */
export default function SuperAdminDashboardRedirect() {
    redirect("/super-admin");
}
