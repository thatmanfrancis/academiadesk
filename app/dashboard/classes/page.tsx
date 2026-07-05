import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";

const LIMIT = 20;

export default async function ClassesPage({
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

  if (!user || user.role !== "ADMIN" || !user.tenantId) redirect("/dashboard");

  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * LIMIT;

  const where = {
    tenantId: user.tenantId,
    ...(q && { name: { contains: q, mode: "insensitive" as const } }),
  };

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      include: {
        teacher: { select: { name: true } },
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take: LIMIT,
    }),
    prisma.class.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics" },
          { label: "Classes", href: "/dashboard/classes" },
        ]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Classes</h1>
          <Link href="/dashboard/classes/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Add class
          </Link>
        </div>
      </div>

      <Suspense>
        <TableSearch placeholder="Search by class name…" />
      </Suspense>

      {classes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm mb-3">
            {q ? "No classes match your search." : "No classes created yet."}
          </p>
          {!q && (
            <Link href="/dashboard/classes/new" className="text-sm text-blue-600 hover:underline">
              Create your first class →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span className="col-span-5">Class name</span>
            <span className="col-span-4">Form teacher</span>
            <span className="col-span-2">Students</span>
            <span className="col-span-1" />
          </div>
          <div className="divide-y divide-gray-50">
            {classes.map((cls) => (
              <div key={cls.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50">
                <span className="col-span-5 text-sm font-medium text-gray-900">{cls.name}</span>
                <span className="col-span-4 text-sm text-gray-500">
                  {cls.teacher?.name ?? <span className="text-gray-300">Unassigned</span>}
                </span>
                <span className="col-span-2 text-sm text-gray-500">{cls._count.students}</span>
                <div className="col-span-1 flex justify-end">
                  <Link
                    href={`/dashboard/classes/${cls.id}`}
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit class"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
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
