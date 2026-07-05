import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserPrivileges } from "@/lib/privileges";
import Breadcrumb from "@/components/Breadcrumb";

const STATUS_STYLES: Record<string, string> = {
  UNPAID: "bg-red-50 text-red-600 border-red-100",
  PARTIAL: "bg-yellow-50 text-yellow-700 border-yellow-100",
  PAID: "bg-green-50 text-green-700 border-green-100",
};

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, privileges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true },
    }),
    getUserPrivileges(session.user.id),
  ]);

  if (!user?.tenantId || !privileges?.canViewInvoices) redirect("/dashboard");

  const invoices = await prisma.invoice.findMany({
    where: { student: { tenantId: user.tenantId } },
    include: {
      student: { select: { firstName: true, lastName: true, regNumber: true } },
      term: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totals = {
    UNPAID: invoices.filter((i) => i.status === "UNPAID").length,
    PARTIAL: invoices.filter((i) => i.status === "PARTIAL").length,
    PAID: invoices.filter((i) => i.status === "PAID").length,
  };

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Finance" }, { label: "Invoices" }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          {privileges.canManageInvoices && (
            <Link
              href="/dashboard/invoices/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + New invoice
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["UNPAID", "PARTIAL", "PAID"] as const).map((s) => (
          <div key={s} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totals[s]}</p>
            <p className={`text-xs mt-0.5 font-medium ${
              s === "UNPAID" ? "text-red-500" : s === "PARTIAL" ? "text-yellow-600" : "text-green-600"
            }`}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </p>
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400">No invoices yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span className="col-span-3">Student</span>
            <span className="col-span-3">Term</span>
            <span className="col-span-2">Description</span>
            <span className="col-span-1 text-right">Amount</span>
            <span className="col-span-1 text-right">Paid</span>
            <span className="col-span-2 text-center">Status</span>
          </div>
          {invoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50 text-sm">
              <span className="col-span-3 font-medium text-gray-900">
                {inv.student.lastName}, {inv.student.firstName}
              </span>
              <span className="col-span-3 text-gray-500">{inv.term.name}</span>
              <span className="col-span-2 text-gray-500 truncate">{inv.description}</span>
              <span className="col-span-1 text-right text-gray-700">₦{inv.amount.toLocaleString()}</span>
              <span className="col-span-1 text-right text-gray-700">₦{inv.amountPaid.toLocaleString()}</span>
              <div className="col-span-2 flex justify-center">
                <span className={`text-xs font-medium border px-2.5 py-0.5 rounded-full ${STATUS_STYLES[inv.status]}`}>
                  {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
