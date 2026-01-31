/**
 * Loading skeleton for FAQ page
 */
export default function FAQLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header Skeleton */}
      <header className="border-b border-slate-200 bg-white sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="h-10 w-28 bg-slate-200 rounded" />
          <div className="flex items-center space-x-6">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-4 w-16 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Skeleton */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-6" />
          <div className="h-10 w-80 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-5 w-64 bg-slate-200 rounded mx-auto" />
        </div>

        {/* Search Skeleton */}
        <div className="mb-8">
          <div className="h-14 w-full bg-slate-200 rounded-xl" />
        </div>

        {/* Categories Skeleton */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-slate-200 rounded-lg" />
          ))}
        </div>

        {/* FAQ List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-64 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
