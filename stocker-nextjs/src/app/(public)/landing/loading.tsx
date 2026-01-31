/**
 * Loading skeleton for Landing page
 */
export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Hero Skeleton */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-12 w-96 bg-slate-200 rounded mx-auto mb-6" />
          <div className="h-6 w-full max-w-2xl bg-slate-200 rounded mx-auto mb-8" />
          <div className="flex gap-4 justify-center">
            <div className="h-12 w-32 bg-slate-200 rounded-xl" />
            <div className="h-12 w-32 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Social Proof Skeleton */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center gap-12 mb-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 w-24 bg-slate-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-20 bg-slate-200 rounded mx-auto mb-2" />
                <div className="h-4 w-24 bg-slate-200 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Skeleton */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="h-4 w-20 bg-slate-200 rounded mx-auto mb-4" />
            <div className="h-10 w-80 bg-slate-200 rounded mx-auto mb-4" />
            <div className="h-5 w-96 bg-slate-200 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="p-8 bg-white border border-slate-200 rounded-2xl">
                <div className="h-12 w-12 bg-slate-200 rounded-xl mb-5" />
                <div className="h-6 w-48 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-full bg-slate-200 rounded mb-2" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl">
                <div className="h-10 w-10 bg-slate-200 rounded-lg mb-4" />
                <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
