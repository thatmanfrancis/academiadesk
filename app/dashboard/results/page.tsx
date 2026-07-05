import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserPrivileges } from "@/lib/privileges";

export default async function ResultsDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const privileges = await getUserPrivileges(session.user.id);
  if (!privileges?.canViewReports) redirect("/dashboard");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Results</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/scratch-cards"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 transition-colors"
        >
          <p className="font-semibold text-gray-900 mb-1">Scratch Cards</p>
          <p className="text-sm text-gray-500">Generate and manage PIN-based result access cards.</p>
        </Link>
        <Link
          href="/results"
          target="_blank"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 transition-colors"
        >
          <p className="font-semibold text-gray-900 mb-1">Public Result Checker ↗</p>
          <p className="text-sm text-gray-500">The page parents and students use to check results.</p>
        </Link>
      </div>
    </div>
  );
}
