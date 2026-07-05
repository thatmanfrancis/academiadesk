import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import EditSchoolForm from "./EditSchoolForm";
import AppHeader from "@/components/AppHeader";

export default async function EditSchoolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const school = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      state: true,
      lga: true,
      phone: true,
      website: true,
      curriculum: true,
      feeRange: true,
      schoolType: true,
      updatedAt: true,
      users: { select: { id: true } },
    },
  });

  if (!school) notFound();

  const sessionUser = session.user as typeof session.user & { id?: string };
  const isOwner = school.users.some((u) => u.id === sessionUser.id);
  if (!isOwner) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit school details</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Last updated{" "}
              {new Date(school.updatedAt).toLocaleDateString("en-NG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link
            href={`/schools/${slug}`}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Back to school page
          </Link>
        </div>

        <EditSchoolForm school={school} />
      </main>
    </div>
  );
}
