'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0c0f1a]" />,
});

export default function Loading() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0c0f1a] flex flex-col items-center justify-center p-4">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Suspense fallback={null}>
          <GradientMesh />
        </Suspense>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
          className="mb-12"
        >
          <Image
            src="/stoocker_white.png"
            alt="Stoocker"
            width={180}
            height={50}
            className="object-contain brightness-125"
            priority
          />
        </motion.div>

        {/* Premium Spinner */}
        <div className="relative w-24 h-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500/30 border-l-2 border-l-transparent border-b-2 border-b-transparent"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-t-2 border-l-2 border-white/20 border-r-2 border-r-transparent border-b-2 border-b-transparent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full animate-ping" />
          </div>
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          className="mt-12 text-sm font-medium tracking-[0.4em] uppercase"
        >
          Sistem Hazırlanıyor
        </motion.p>
      </div>
    </div>
  );
}
