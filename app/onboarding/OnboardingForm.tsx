"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
].map((s) => ({ value: s, label: s }));

const CURRICULA = ["Nigerian (WAEC/NECO)", "British", "American", "IB (International Baccalaureate)", "Montessori", "French"];
const SCHOOL_TYPES = [
  "Nursery","Primary","Secondary","Nursery & Primary","Primary & Secondary","All levels",
].map((t) => ({ value: t, label: t }));const FEE_RANGES = ["Under ₦100k/term", "₦100k–₦300k/term", "₦300k–₦600k/term", "₦600k–₦1m/term", "Above ₦1m/term"];

type Role = "ADMIN" | "PARENT" | "TEACHER";

export default function OnboardingForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // School fields
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [curriculum, setCurriculum] = useState<string[]>([]);
  const [feeRange, setFeeRange] = useState("");

  function toggleCurriculum(value: string) {
    setCurriculum((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);

    const body =
      role === "ADMIN"
        ? {
            role,
            school: {
              name: schoolName,
              address,
              state,
              lga,
              phone: phone || undefined,
              website: website || undefined,
              schoolType,
              curriculum,
              feeRange: feeRange || undefined,
            },
          }
        : { role };

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-6">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Role Selection */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">I am a…</p>
        <div className="grid grid-cols-3 gap-3">
          {(["ADMIN", "PARENT", "TEACHER"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                role === r
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {r === "ADMIN" ? "School Admin" : r === "PARENT" ? "Parent / Guardian" : "Teacher"}
            </button>
          ))}
        </div>
      </div>

      {/* School registration fields — only for ADMIN */}
      {role === "ADMIN" && (
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h2 className="text-base font-semibold text-gray-800">Register your school</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School name *</label>
            <input
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Greenfield Academy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="12 School Road, Victoria Island"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <SearchableSelect
                options={NIGERIAN_STATES}
                value={state}
                onChange={setState}
                placeholder="Select state"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LGA *</label>
              <input
                required
                value={lga}
                onChange={(e) => setLga(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Eti-Osa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="https://yourschool.edu.ng"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School type *</label>
            <SearchableSelect
              options={SCHOOL_TYPES}
              value={schoolType}
              onChange={setSchoolType}
              placeholder="Select type"
              required
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Curriculum offered *</p>
            <div className="flex flex-wrap gap-2">
              {CURRICULA.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCurriculum(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    curriculum.includes(c)
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {curriculum.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">Select at least one</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee range</label>
            <select
              value={feeRange}
              onChange={(e) => setFeeRange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Prefer not to say</option>
              {FEE_RANGES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !role}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
