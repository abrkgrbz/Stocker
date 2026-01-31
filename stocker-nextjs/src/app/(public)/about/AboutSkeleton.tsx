/**
 * Loading skeleton for About page
 */
export default function AboutSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-white/80 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="h-10 w-28 bg-slate-200 rounded" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-10 w-28 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <section className="py-20 text-center px-4 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-6" />
          <div className="h-12 w-64 bg-slate-200 rounded mx-auto mb-6" />
          <div className="h-6 w-full max-w-2xl bg-slate-200 rounded mx-auto" />
        </div>
      </section>

      {/* Stats Skeleton */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-10 w-24 bg-slate-200 rounded mx-auto mb-2" />
                <div className="h-4 w-32 bg-slate-200 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Skeleton */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="h-8 w-32 bg-slate-200 rounded-full" />
            <div className="h-10 w-3/4 bg-slate-200 rounded" />
            <div className="h-24 w-full bg-slate-200 rounded" />
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </section>

      {/* Values Skeleton */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-10 w-48 bg-slate-200 rounded mx-auto mb-4" />
            <div className="h-5 w-96 bg-slate-200 rounded mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-12 h-12 bg-slate-200 rounded-xl mx-auto mb-6" />
                <div className="h-6 w-24 bg-slate-200 rounded mx-auto mb-3" />
                <div className="h-16 w-full bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Skeleton */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-10 w-56 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-5 w-80 bg-slate-200 rounded mx-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="h-32 bg-slate-200" />
              <div className="pt-16 pb-8 px-8 text-center">
                <div className="h-6 w-40 bg-slate-200 rounded mx-auto mb-2" />
                <div className="h-4 w-32 bg-slate-200 rounded mx-auto mb-4" />
                <div className="h-12 w-full bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-10 w-96 bg-slate-200 rounded mx-auto mb-6" />
          <div className="h-6 w-80 bg-slate-200 rounded mx-auto mb-10" />
          <div className="flex justify-center gap-4">
            <div className="h-14 w-40 bg-slate-200 rounded-xl" />
            <div className="h-14 w-40 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
