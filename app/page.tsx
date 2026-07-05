import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">AcademiaDesk</span>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-4xl font-bold text-gray-900 max-w-2xl leading-tight">
          Find the right school in Nigeria, from anywhere in the world
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl">
          AcademiaDesk helps diaspora families discover, compare, and apply to Nigerian schools —
          and gives schools the tools to manage everything in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/schools"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Browse schools
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Register your school
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-100 px-6 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} AcademiaDesk
      </footer>
    </div>
  );
}
