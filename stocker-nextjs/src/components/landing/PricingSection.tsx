'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import type { PricingPlan } from '@/lib/api/services/cms.types';

interface PricingSectionProps {
  plans?: PricingPlan[];
}

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Internal display type for normalized plans
interface DisplayPlan {
  key: string;
  name?: string;
  description?: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  currency?: string;
  highlighted: boolean;
  features: string[];
  ctaText?: string;
  ctaLink?: string;
}

// Default fallback plans
const defaultPlans: DisplayPlan[] = [
  {
    key: 'starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    highlighted: false,
    features: [
      '100 urun limiti',
      '1 kullanici',
      'Temel raporlama',
      'E-posta destegi',
      '1 depo',
    ],
  },
  {
    key: 'pro',
    monthlyPrice: 299,
    yearlyPrice: 249,
    highlighted: true,
    features: [
      'Sinirsiz urun',
      '10 kullanici',
      'Gelismis raporlama',
      'Oncelikli destek',
      'Sinirsiz depo',
      'E-fatura entegrasyonu',
      'API erisimi',
      'CRM modulu',
    ],
  },
  {
    key: 'enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    highlighted: false,
    features: [
      'Sinirsiz her sey',
      'Sinirsiz kullanici',
      'Ozel raporlama',
      '7/24 destek',
      'Coklu sirket',
      'Ozel entegrasyonlar',
      'SLA garantisi',
      'Dedicated manager',
    ],
  },
];

export default function PricingSection({ plans }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);
  const { t } = useTranslations();

  // Use CMS plans or fallback to defaults
  const displayPlans: DisplayPlan[] =
    plans && plans.length > 0
      ? plans.map((plan) => ({
          key: plan.slug,
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          currency: plan.currency,
          highlighted: plan.isPopular || plan.isFeatured,
          features: plan.features?.map((f) => f.name) || [],
          ctaText: plan.ctaText,
          ctaLink: plan.ctaLink,
        }))
      : defaultPlans;

  return (
    <section id="pricing" className="py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-[12px] font-medium text-slate-500 uppercase tracking-wider mb-4"
          >
            Fiyatlandirma
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[32px] md:text-[42px] font-semibold text-slate-900 tracking-tight mb-4"
          >
            {t('landing.pricing.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[16px] text-slate-500 mb-8"
          >
            {t('landing.pricing.subtitle')}
          </motion.p>

          {/* Toggle - Animated */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl"
          >
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2.5 text-[13px] font-medium rounded-lg transition-all ${
                !isYearly
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('landing.pricing.monthly')}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2.5 text-[13px] font-medium rounded-lg transition-all flex items-center gap-2 ${
                isYearly
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('landing.pricing.yearly')}
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                {t('landing.pricing.discount')}
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Cards - Featured in center with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        >
          {displayPlans.map((plan) => {
            const isHighlighted = plan.highlighted;

            return (
              <motion.div
                key={plan.key}
                variants={cardVariants}
                whileHover={
                  !isHighlighted
                    ? {
                        y: -6,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        transition: { duration: 0.3 },
                      }
                    : undefined
                }
                className={`
                  relative rounded-2xl p-6 transition-colors duration-300
                  ${
                    isHighlighted
                      ? 'bg-white border-2 border-slate-900 shadow-xl shadow-slate-900/10 lg:scale-105 lg:-my-4 lg:py-10 z-10'
                      : 'bg-white border border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                {/* Popular Badge */}
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-slate-900 text-white text-[11px] font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {t('landing.pricing.mostPopular')}
                    </span>
                  </div>
                )}

                {/* Plan Info */}
                <div className="mb-6">
                  <h3
                    className={`text-[18px] font-semibold mb-1 ${isHighlighted ? 'text-slate-900' : 'text-slate-700'}`}
                  >
                    {plan.name || t(`landing.pricing.${plan.key}.name`)}
                  </h3>
                  <p className="text-[13px] text-slate-500">
                    {plan.description || t(`landing.pricing.${plan.key}.description`)}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.monthlyPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-[42px] font-bold tracking-tight ${isHighlighted ? 'text-slate-900' : 'text-slate-700'}`}
                      >
                        {plan.currency || '₺'}
                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-[14px] text-slate-500">
                        {t('landing.pricing.perMonth')}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`text-[42px] font-bold tracking-tight ${isHighlighted ? 'text-slate-900' : 'text-slate-700'}`}
                    >
                      {t('landing.pricing.custom')}
                    </div>
                  )}
                  {isYearly &&
                    plan.monthlyPrice !== null &&
                    plan.monthlyPrice > 0 &&
                    plan.yearlyPrice !== null && (
                      <div className="text-[12px] text-slate-400 mt-1">
                        Yillik odemeyle {plan.currency || '₺'}
                        {((plan.monthlyPrice - plan.yearlyPrice) * 12).toLocaleString()} tasarruf
                      </div>
                    )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.ctaLink || (plan.monthlyPrice === null ? '/contact' : '/register')}
                  className={`
                    block w-full py-3 px-4 rounded-xl text-center text-[14px] font-semibold transition-all
                    ${
                      isHighlighted
                        ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }
                  `}
                >
                  {plan.ctaText || t(`landing.pricing.${plan.key}.cta`)}
                </Link>

                {/* Divider */}
                <div className="my-6 border-t border-slate-100" />

                {/* Features */}
                <div className="space-y-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Dahil olanlar:
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <svg
                        className={`w-4 h-4 mt-0.5 shrink-0 ${isHighlighted ? 'text-slate-900' : 'text-slate-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-[13px] ${isHighlighted ? 'text-slate-700' : 'text-slate-500'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-[13px] text-slate-400">{t('landing.pricing.trialNote')}</p>
          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { icon: '🔒', text: 'Guvenli odeme' },
              { icon: '↩️', text: 'Istedigin zaman iptal' },
              { icon: '💳', text: 'Kredi karti gerekmez' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] text-slate-500">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
