/**
 * Loading skeleton for legal pages (Terms, Privacy, KVKK)
 */
export default function LegalPageSkeleton() {
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
      <section className="py-16 text-center px-4 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-6" />
          <div className="h-10 w-64 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-5 w-48 bg-slate-200 rounded mx-auto" />
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
          {/* Title */}
          <div className="h-8 w-3/4 bg-slate-200 rounded" />

          {/* Paragraphs */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 rounded" />
          </div>

          {/* Section 1 */}
          <div className="h-6 w-1/3 bg-slate-200 rounded mt-8" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-4/5 bg-slate-200 rounded" />
          </div>

          {/* Section 2 */}
          <div className="h-6 w-1/4 bg-slate-200 rounded mt-8" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
          </div>

          {/* Section 3 */}
          <div className="h-6 w-2/5 bg-slate-200 rounded mt-8" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Contact Box Skeleton */}
        <div className="mt-12 bg-slate-100 rounded-xl p-8 text-center">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-4 w-80 bg-slate-200 rounded mx-auto mb-6" />
          <div className="h-12 w-48 bg-slate-200 rounded-lg mx-auto" />
        </div>
      </section>
    </div>
  );
}
