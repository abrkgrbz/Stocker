'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  CpuChipIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CloudIcon,
  CurrencyDollarIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { useTranslations } from '@/lib/i18n';

export default function IntegrationsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t } = useTranslations();

  const integrations = [
    {
      categoryKey: 'erp',
      icon: <CircleStackIcon className="w-6 h-6" />,
      systems: ['SAP', 'Oracle ERP', 'Microsoft Dynamics', 'Logo', 'Netsis'],
      color: 'from-blue-600 to-blue-800',
    },
    {
      categoryKey: 'ecommerce',
      icon: <ShoppingCartIcon className="w-6 h-6" />,
      systems: ['Trendyol', 'Hepsiburada', 'N11', 'Gittigidiyor', 'Amazon TR'],
      color: 'from-gray-600 to-gray-800',
    },
    {
      categoryKey: 'accounting',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      systems: ['Logo', 'Mikro', 'Eta', 'Nebim', 'Zirve'],
      color: 'from-green-600 to-emerald-600',
    },
    {
      categoryKey: 'payment',
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      systems: ['iyzico', 'PayTR', 'Payu', 'Stripe', 'PayPal'],
      color: 'from-orange-600 to-red-600',
    },
    {
      categoryKey: 'cargo',
      icon: <CloudIcon className="w-6 h-6" />,
      systems: ['Aras Kargo', 'Yurtiçi', 'MNG', 'PTT', 'UPS'],
      color: 'from-gray-500 to-gray-700',
    },
    {
      categoryKey: 'api',
      icon: <CpuChipIcon className="w-6 h-6" />,
      systems: ['REST API', 'Webhooks', 'GraphQL', 'Custom Integration', 'Zapier'],
      color: 'from-gray-700 to-gray-900',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as any,
      },
    },
  } as any;

  return (
    <section id="integrations" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold"
          >
            {t('landing.integrations.badge')}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t('landing.integrations.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {t('landing.integrations.subtitle')}
          </motion.p>
        </motion.div>

        {/* Integrations Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${integration.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}
              >
                {integration.icon}
              </motion.div>

              {/* Category */}
              <h3 className="relative text-2xl font-bold text-gray-900 mb-3">
                {t(`landing.integrations.${integration.categoryKey}.title`)}
              </h3>

              {/* Description */}
              <p className="relative text-gray-600 text-sm leading-relaxed mb-6">
                {t(`landing.integrations.${integration.categoryKey}.description`)}
              </p>

              {/* Systems Tags */}
              <div className="relative flex flex-wrap gap-2">
                {integration.systems.map((system, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * idx }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 cursor-pointer"
                  >
                    {system}
                  </motion.span>
                ))}
              </div>

              {/* Connector Icon */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute top-8 right-8"
              >
                <svg className="w-6 h-6 text-gray-300 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* API Documentation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 bg-gradient-to-r from-gray-900 to-black rounded-2xl p-12 text-center text-white shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CpuChipIcon className="w-12 h-12" />
          </motion.div>
          <h3 className="text-3xl font-bold mb-4">
            {t('landing.integrations.apiTitle')}
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('landing.integrations.apiSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="#api-docs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('landing.integrations.apiDocs')}
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gray-700/50 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-gray-700/70 transition-all duration-300"
            >
              {t('landing.integrations.apiSupport')}
            </motion.a>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
