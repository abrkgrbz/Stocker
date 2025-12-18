'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import dynamic from 'next/dynamic';

// Dynamic import for ParticleWave to avoid SSR issues with Three.js
const ParticleWave = dynamic(() => import('./ParticleWave'), {
  ssr: false,
  loading: () => null,
});

// Company logos for the trust banner
const companyLogos = [
  'Migros', 'Getir', 'Trendyol', 'Hepsiburada', 'N11', 'LC Waikiki', 'DeFacto', 'Koçtaş',
  'Teknosa', 'MediaMarkt', 'Boyner', 'Mavi'
];

export default function HeroSection() {
  const { t, locale, setLocale } = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Parallax effect for dashboard mockup
  const mockupY = useTransform(scrollY, [0, 500], [0, 50]);
  const mockupOpacity = useTransform(scrollY, [0, 400], [1, 0.8]);

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      {/* STICKY Navigation - Glassmorphism */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm shadow-slate-900/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/stoocker_black.png"
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
            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white/50 backdrop-blur-sm">
              <button
                onClick={() => locale !== 'tr' && setLocale('tr')}
                className={`px-2 py-1 text-[12px] font-medium transition-colors ${
                  locale === 'tr'
                    ? 'bg-slate-900 text-white'
                    : 'bg-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                TR
              </button>
              <button
                onClick={() => locale !== 'en' && setLocale('en')}
                className={`px-2 py-1 text-[12px] font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-slate-900 text-white'
                    : 'bg-transparent text-slate-500 hover:text-slate-900'
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
              className="text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-md transition-all hover:shadow-lg hover:shadow-slate-900/20"
            >
              {t('landing.navbar.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[12px] text-slate-600">{t('landing.hero.badge')}</span>
        </motion.div>

        {/* Headline - Staggered */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[48px] md:text-[60px] font-semibold text-slate-900 tracking-tight leading-[1.1] mb-6"
        >
          {t('landing.hero.title1')}
          <br />
          <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text">
            {t('landing.hero.title2')}
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[17px] text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {t('landing.hero.subtitle')}
        </motion.p>

        {/* CTAs - Staggered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-3"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-medium px-6 py-3 rounded-lg transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5"
          >
            {t('landing.hero.cta')}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 text-[14px] font-medium px-6 py-3 rounded-lg border border-slate-200 transition-all hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {t('landing.hero.watchDemo')}
          </Link>
        </motion.div>

        {/* Trust Line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-[13px] text-slate-400 mt-8"
        >
          {t('landing.hero.trustLine')}
        </motion.p>
      </div>

      {/* Dashboard Mockup - FLOATING Animation */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ y: mockupY, opacity: mockupOpacity }}
        className="relative z-10 max-w-5xl mx-auto px-6 pb-8"
      >
        {/* Animated Gradient Glow Behind */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-gradient-to-br from-slate-200/60 via-blue-100/40 to-slate-300/50 blur-3xl rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-gradient-to-r from-blue-200/30 to-indigo-200/30 blur-2xl rounded-full"
          />
        </div>

        {/* Floating Dashboard Container - with continuous float animation */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Main Dashboard Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 overflow-hidden">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100/80 rounded-lg border border-slate-200/60 text-[11px] text-slate-500">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6.3 1 .9 1 1.5v3c0 1-.8 1.5-1.8 1.5h-4c-1 0-1.8-.5-1.8-1.5v-3c0-.6.4-1.2 1-1.5V9.5C9.2 8.1 10.6 7 12 7z" />
                  </svg>
                  app.stoocker.com
                </div>
              </div>
            </div>

            {/* Dashboard UI - Enhanced with micro-animations */}
            <div className="p-5 bg-gradient-to-br from-slate-50/80 to-white">
              <div className="flex gap-5">
                {/* Sidebar */}
                <div className="w-48 shrink-0 space-y-2">
                  <div className="h-8 bg-slate-900 rounded-lg mb-5 flex items-center justify-center">
                    <div className="w-20 h-3 bg-white/20 rounded" />
                  </div>
                  {['Dashboard', 'Stok', 'Siparişler', 'Müşteriler', 'Raporlar'].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className={`h-8 rounded-lg flex items-center px-3 gap-2 ${i === 0 ? 'bg-slate-200' : 'bg-slate-100/60'}`}
                    >
                      <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-slate-400' : 'bg-slate-300'}`} />
                      <span className={`text-[11px] ${i === 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{item}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-5 w-32 bg-slate-200 rounded mb-1" />
                      <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-white border border-slate-200 rounded-lg" />
                      <div className="h-8 w-28 bg-slate-900 rounded-lg flex items-center justify-center">
                        <span className="text-[10px] text-white">+ Yeni Ürün</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row - Staggered */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Toplam Stok', value: '12,458', change: '+12%', color: 'emerald' },
                      { label: 'Siparişler', value: '847', change: '+8%', color: 'blue' },
                      { label: 'Gelir', value: '₺284K', change: '+23%', color: 'violet' },
                      { label: 'Müşteriler', value: '2,156', change: '+5%', color: 'amber' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-slate-400">{stat.label}</span>
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                            {stat.change}
                          </span>
                        </div>
                        <div className="text-[16px] font-semibold text-slate-900">{stat.value}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart with animated bars */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-medium text-slate-700">Satış Trendi</span>
                      <div className="flex gap-1">
                        {['7G', '30G', '90G'].map((period, i) => (
                          <span
                            key={period}
                            className={`text-[9px] px-2 py-1 rounded ${i === 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                          >
                            {period}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-end gap-1 h-24">
                      {[32, 45, 38, 52, 48, 65, 58, 72, 68, 85, 78, 92].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.6, delay: 1.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          className={`flex-1 rounded-t ${i === 11 ? 'bg-slate-900' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                    <span className="text-[11px] font-medium text-slate-700 mb-3 block">Son İşlemler</span>
                    <div className="space-y-2">
                      {[
                        { product: 'iPhone 15 Pro', action: 'Stok güncellendi', qty: '+50', time: '2dk' },
                        { product: 'MacBook Air M3', action: 'Sipariş alındı', qty: '-3', time: '15dk' },
                        { product: 'AirPods Pro 2', action: 'Düşük stok uyarısı', qty: '12', time: '1s' },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.5 + i * 0.1 }}
                          className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <div className="w-4 h-4 rounded bg-slate-300" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[11px] text-slate-700 font-medium">{item.product}</div>
                            <div className="text-[10px] text-slate-400">{item.action}</div>
                          </div>
                          <div className={`text-[10px] font-medium ${item.qty.startsWith('+') ? 'text-emerald-600' : item.qty.startsWith('-') ? 'text-red-500' : 'text-amber-500'}`}>
                            {item.qty}
                          </div>
                          <div className="text-[9px] text-slate-400">{item.time}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection Effect */}
          <div className="mt-1 mx-8 h-24 bg-gradient-to-b from-slate-300/20 to-transparent rounded-b-2xl blur-md transform scale-y-[-0.25] opacity-30" />
        </motion.div>
      </motion.div>

      {/* Logo Banner - Infinite Marquee with hover pause */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 py-16 overflow-hidden border-t border-slate-100/50"
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex animate-scroll-x hover:[animation-play-state:paused]">
          {[...companyLogos, ...companyLogos, ...companyLogos].map((logo, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-10 text-[16px] font-semibold text-slate-300 hover:text-slate-500 transition-colors duration-300 select-none cursor-default"
            >
              {logo}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
