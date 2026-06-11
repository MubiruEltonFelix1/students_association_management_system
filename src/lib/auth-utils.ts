import { auth } from "./auth";
import { AUTHORIZED_SCAN_ROLES } from "./constants";
import { redirect } from "next/navigation";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const role = (session.user as any).role;
  if (!AUTHORIZED_SCAN_ROLES.includes(role)) {
    redirect("/dashboard");
  }
  return session;
}

export function canScan(role: string): boolean {
  return AUTHORIZED_SCAN_ROLES.includes(role);
}

export function isAdmin(role: string): boolean {
  return AUTHORIZED_SCAN_ROLES.includes(role);
}
