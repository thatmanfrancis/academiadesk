import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";
import BackButton from "@/components/BackButton";
import ApplicationStatusForm from "../ApplicationStatusForm";
import { Suspense } from "react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });

  if (!user || user.role !== "ADMIN" || !user.tenantId) redirect("/dashboard");

  const { id } = await params;

  const application = await prisma.admissionApplication.findUnique({
    where: { id },
    include: { tenant: { select: { name: true } } },
  });

  if (!application || application.tenantId !== user.tenantId) notFound();

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admissions" },
          { label: "Applications", href: "/dashboard/applications" },
          { label: application.childName },
        ]} />
        <BackButton href="/dashboard/applications" label="Back to applications" />
        <h1 className="text-xl font-bold text-gray-900">Application Details</h1>
      </div>

      {/* Status badge + inline changer */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 mb-1">Current status</p>
            <span className={`inline-flex items-center border text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[application.status]}`}>
              {STATUS_LABELS[application.status] ?? application.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Update status</p>
            <Suspense>
              <ApplicationStatusForm id={application.id} currentStatus={application.status} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Child details */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Child information</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-400 text-xs mb-0.5">Full name</dt>
            <dd className="font-medium text-gray-900">{application.childName}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs mb-0.5">Applying to</dt>
            <dd className="font-medium text-gray-900">{application.tenant.name}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs mb-0.5">Application code</dt>
            <dd className="font-mono text-sm font-semibold text-gray-800 tracking-widest">
              APP-{application.applicationCode}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs mb-0.5">Submitted</dt>
            <dd className="text-gray-700">
              {new Date(application.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>

      {/* Parent / guardian details */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Parent / guardian</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-400 text-xs mb-0.5">Name</dt>
            <dd className="font-medium text-gray-900">{application.parentName}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs mb-0.5">Email</dt>
            <dd className="text-gray-700">
              <a href={`mailto:${application.parentEmail}`} className="text-blue-600 hover:underline">
                {application.parentEmail}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
