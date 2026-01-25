'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

type ChangeType = 'feature' | 'improvement' | 'fix' | 'security';

interface Change {
  type: ChangeType;
  description: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: Change[];
}

const releases: Release[] = [
  {
    version: '2.6.0',
    date: '1 Şubat 2026',
    title: 'Güvenlik ve Destek Merkezi Güncellemesi',
    description: 'KVKK uyumluluğu ve kullanıcı destek deneyimi için kapsamlı iyileştirmeler.',
    changes: [
      { type: 'feature', description: 'Yeni Destek Merkezi (Support Center) yayına alındı' },
      { type: 'security', description: 'KVKK ve Veri Güvenliği sayfaları güncellendi' },
      { type: 'improvement', description: 'Kullanıcı sözleşmesi ve yasal metinler yenilendi' },
      { type: 'feature', description: 'Canlı destek altyapısı entegre edildi' },
    ],
  },
  {
    version: '2.5.0',
    date: '10 Ocak 2025',
    title: 'Yapay Zeka Destekli Stok Tahmini',
    description: 'Machine learning algoritmaları ile stok ihtiyaçlarınızı önceden tahmin edin.',
    changes: [
      { type: 'feature', description: 'AI destekli stok tahmin modülü eklendi' },
      { type: 'feature', description: 'Otomatik yeniden sipariş önerileri' },
      { type: 'feature', description: 'Mevsimsel talep analizi' },
      { type: 'improvement', description: 'Dashboard performansı %40 artırıldı' },
      { type: 'fix', description: 'Çoklu depo transferlerinde senkronizasyon hatası düzeltildi' },
    ],
  },
  {
    version: '2.4.0',
    date: '15 Aralık 2024',
    title: 'CRM Modülü Genişletmesi',
    description: 'Müşteri ilişkileri yönetimi için kapsamlı yeni özellikler.',
    changes: [
      { type: 'feature', description: 'Satış ekipleri ve bölge yönetimi eklendi' },
      { type: 'feature', description: 'Toplantı ve arama kayıtları takibi' },
      { type: 'feature', description: 'Rakip analizi modülü' },
      { type: 'feature', description: 'Sadakat programları yönetimi' },
      { type: 'improvement', description: 'Müşteri segmentasyonu algoritması iyileştirildi' },
      { type: 'fix', description: 'Lead dönüşüm raporlarındaki hesaplama hatası düzeltildi' },
    ],
  },
  {
    version: '2.3.0',
    date: '20 Kasım 2024',
    title: 'Gelişmiş Raporlama',
    description: 'Özelleştirilebilir raporlar ve gerçek zamanlı analitik.',
    changes: [
      { type: 'feature', description: 'Sürükle-bırak rapor oluşturucu' },
      { type: 'feature', description: 'Otomatik rapor zamanlama ve e-posta gönderimi' },
      { type: 'feature', description: 'Excel ve PDF dışa aktarım seçenekleri' },
      { type: 'improvement', description: 'Grafik çeşitliliği artırıldı' },
      { type: 'security', description: 'Rapor erişim kontrolleri güçlendirildi' },
    ],
  },
  {
    version: '2.2.0',
    date: '1 Kasım 2024',
    title: 'Mobil Uygulama 2.0',
    description: 'Tamamen yeniden tasarlanmış mobil deneyim.',
    changes: [
      { type: 'feature', description: 'Yeni modern arayüz tasarımı' },
      { type: 'feature', description: 'Offline mod desteği' },
      { type: 'feature', description: 'Barkod tarama performansı artırıldı' },
      { type: 'improvement', description: 'Uygulama başlatma süresi %60 azaltıldı' },
      { type: 'fix', description: 'iOS bildirim sorunları giderildi' },
    ],
  },
  {
    version: '2.1.0',
    date: '10 Ekim 2024',
    title: 'Çoklu Depo Yönetimi',
    description: 'Birden fazla depoyu tek panelden yönetin.',
    changes: [
      { type: 'feature', description: 'Sınırsız depo ekleme' },
      { type: 'feature', description: 'Depolar arası transfer yönetimi' },
      { type: 'feature', description: 'Depo bazlı raporlama' },
      { type: 'improvement', description: 'Stok sayım hızı artırıldı' },
      { type: 'fix', description: 'Depo bazlı yetkilendirme hatası düzeltildi' },
    ],
  },
  {
    version: '2.0.0',
    date: '1 Eylül 2024',
    title: 'Stocker 2.0 - Büyük Güncelleme',
    description: 'Tamamen yeniden yazılmış altyapı ve modern arayüz.',
    changes: [
      { type: 'feature', description: 'Yeni Next.js 14 tabanlı frontend' },
      { type: 'feature', description: '.NET 8 backend migrasyonu' },
      { type: 'feature', description: 'Real-time bildirimler' },
      { type: 'feature', description: 'Gelişmiş API v2' },
      { type: 'security', description: 'Zero-trust güvenlik modeli' },
      { type: 'improvement', description: 'Genel performans %200 artış' },
    ],
  },
];

const typeConfig = {
  feature: { label: 'Yeni Özellik', color: 'bg-emerald-100 text-emerald-700', icon: '✨' },
  improvement: { label: 'İyileştirme', color: 'bg-blue-100 text-blue-700', icon: '📈' },
  fix: { label: 'Düzeltme', color: 'bg-amber-100 text-amber-700', icon: '🔧' },
  security: { label: 'Güvenlik', color: 'bg-purple-100 text-purple-700', icon: '🔒' },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/stoocker_black.png" alt="Stoocker Logo" width={120} height={40} className="object-contain" priority />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/docs" className="text-slate-500 hover:text-slate-900 transition-colors">Dokümantasyon</Link>
            <Link href="/status" className="text-slate-500 hover:text-slate-900 transition-colors">Sistem Durumu</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Değişiklik Günlüğü</h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              Stocker&apos;daki tüm güncellemeler, yeni özellikler ve iyileştirmeler.
              Her sürümde neler değişti öğrenin.
            </p>
          </motion.div>
        </section>

        {/* Subscribe */}
        <section className="pb-12">
          <div className="max-w-2xl mx-auto px-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <h3 className="font-semibold text-slate-900 mb-2">Güncellemelerden haberdar olun</h3>
              <p className="text-sm text-slate-500 mb-4">Yeni özellikler ve güncellemeler için e-posta listesine katılın.</p>
              <form className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
                  Abone Ol
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Releases */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="space-y-12">
              {releases.map((release, releaseIndex) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: releaseIndex * 0.1 }}
                  className="relative"
                >
                  {/* Timeline line */}
                  {releaseIndex < releases.length - 1 && (
                    <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-slate-200" />
                  )}

                  <div className="flex gap-6">
                    {/* Version badge */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        {release.version.split('.')[0]}.{release.version.split('.')[1]}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-12">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-slate-900">{release.title}</h2>
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          v{release.version}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">{release.date}</p>
                      <p className="text-slate-600 mb-6">{release.description}</p>

                      <div className="space-y-3">
                        {release.changes.map((change, changeIndex) => (
                          <div key={changeIndex} className="flex items-start gap-3">
                            <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ${typeConfig[change.type].color}`}>
                              {typeConfig[change.type].icon} {typeConfig[change.type].label}
                            </span>
                            <span className="text-sm text-slate-600">{change.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Özellik Öneriniz mi Var?</h2>
              <p className="text-slate-500 mb-6">Stocker&apos;ı daha iyi hale getirmek için fikirlerinizi duymak isteriz.</p>
              <Link href="/contact" className="inline-block px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">
                Geri Bildirim Gönderin
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center pb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-700 transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <div>&copy; 2026 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Şartlar</Link>
              <Link href="/status" className="hover:text-slate-900 transition-colors">Sistem Durumu</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
