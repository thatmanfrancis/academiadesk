import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";

const LIMIT = 20;

const TITLE_LABELS: Record<string, string> = {
  HEADMASTER: "Headmaster",
  DEPUTY_HEADMASTER: "Deputy Headmaster",
  HEAD_OF_DEPARTMENT: "Head of Department",
  FORM_MASTER: "Form Master",
  CLASS_TEACHER: "Class Teacher",
  SUBJECT_TEACHER: "Subject Teacher",
};

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") || !user.tenantId) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * LIMIT;

  const where = {
    tenantId: user.tenantId,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { user: { email: { contains: q, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        user: { select: { email: true } },
        classes: { select: { name: true } },
        privilege: true,
      },
      orderBy: { name: "asc" },
      skip,
      take: LIMIT,
    }),
    prisma.teacher.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff" },
          { label: "Teachers", href: "/dashboard/teachers" },
        ]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Teachers</h1>
          <Link href="/dashboard/teachers/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Add teacher
          </Link>
        </div>
      </div>

      <Suspense>
        <TableSearch placeholder="Search by name or email…" />
      </Suspense>

      {teachers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm mb-3">
            {q ? "No teachers match your search." : "No teachers added yet."}
          </p>
          {!q && (
            <Link href="/dashboard/teachers/new" className="text-sm text-blue-600 hover:underline">
              Add your first teacher →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span className="col-span-3">Name</span>
            <span className="col-span-3">Title</span>
            <span className="col-span-3">Subjects</span>
            <span className="col-span-2">Classes</span>
            <span className="col-span-1" />
          </div>
          <div className="divide-y divide-gray-50">
            {teachers.map((t) => (
              <div key={t.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50">
                <div className="col-span-3">
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  {t.user.email && <p className="text-xs text-gray-400">{t.user.email}</p>}
                </div>
                <span className="col-span-3 text-sm text-gray-600">
                  {TITLE_LABELS[t.title] ?? t.title}
                </span>
                <span className="col-span-3 text-sm text-gray-500 truncate">
                  {t.subjects.length > 0 ? t.subjects.join(", ") : "—"}
                </span>
                <span className="col-span-2 text-sm text-gray-500 truncate">
                  {t.classes.length > 0 ? t.classes.map((c) => c.name).join(", ") : "—"}
                </span>
                <div className="col-span-1 flex justify-end">
                  <Link
                    href={`/dashboard/teachers/${t.id}/privileges`}
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Manage privileges"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Suspense>
            <Pagination total={total} page={page} limit={LIMIT} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
