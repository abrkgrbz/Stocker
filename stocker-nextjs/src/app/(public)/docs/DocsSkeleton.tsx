/**
 * Skeleton loading component for Docs page
 */
export default function DocsSkeleton() {
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

      {/* Hero Skeleton */}
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-6" />
          <div className="h-10 w-64 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-5 w-96 bg-slate-200 rounded mx-auto mb-8" />
          <div className="h-14 w-full max-w-xl bg-slate-200 rounded-xl mx-auto" />
        </div>
      </section>

      {/* Content Skeleton */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Popular Articles Skeleton */}
        <section className="mb-12">
          <div className="h-7 w-48 bg-slate-200 rounded mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 bg-slate-100 rounded-xl">
                <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Categories Skeleton */}
        <section>
          <div className="h-7 w-32 bg-slate-200 rounded mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Help Section Skeleton */}
        <section className="mt-16 p-8 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
            <div className="flex-1 text-center md:text-left">
              <div className="h-6 w-64 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-80 bg-slate-200 rounded" />
            </div>
            <div className="h-12 w-28 bg-slate-200 rounded-xl" />
          </div>
        </section>
      </main>
    </div>
  );
}
