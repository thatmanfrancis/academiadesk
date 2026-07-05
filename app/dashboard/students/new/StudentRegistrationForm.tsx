"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";

type Step = "personal" | "guardian" | "health";

const STEPS: { key: Step; label: string }[] = [
  { key: "personal", label: "Personal details" },
  { key: "guardian", label: "Guardian / Parent" },
  { key: "health", label: "Health record" },
];

const BLOOD_GROUPS = ["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG","UNKNOWN"].map(
  (v) => ({ value: v, label: v.replace("_POS", " +ve").replace("_NEG", " -ve").replace("UNKNOWN", "Unknown") })
);

const GENOTYPES = ["AA","AS","AC","SS","SC","CC"].map((g) => ({ value: g, label: g }));

const RELATIONSHIPS = ["Mother","Father","Uncle","Aunt","Grandparent","Guardian","Sibling","Other"].map(
  (r) => ({ value: r, label: r })
);

interface GuardianForm {
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  isPrimary: boolean;
}

const emptyGuardian = (): GuardianForm => ({
  fullName: "", relationship: "", phone: "",
  email: "", address: "", occupation: "", isPrimary: false,
});

interface Props {
  classes: { id: string; name: string }[];
}

export default function StudentRegistrationForm({ classes }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("personal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Personal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [classId, setClassId] = useState("");

  // Guardians
  const [guardians, setGuardians] = useState<GuardianForm[]>([{ ...emptyGuardian(), isPrimary: true }]);

  // Health
  const [bloodGroup, setBloodGroup] = useState("UNKNOWN");
  const [genotype, setGenotype] = useState("");
  const [allergies, setAllergies] = useState("");
  const [disabilities, setDisabilities] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");

  function updateGuardian(index: number, field: keyof GuardianForm, value: string | boolean) {
    setGuardians((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  }

  function addGuardian() {
    setGuardians((prev) => [...prev, emptyGuardian()]);
  }

  function removeGuardian(index: number) {
    setGuardians((prev) => prev.filter((_, i) => i !== index));
  }

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      firstName, lastName, otherNames: otherNames || undefined,
      regNumber, dateOfBirth: dob || undefined,
      gender: gender || undefined, classId,
      guardians: guardians.map((g) => ({
        ...g,
        email: g.email || undefined,
        address: g.address || undefined,
        occupation: g.occupation || undefined,
      })),
      health: {
        bloodGroup,
        genotype: genotype || undefined,
        allergies: allergies ? allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        disabilities: disabilities ? disabilities.split(",").map((s) => s.trim()).filter(Boolean) : [],
        medicalConditions: medicalConditions ? medicalConditions.split(",").map((s) => s.trim()).filter(Boolean) : [],
        emergencyContact: emergencyContact || undefined,
        emergencyPhone: emergencyPhone || undefined,
        doctorName: doctorName || undefined,
        doctorPhone: doctorPhone || undefined,
      },
    };

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/dashboard/students");
    router.refresh();
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Step tabs */}
      <div className="flex border-b border-gray-200">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStep(s.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              step === s.key
                ? "border-blue-600 text-blue-700"
                : i < stepIndex
                ? "border-transparent text-gray-500 hover:text-gray-700"
                : "border-transparent text-gray-400 cursor-default"
            }`}
          >
            <span className={`mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
              i < stepIndex ? "bg-green-100 text-green-700" :
              step === s.key ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-400"
            }`}>
              {i < stepIndex ? "✓" : i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Step 1: Personal ── */}
          {step === "personal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Okonkwo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Chidi"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other names</label>
                <input
                  value={otherNames}
                  onChange={(e) => setOtherNames(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reg. number *</label>
                  <input
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="2024/001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div className="flex gap-3 mt-1">
                    {["MALE", "FEMALE", "OTHER"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                          gender === g
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {g.charAt(0) + g.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <SearchableSelect
                    options={classOptions}
                    value={classId}
                    onChange={setClassId}
                    placeholder="Select class"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Guardian ── */}
          {step === "guardian" && (
            <div className="space-y-6">
              {guardians.map((g, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-800">
                      Guardian {index + 1}
                      {g.isPrimary && (
                        <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3">
                      {!g.isPrimary && (
                        <button
                          type="button"
                          onClick={() => updateGuardian(index, "isPrimary", true)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Set as primary
                        </button>
                      )}
                      {guardians.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGuardian(index)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Full name *</label>
                      <input
                        required
                        value={g.fullName}
                        onChange={(e) => updateGuardian(index, "fullName", e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Relationship *</label>
                      <SearchableSelect
                        options={RELATIONSHIPS}
                        value={g.relationship}
                        onChange={(v) => updateGuardian(index, "relationship", v)}
                        placeholder="Select"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                      <input
                        required
                        value={g.phone}
                        onChange={(e) => updateGuardian(index, "phone", e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={g.email}
                        onChange={(e) => updateGuardian(index, "email", e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Occupation</label>
                      <input
                        value={g.occupation}
                        onChange={(e) => updateGuardian(index, "occupation", e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                      <input
                        value={g.address}
                        onChange={(e) => updateGuardian(index, "address", e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addGuardian}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add another guardian
              </button>
            </div>
          )}

          {/* ── Step 3: Health ── */}
          {step === "health" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood group</label>
                  <SearchableSelect
                    options={BLOOD_GROUPS}
                    value={bloodGroup}
                    onChange={setBloodGroup}
                    placeholder="Select blood group"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genotype</label>
                  <SearchableSelect
                    options={GENOTYPES}
                    value={genotype}
                    onChange={setGenotype}
                    placeholder="Select genotype"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                  <span className="ml-1 text-xs text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Penicillin, Peanuts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disabilities
                  <span className="ml-1 text-xs text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  value={disabilities}
                  onChange={(e) => setDisabilities(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Visual impairment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical conditions
                  <span className="ml-1 text-xs text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Asthma, Sickle cell"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Emergency contact</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Contact name</label>
                    <input
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Doctor&apos;s name</label>
                    <input
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Doctor&apos;s phone</label>
                    <input
                      value={doctorPhone}
                      onChange={(e) => setDoctorPhone(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={() => {
              const i = STEPS.findIndex((s) => s.key === step);
              if (i > 0) setStep(STEPS[i - 1].key);
            }}
            disabled={step === "personal"}
            className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          {step !== "health" ? (
            <button
              type="button"
              onClick={() => {
                const i = STEPS.findIndex((s) => s.key === step);
                setStep(STEPS[i + 1].key);
              }}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering…" : "Register student"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
