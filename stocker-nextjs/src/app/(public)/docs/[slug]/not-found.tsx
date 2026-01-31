import Link from 'next/link';

export default function DocArticleNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Makale Bulunamadi</h2>
        <p className="text-slate-500 mb-6">Aradiginiz dokumantasyon makalesi mevcut degil veya kaldirilmis olabilir.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/docs"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Tum Dokumanlar
          </Link>
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
