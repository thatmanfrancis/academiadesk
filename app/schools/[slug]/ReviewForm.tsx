"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [parentName, setParentName] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/schools/${slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentName, rating, comment }),
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

  if (success) {
    return (
      <div className="rounded bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        Thanks for your review! It will be visible shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your name *</label>
        <input
          required
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Ada Okonkwo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(0)}
                className="text-2xl focus:outline-none"
                aria-label={`Rate ${value} out of 5`}
              >
                <span className={value <= (hovered || rating) ? "text-yellow-400" : "text-gray-200"}>
                  ★
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
        <textarea
          required
          minLength={10}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          placeholder="Share your experience with this school…"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
