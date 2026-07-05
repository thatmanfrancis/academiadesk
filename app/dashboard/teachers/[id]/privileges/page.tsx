import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import PrivilegesForm from "./PrivilegesForm";
import Breadcrumb from "@/components/Breadcrumb";
import BackButton from "@/components/BackButton";

export default async function TeacherPrivilegesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });

  if (!adminUser || (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const teacher = await prisma.teacher.findFirst({
    where: { id, tenantId: adminUser.tenantId! },
    include: { privilege: true },
  });

  if (!teacher) notFound();

  const currentPrivileges = teacher.privilege ?? {
    canViewStudents: true,
    canManageGrades: false,
    canViewAllGrades: false,
    canManageAttendance: false,
    canViewInvoices: false,
    canManageInvoices: false,
    canViewApplications: false,
    canManageClasses: false,
    canViewReports: false,
    canPublishResults: false,
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff" },
          { label: "Teachers", href: "/dashboard/teachers" },
          { label: teacher.name },
          { label: "Privileges" },
        ]} />
        <BackButton href="/dashboard/teachers" label="Back to teachers" />
        <h1 className="text-xl font-bold text-gray-900">Privileges — {teacher.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Control what this teacher can see and do in the dashboard.
        </p>
      </div>
      <PrivilegesForm teacherId={id} current={currentPrivileges} />
    </div>
  );
}
