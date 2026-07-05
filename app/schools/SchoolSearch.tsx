"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const CURRICULA = ["Nigerian (WAEC/NECO)", "British", "American", "IB (International Baccalaureate)", "Montessori", "French"];
const SCHOOL_TYPES = ["Nursery", "Primary", "Secondary", "Nursery & Primary", "Primary & Secondary", "All levels"];

export default function SchoolSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [state, setState] = useState(searchParams.get("state") ?? "");
  const [curriculum, setCurriculum] = useState(searchParams.get("curriculum") ?? "");
  const [schoolType, setSchoolType] = useState(searchParams.get("schoolType") ?? "");

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (curriculum) params.set("curriculum", curriculum);
    if (schoolType) params.set("schoolType", schoolType);
    router.push(`/schools?${params.toString()}`);
  }, [q, state, curriculum, schoolType, router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") applyFilters();
  }

  function clearFilters() {
    setQ("");
    setState("");
    setCurriculum("");
    setSchoolType("");
    router.push("/schools");
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by school name or area…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All states</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={curriculum}
          onChange={(e) => setCurriculum(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All curricula</option>
          {CURRICULA.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={schoolType}
          onChange={(e) => setSchoolType(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All types</option>
          {SCHOOL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button
          onClick={applyFilters}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>

        {(q || state || curriculum || schoolType) && (
          <button
            onClick={clearFilters}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
