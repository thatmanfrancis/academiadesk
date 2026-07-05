import Link from "next/link";
import { Suspense } from "react";
import SchoolSearch from "./SchoolSearch";
import SchoolList from "./SchoolList";

export const metadata = {
  title: "Find Schools | AcademiaDesk",
  description: "Search and discover schools across Nigeria",
};

export default function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900">
          AcademiaDesk
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Schools in Nigeria</h1>
          <p className="text-gray-500">
            Search and compare schools by location, curriculum, and fees.
          </p>
        </div>

        <Suspense fallback={null}>
          <SchoolSearch />
        </Suspense>

        <Suspense
          fallback={
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          }
        >
          <SchoolList searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
