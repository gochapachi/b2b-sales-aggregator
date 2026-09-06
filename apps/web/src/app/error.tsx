'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-xs text-slate-600 mb-4 max-w-sm">
        {error.message || 'An unexpected error occurred in the B2B marketplace.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
      >
        Try Again
      </button>
    </div>
  );
}
