import Link from 'next/link';

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Yazı Bulunamadı</h2>
        <p className="text-slate-500 mb-6">Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/blog"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Tüm Yazılar
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
