import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ApplicationForm from "./ApplicationForm";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const school = await prisma.tenant.findUnique({
    where: { slug, isPublished: true },
    select: { name: true, slug: true },
  });

  if (!school) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900">
          AcademiaDesk
        </Link>
        <Link href={`/schools/${slug}`} className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to {school.name}
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Apply for admission</h1>
          <p className="text-sm text-gray-500 mb-6">
            Applying to <span className="font-medium text-gray-700">{school.name}</span>
          </p>
          <ApplicationForm slug={slug} />
        </div>
      </main>
    </div>
  );
}
