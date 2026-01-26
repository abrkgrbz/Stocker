'use client';

// Premium Redesigned Invalid Tenant Page
// Forced visibility via inline styles to override problematic global CSS

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Home, HelpCircle } from 'lucide-react';

const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0c0f1a]" />,
});

export default function InvalidTenantPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0c0f1a] flex flex-col items-center justify-center p-4">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Suspense fallback={null}>
          <GradientMesh />
        </Suspense>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 z-10"
      >
        <Image
          src="/stoocker_white.png"
          alt="Stoocker"
          width={140}
          height={40}
          className="object-contain"
          priority
        />
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/50 overflow-hidden relative group">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-700" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-rose-500/20 transition-colors duration-700" />

          <div className="flex flex-col items-center text-center">
            {/* Error Icon */}
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-tr from-rose-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center border border-rose-500/20 mb-8"
            >
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </motion.div>

            <h1
              style={{ color: 'white' }}
              className="text-3xl font-bold mb-4 tracking-tight"
            >
              Erişim Başarısız
            </h1>

            <p
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              className="text-base leading-relaxed mb-10 max-w-[280px]"
            >
              Aradığınız işletme adresi <span style={{ color: '#818cf8' }} className="font-medium">bulunamadı</span> veya taşınmış olabilir.
            </p>

            <div className="w-full space-y-3">
              <Link
                href="https://stoocker.app"
                style={{ backgroundColor: 'white', color: '#0f172a' }}
                className="group relative flex items-center justify-center w-full font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5"
              >
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>Ana Sayfaya Dön</span>
                </div>
              </Link>

              <button
                onClick={() => window.history.back()}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                className="flex items-center justify-center w-full font-semibold py-4 px-6 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Geri Git</span>
                </div>
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 w-full text-center">
              <a
                href="#"
                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                className="inline-flex items-center gap-2 text-sm hover:text-indigo-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Desteğe mi ihtiyacınız var?
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ color: 'rgba(255, 255, 255, 0.2)' }}
        className="absolute bottom-8 text-xs tracking-widest uppercase font-medium"
      >
        Stoocker Cloud Infrastructure
      </motion.div>
    </div>
  );
}
