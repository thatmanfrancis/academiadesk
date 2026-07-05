"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Card {
  id: string;
  serial: string;
  pin: string;
  status: string;
  createdAt: Date | string;
  usedAt: Date | string | null;
  student: { firstName: string; lastName: string; regNumber: string } | null;
}

export default function ScratchCardManager({ cards: initial }: { cards: Card[] }) {
  const router = useRouter();
  const [cards, setCards] = useState(initial);
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [reveal, setReveal] = useState<Set<string>>(new Set());

  async function generate() {
    setError("");
    setGenerating(true);
    const res = await fetch("/api/scratch-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    setGenerating(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to generate");
      return;
    }
    router.refresh();
    const newCards = await res.json();
    setCards((prev) => [...newCards, ...prev]);
  }

  function toggleReveal(id: string) {
    setReveal((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Generate panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-800 mb-3">Generate new cards</p>
        {error && (
          <div className="mb-3 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Quantity</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {/* Card list */}
      {cards.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No scratch cards generated yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span className="col-span-3">Serial</span>
            <span className="col-span-3">PIN</span>
            <span className="col-span-3">Student</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1"></span>
          </div>
          {cards.map((card) => {
            const isRevealed = reveal.has(card.id);
            return (
              <div key={card.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50">
                <span className="col-span-3 text-xs font-mono text-gray-700">{card.serial}</span>
                <span className="col-span-3 text-xs font-mono">
                  {isRevealed ? (
                    <span className="text-blue-700 font-bold">{card.pin}</span>
                  ) : (
                    <span className="tracking-widest text-gray-300">••••••••••••</span>
                  )}
                </span>
                <span className="col-span-3 text-xs text-gray-500">
                  {card.student
                    ? `${card.student.lastName} ${card.student.firstName}`
                    : "—"}
                </span>
                <span className={`col-span-2 text-xs font-medium ${
                  card.status === "USED" ? "text-gray-400" : "text-green-600"
                }`}>
                  {card.status === "USED" ? "Used" : "Unused"}
                </span>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => toggleReveal(card.id)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {isRevealed ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
