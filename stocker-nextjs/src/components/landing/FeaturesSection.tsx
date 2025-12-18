'use client';

import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Mini UI Snippets for each feature
const FeatureSnippets = {
  inventory: () => (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-medium text-slate-700">Stok Durumu</span>
        <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">Güncel</span>
      </div>
      <div className="space-y-2">
        {[
          { name: 'iPhone 15 Pro', qty: 124, status: 'high' },
          { name: 'MacBook Air', qty: 23, status: 'medium' },
          { name: 'AirPods Pro', qty: 8, status: 'low' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-100" />
            <div className="flex-1">
              <div className="text-[9px] text-slate-600">{item.name}</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.status === 'high' ? 'bg-emerald-500 w-[80%]' :
                    item.status === 'medium' ? 'bg-amber-400 w-[45%]' :
                    'bg-red-400 w-[15%]'
                  }`}
                />
              </div>
            </div>
            <span className="text-[9px] font-medium text-slate-500">{item.qty}</span>
          </div>
        ))}
      </div>
    </div>
  ),

  invoice: () => (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-700">E-Fatura #2024-847</div>
          <div className="text-[9px] text-emerald-600">GİB Onaylandı</div>
        </div>
      </div>
      <div className="space-y-1.5 text-[9px]">
        <div className="flex justify-between text-slate-500">
          <span>Müşteri:</span>
          <span className="text-slate-700">ABC Teknoloji Ltd.</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Tutar:</span>
          <span className="text-slate-900 font-semibold">₺12,450.00</span>
        </div>
      </div>
    </div>
  ),

  reports: () => (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div className="text-[10px] font-medium text-slate-700 mb-2">Aylık Gelir</div>
      <div className="flex items-end gap-0.5 h-16">
        {[35, 45, 38, 52, 48, 65, 72, 68, 78, 85, 82, 95].map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t transition-all ${i === 11 ? 'bg-slate-900' : 'bg-slate-200'}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px] text-slate-400">Oca</span>
        <span className="text-[9px] text-slate-400">Ara</span>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] text-slate-500">Bu Ay</span>
        <span className="text-[11px] font-semibold text-slate-900">₺847,250</span>
      </div>
    </div>
  ),

  crm: () => (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div className="text-[10px] font-medium text-slate-700 mb-3">Satış Pipeline</div>
      <div className="space-y-2">
        {[
          { stage: 'Lead', count: 24, color: 'bg-blue-100 text-blue-700', width: '100%' },
          { stage: 'Teklif', count: 12, color: 'bg-amber-100 text-amber-700', width: '60%' },
          { stage: 'Müzakere', count: 5, color: 'bg-violet-100 text-violet-700', width: '35%' },
          { stage: 'Kazanıldı', count: 3, color: 'bg-emerald-100 text-emerald-700', width: '20%' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${item.color}`}>
              {item.count}
            </span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-300 rounded-full" style={{ width: item.width }} />
            </div>
            <span className="text-[8px] text-slate-400 w-12">{item.stage}</span>
          </div>
        ))}
      </div>
    </div>
  ),

  multitenancy: () => (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div className="text-[10px] font-medium text-slate-700 mb-3">Şirketlerim</div>
      <div className="space-y-2">
        {[
          { name: 'ABC Teknoloji', role: 'Yönetici', active: true },
          { name: 'XYZ Holding', role: 'Görüntüleyici', active: false },
          { name: 'Demo Şirket', role: 'Düzenleyici', active: false },
        ].map((company, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
              company.active ? 'bg-slate-100' : 'hover:bg-slate-50'
            }`}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${
              company.active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {company.name[0]}
            </div>
            <div className="flex-1">
              <div className="text-[9px] font-medium text-slate-700">{company.name}</div>
              <div className="text-[8px] text-slate-400">{company.role}</div>
            </div>
            {company.active && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  ),

  security: () => (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-700">Güvenlik Durumu</div>
          <div className="text-[9px] text-emerald-600">Tüm sistemler korumalı</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {[
          { label: '2FA Aktif', enabled: true },
          { label: 'SSL Sertifikası', enabled: true },
          { label: 'Denetim Logları', enabled: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between text-[9px]">
            <span className="text-slate-500">{item.label}</span>
            <span className={item.enabled ? 'text-emerald-500' : 'text-slate-300'}>
              {item.enabled ? '✓' : '○'}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

const featureIcons = {
  inventory: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  invoice: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  reports: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  crm: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  multitenancy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  security: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

// Bento grid layout configuration
const bentoConfig = [
  { key: 'inventory', colSpan: 2, rowSpan: 1, size: 'large' },
  { key: 'invoice', colSpan: 1, rowSpan: 1, size: 'small' },
  { key: 'reports', colSpan: 1, rowSpan: 1, size: 'small' },
  { key: 'crm', colSpan: 2, rowSpan: 1, size: 'large' },
  { key: 'multitenancy', colSpan: 1, rowSpan: 1, size: 'small' },
  { key: 'security', colSpan: 1, rowSpan: 1, size: 'small' },
] as const;

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t } = useTranslations();

  return (
    <section id="features" className="py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-[12px] font-medium text-slate-500 uppercase tracking-wider mb-4"
          >
            Özellikler
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[32px] md:text-[42px] font-semibold text-slate-900 tracking-tight mb-4"
          >
            {t('landing.features.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[16px] text-slate-500 max-w-lg mx-auto"
          >
            {t('landing.features.subtitle')}
          </motion.p>
        </motion.div>

        {/* Bento Grid - with staggered animation */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr"
        >
          {bentoConfig.map((item, index) => {
            const SnippetComponent = FeatureSnippets[item.key];
            const isLarge = item.colSpan === 2;

            return (
              <motion.div
                key={item.key}
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                  transition: { duration: 0.3 }
                }}
                className={`
                  group relative p-6 bg-white border border-slate-200/80 rounded-2xl
                  hover:border-slate-300
                  transition-colors duration-300
                  ${isLarge ? 'lg:col-span-2' : 'lg:col-span-1'}
                `}
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                <div className={`relative z-10 ${isLarge ? 'flex gap-6' : ''}`}>
                  {/* Left Side - Content */}
                  <div className={isLarge ? 'flex-1' : ''}>
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-4 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300">
                      {featureIcons[item.key]}
                    </div>

                    {/* Content */}
                    <h3 className="text-[16px] font-semibold text-slate-900 mb-2">
                      {t(`landing.features.${item.key}.title`)}
                    </h3>
                    <p className="text-[14px] text-slate-500 leading-relaxed">
                      {t(`landing.features.${item.key}.description`)}
                    </p>
                  </div>

                  {/* Right Side - UI Snippet (only for large cards) */}
                  {isLarge && (
                    <div className="hidden lg:block w-56 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                      <SnippetComponent />
                    </div>
                  )}
                </div>

                {/* Small card snippet - show below content */}
                {!isLarge && (
                  <div className="mt-4 opacity-60 group-hover:opacity-100 transition-opacity">
                    <SnippetComponent />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="/features"
            className="group inline-flex items-center gap-2 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            {t('landing.features.viewAll')}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
