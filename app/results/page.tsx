import AppHeader from "@/components/AppHeader";
import Breadcrumb from "@/components/Breadcrumb";
import ResultChecker from "./ResultChecker";

export const metadata = {
  title: "Check Results | AcademiaDesk",
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-lg mx-auto">
          <Breadcrumb items={[{ label: "AcademiaDesk", href: "/" }, { label: "Check Results" }]} />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Check Results</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter your scratch card serial number and PIN to view your results.
          </p>
          <ResultChecker />
        </div>
      </main>
    </div>
  );
}
