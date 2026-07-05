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

const CURRICULA = [
  "Nigerian (WAEC/NECO)", "British", "American",
  "IB (International Baccalaureate)", "Montessori", "French",
];

const SCHOOL_TYPES = [
  "Nursery","Primary","Secondary","Nursery & Primary",
  "Primary & Secondary","All levels",
].map((t) => ({ value: t, label: t }));

const FEE_RANGES = [
  "Under ₦100k/term","₦100k–₦300k/term","₦300k–₦600k/term",
  "₦600k–₦1m/term","Above ₦1m/term",
].map((f) => ({ value: f, label: f }));

interface SchoolData {
  slug: string;
  name: string;
  address: string | null;
  state: string | null;
  lga: string | null;
  phone: string | null;
  website: string | null;
  curriculum: string[];
  feeRange: string | null;
  schoolType: string | null;
}

export default function EditSchoolForm({ school }: { school: SchoolData }) {
  const router = useRouter();
  const [name, setName] = useState(school.name);
  const [address, setAddress] = useState(school.address ?? "");
  const [state, setState] = useState(school.state ?? "");
  const [lga, setLga] = useState(school.lga ?? "");
  const [phone, setPhone] = useState(school.phone ?? "");
  const [website, setWebsite] = useState(school.website ?? "");
  const [schoolType, setSchoolType] = useState(school.schoolType ?? "");
  const [curriculum, setCurriculum] = useState<string[]>(school.curriculum);
  const [feeRange, setFeeRange] = useState(school.feeRange ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleCurriculum(value: string) {
    setCurriculum((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (curriculum.length === 0) {
      setError("Select at least one curriculum");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/schools/${school.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, address, state, lga,
        phone: phone || undefined,
        website: website || undefined,
        schoolType, curriculum,
        feeRange: feeRange || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-5">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          School details updated successfully.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">School name *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="https://"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">School type *</label>
        <SearchableSelect
          options={SCHOOL_TYPES}
          value={schoolType}
          onChange={setSchoolType}
          placeholder="Select school type"
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fee range</label>
        <SearchableSelect
          options={FEE_RANGES}
          value={feeRange}
          onChange={setFeeRange}
          placeholder="Prefer not to say"
        />
      </div>

      <div className="pt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
