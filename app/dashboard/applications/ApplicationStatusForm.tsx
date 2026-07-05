"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<Status, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
};

export default function ApplicationStatusForm({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus as Status);
  const [saving, setSaving] = useState(false);

  async function update(newStatus: Status) {
    if (newStatus === status) return;
    setSaving(true);
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          onClick={() => update(s)}
          disabled={saving}
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
            status === s
              ? STATUS_STYLES[s]
              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
          }`}
        >
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}
