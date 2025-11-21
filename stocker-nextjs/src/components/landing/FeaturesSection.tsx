'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from '@/lib/i18n';
import {
  RocketOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  LineChartOutlined,
  CloudOutlined,
  TeamOutlined,
  BellOutlined,
  MobileOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

const features = [
  {
    icon: <RocketOutlined />,
    title: 'Hızlı Başlangıç',
    description: 'Dakikalar içinde kurulum yapın ve hemen kullanmaya başlayın. Karmaşık konfigürasyonlara son.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Yüksek Performans',
    description: 'Optimize edilmiş altyapı ile binlerce işlemi saniyeler içinde gerçekleştirin.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: <SafetyOutlined />,
    title: 'Güvenli ve Şifreli',
    description: 'Verileriniz en üst düzey güvenlik standartları ile korunur. SSL ve şifreli depolama.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <LineChartOutlined />,
    title: 'Anlık Raporlama',
    description: 'Gerçek zamanlı raporlar ve analizlerle işinizi her an takip edin.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <CloudOutlined />,
    title: 'Bulut Tabanlı',
    description: 'Her yerden, her cihazdan erişim. Verileriniz güvende ve her zaman hazır.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: <TeamOutlined />,
    title: 'Ekip Yönetimi',
    description: 'Çalışanlarınıza rol ve yetki verin. Tüm ekibinizle birlikte çalışın.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: <BellOutlined />,
    title: 'Akıllı Bildirimler',
    description: 'Kritik durumlarda anında haberdar olun. Özelleştirilebilir bildirim sistemi.',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: <MobileOutlined />,
    title: 'Mobil Uyumlu',
    description: 'Responsive tasarım ile mobil cihazlardan sorunsuz kullanım.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: <DatabaseOutlined />,
    title: 'Otomatik Yedekleme',
    description: 'Verileriniz otomatik olarak yedeklenir. Veri kaybı riski sıfır.',
    color: 'from-amber-500 to-orange-500',
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t } = useTranslations();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as any,
      },
    },
  } as any;

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t('landing.features.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {t('landing.features.subtitle')}
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}
              >
                {feature.icon}
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute bottom-8 right-8"
              >
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
