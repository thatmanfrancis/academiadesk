import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "./SignOutButton";

export default async function AppHeader() {
  const session = await auth();
  const user = session?.user as ({ role?: string } | undefined);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-base font-bold text-gray-900 tracking-tight">
          AcademiaDesk
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/schools" className="text-sm text-gray-600 hover:text-gray-900">
            Schools
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
