'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import dynamic from 'next/dynamic';

// Dynamic import for ParticleWave to avoid SSR issues with Three.js
const ParticleWave = dynamic(() => import('./ParticleWave'), {
  ssr: false,
  loading: () => null,
});

export default function HeroSection() {
  const { t, locale, setLocale } = useTranslations();

  return (
    <section className="relative bg-white min-h-screen overflow-hidden">
      {/* Particle Wave Background - z-0 */}
      <Suspense fallback={null}>
        <ParticleWave className="z-0" />
      </Suspense>

      {/* Dot Pattern Background - z-1 */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          opacity: 0.4,
        }}
      />

      {/* Radial Fade Overlay - z-2 */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-white/80 via-white/60 to-white/90" />

      {/* Navigation - z-10 */}
      <nav className="relative z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Stoocker Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
              {t('landing.navbar.features')}
            </Link>
            <Link href="#pricing" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
              {t('landing.navbar.pricing')}
            </Link>
            <Link href="#faq" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
              {t('landing.navbar.faq')}
            </Link>
          </div>

          {/* Auth & Language */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
              <button
                onClick={() => locale !== 'tr' && setLocale('tr')}
                className={`px-2 py-1 text-[12px] font-medium transition-colors ${
                  locale === 'tr'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-500 hover:text-slate-900'
                }`}
              >
                TR
              </button>
              <button
                onClick={() => locale !== 'en' && setLocale('en')}
                className={`px-2 py-1 text-[12px] font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            <Link href="/login" className="text-[13px] text-slate-600 hover:text-slate-900 transition-colors">
              {t('landing.navbar.signIn')}
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-md transition-colors"
            >
              {t('landing.navbar.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[12px] text-slate-600">{t('landing.hero.badge')}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-[52px] md:text-[64px] font-semibold text-slate-900 tracking-tight leading-[1.1] mb-6"
        >
          {t('landing.hero.title1')}
          <br />
          {t('landing.hero.title2')}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-[17px] text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {t('landing.hero.subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center justify-center gap-3"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {t('landing.hero.cta')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 text-[14px] font-medium px-5 py-2.5 rounded-lg border border-slate-200 transition-colors"
          >
            {t('landing.hero.watchDemo')}
          </Link>
        </motion.div>

        {/* Trust Line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-[13px] text-slate-400 mt-8"
        >
          {t('landing.hero.trustLine')}
        </motion.p>
      </div>

      {/* Dashboard Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-10 max-w-5xl mx-auto px-6 pb-24"
      >
        <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-2xl shadow-slate-900/10 overflow-hidden">
          {/* Window Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded border border-slate-200 text-[11px] text-slate-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                app.stoocker.com
              </div>
            </div>
          </div>

          {/* Dashboard UI */}
          <div className="p-4 bg-slate-50/30">
            <div className="flex gap-4">
              {/* Sidebar */}
              <div className="w-44 shrink-0 space-y-1">
                <div className="h-7 bg-slate-900 rounded-md mb-4" />
                <div className="h-6 bg-slate-100 rounded-md" />
                <div className="h-6 bg-slate-200 rounded-md" />
                <div className="h-6 bg-slate-100 rounded-md" />
                <div className="h-6 bg-slate-100 rounded-md" />
                <div className="h-6 bg-slate-100 rounded-md w-3/4" />
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 bg-slate-200 rounded" />
                  <div className="h-7 w-20 bg-slate-900 rounded-md" />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-3">
                      <div className="h-2.5 w-14 bg-slate-100 rounded mb-2" />
                      <div className="h-4 w-16 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="h-2.5 w-20 bg-slate-100 rounded mb-4" />
                  <div className="flex items-end gap-1.5 h-20">
                    {[32, 48, 36, 64, 44, 56, 72, 48, 60, 80, 40, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-slate-900 rounded-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Table Preview */}
                <div className="bg-white rounded-lg border border-slate-200 p-3">
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-slate-100 rounded" />
                        <div className="h-2.5 flex-1 bg-slate-100 rounded" />
                        <div className="h-2.5 w-16 bg-slate-100 rounded" />
                        <div className="h-2.5 w-12 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
