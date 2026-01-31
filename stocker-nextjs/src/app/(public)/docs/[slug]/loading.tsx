/**
 * Loading skeleton for doc article detail page
 */
export default function DocArticleLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header Skeleton */}
      <header className="border-b border-slate-200 bg-white sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="h-10 w-28 bg-slate-200 rounded" />
          <div className="flex items-center space-x-6">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-4 w-16 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </header>

      {/* Breadcrumb Skeleton */}
      <nav className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-4 w-4 bg-slate-100 rounded" />
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-4 w-4 bg-slate-100 rounded" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </nav>

      {/* Content Skeleton */}
      <main className="max-w-4xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="h-5 w-24 bg-slate-200 rounded mb-4" />
          <div className="h-10 w-3/4 bg-slate-200 rounded mb-4" />
          <div className="h-6 w-full bg-slate-200 rounded mb-6" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="h-6 w-1/3 bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
          <div className="h-40 w-full bg-slate-200 rounded-xl mt-6" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-5/6 bg-slate-200 rounded" />
          <div className="h-6 w-1/4 bg-slate-200 rounded mt-8" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="bg-slate-100 rounded-2xl p-6 mb-8">
            <div className="h-6 w-48 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-64 bg-slate-200 rounded mb-4" />
            <div className="flex gap-3">
              <div className="h-10 w-20 bg-slate-200 rounded-lg" />
              <div className="h-10 w-20 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
