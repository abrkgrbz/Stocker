import Link from 'next/link';

export default function DynamicPageNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📄</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Sayfa Bulunamadı
        </h1>
        <p className="text-slate-500 mb-8 max-w-md">
          Aradığınız sayfa mevcut değil veya henüz yayınlanmamış olabilir.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Ana Sayfa
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Dökümanlar
          </Link>
        </div>
      </div>
    </div>
  );
}
