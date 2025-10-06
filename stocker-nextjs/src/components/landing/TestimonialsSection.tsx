'use client';

import React from 'react';
import { Avatar } from 'antd';
import { StarFilled } from '@ant-design/icons';

const testimonials = [
  {
    name: 'Ahmet Yılmaz',
    role: 'CEO',
    company: 'TechStore AŞ',
    avatar: 'AY',
    content: 'Stocker sayesinde stok yönetimimiz çok daha kolay hale geldi. Artık stok eksikliği yaşamıyoruz ve raporlama süreçlerimiz otomatikleşti. Kesinlikle tavsiye ediyorum!',
    rating: 5,
    color: 'bg-blue-500',
  },
  {
    name: 'Ayşe Demir',
    role: 'Operasyon Müdürü',
    company: 'ModaButik',
    avatar: 'AD',
    content: 'Kullanımı çok kolay ve sezgisel. Ekibimiz hızlıca adapte oldu. Özellikle mobil uygulaması çok işlevsel, her yerden kontrol edebiliyoruz.',
    rating: 5,
    color: 'bg-purple-500',
  },
  {
    name: 'Mehmet Kaya',
    role: 'İşletme Sahibi',
    company: 'Kaya Gıda',
    avatar: 'MK',
    content: 'Fiyat/performans oranı mükemmel. Daha pahalı alternatifleri denedik ama Stocker hem daha uygun hem de daha kullanışlı. Müşteri desteği de çok başarılı.',
    rating: 5,
    color: 'bg-green-500',
  },
  {
    name: 'Zeynep Şahin',
    role: 'CFO',
    company: 'Global Ticaret',
    avatar: 'ZŞ',
    content: 'Raporlama ve analiz özellikleri gerçekten güçlü. Finans ekibimiz için vazgeçilmez oldu. Özellikle maliyet takibi ve kar/zarar analizleri çok detaylı.',
    rating: 5,
    color: 'bg-pink-500',
  },
  {
    name: 'Can Özdemir',
    role: 'Depo Müdürü',
    company: 'Lojistik Pro',
    avatar: 'CÖ',
    content: 'Barkod sistemi ve otomatik sayım özellikleri işimizi hızlandırdı. Hata payını minimuma indirdik. Entegrasyon seçenekleri de çok geniş.',
    rating: 5,
    color: 'bg-orange-500',
  },
  {
    name: 'Elif Arslan',
    role: 'Genel Müdür',
    company: 'E-Ticaret Dünyası',
    avatar: 'EA',
    content: 'E-ticaret sitemizle entegrasyonu sorunsuz çalışıyor. Stok senkronizasyonu gerçek zamanlı. Müşteri memnuniyetimiz arttı çünkü stok bilgileri her zaman güncel.',
    rating: 5,
    color: 'bg-indigo-500',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Binlerce mutlu müşterimizin deneyimlerini dinleyin
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 relative group"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarFilled key={i} className="text-yellow-400 text-lg" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <Avatar size={56} className={`${testimonial.color} text-white font-semibold text-lg`}>
                  {testimonial.avatar}
                </Avatar>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </div>

              {/* Decorative Gradient */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${testimonial.color.replace('bg-', 'from-')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}></div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
            <div className="text-gray-600 text-sm">Ortalama Puan</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">2,500+</div>
            <div className="text-gray-600 text-sm">Yorumlar</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600 text-sm">Tavsiye Oranı</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
            <div className="text-gray-600 text-sm">Aktif Kullanıcı</div>
          </div>
        </div>
      </div>
    </section>
  );
}
