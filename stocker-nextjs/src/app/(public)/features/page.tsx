'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const mainFeatures = [
  {
    id: 'inventory',
    icon: '📦',
    title: 'Stok Yönetimi',
    description: 'Gerçek zamanlı stok takibi, otomatik uyarılar ve akıllı envanter kontrolü ile stoklarınızı mükemmel yönetin.',
    features: [
      'Gerçek zamanlı stok görünümü',
      'Çoklu depo yönetimi',
      'Otomatik stok uyarıları',
      'Barkod ve QR kod desteği',
      'Seri/lot numarası takibi',
      'Son kullanma tarihi yönetimi',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'orders',
    icon: '🛒',
    title: 'Sipariş Yönetimi',
    description: 'Siparişleri tek panelden yönetin. E-ticaret entegrasyonları ile otomatik sipariş senkronizasyonu.',
    features: [
      'Çoklu kanal sipariş birleştirme',
      'Otomatik sipariş işleme',
      'Kargo entegrasyonları',
      'Sipariş durumu takibi',
      'İade yönetimi',
      'Toplu sipariş işleme',
    ],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'analytics',
    icon: '📊',
    title: 'Analitik & Raporlama',
    description: 'Veriye dayalı kararlar alın. Detaylı raporlar ve özelleştirilebilir dashboard ile işletmenizi analiz edin.',
    features: [
      'Özelleştirilebilir dashboard',
      'Satış ve stok raporları',
      'Trend analizi',
      'Kar/zarar hesaplamaları',
      'Excel ve PDF dışa aktarım',
      'Otomatik rapor zamanlama',
    ],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'crm',
    icon: '👥',
    title: 'Müşteri İlişkileri (CRM)',
    description: 'Müşterilerinizi tanıyın, sadakat oluşturun. Satış ekiplerinizi etkili yönetin.',
    features: [
      'Müşteri profilleri',
      'Satış hunisi yönetimi',
      'Lead takibi',
      'Toplantı ve arama kayıtları',
      'Sadakat programları',
      'Müşteri segmentasyonu',
    ],
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'finance',
    icon: '💰',
    title: 'Finans & Muhasebe',
    description: 'e-Fatura, e-Arşiv ve muhasebe entegrasyonları ile finansal süreçlerinizi otomatikleştirin.',
    features: [
      'e-Fatura ve e-Arşiv',
      'GİB entegrasyonu',
      'Ba-Bs formu otomasyonu',
      'Muhasebe yazılımı entegrasyonu',
      'Ödeme takibi',
      'Maliyet analizi',
    ],
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'hr',
    icon: '🏢',
    title: 'İnsan Kaynakları',
    description: 'Çalışan yönetimi, izin takibi ve organizasyon şeması ile İK süreçlerinizi dijitalleştirin.',
    features: [
      'Çalışan profilleri',
      'İzin ve devamsızlık takibi',
      'Organizasyon şeması',
      'Performans değerlendirme',
      'Bordro entegrasyonu',
      'SGK bildirimleri',
    ],
    color: 'from-indigo-500 to-blue-500',
  },
];

const additionalFeatures = [
  { icon: '📱', title: 'Mobil Uygulama', description: 'iOS ve Android uygulamalarıyla her yerden erişin' },
  { icon: '🔔', title: 'Akıllı Bildirimler', description: 'Önemli olaylardan anında haberdar olun' },
  { icon: '🔐', title: 'Gelişmiş Güvenlik', description: '2FA, rol tabanlı erişim ve şifreleme' },
  { icon: '🔄', title: 'API Erişimi', description: 'RESTful API ile özel entegrasyonlar geliştirin' },
  { icon: '🌍', title: 'Çoklu Dil', description: 'Türkçe ve İngilizce dil desteği' },
  { icon: '☁️', title: 'Bulut Tabanlı', description: 'Kurulum gerektirmez, her yerden erişilebilir' },
  { icon: '📈', title: 'Ölçeklenebilir', description: 'İşletmeniz büyüdükçe sistem de büyür' },
  { icon: '🎯', title: 'Kolay Kullanım', description: 'Sezgisel arayüz, hızlı öğrenme eğrisi' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/stoocker_black.png" alt="Stoocker Logo" width={120} height={40} className="object-contain" priority />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/pricing" className="text-slate-500 hover:text-slate-900 transition-colors">Fiyatlandırma</Link>
            <Link href="/integrations" className="text-slate-500 hover:text-slate-900 transition-colors">Entegrasyonlar</Link>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Özellikler</h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              İşletmenizi yönetmek için ihtiyacınız olan tüm araçlar tek bir platformda.
              Stok yönetiminden CRM&apos;e, muhasebeden İK&apos;ya kapsamlı çözümler.
            </p>
          </motion.div>
        </section>

        {/* Main Features */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="space-y-24">
              {mainFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl`}>
                        {feature.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">{feature.title}</h2>
                    </div>
                    <p className="text-slate-500 mb-6">{feature.description}</p>
                    <ul className="grid grid-cols-2 gap-3">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className={`aspect-video rounded-2xl bg-gradient-to-br ${feature.color} p-1`}>
                      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                        <div className="text-8xl opacity-20">{feature.icon}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Ve Daha Fazlası</h2>
              <p className="text-slate-500">İşletmenizi bir adım öne taşıyacak ek özellikler</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors text-center"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Neden Stocker?</h2>
              <p className="text-slate-500">Geleneksel yöntemlerle karşılaştırma</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-slate-100 rounded-2xl"
              >
                <h3 className="text-lg font-bold text-slate-500 mb-6">❌ Geleneksel Yöntemler</h3>
                <ul className="space-y-4">
                  {[
                    'Excel tablolarında kaybolmuş veriler',
                    'Manuel stok sayımları ve hatalar',
                    'Farklı sistemler arasında kopyala-yapıştır',
                    'Güncel olmayan raporlar',
                    'Sadece ofisten erişim',
                    'Yüksek IT maliyetleri',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-500">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-slate-900 rounded-2xl text-white"
              >
                <h3 className="text-lg font-bold text-emerald-400 mb-6">✓ Stocker ile</h3>
                <ul className="space-y-4">
                  {[
                    'Tek platformda entegre tüm veriler',
                    'Otomatik stok takibi ve uyarılar',
                    'Seamless entegrasyonlar',
                    'Gerçek zamanlı analitik',
                    'Her yerden mobil erişim',
                    'Aylık sabit ücret, sürpriz yok',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Hemen Deneyin</h2>
              <p className="text-slate-500 mb-6">14 gün ücretsiz deneme, kredi kartı gerekmez.</p>
              <div className="flex justify-center gap-4">
                <Link href="/register" className="px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">
                  Ücretsiz Başla
                </Link>
                <Link href="/demo" className="px-8 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors">
                  Demo İzle
                </Link>
              </div>
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
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/pricing" className="hover:text-slate-900 transition-colors">Fiyatlandırma</Link>
              <Link href="/integrations" className="hover:text-slate-900 transition-colors">Entegrasyonlar</Link>
              <Link href="/contact" className="hover:text-slate-900 transition-colors">İletişim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
