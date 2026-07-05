import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserPrivileges } from "@/lib/privileges";
import StudentRegistrationForm from "./StudentRegistrationForm";

export default async function NewStudentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, privileges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true, role: true },
    }),
    getUserPrivileges(session.user.id),
  ]);

  if (!user?.tenantId || !privileges?.canViewStudents) redirect("/dashboard");

  const classes = await prisma.class.findMany({
    where: { tenantId: user.tenantId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Register student</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in personal details, guardian info, and health records.
        </p>
      </div>
      <StudentRegistrationForm classes={classes} />
    </div>
  );
}
