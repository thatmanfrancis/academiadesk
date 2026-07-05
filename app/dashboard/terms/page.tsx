import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";

export default async function TermsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") || !user.tenantId) {
    redirect("/dashboard");
  }

  const terms = await prisma.term.findMany({
    where: { tenantId: user.tenantId },
    orderBy: [{ year: "desc" }, { term: "asc" }],
  });

  const ordinal = (n: number) => ["First", "Second", "Third"][n - 1] ?? `${n}th`;

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "School" }, { label: "Terms" }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Academic Terms</h1>
          <Link
            href="/dashboard/terms/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New term
          </Link>
        </div>
      </div>

      {terms.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400 mb-2">No terms set up yet.</p>
          <Link href="/dashboard/terms/new" className="text-sm text-blue-600 hover:underline">
            Create your first term →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span className="col-span-4">Term</span>
            <span className="col-span-3">Session</span>
            <span className="col-span-2">Start</span>
            <span className="col-span-2">End</span>
            <span className="col-span-1" />
          </div>
          {terms.map((t) => (
            <div key={t.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50">
              <div className="col-span-4 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {ordinal(t.term)} Term
                </span>
                {t.isCurrent && (
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <span className="col-span-3 text-sm text-gray-500">{t.year}</span>
              <span className="col-span-2 text-sm text-gray-500">
                {new Date(t.startDate).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
              </span>
              <span className="col-span-2 text-sm text-gray-500">
                {new Date(t.endDate).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
              </span>
              <div className="col-span-1 flex justify-end">
                <Link href={`/dashboard/terms/${t.id}`} className="text-xs text-blue-600 hover:underline">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
