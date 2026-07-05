"use client";

import { useState } from "react";

interface GradeResult {
  subject: string;
  caScore: number;
  examScore: number;
  totalScore: number;
  term: { name: string };
}

interface ResultData {
  student: { name: string; regNumber: string; class: string };
  grades: GradeResult[];
}

function grade(score: number): string {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

function gradeColor(g: string): string {
  if (g === "A") return "text-green-700";
  if (g === "B") return "text-blue-700";
  if (g === "C") return "text-yellow-700";
  if (g === "F") return "text-red-600";
  return "text-gray-700";
}

export default function ResultChecker() {
  const [serial, setSerial] = useState("");
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    const res = await fetch("/api/scratch-cards/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serial: serial.trim().toUpperCase(), pin: pin.trim().toUpperCase() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setResult(data);
  }

  // Group grades by term
  const termGroups: Record<string, GradeResult[]> = {};
  if (result) {
    for (const g of result.grades) {
      const term = g.term.name;
      if (!termGroups[term]) termGroups[term] = [];
      termGroups[term].push(g);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCheck} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {error && (
          <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serial number</label>
          <input
            required
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="ACD-1234567890-ABC123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
          <input
            required
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Scratch to reveal PIN"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Check result"}
        </button>
      </form>

      {result && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 bg-blue-50 border-b border-blue-100">
            <h2 className="text-base font-bold text-gray-900">{result.student.name}</h2>
            <p className="text-sm text-gray-500">
              Reg. {result.student.regNumber} · {result.student.class}
            </p>
          </div>

          {Object.keys(termGroups).length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">No grades recorded yet.</p>
          ) : (
            Object.entries(termGroups).map(([termName, grades]) => (
              <div key={termName}>
                <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {termName}
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <th className="px-5 py-2 text-left font-medium">Subject</th>
                      <th className="px-3 py-2 text-center font-medium">CA</th>
                      <th className="px-3 py-2 text-center font-medium">Exam</th>
                      <th className="px-3 py-2 text-center font-medium">Total</th>
                      <th className="px-3 py-2 text-center font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {grades.map((g) => {
                      const g_ = grade(g.totalScore);
                      return (
                        <tr key={g.subject} className="hover:bg-gray-50">
                          <td className="px-5 py-2.5 font-medium text-gray-800">{g.subject}</td>
                          <td className="px-3 py-2.5 text-center text-gray-600">{g.caScore}</td>
                          <td className="px-3 py-2.5 text-center text-gray-600">{g.examScore}</td>
                          <td className="px-3 py-2.5 text-center font-semibold text-gray-900">{g.totalScore}</td>
                          <td className={`px-3 py-2.5 text-center font-bold ${gradeColor(g_)}`}>{g_}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}

          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            This card has been used and cannot be used again.
          </div>
        </div>
      )}
    </div>
  );
}
