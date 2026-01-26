'use client';

// Premium Redesigned Global Error Page
// Absolute fallback for top-level application crashes

import * as Sentry from '@sentry/nextjs';
import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0c0f1a]" />,
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="antialiased">
        <div className="min-h-screen relative overflow-hidden bg-[#0c0f1a] flex flex-col items-center justify-center p-4">
          {/* Background Atmosphere */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <Suspense fallback={null}>
              <GradientMesh />
            </Suspense>
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/50 text-center">
              <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20 mb-8 mx-auto">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
              </div>

              <h2 style={{ color: 'white' }} className="text-3xl font-bold mb-4 tracking-tight">Kritik Hata</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.4)' }} className="text-lg mb-10 leading-relaxed">
                Uygulama genelinde bir sorun oluştu. Lütfen sistemi yeniden başlatmayı deneyin.
              </p>

              <button
                onClick={reset}
                style={{ backgroundColor: 'white', color: '#0f172a' }}
                className="w-full flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-2xl hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Uygulamayı Yenile</span>
              </button>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}