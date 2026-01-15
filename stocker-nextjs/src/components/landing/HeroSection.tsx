'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import { useAuth } from '@/lib/auth/auth-context';
import dynamic from 'next/dynamic';

// Dynamic import for GradientMesh to avoid SSR issues with Three.js
const GradientMesh = dynamic(() => import('./GradientMesh'), {
  ssr: false,
  loading: () => null,
});

// Company logos for the trust banner
const companyLogos = [
  'Migros', 'Getir', 'Trendyol', 'Hepsiburada', 'N11', 'LC Waikiki', 'DeFacto', 'Koçtaş',
  'Teknosa', 'MediaMarkt', 'Boyner', 'Mavi'
];

// Dashboard menu items with icons
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'stock', label: 'Stok', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'orders', label: 'Siparişler', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'customers', label: 'Müşteriler', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'reports', label: 'Raporlar', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

// Mock data for different pages
const mockPageData = {
  dashboard: {
    stats: [
      { label: 'Toplam Stok', value: '12,458', change: '+12%', color: 'emerald' },
      { label: 'Siparişler', value: '847', change: '+8%', color: 'blue' },
      { label: 'Gelir', value: '₺284K', change: '+23%', color: 'violet' },
      { label: 'Müşteriler', value: '2,156', change: '+5%', color: 'amber' },
    ],
    chartTitle: 'Satış Trendi',
    chartData: [32, 45, 38, 52, 48, 65, 58, 72, 68, 85, 78, 92],
    activities: [
      { product: 'iPhone 15 Pro', action: 'Stok güncellendi', qty: '+50', time: '2dk' },
      { product: 'MacBook Air M3', action: 'Sipariş alındı', qty: '-3', time: '15dk' },
      { product: 'AirPods Pro 2', action: 'Düşük stok uyarısı', qty: '12', time: '1s' },
    ],
    headerTitle: 'Genel Bakış',
    headerSubtitle: 'Hoş geldiniz',
    actionButton: '+ Yeni Ürün',
  },
  stock: {
    stats: [
      { label: 'Toplam Ürün', value: '3,847', change: '+5%', color: 'blue' },
      { label: 'Düşük Stok', value: '23', change: '-8%', color: 'red' },
      { label: 'Stok Değeri', value: '₺1.2M', change: '+15%', color: 'emerald' },
      { label: 'Kategoriler', value: '48', change: '+2%', color: 'violet' },
    ],
    chartTitle: 'Stok Hareketleri',
    chartData: [65, 72, 58, 85, 92, 78, 68, 55, 82, 90, 75, 88],
    activities: [
      { product: 'Samsung Galaxy S24', action: 'Stok eklendi', qty: '+100', time: '5dk' },
      { product: 'Sony WH-1000XM5', action: 'Kritik stok seviyesi', qty: '5', time: '30dk' },
      { product: 'iPad Pro 12.9', action: 'Stok transferi', qty: '+25', time: '2s' },
    ],
    headerTitle: 'Stok Yönetimi',
    headerSubtitle: '3,847 ürün',
    actionButton: '+ Stok Ekle',
  },
  orders: {
    stats: [
      { label: 'Bekleyen', value: '156', change: '+18%', color: 'amber' },
      { label: 'Hazırlanan', value: '89', change: '+12%', color: 'blue' },
      { label: 'Kargoda', value: '234', change: '+25%', color: 'violet' },
      { label: 'Teslim Edildi', value: '1,458', change: '+8%', color: 'emerald' },
    ],
    chartTitle: 'Sipariş Trendi',
    chartData: [45, 52, 68, 75, 82, 65, 78, 92, 85, 70, 88, 95],
    activities: [
      { product: '#SP-2847', action: 'Yeni sipariş alındı', qty: '₺2,450', time: '1dk' },
      { product: '#SP-2846', action: 'Kargoya verildi', qty: '₺890', time: '10dk' },
      { product: '#SP-2845', action: 'Teslim edildi', qty: '₺1,200', time: '45dk' },
    ],
    headerTitle: 'Siparişler',
    headerSubtitle: '847 aktif sipariş',
    actionButton: '+ Sipariş Oluştur',
  },
  customers: {
    stats: [
      { label: 'Toplam Müşteri', value: '2,156', change: '+5%', color: 'blue' },
      { label: 'Aktif', value: '1,847', change: '+12%', color: 'emerald' },
      { label: 'Yeni (Bu Ay)', value: '156', change: '+28%', color: 'violet' },
      { label: 'Sadık Müşteri', value: '892', change: '+8%', color: 'amber' },
    ],
    chartTitle: 'Müşteri Büyümesi',
    chartData: [25, 35, 42, 55, 48, 62, 58, 72, 78, 85, 82, 95],
    activities: [
      { product: 'Ahmet Yılmaz', action: 'Yeni kayıt', qty: 'Premium', time: '3dk' },
      { product: 'Zeynep Kaya', action: 'Sipariş verdi', qty: '₺3,200', time: '20dk' },
      { product: 'Mehmet Demir', action: 'Sadık müşteri oldu', qty: '10+ sipariş', time: '1s' },
    ],
    headerTitle: 'Müşteriler',
    headerSubtitle: '2,156 kayıtlı müşteri',
    actionButton: '+ Müşteri Ekle',
  },
  reports: {
    stats: [
      { label: 'Aylık Gelir', value: '₺847K', change: '+23%', color: 'emerald' },
      { label: 'Kar Marjı', value: '%24.5', change: '+3%', color: 'blue' },
      { label: 'Ortalama Sepet', value: '₺456', change: '+8%', color: 'violet' },
      { label: 'Dönüşüm Oranı', value: '%12.8', change: '+2%', color: 'amber' },
    ],
    chartTitle: 'Gelir Analizi',
    chartData: [55, 62, 58, 72, 68, 85, 78, 92, 88, 95, 90, 98],
    activities: [
      { product: 'Haftalık Rapor', action: 'Otomatik oluşturuldu', qty: 'PDF', time: '1s' },
      { product: 'Stok Analizi', action: 'İnceleme bekliyor', qty: 'Excel', time: '2s' },
      { product: 'Satış Özeti', action: 'Gönderildi', qty: 'Email', time: '1g' },
    ],
    headerTitle: 'Raporlar',
    headerSubtitle: 'Analiz ve istatistikler',
    actionButton: '+ Rapor Oluştur',
  },
};

export default function HeroSection() {
  const { t, locale, setLocale } = useTranslations();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activePage, setActivePage] = useState<keyof typeof mockPageData>('dashboard');
  const { scrollY } = useScroll();

  // Get current page data
  const currentPageData = mockPageData[activePage];

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
    <section className="relative min-h-screen overflow-hidden bg-[#0c0f1a]">
      {/* Gradient Mesh Background - Full coverage */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-[#0c0f1a]" />}>
          <GradientMesh />
        </Suspense>
      </div>

      {/* Content Fade Overlay - transition to white at bottom for other sections */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-white/95 pointer-events-none" />

      {/* STICKY Navigation - Glassmorphism (Dark Theme) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/stoocker_white.png"
              alt="Stoocker Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              {t('landing.navbar.features')}
            </Link>
            <Link href="/pricing" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              {t('landing.navbar.pricing')}
            </Link>
            <Link href="/faq" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              {t('landing.navbar.faq')}
            </Link>
          </div>

          {/* Auth & Language */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center border border-slate-600 rounded-md overflow-hidden bg-slate-800/50 backdrop-blur-sm">
              <button
                onClick={() => locale !== 'tr' && setLocale('tr')}
                className={`px-2 py-1 text-[12px] font-medium transition-colors ${
                  locale === 'tr'
                    ? 'bg-white text-slate-900'
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                TR
              </button>
              <button
                onClick={() => locale !== 'en' && setLocale('en')}
                className={`px-2 py-1 text-[12px] font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-white text-slate-900'
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {isLoading ? (
              <div className="w-20 h-8 bg-slate-700/50 rounded-md animate-pulse" />
            ) : isAuthenticated && user?.tenantCode ? (
              <a
                href={`https://${user.tenantCode}.stoocker.app/app`}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-md transition-all hover:shadow-lg hover:shadow-white/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {t('landing.navbar.goToDashboard')}
              </a>
            ) : (
              <>
                <Link href="/login" className="text-[13px] text-slate-300 hover:text-white transition-colors">
                  {t('landing.navbar.signIn')}
                </Link>
                <Link
                  href="/register"
                  className="text-[13px] font-medium text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-md transition-all hover:shadow-lg hover:shadow-white/20"
                >
                  {t('landing.navbar.getStarted')}
                </Link>
              </>
            )}
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
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-600 bg-slate-800/60 backdrop-blur-sm mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[12px] text-slate-300">{t('landing.hero.badge')}</span>
        </motion.div>

        {/* Headline - Staggered */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[48px] md:text-[60px] font-semibold text-white tracking-tight leading-[1.1] mb-6"
        >
          {t('landing.hero.title1')}
          <br />
          <span className="bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent">
            {t('landing.hero.title2')}
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[17px] text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed"
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
          {isAuthenticated && user?.tenantCode ? (
            <a
              href={`https://${user.tenantCode}.stoocker.app/app`}
              className="group inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 text-[14px] font-medium px-6 py-3 rounded-lg transition-all hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              {t('landing.navbar.goToDashboard')}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          ) : (
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 text-[14px] font-medium px-6 py-3 rounded-lg transition-all hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
            >
              {t('landing.hero.cta')}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/60 text-white text-[14px] font-medium px-6 py-3 rounded-lg border border-slate-600 transition-all hover:border-slate-500 hover:shadow-lg hover:-translate-y-0.5"
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
          className="text-[13px] text-slate-500 mt-8"
        >
          {t('landing.hero.trustLine')}
        </motion.p>

        {/* Turkey Regulatory Compliance Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-3">
            {/* GİB Entegrasyonu */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-medium text-emerald-300">e-Fatura / GİB Entegre</span>
            </div>

            {/* SGK Uyumu */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[11px] font-medium text-blue-300">SGK Uyumlu</span>
            </div>

            {/* KVKK */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[11px] font-medium text-purple-300">KVKK Uyumlu</span>
            </div>

            {/* Ba-Bs */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[11px] font-medium text-amber-300">Ba-Bs Formu</span>
            </div>
          </div>

          {/* Legal Reference Text */}
          <p className="text-[11px] text-slate-500 mt-4">
            213 VUK • 3065 KDV • 193 GVK • 5510 SGK • 6698 KVKK
          </p>
        </motion.div>
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
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-gradient-to-br from-slate-600/40 via-blue-900/30 to-slate-700/40 blur-3xl rounded-full"
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
            className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-gradient-to-r from-blue-800/30 to-indigo-800/30 blur-2xl rounded-full"
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
                  stoocker.app
                </div>
              </div>
            </div>

            {/* Dashboard UI - Enhanced with micro-animations */}
            <div className="p-5 bg-gradient-to-br from-slate-50/80 to-white">
              <div className="flex gap-5">
                {/* Sidebar - Interactive */}
                <div className="w-48 shrink-0 space-y-2">
                  <div className="h-8 bg-slate-900 rounded-lg mb-5 flex items-center justify-center">
                    <div className="w-20 h-3 bg-white/20 rounded" />
                  </div>
                  {menuItems.map((item, i) => {
                    const isActive = activePage === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        onClick={() => setActivePage(item.id as keyof typeof mockPageData)}
                        className={`w-full h-8 rounded-lg flex items-center px-3 gap-2 transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 shadow-lg shadow-slate-900/20'
                            : 'bg-slate-100/60 hover:bg-slate-200/80'
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                        <span className={`text-[11px] ${isActive ? 'text-white font-medium' : 'text-slate-500'}`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Main Content - Dynamic based on active page */}
                <div className="flex-1 space-y-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePage}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[14px] font-semibold text-slate-800">{currentPageData.headerTitle}</div>
                          <div className="text-[11px] text-slate-400">{currentPageData.headerSubtitle}</div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 w-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <div className="h-8 w-28 bg-slate-900 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                            <span className="text-[10px] text-white">{currentPageData.actionButton}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Row - Dynamic */}
                      <div className="grid grid-cols-4 gap-3">
                        {currentPageData.stats.map((stat, i) => (
                          <motion.div
                            key={`${activePage}-stat-${i}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-slate-400">{stat.label}</span>
                              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                                stat.change.startsWith('+')
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-red-50 text-red-600'
                              }`}>
                                {stat.change}
                              </span>
                            </div>
                            <div className="text-[16px] font-semibold text-slate-900">{stat.value}</div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Chart with animated bars - Dynamic */}
                      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[11px] font-medium text-slate-700">{currentPageData.chartTitle}</span>
                          <div className="flex gap-1">
                            {['7G', '30G', '90G'].map((period, i) => (
                              <span
                                key={period}
                                className={`text-[9px] px-2 py-1 rounded cursor-pointer transition-colors ${
                                  i === 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {period}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-end gap-1 h-24">
                          {currentPageData.chartData.map((h, i) => (
                            <motion.div
                              key={`${activePage}-chart-${i}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 0.4, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                              className={`flex-1 rounded-t transition-colors ${
                                i === currentPageData.chartData.length - 1 ? 'bg-slate-900' : 'bg-slate-200 hover:bg-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Recent Activity - Dynamic */}
                      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                        <span className="text-[11px] font-medium text-slate-700 mb-3 block">Son İşlemler</span>
                        <div className="space-y-2">
                          {currentPageData.activities.map((item, i) => (
                            <motion.div
                              key={`${activePage}-activity-${i}`}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.05 }}
                              className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 rounded-lg transition-colors cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <div className="w-4 h-4 rounded bg-slate-300" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[11px] text-slate-700 font-medium">{item.product}</div>
                                <div className="text-[10px] text-slate-400">{item.action}</div>
                              </div>
                              <div className={`text-[10px] font-medium ${
                                item.qty.startsWith('+')
                                  ? 'text-emerald-600'
                                  : item.qty.startsWith('-')
                                    ? 'text-red-500'
                                    : item.qty.startsWith('₺')
                                      ? 'text-blue-600'
                                      : 'text-amber-500'
                              }`}>
                                {item.qty}
                              </div>
                              <div className="text-[9px] text-slate-400">{item.time}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
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
        className="relative z-10 py-16 overflow-hidden border-t border-white/10"
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex animate-scroll-x hover:[animation-play-state:paused]">
          {[...companyLogos, ...companyLogos, ...companyLogos].map((logo, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-10 text-[16px] font-semibold text-slate-400 hover:text-slate-600 transition-colors duration-300 select-none cursor-default"
            >
              {logo}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
