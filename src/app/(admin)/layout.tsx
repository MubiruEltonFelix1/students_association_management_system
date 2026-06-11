import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/layout/admin-nav";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role;
  const adminRoles = [
    "PRESIDENT", "VICE_PRESIDENT", "GENERAL_SECRETARY",
    "ASST_GEN_SECRETARY", "SPEAKER", "TECHNICAL_DIRECTOR", "SUPER_ADMIN",
  ];
  if (!adminRoles.includes(role)) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <AdminNav user={session.user as any} />
      <div className="flex-1 flex flex-col lg:pl-64">
        <DashboardHeader user={session.user as any} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
