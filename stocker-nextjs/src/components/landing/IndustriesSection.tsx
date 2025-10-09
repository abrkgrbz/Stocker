'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ShoppingOutlined,
  ShopOutlined,
  DeploymentUnitOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  CarOutlined,
} from '@ant-design/icons';

const industries = [
  {
    icon: <ShopOutlined />,
    title: 'Perakende',
    description: 'Mağaza stok yönetimi, raf takibi, hızlı satış noktası entegrasyonu',
    benefits: ['Barkod okuma', 'Hızlı sayım', 'Raf optimizasyonu'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <ShoppingOutlined />,
    title: 'E-ticaret',
    description: 'Multi-kanal stok senkronizasyonu, otomatik sipariş takibi, kargo entegrasyonu',
    benefits: ['N11, Trendyol, Hepsiburada', 'Otomatik stok güncelleme', 'Kargo takibi'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <DeploymentUnitOutlined />,
    title: 'Üretim',
    description: 'Hammadde takibi, üretim planlama, fire yönetimi, seri takip',
    benefits: ['Reçete yönetimi', 'Parti/seri no', 'Fire analizi'],
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: <MedicineBoxOutlined />,
    title: 'Sağlık',
    description: 'İlaç ve medikal malzeme yönetimi, son kullanma tarihi takibi, lot yönetimi',
    benefits: ['SKT takibi', 'Lot yönetimi', 'Reçete kontrol'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <HomeOutlined />,
    title: 'Toptan',
    description: 'Büyük hacimli stok yönetimi, depo optimizasyonu, müşteri bazlı fiyatlandırma',
    benefits: ['Depo yönetimi', 'Toplu fiyatlama', 'Bayi takibi'],
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: <CarOutlined />,
    title: 'Otomotiv',
    description: 'Yedek parça yönetimi, OEM kodları, araç bazlı stok organizasyonu',
    benefits: ['OEM eşleştirme', 'Parça katalogu', 'Araç bazlı stok'],
    color: 'from-gray-600 to-gray-800',
  },
];

export default function IndustriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="industries" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="inline-block mb-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
          >
            Sektörel Çözümler
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Her Sektöre Özel Çözüm
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            İster perakende, ister e-ticaret, ister üretim olsun - sektörünüze özel stok yönetimi çözümleri
          </motion.p>
        </motion.div>

        {/* Industries Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${industry.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center text-white text-3xl mb-6 shadow-lg`}
              >
                {industry.icon}
              </motion.div>

              {/* Content */}
              <h3 className="relative text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                {industry.title}
              </h3>
              <p className="relative text-gray-600 leading-relaxed mb-6">
                {industry.description}
              </p>

              {/* Benefits List */}
              <div className="relative space-y-2">
                {industry.benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Decorative Element */}
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 opacity-10"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.8 }}
              >
                <div className={`w-full h-full bg-gradient-to-br ${industry.color} rounded-full blur-2xl`}></div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Sektörünüze özel çözümümüzü keşfetmek ister misiniz?
          </p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Demo Talep Et
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
