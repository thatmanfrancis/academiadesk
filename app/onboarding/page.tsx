import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Already onboarded
  const user = session.user as typeof session.user & { role?: string };
  if (user.role) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to AcademiaDesk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tell us a bit about yourself to get started.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
