"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        Sign out
      </button>

      {/* Backdrop + modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="signout-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => !loading && setOpen(false)}
          />

          {/* Modal card */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <h2
              id="signout-title"
              className="text-base font-semibold text-gray-900 mb-1"
            >
              Sign out?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              You&apos;ll need to sign back in to access your dashboard.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing out…" : "Yes, sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
