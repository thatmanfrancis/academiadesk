import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      role: true,
      tenant: {
        select: {
          name: true,
          slug: true,
          isPublished: true,
          _count: { select: { students: true, classes: true, applications: true } },
        },
      },
    },
  });

  if (!user) redirect("/login");
  if (!user.role) redirect("/onboarding");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5 capitalize">
          {user.role.toLowerCase().replace(/_/g, " ")}
        </p>
      </div>

      {user.role === "ADMIN" && user.tenant && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">{user.tenant.name}</h2>
                <p className="text-xs mt-0.5">
                  {user.tenant.isPublished ? (
                    <span className="text-green-600">● Published</span>
                  ) : (
                    <span className="text-yellow-600">● Pending</span>
                  )}
                </p>
              </div>
              <Link
                href={`/schools/${user.tenant.slug}`}
                className="text-xs text-blue-600 hover:underline"
              >
                View public page →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Students", value: user.tenant._count.students, href: "/dashboard/students" },
                { label: "Classes", value: user.tenant._count.classes, href: "/dashboard/classes" },
                { label: "Applications", value: user.tenant._count.applications, href: "/dashboard/applications" },
              ].map(({ label, value, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-md bg-gray-50 border border-gray-200 p-4 text-center hover:border-blue-300 transition-colors"
                >
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {user.role === "PARENT" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Find schools</h2>
          <p className="text-sm text-gray-500 mb-4">
            Search and discover schools near your preferred location in Nigeria.
          </p>
          <Link
            href="/schools"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 inline-block"
          >
            Browse schools
          </Link>
        </div>
      )}

      {user.role === "TEACHER" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Your account</h2>
          <p className="text-sm text-gray-500">
            A school admin needs to assign you to their school before you can access your classes.
          </p>
        </div>
      )}
    </div>
  );
}
