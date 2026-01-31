'use client';

// Premium Not Found Page - matches global 404 design
import React, { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';

const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0c0f1a]" />,
});

export default function DocArticleNotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0c0f1a] flex flex-col items-center justify-center p-4">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Suspense fallback={null}>
          <GradientMesh />
        </Suspense>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
            className="text-[12rem] sm:text-[16rem] font-bold leading-none select-none pointer-events-none"
          >
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative -mt-20 sm:-mt-32"
        >
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl w-full max-w-lg mx-auto text-white">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>

              <h2 style={{ color: 'white' }} className="text-3xl font-bold mb-4 tracking-tight">Makale Bulunamadi</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.4)' }} className="text-lg mb-8 max-w-sm">
                Aradiginiz dokumantasyon makalesi mevcut degil veya kaldirilmis olabilir.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link
                  href="/docs"
                  style={{ backgroundColor: 'white', color: '#0f172a' }}
                  className="flex-1 flex items-center justify-center gap-2 font-bold py-4 px-4 sm:px-8 rounded-2xl hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap min-w-fit"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Tum Dokumanlar</span>
                </Link>
                <button
                  onClick={() => window.history.back()}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  className="flex-1 flex items-center justify-center gap-2 font-semibold py-4 px-4 sm:px-8 rounded-2xl transition-all hover:bg-white/10 whitespace-nowrap min-w-fit"
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
          Stoocker Security & Infrastructure
        </div>
      </div>
    </div>
  );
}
