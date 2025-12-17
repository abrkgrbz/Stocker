'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';

const logos = [
  { name: 'TechCorp', id: 1 },
  { name: 'InnovateTR', id: 2 },
  { name: 'GrowthCo', id: 3 },
  { name: 'ScaleUp', id: 4 },
  { name: 'ModernBiz', id: 5 },
];

export default function SocialProof() {
  const { t } = useTranslations();

  const stats = [
    { value: '2,500+', label: t('landing.socialProof.stats.businesses') },
    { value: '₺50M+', label: t('landing.socialProof.stats.volume') },
    { value: '99.9%', label: t('landing.socialProof.stats.uptime') },
    { value: '4.9/5', label: t('landing.socialProof.stats.rating') },
  ];

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[12px] uppercase tracking-wider text-slate-400 font-medium mb-8">
            {t('landing.socialProof.trustedBy')}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="text-[15px] font-semibold text-slate-300 hover:text-slate-400 transition-colors"
              >
                {logo.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-[28px] font-semibold text-slate-900 tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-[13px] text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
