import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserPrivileges } from "@/lib/privileges";
import Breadcrumb from "@/components/Breadcrumb";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import ClassFilter from "./ClassFilter";

const LIMIT = 20;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, privileges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true },
    }),
    getUserPrivileges(session.user.id),
  ]);

  if (!user || !privileges?.canViewStudents || !user.tenantId) redirect("/dashboard");

  const params = await searchParams;
  const q = params.q ?? "";
  const classFilter = params.classId ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * LIMIT;

  const where = {
    tenantId: user.tenantId,
    ...(q && {
      OR: [
        { firstName: { contains: q, mode: "insensitive" as const } },
        { lastName: { contains: q, mode: "insensitive" as const } },
        { regNumber: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(classFilter && { classId: classFilter }),
  };

  const [students, total, classes] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { class: { select: { name: true } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip,
      take: LIMIT,
    }),
    prisma.student.count({ where }),
    prisma.class.findMany({
      where: { tenantId: user.tenantId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics" },
          { label: "Students", href: "/dashboard/students" },
        ]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <Link href="/dashboard/students/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Add student
          </Link>
        </div>
      </div>

      {/* Search + class filter */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Suspense>
            <TableSearch placeholder="Search by name or reg. number…" />
          </Suspense>
        </div>
        {classes.length > 0 && (
          <Suspense>
            <ClassFilter classes={classes} current={classFilter} />
          </Suspense>
        )}
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm mb-3">
            {q || classFilter ? "No students match your search." : "No students registered yet."}
          </p>
          {!q && !classFilter && (
            <Link href="/dashboard/students/new" className="text-sm text-blue-600 hover:underline">
              Register your first student →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span className="col-span-4">Name</span>
            <span className="col-span-3">Reg. No.</span>
            <span className="col-span-3">Class</span>
            <span className="col-span-2" />
          </div>
          <div className="divide-y divide-gray-50">
            {students.map((student) => (
              <div key={student.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50">
                <span className="col-span-4 text-sm font-medium text-gray-900">
                  {student.lastName}, {student.firstName}
                </span>
                <span className="col-span-3 text-sm text-gray-500">{student.regNumber}</span>
                <span className="col-span-3 text-sm text-gray-500">{student.class.name}</span>
                <div className="col-span-2 flex justify-end">
                  <Link
                    href={`/dashboard/students/${student.id}`}
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View student"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
