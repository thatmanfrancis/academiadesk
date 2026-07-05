import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session server-side. Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Get the current session server-side. Redirects to /onboarding if role is not set.
 */
export async function requireOnboarded() {
  const session = await requireAuth();
  // If user has no role they haven't completed onboarding
  if (!(session.user as { role?: string }).role) {
    redirect("/onboarding");
  }
  return session;
}

/**
 * Returns the session or null — no redirect.
 */
export async function getOptionalSession() {
  return auth();
}
