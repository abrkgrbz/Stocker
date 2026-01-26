'use client';

// Premium Redesigned Unauthorized Access Page
// Shown when users attempt to access restricted resources

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Lock, Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useRole } from '@/hooks/useRole';

const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0c0f1a]" />,
});

export default function UnauthorizedPage() {
  const { displayName, role } = useRole();

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
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/50 text-center relative overflow-hidden group">
          {/* Decorative Security Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-rose-500/20 transition-colors duration-1000" />

          <div className="flex flex-col items-center">
            {/* Lock Icon */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20 mb-8"
            >
              <Lock className="w-10 h-10 text-rose-500" />
            </motion.div>

            <h1 style={{ color: 'white' }} className="text-3xl font-bold mb-4 tracking-tight">Erişim Engellendi</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }} className="text-base leading-relaxed mb-8">
              Bu alanı görüntülemek için gerekli yetki seviyesine sahip değilsiniz.
            </p>

            {role && (
              <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-8 flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-rose-400/60" />
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.4)' }} className="text-[10px] font-bold uppercase tracking-wider">Mevcut Rolünüz</div>
                  <div style={{ color: 'white' }} className="text-sm font-semibold">{displayName}</div>
                </div>
              </div>
            )}

            <div className="w-full space-y-3">
              <Link
                href="/dashboard"
                style={{ backgroundColor: 'white', color: '#0f172a' }}
                className="flex items-center justify-center w-full font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5 whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>Panele Dön</span>
                </div>
              </Link>

              <button
                onClick={() => window.history.back()}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                className="flex items-center justify-center w-full font-semibold py-4 px-6 rounded-2xl transition-all whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Geri Git</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ color: 'rgba(255, 255, 255, 0.1)' }}
        className="absolute bottom-8 text-[10px] tracking-[0.4em] uppercase font-bold"
      >
        Stoocker Security Protocols Active
      </motion.div>
    </div>
  );
}
