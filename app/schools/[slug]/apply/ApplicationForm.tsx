"use client";

import { useState } from "react";

export default function ApplicationForm({ slug }: { slug: string }) {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [error, setError] = useState("");
  const [applicationCode, setApplicationCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/schools/${slug}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentName, parentEmail, childName }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setApplicationCode(data.applicationCode);
  }

  async function handleCopy() {
    if (!applicationCode) return;
    try {
      await navigator.clipboard.writeText(`APP-${applicationCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard without user gesture
      const el = document.createElement("textarea");
      el.value = `APP-${applicationCode}`;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (applicationCode) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-800">
          <p className="font-semibold text-base mb-1">Application submitted!</p>
          <p className="mb-3">
            The school will contact you at <strong>{parentEmail}</strong>.
          </p>
          <p className="text-xs text-green-700 mb-1">Your reference code — keep this safe:</p>

          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-lg font-bold tracking-[0.2em] text-green-900">
              APP-{applicationCode}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy to clipboard"}
              className={`relative flex items-center justify-center h-8 w-8 rounded-md border transition-all duration-200 ${
                copied
                  ? "border-green-400 bg-green-100 text-green-600 scale-95"
                  : "border-green-300 bg-white text-green-600 hover:bg-green-100 hover:scale-105 active:scale-95"
              }`}
              aria-label={copied ? "Copied!" : "Copy code"}
            >
              {/* Animate between clipboard icon and checkmark */}
              <span
                className={`absolute transition-all duration-200 ${
                  copied ? "opacity-100 scale-100" : "opacity-0 scale-75"
                }`}
              >
                {/* Checkmark */}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span
                className={`absolute transition-all duration-200 ${
                  copied ? "opacity-0 scale-75" : "opacity-100 scale-100"
                }`}
              >
                {/* Clipboard */}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              </span>
            </button>
          </div>

          {copied && (
            <p className="text-xs text-green-600 mt-1.5 transition-opacity duration-200">
              Copied to clipboard ✓
            </p>
          )}
        </div>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent / guardian name *
        </label>
        <input
          required
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Ada Okonkwo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your email *
        </label>
        <input
          type="email"
          required
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Child&apos;s full name *
        </label>
        <input
          required
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Chidi Okonkwo"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
