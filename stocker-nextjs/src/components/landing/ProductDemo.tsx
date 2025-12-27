'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from 'antd';
import {
  Squares2X2Icon,
  ChartBarIcon,
  BellIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const features = [
  {
    id: 'dashboard',
    title: 'Akıllı Dashboard',
    icon: <Squares2X2Icon className="w-8 h-8" />,
    description: 'Tüm stok hareketlerinizi tek bir ekranda görüntüleyin',
    benefits: [
      'Gerçek zamanlı stok seviyeleri',
      'Kritik stok uyarıları',
      'Hızlı erişim menüleri',
      'Özelleştirilebilir widget\'lar',
    ],
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'analytics',
    title: 'Detaylı Analitik',
    icon: <ChartBarIcon className="w-8 h-8" />,
    description: 'Veriye dayalı kararlar alın, işletmenizi büyütün',
    benefits: [
      'Satış trendleri analizi',
      'Stok performans raporları',
      'Tahmin ve öngörüler',
      'Excel/PDF export',
    ],
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'alerts',
    title: 'Akıllı Bildirimler',
    icon: <BellIcon className="w-8 h-8" />,
    description: 'Kritik durumlarda anında haberdar olun',
    benefits: [
      'Düşük stok uyarıları',
      'Son kullanma tarihi takibi',
      'Email & SMS bildirimleri',
      'Özel alarm kuralları',
    ],
    color: 'from-orange-600 to-red-600',
  },
  {
    id: 'orders',
    title: 'Sipariş Yönetimi',
    icon: <ShoppingCartIcon className="w-8 h-8" />,
    description: 'Siparişlerinizi otomatik yönetin, zamandan tasarruf edin',
    benefits: [
      'Otomatik sipariş oluşturma',
      'Tedarikçi entegrasyonu',
      'Sipariş takibi',
      'Fatura yönetimi',
    ],
    color: 'from-green-600 to-teal-600',
  },
];

export default function ProductDemo() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Güçlü Özellikler
            </span>
            {' '}ile Tanışın
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            İşletmenizin ihtiyacı olan tüm araçlar tek platformda
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature Tabs */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  hoverable
                  onClick={() => setActiveFeature(feature)}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeFeature.id === feature.id
                      ? 'bg-gradient-to-r ' + feature.color + ' text-white scale-105'
                      : 'bg-gray-800/50 hover:bg-gray-800'
                  }`}
                  variant="borderless"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`text-3xl ${
                        activeFeature.id === feature.id ? 'text-white' : 'text-purple-400'
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2 ${
                          activeFeature.id === feature.id ? 'text-white' : 'text-gray-200'
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`${
                          activeFeature.id === feature.id
                            ? 'text-white/90'
                            : 'text-gray-400'
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Feature Content */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
              >
                <div className={`text-5xl mb-6 bg-gradient-to-r ${activeFeature.color} w-16 h-16 rounded-xl flex items-center justify-center text-white`}>
                  {activeFeature.icon}
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  {activeFeature.title}
                </h3>

                <p className="text-gray-400 mb-6">
                  {activeFeature.description}
                </p>

                <div className="space-y-3">
                  {activeFeature.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircleIconSolid className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Mock Screenshot/Visual */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`mt-8 h-48 bg-gradient-to-br ${activeFeature.color} opacity-20 rounded-xl flex items-center justify-center`}
                >
                  <div className="text-6xl text-white/30">
                    {activeFeature.icon}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
