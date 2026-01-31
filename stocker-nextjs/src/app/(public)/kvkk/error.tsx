'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function KVKKError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('KVKK page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Bir hata olustu</h2>
        <p className="text-slate-500 mb-6">Sayfa yuklenirken bir sorun olustu.</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
