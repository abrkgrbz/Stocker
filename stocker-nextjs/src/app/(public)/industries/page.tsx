'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const industries = [
  {
    id: 'retail',
    icon: '🏪',
    title: 'Perakende',
    description: 'Mağaza yönetiminden POS entegrasyonuna, perakende sektörünün tüm ihtiyaçları için tasarlandı.',
    challenges: [
      'Çoklu mağaza stok yönetimi',
      'Anlık satış takibi',
      'Müşteri sadakat programları',
      'Sezonluk stok planlaması',
    ],
    solutions: [
      'Merkezi stok görünümü tüm mağazalar için',
      'POS sistemi entegrasyonları',
      'CRM ve sadakat modülü',
      'Talep tahmin algoritmaları',
    ],
    stats: { users: '1,200+', products: '15M+' },
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'ecommerce',
    icon: '🛒',
    title: 'E-Ticaret',
    description: 'Trendyol, Hepsiburada, Amazon ve kendi mağazanızı tek panelden yönetin.',
    challenges: [
      'Çoklu kanal stok senkronizasyonu',
      'Sipariş yönetimi karmaşıklığı',
      'Kargo entegrasyonları',
      'İade süreçleri',
    ],
    solutions: [
      'Otomatik stok senkronizasyonu',
      'Tek panel çoklu kanal yönetimi',
      'Tüm kargo firmalarıyla entegrasyon',
      'Kolay iade yönetimi modülü',
    ],
    stats: { users: '800+', orders: '5M+' },
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'wholesale',
    icon: '📦',
    title: 'Toptan Satış',
    description: 'B2B satış, müşteri kredileri ve toplu sipariş yönetimi için özel çözümler.',
    challenges: [
      'Büyük hacimli sipariş yönetimi',
      'Müşteri bazlı fiyatlandırma',
      'Vade ve kredi takibi',
      'Depo optimizasyonu',
    ],
    solutions: [
      'Toplu sipariş işleme',
      'Müşteri gruplarına özel fiyat listeleri',
      'Cari hesap ve vade yönetimi',
      'Akıllı depo yerleşim önerileri',
    ],
    stats: { users: '500+', revenue: '₺2B+' },
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'manufacturing',
    icon: '🏭',
    title: 'Üretim & İmalat',
    description: 'Hammadde takibinden üretim planlamasına, imalat sektörü için entegre çözümler.',
    challenges: [
      'Hammadde ve malzeme takibi',
      'Üretim planlaması',
      'Reçete yönetimi',
      'Kalite kontrol',
    ],
    solutions: [
      'BOM (Malzeme Listesi) yönetimi',
      'Üretim emirleri modülü',
      'Maliyet hesaplama',
      'Lot ve seri takibi',
    ],
    stats: { users: '300+', items: '8M+' },
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'food',
    icon: '🍽️',
    title: 'Gıda & Restoran',
    description: 'SKT takibi, reçete yönetimi ve tedarikçi entegrasyonları ile gıda sektörüne özel.',
    challenges: [
      'Son kullanma tarihi takibi',
      'Reçete ve porsiyon yönetimi',
      'Gıda güvenliği uyumu',
      'Tedarikçi yönetimi',
    ],
    solutions: [
      'FIFO otomasyonu ve SKT uyarıları',
      'Dinamik reçete hesaplamaları',
      'İzlenebilirlik ve raporlama',
      'Tedarikçi sipariş otomasyonu',
    ],
    stats: { users: '600+', locations: '2K+' },
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'healthcare',
    icon: '🏥',
    title: 'Sağlık & Eczane',
    description: 'İlaç takibi, soğuk zincir yönetimi ve SGK entegrasyonları ile sağlık sektörüne uygun.',
    challenges: [
      'Soğuk zincir takibi',
      'İlaç lot numarası izleme',
      'SGK ve Medula entegrasyonu',
      'Reçete yönetimi',
    ],
    solutions: [
      'Sıcaklık izleme entegrasyonu',
      'Tam izlenebilirlik',
      'SGK modülü',
      'Dijital reçete işleme',
    ],
    stats: { users: '400+', items: '3M+' },
    color: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'automotive',
    icon: '🚗',
    title: 'Otomotiv & Yedek Parça',
    description: 'OEM kodları, araç uyumluluk ve çapraz referans yönetimi ile otomotiv sektörüne özel.',
    challenges: [
      'Karmaşık parça numaraları',
      'Araç uyumluluk takibi',
      'Çapraz referans yönetimi',
      'Tedarikçi çeşitliliği',
    ],
    solutions: [
      'OEM ve aftermarket kod eşleştirme',
      'Araç-parça uyumluluk veritabanı',
      'Otomatik çapraz referans',
      'Çoklu tedarikçi yönetimi',
    ],
    stats: { users: '350+', parts: '12M+' },
    color: 'from-slate-500 to-gray-500',
  },
  {
    id: 'textile',
    icon: '👕',
    title: 'Tekstil & Moda',
    description: 'Beden-renk-model kombinasyonları, sezon planlaması ve koleksiyon yönetimi.',
    challenges: [
      'Varyant yönetimi (beden/renk)',
      'Sezonluk planlama',
      'Koleksiyon takibi',
      'Hızlı moda döngüsü',
    ],
    solutions: [
      'Matris stok yönetimi',
      'Sezon bazlı raporlama',
      'Koleksiyon modülü',
      'Trend analizi',
    ],
    stats: { users: '450+', skus: '20M+' },
    color: 'from-pink-500 to-fuchsia-500',
  },
];

const testimonials = [
  {
    quote: 'Stocker ile 5 mağazamızın stok yönetimini merkezi hale getirdik. Stok fazlası %30 azaldı.',
    author: 'Mehmet Yılmaz',
    role: 'Perakende Zinciri Sahibi',
    industry: 'Perakende',
  },
  {
    quote: 'E-ticaret kanallarımız arasındaki stok senkronizasyonu artık otomatik. Overselling sorunu tarihe karıştı.',
    author: 'Ayşe Kaya',
    role: 'E-ticaret Müdürü',
    industry: 'E-Ticaret',
  },
  {
    quote: 'Üretim planlaması ve hammadde takibi için birebir. Fire oranımız %15 düştü.',
    author: 'Ali Demir',
    role: 'Fabrika Müdürü',
    industry: 'Üretim',
  },
];

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/stoocker_black.png" alt="Stoocker Logo" width={120} height={40} className="object-contain" priority />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/features" className="text-slate-500 hover:text-slate-900 transition-colors">Özellikler</Link>
            <Link href="/pricing" className="text-slate-500 hover:text-slate-900 transition-colors">Fiyatlandırma</Link>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Sektörel Çözümler</h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              Her sektörün kendine özgü ihtiyaçları var. Stocker, sektörünüze özel özellikler ve
              entegrasyonlarla işletmenize tam uyum sağlar.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '8+', label: 'Sektör' },
                { value: '5,000+', label: 'Aktif İşletme' },
                { value: '50M+', label: 'Yönetilen Ürün' },
                { value: '₺10B+', label: 'İşlenen Ciro' },
              ].map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="text-center">
                  <div className="text-4xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-slate-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {industries.map((industry, index) => (
                <motion.div
                  key={industry.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center text-2xl`}>
                      {industry.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{industry.title}</h2>
                      <div className="flex gap-4 text-xs text-slate-500 mt-1">
                        <span>{industry.stats.users} Kullanıcı</span>
                        <span>•</span>
                        <span>{Object.values(industry.stats)[1]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 mb-6">{industry.description}</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Zorluklar</h4>
                      <ul className="space-y-2">
                        {industry.challenges.map((challenge, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-red-400 mt-0.5">•</span>
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Çözümlerimiz</h4>
                      <ul className="space-y-2">
                        {industry.solutions.map((solution, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-emerald-500 mt-0.5">✓</span>
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Sektör Liderlerinden</h2>
              <p className="text-slate-500">Farklı sektörlerden müşterilerimizin deneyimleri</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white rounded-2xl border border-slate-200"
                >
                  <div className="mb-4 text-slate-400">&ldquo;</div>
                  <p className="text-slate-600 mb-6">{testimonial.quote}</p>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                    <div className="text-xs text-slate-400 mt-1">{testimonial.industry}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 bg-slate-900 rounded-2xl text-white">
              <h2 className="text-2xl font-bold mb-4">Sektörünüze Özel Demo</h2>
              <p className="text-slate-400 mb-6">Sektörünüzün ihtiyaçlarına özel bir demo planlayalım.</p>
              <div className="flex justify-center gap-4">
                <Link href="/demo" className="px-8 py-3 bg-white text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors">
                  Demo Talep Et
                </Link>
                <Link href="/contact" className="px-8 py-3 border border-slate-600 text-white font-medium rounded-xl hover:border-slate-500 transition-colors">
                  Satışla Görüş
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
              <Link href="/features" className="hover:text-slate-900 transition-colors">Özellikler</Link>
              <Link href="/pricing" className="hover:text-slate-900 transition-colors">Fiyatlandırma</Link>
              <Link href="/contact" className="hover:text-slate-900 transition-colors">İletişim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
