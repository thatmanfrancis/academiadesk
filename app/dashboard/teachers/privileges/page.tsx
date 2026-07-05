import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";

export default async function AllPrivilegesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") || !user.tenantId) {
    redirect("/dashboard");
  }

  const teachers = await prisma.teacher.findMany({
    where: { tenantId: user.tenantId },
    include: { privilege: true },
    orderBy: { name: "asc" },
  });

  const PRIV_LABELS = [
    { key: "canViewStudents",    label: "View students" },
    { key: "canManageGrades",    label: "Manage grades" },
    { key: "canViewAllGrades",   label: "All grades" },
    { key: "canManageAttendance",label: "Attendance" },
    { key: "canViewInvoices",    label: "View invoices" },
    { key: "canManageInvoices",  label: "Manage invoices" },
    { key: "canViewApplications",label: "Applications" },
    { key: "canManageClasses",   label: "Classes" },
    { key: "canViewReports",     label: "Reports" },
    { key: "canPublishResults",  label: "Publish results" },
  ] as const;

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Staff" }, { label: "Privileges" }]} />
        <h1 className="text-xl font-bold text-gray-900">Staff Privileges Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Click a teacher&apos;s name to edit their individual privileges.
        </p>
      </div>

      {teachers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400 mb-2">No teachers added yet.</p>
          <Link href="/dashboard/teachers/new" className="text-sm text-blue-600 hover:underline">
            Add teachers first →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide w-36">
                  Teacher
                </th>
                {PRIV_LABELS.map((p) => (
                  <th key={p.key} className="px-2 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {p.label}
                  </th>
                ))}
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{t.name}</td>
                  {PRIV_LABELS.map((p) => {
                    const granted = t.privilege?.[p.key] ?? false;
                    return (
                      <td key={p.key} className="px-2 py-3 text-center">
                        {granted ? (
                          <span className="text-green-500 text-base" title="Granted">✓</span>
                        ) : (
                          <span className="text-gray-200 text-base" title="Not granted">–</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/teachers/${t.id}/privileges`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
