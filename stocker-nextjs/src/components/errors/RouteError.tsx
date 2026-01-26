'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { RefreshCcw, ArrowLeft, Terminal, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0c0f1a]" />,
});

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: RouteErrorProps) {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
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
        className="relative z-10 w-full max-w-xl"
      >
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/50 overflow-hidden relative group">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />

          <div className="flex flex-col items-center text-center">
            {/* Error Icon */}
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 mb-8"
            >
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </motion.div>

            <h2 style={{ color: 'white' }} className="text-3xl font-bold mb-4 tracking-tight">İşlem Başarısız</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.4)' }} className="text-lg mb-8 max-w-sm mx-auto">
              Bir şeyler planladığımız gibi gitmedi. Lütfen sayfayı yenilemeyi deneyin.
            </p>

            {/* Development Error Details */}
            {isDevelopment && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-10 p-5 bg-black/40 rounded-2xl border border-white/5 text-left"
              >
                <div className="flex items-center gap-2 mb-3 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                  <Terminal className="w-3 h-3" />
                  Geliştirici Detayları
                </div>
                <p
                  style={{ color: '#fb923c' }}
                  className="text-xs font-mono break-words"
                >
                  {error.message || 'Bilinmeyen hata oluştu.'}
                </p>
                {error.digest && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-white/20 font-mono">
                    ID: {error.digest}
                  </div>
                )}
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={reset}
                style={{ backgroundColor: 'white', color: '#0f172a' }}
                className="flex-1 flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-2xl hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Tekrar Dene</span>
              </button>
              <button
                onClick={() => router.back()}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                className="flex-1 flex items-center justify-center gap-2 font-semibold py-4 px-8 rounded-2xl transition-all hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri Git</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Branding */}
      <div
        style={{ color: 'rgba(255, 255, 255, 0.1)' }}
        className="mt-16 font-medium tracking-[0.3em] uppercase text-[10px]"
      >
        Stoocker Incident Monitoring
      </div>
    </div>
  );
}
