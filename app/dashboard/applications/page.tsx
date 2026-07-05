import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";
import ApplicationStatusForm from "./ApplicationStatusForm";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";

const LIMIT = 15;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
};

export default async function ApplicationsPage({
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
  const statusFilter = params.status ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * LIMIT;

  const where = {
    tenantId: user.tenantId,
    ...(q && {
      OR: [
        { childName: { contains: q, mode: "insensitive" as const } },
        { parentName: { contains: q, mode: "insensitive" as const } },
        { parentEmail: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(statusFilter && { status: statusFilter }),
  };

  const [applications, total, allCounts] = await Promise.all([
    prisma.admissionApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: LIMIT,
    }),
    prisma.admissionApplication.count({ where }),
    prisma.admissionApplication.groupBy({
      by: ["status"],
      where: { tenantId: user.tenantId },
      _count: true,
    }),
  ]);

  const counts = {
    PENDING: allCounts.find((c) => c.status === "PENDING")?._count ?? 0,
    APPROVED: allCounts.find((c) => c.status === "APPROVED")?._count ?? 0,
    REJECTED: allCounts.find((c) => c.status === "REJECTED")?._count ?? 0,
  };

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admissions" },
          { label: "Applications", href: "/dashboard/applications" },
        ]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admission Applications</h1>
          <span className="text-sm text-gray-400">{total} total</span>
        </div>
      </div>

      {/* Status summary cards — also act as filters */}
      <div className="grid grid-cols-3 gap-3">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => {
          const isActive = statusFilter === s;
          const href = isActive
            ? "/dashboard/applications"
            : `/dashboard/applications?status=${s}`;
          return (
            <Link
              key={s}
              href={href}
              className={`rounded-lg border p-4 text-center transition-colors ${
                isActive
                  ? "border-blue-300 bg-blue-50"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-xl font-bold text-gray-900">{counts[s]}</p>
              <p className={`text-xs mt-0.5 font-medium ${
                s === "PENDING" ? "text-yellow-600" :
                s === "APPROVED" ? "text-green-600" : "text-red-500"
              }`}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Search bar */}
      <Suspense>
        <TableSearch placeholder="Search by child name, parent name or email…" />
      </Suspense>

      {/* Table */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">
            {q || statusFilter ? "No applications match your search." : "No applications yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Header */}
          <div className="flex items-center px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100 gap-4">
            <span className="w-24 shrink-0">Code</span>
            <span className="w-36 shrink-0">Child</span>
            <span className="w-32 shrink-0">Parent</span>
            <span className="flex-1">Email</span>
            <span className="w-52 shrink-0">Status</span>
            <span className="w-8 shrink-0" />
          </div>

          <div className="divide-y divide-gray-50">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center px-4 py-3 hover:bg-gray-50 gap-4">
                <span className="w-24 shrink-0 font-mono text-xs font-semibold text-gray-500 tracking-wider">
                  {app.applicationCode}
                </span>
                <span className="w-36 shrink-0 text-sm font-medium text-gray-900 truncate">
                  {app.childName}
                </span>
                <span className="w-32 shrink-0 text-sm text-gray-600 truncate">{app.parentName}</span>
                <span className="flex-1 text-xs text-gray-400 truncate">{app.parentEmail}</span>
                <div className="w-52 shrink-0">
                  <Suspense>
                    <ApplicationStatusForm id={app.id} currentStatus={app.status} />
                  </Suspense>
                </div>
                <div className="w-8 shrink-0 flex justify-end">
                  <Link
                    href={`/dashboard/applications/${app.id}`}
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View details"
                    aria-label="View application details"
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
