'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    content: 'Stoocker ile envanter yönetimimiz tamamen değişti. Eskiden saatler süren stok sayımları artık dakikalar içinde tamamlanıyor. Müşteri memnuniyetimiz %40 arttı.',
    author: 'Ahmet Yılmaz',
    role: 'Operasyon Müdürü',
    company: 'TechStore Türkiye',
    avatar: 'AY',
    rating: 5,
  },
  {
    id: 2,
    content: 'E-fatura entegrasyonu hayat kurtarıcı oldu. Tek tıkla fatura kesebilmek ve GİB ile sorunsuz çalışmak inanılmaz bir kolaylık. Muhasebe ekibimiz çok mutlu.',
    author: 'Zeynep Kaya',
    role: 'Finans Direktörü',
    company: 'ModernMart',
    avatar: 'ZK',
    rating: 5,
  },
  {
    id: 3,
    content: 'Çoklu şirket yönetimi özelliği bizi Stoocker\'a bağlayan en önemli faktör. 5 farklı şirketimizi tek panelden yönetiyoruz. Zaman tasarrufu müthiş.',
    author: 'Mehmet Demir',
    role: 'Genel Müdür',
    company: 'Demir Holding',
    avatar: 'MD',
    rating: 5,
  },
  {
    id: 4,
    content: 'Raporlama özellikleri gerçekten profesyonel seviyede. Satış trendlerini, stok dönüş hızlarını anlık takip edebiliyorum. Karar alma süreçlerimiz hızlandı.',
    author: 'Elif Şahin',
    role: 'Satış Müdürü',
    company: 'GrowthCo',
    avatar: 'EŞ',
    rating: 5,
  },
];

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white border-t border-slate-100 overflow-hidden">
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
            Müşteri Yorumları
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[32px] md:text-[42px] font-semibold text-slate-900 tracking-tight mb-4"
          >
            Binlerce işletme güveniyor
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[16px] text-slate-500 max-w-lg mx-auto"
          >
            Türkiye'nin önde gelen işletmeleri neden Stoocker'ı tercih ediyor?
          </motion.p>
        </motion.div>

        {/* Testimonials Grid - Masonry Style with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              whileHover={{
                y: -4,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                transition: { duration: 0.3 }
              }}
              className={`
                group relative bg-white border border-slate-200 rounded-2xl p-6
                hover:border-slate-300
                transition-colors duration-300
                ${index === 0 || index === 3 ? 'md:row-span-1' : ''}
              `}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 left-6">
                <svg
                  className="w-8 h-8 text-slate-100 group-hover:text-slate-200 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Content */}
              <div className="relative pt-8">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[15px] text-slate-600 leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-[12px] font-semibold text-white">
                      {testimonial.avatar}
                    </span>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="text-[14px] font-semibold text-slate-900">
                      {testimonial.author}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {testimonial.role} · {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row - Staggered Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.2 }
            }
          }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '2,500+', label: 'Aktif İşletme' },
            { value: '₺50M+', label: 'Aylık İşlem Hacmi' },
            { value: '99.9%', label: 'Uptime Garantisi' },
            { value: '4.9/5', label: 'Ortalama Puan' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                }
              }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
              className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-100/50 transition-colors duration-300"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="text-[28px] font-semibold text-slate-900 tracking-tight mb-1"
              >
                {stat.value}
              </motion.div>
              <div className="text-[13px] text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
