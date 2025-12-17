'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const { t } = useTranslations();

  const plans = [
    {
      key: 'starter',
      monthlyPrice: 0,
      yearlyPrice: 0,
      highlighted: false,
    },
    {
      key: 'pro',
      monthlyPrice: 299,
      yearlyPrice: 249,
      highlighted: true,
    },
    {
      key: 'enterprise',
      monthlyPrice: null,
      yearlyPrice: null,
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-[32px] md:text-[40px] font-semibold text-slate-900 tracking-tight mb-4">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-[16px] text-slate-500 mb-8">
            {t('landing.pricing.subtitle')}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors ${
                !isYearly
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('landing.pricing.monthly')}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors ${
                isYearly
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('landing.pricing.yearly')}
              <span className="ml-1.5 text-[11px] text-emerald-600 font-semibold">{t('landing.pricing.discount')}</span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const features = t(`landing.pricing.${plan.key}.features`);
            const featureList = typeof features === 'string' ? features.split(',') : (features as unknown as string[]);

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-xl p-6 ${
                  plan.highlighted
                    ? 'border-2 border-slate-900'
                    : 'border border-slate-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-slate-900 text-white text-[11px] font-medium px-3 py-1 rounded-full">
                      {t('landing.pricing.mostPopular')}
                    </span>
                  </div>
                )}

                {/* Plan Info */}
                <div className="mb-6">
                  <h3 className="text-[16px] font-semibold text-slate-900 mb-1">
                    {t(`landing.pricing.${plan.key}.name`)}
                  </h3>
                  <p className="text-[13px] text-slate-500">
                    {t(`landing.pricing.${plan.key}.description`)}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.monthlyPrice !== null ? (
                    <div className="flex items-baseline">
                      <span className="text-[36px] font-semibold text-slate-900 tracking-tight">
                        ₺{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="ml-1.5 text-[14px] text-slate-500">{t('landing.pricing.perMonth')}</span>
                    </div>
                  ) : (
                    <div className="text-[36px] font-semibold text-slate-900 tracking-tight">
                      {t('landing.pricing.custom')}
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {featureList.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg
                        className="w-4 h-4 text-slate-400 mt-0.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[13px] text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.monthlyPrice === null ? '/contact' : '/register'}
                  className={`block w-full py-2.5 px-4 rounded-lg text-center text-[14px] font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t(`landing.pricing.${plan.key}.cta`)}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-[13px] text-slate-400 mt-8"
        >
          {t('landing.pricing.trialNote')}
        </motion.p>
      </div>
    </section>
  );
}
