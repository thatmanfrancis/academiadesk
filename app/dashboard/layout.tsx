import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";
import DashboardSidebar from "@/components/DashboardSidebar";
import { getUserPrivileges } from "@/lib/privileges";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, privileges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        role: true,
        tenant: { select: { slug: true, name: true } },
      },
    }),
    getUserPrivileges(session.user.id),
  ]);

  if (!user) redirect("/login");
  if (!user.role) redirect("/onboarding");

  // Non-staff roles (parent, student) don't use this dashboard layout
  if (!privileges) redirect("/");

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold text-gray-900 tracking-tight">
            AcademiaDesk
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.name ?? user.email}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
              {user.role?.toLowerCase().replace(/_/g, " ")}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <DashboardSidebar
            privileges={privileges}
            isAdmin={isAdmin}
            tenantSlug={user.tenant?.slug}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
