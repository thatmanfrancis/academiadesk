"use client";

import { useState } from "react";

type PrivilegeKey =
  | "canViewStudents"
  | "canManageGrades"
  | "canViewAllGrades"
  | "canManageAttendance"
  | "canViewInvoices"
  | "canManageInvoices"
  | "canViewApplications"
  | "canManageClasses"
  | "canViewReports"
  | "canPublishResults";

const PRIVILEGE_LABELS: { key: PrivilegeKey; label: string; description: string }[] = [
  { key: "canViewStudents",     label: "View students",        description: "Can see the student list and profiles" },
  { key: "canManageGrades",     label: "Enter grades",         description: "Can add and edit student grades for their classes" },
  { key: "canViewAllGrades",    label: "View all grades",      description: "Can view grades across all classes, not just their own" },
  { key: "canManageAttendance", label: "Manage attendance",    description: "Can mark and update attendance records" },
  { key: "canViewInvoices",     label: "View invoices",        description: "Can see fee invoices and payment status" },
  { key: "canManageInvoices",   label: "Manage invoices",      description: "Can create and update fee invoices" },
  { key: "canViewApplications", label: "View applications",    description: "Can see admission applications" },
  { key: "canManageClasses",    label: "Manage classes",       description: "Can create and edit classes" },
  { key: "canViewReports",      label: "View reports",         description: "Can access result and performance reports" },
  { key: "canPublishResults",   label: "Publish results",      description: "Can publish term results and generate scratch cards" },
];

// Dependencies: some privileges require others
const DEPENDENCIES: Partial<Record<PrivilegeKey, PrivilegeKey[]>> = {
  canManageGrades: ["canViewStudents"],
  canManageInvoices: ["canViewInvoices"],
  canPublishResults: ["canViewReports", "canManageGrades"],
};

interface Props {
  teacherId: string;
  current: Record<PrivilegeKey, boolean>;
}

export default function PrivilegesForm({ teacherId, current }: Props) {
  const [privileges, setPrivileges] = useState<Record<PrivilegeKey, boolean>>({ ...current });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function toggle(key: PrivilegeKey) {
    setPrivileges((prev) => {
      const next = { ...prev, [key]: !prev[key] };

      // If turning ON — also enable dependencies
      if (next[key]) {
        const deps = DEPENDENCIES[key] ?? [];
        for (const dep of deps) next[dep] = true;
      }

      // If turning OFF — also disable anything that depends on this
      if (!next[key]) {
        for (const [k, deps] of Object.entries(DEPENDENCIES) as [PrivilegeKey, PrivilegeKey[]][]) {
          if (deps.includes(key)) next[k] = false;
        }
      }

      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/teachers/${teacherId}/privileges`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(privileges),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save");
    } else {
      setSaved(true);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {error && (
        <div className="px-5 pt-4 text-sm text-red-600 bg-red-50 border-b border-red-100 py-3">
          {error}
        </div>
      )}

      <ul className="divide-y divide-gray-100">
        {PRIVILEGE_LABELS.map(({ key, label, description }) => {
          const enabled = privileges[key];
          const deps = DEPENDENCIES[key] ?? [];
          const missingDep = deps.some((d) => !privileges[d]);

          return (
            <li key={key} className="flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <p className={`text-sm font-medium ${enabled ? "text-gray-900" : "text-gray-500"}`}>
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                {missingDep && enabled === false && deps.length > 0 && (
                  <p className="text-xs text-amber-500 mt-0.5">
                    Requires: {deps.map((d) => PRIVILEGE_LABELS.find((p) => p.key === d)?.label).join(", ")}
                  </p>
                )}
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => toggle(key)}
                className={`relative shrink-0 mt-0.5 h-5 w-9 rounded-full border-2 transition-colors duration-200 focus:outline-none ${
                  enabled
                    ? "bg-blue-600 border-blue-600"
                    : "bg-gray-200 border-gray-200"
                }`}
              >
                <span
                  className={`block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                    enabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save privileges"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </div>
  );
}
