import { redirect } from "next/navigation";

/**
 * /admin/dashboard redirects to /admin (the actual dashboard page)
 * This allows the login redirect target to be explicit and readable.
 */
export default function AdminDashboardRedirect() {
    redirect("/admin");
}
