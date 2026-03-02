import { redirect } from "next/navigation";

/**
 * /login is deprecated — the root "/" is now the login page.
 * This redirect ensures any bookmarked /login URLs continue to work.
 */
export default function LoginRedirect() {
    redirect("/");
}
