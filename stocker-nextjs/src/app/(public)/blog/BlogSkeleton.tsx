export default function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="w-28 h-8 bg-slate-200 rounded animate-pulse" />
          <div className="flex items-center space-x-6">
            <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
            <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
            <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Skeleton */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-6 animate-pulse" />
          <div className="h-10 bg-slate-200 rounded w-32 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded w-96 mx-auto animate-pulse" />
        </div>

        {/* Categories Skeleton */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-20 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Featured Post Skeleton */}
        <div className="mb-12 p-8 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-full lg:w-64 h-48 bg-slate-200 rounded-xl animate-pulse" />
            <div className="flex-1 w-full">
              <div className="flex gap-3 mb-3">
                <div className="w-20 h-6 bg-slate-200 rounded-full animate-pulse" />
                <div className="w-16 h-6 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-3/4 mb-3 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-4 animate-pulse" />
              <div className="flex gap-4">
                <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200">
              <div className="h-40 bg-slate-200 rounded-lg mb-4 animate-pulse" />
              <div className="w-16 h-5 bg-slate-200 rounded-full mb-3 animate-pulse" />
              <div className="h-6 bg-slate-200 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4 animate-pulse" />
              <div className="flex justify-between">
                <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
