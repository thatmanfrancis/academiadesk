import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserPrivileges } from "@/lib/privileges";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

export default async function GradesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, privileges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true },
    }),
    getUserPrivileges(session.user.id),
  ]);

  if (!user?.tenantId || (!privileges?.canManageGrades && !privileges?.canViewAllGrades)) {
    redirect("/dashboard");
  }

  const terms = await prisma.term.findMany({
    where: { tenantId: user.tenantId },
    orderBy: [{ year: "desc" }, { term: "asc" }],
    select: { id: true, name: true, isCurrent: true },
  });

  const currentTerm = terms.find((t) => t.isCurrent) ?? terms[0];

  const grades = currentTerm
    ? await prisma.grade.findMany({
        where: { term: { tenantId: user.tenantId }, termId: currentTerm.id },
        include: {
          student: { select: { firstName: true, lastName: true, regNumber: true } },
          class: { select: { name: true } },
        },
        orderBy: [{ class: { name: "asc" } }, { student: { lastName: "asc" } }, { subject: "asc" }],
      })
    : [];

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Academics" }, { label: "Grades" }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Grades</h1>
          {currentTerm && (
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
              {currentTerm.name}
            </span>
          )}
        </div>
      </div>

      {!currentTerm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400 mb-2">No active term found.</p>
          <Link href="/dashboard/terms" className="text-sm text-blue-600 hover:underline">
            Set up a term first →
          </Link>
        </div>
      ) : grades.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400">No grades recorded for this term yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span className="col-span-3">Student</span>
            <span className="col-span-2">Class</span>
            <span className="col-span-3">Subject</span>
            <span className="col-span-1 text-center">CA</span>
            <span className="col-span-1 text-center">Exam</span>
            <span className="col-span-1 text-center">Total</span>
            <span className="col-span-1 text-center">Grade</span>
          </div>
          {grades.map((g) => {
            const total = g.totalScore;
            const grade =
              total >= 70 ? "A" : total >= 60 ? "B" : total >= 50 ? "C" : total >= 45 ? "D" : total >= 40 ? "E" : "F";
            const gradeColor =
              grade === "A" ? "text-green-600" : grade === "B" ? "text-blue-600" : grade === "F" ? "text-red-500" : "text-gray-600";
            return (
              <div key={g.id} className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-gray-50 text-sm">
                <span className="col-span-3 text-gray-900 font-medium">
                  {g.student.lastName}, {g.student.firstName}
                </span>
                <span className="col-span-2 text-gray-500">{g.class.name}</span>
                <span className="col-span-3 text-gray-700">{g.subject}</span>
                <span className="col-span-1 text-center text-gray-500">{g.caScore}</span>
                <span className="col-span-1 text-center text-gray-500">{g.examScore}</span>
                <span className="col-span-1 text-center font-semibold text-gray-900">{total}</span>
                <span className={`col-span-1 text-center font-bold ${gradeColor}`}>{grade}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
