'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

type UpdateType = 'feature' | 'improvement' | 'fix' | 'security';

interface Update {
  version: string;
  date: string;
  title: string;
  description: string;
  type: UpdateType;
  changes: string[];
}

const updates: Update[] = [
  {
    version: '2.4.0',
    date: '11 Aralık 2024',
    title: 'CRM Modülü Genişletmesi',
    description: 'Müşteri ilişkileri yönetimi için kapsamlı yeni özellikler.',
    type: 'feature',
    changes: [
      'Satış ekipleri ve bölge yönetimi eklendi',
      'Toplantı ve arama kayıtları takibi',
      'Rakip analizi modülü',
      'Sadakat programları yönetimi',
      'Referans takip sistemi',
    ],
  },
  {
    version: '2.3.0',
    date: '28 Kasım 2024',
    title: 'Gelişmiş Raporlama',
    description: 'Daha detaylı analizler ve özelleştirilebilir raporlar.',
    type: 'feature',
    changes: [
      'Özelleştirilebilir dashboard widget\'ları',
      'Excel ve PDF export seçenekleri',
      'Otomatik rapor zamanlama',
      'Karşılaştırmalı dönem analizleri',
    ],
  },
  {
    version: '2.2.1',
    date: '15 Kasım 2024',
    title: 'Performans İyileştirmeleri',
    description: 'Sistem genelinde hız ve kararlılık artışı.',
    type: 'improvement',
    changes: [
      'Sayfa yükleme süreleri %40 azaltıldı',
      'Veritabanı sorgu optimizasyonları',
      'Önbellek mekanizması güncellendi',
      'Mobil deneyim iyileştirildi',
    ],
  },
  {
    version: '2.2.0',
    date: '1 Kasım 2024',
    title: 'Envanter Yönetimi v2',
    description: 'Stok takibinde devrim niteliğinde yenilikler.',
    type: 'feature',
    changes: [
      'Barkod tanımlama ve okuma sistemi',
      'Depo bölge yönetimi',
      'Raf ömrü takibi',
      'Kalite kontrol modülü',
      'Döngüsel sayım desteği',
    ],
  },
  {
    version: '2.1.2',
    date: '20 Ekim 2024',
    title: 'Güvenlik Güncellemesi',
    description: 'Kritik güvenlik yamaları ve iyileştirmeler.',
    type: 'security',
    changes: [
      'İki faktörlü kimlik doğrulama (2FA)',
      'Oturum güvenliği güçlendirildi',
      'API rate limiting eklendi',
      'Şifreleme algoritmaları güncellendi',
    ],
  },
  {
    version: '2.1.0',
    date: '5 Ekim 2024',
    title: 'İK Modülü',
    description: 'Tam kapsamlı insan kaynakları yönetimi.',
    type: 'feature',
    changes: [
      'Çalışan profil yönetimi',
      'İzin ve devamsızlık takibi',
      'Performans değerlendirme sistemi',
      'Eğitim ve sertifika yönetimi',
      'Bordro entegrasyonu',
    ],
  },
  {
    version: '2.0.5',
    date: '22 Eylül 2024',
    title: 'Hata Düzeltmeleri',
    description: 'Bildirilen sorunların giderilmesi.',
    type: 'fix',
    changes: [
      'Fatura yazdırma hatası düzeltildi',
      'Tarih formatı tutarsızlıkları giderildi',
      'Bildirim gecikmesi sorunu çözüldü',
      'Mobil menü görüntüleme hatası düzeltildi',
    ],
  },
  {
    version: '2.0.0',
    date: '1 Eylül 2024',
    title: 'Stocker 2.0 - Büyük Güncelleme',
    description: 'Tamamen yenilenen arayüz ve mimari.',
    type: 'feature',
    changes: [
      'Modern ve responsive yeni tasarım',
      'Modüler mimari yapısı',
      'Gerçek zamanlı bildirimler',
      'Gelişmiş arama ve filtreleme',
      'Çoklu dil desteği',
      'Dark mode',
    ],
  },
];

const typeConfig: Record<UpdateType, { label: string; color: string; bgColor: string; icon: ReactNode }> = {
  feature: {
    label: 'Yeni Özellik',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  improvement: {
    label: 'İyileştirme',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  fix: {
    label: 'Hata Düzeltme',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  security: {
    label: 'Güvenlik',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
};

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/stoocker_black.png"
              alt="Stoocker Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors">Gizlilik</Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900 transition-colors">Kullanım Şartları</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Güncellemeler</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Stocker&apos;ın en son özelliklerini, iyileştirmelerini ve düzeltmelerini takip edin.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'Toplam Sürüm', value: '24+', icon: '🚀' },
            { label: 'Yeni Özellik', value: '150+', icon: '✨' },
            { label: 'İyileştirme', value: '300+', icon: '⚡' },
            { label: 'Düzeltme', value: '500+', icon: '🔧' },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-slate-300 via-slate-200 to-transparent" />

          {/* Updates */}
          <div className="space-y-8">
            {updates.map((update, index) => {
              const config = typeConfig[update.type];
              return (
                <motion.div
                  key={update.version}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  className="relative pl-20"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                  </div>

                  {/* Card */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-full text-sm font-mono font-semibold">
                        v{update.version}
                      </span>
                      <span className={`px-3 py-1 ${config.bgColor} ${config.color} rounded-full text-xs font-medium flex items-center gap-1.5`}>
                        {config.icon}
                        {config.label}
                      </span>
                      <span className="text-slate-400 text-sm ml-auto">{update.date}</span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{update.title}</h3>
                    <p className="text-slate-500 mb-4">{update.description}</p>

                    {/* Changes */}
                    <div className="space-y-2">
                      {update.changes.map((change, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <svg className="w-4 h-4 text-slate-900 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-600">{change}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-slate-400 text-sm mb-4">Daha eski güncellemeleri görmek için</p>
          <button className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl border border-slate-200 hover:border-slate-900 transition-all">
            Daha Fazla Yükle
          </button>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-700 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Şartlar</Link>
              <Link href="/cookies" className="hover:text-slate-900 transition-colors">Çerezler</Link>
              <Link href="/updates" className="text-slate-900">Güncellemeler</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
