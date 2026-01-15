'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const integrationCategories = [
  {
    title: 'E-Ticaret Platformları',
    description: 'Türkiye\'nin en popüler e-ticaret platformlarıyla entegrasyon',
    integrations: [
      { name: 'Trendyol', description: 'Stok ve sipariş senkronizasyonu', status: 'active', icon: '🛒' },
      { name: 'Hepsiburada', description: 'Otomatik stok güncellemesi', status: 'active', icon: '🏪' },
      { name: 'N11', description: 'Ürün ve sipariş yönetimi', status: 'active', icon: '📦' },
      { name: 'Amazon Türkiye', description: 'FBA ve stok entegrasyonu', status: 'active', icon: '📱' },
      { name: 'Çiçeksepeti', description: 'Ürün kataloğu senkronizasyonu', status: 'active', icon: '🌸' },
      { name: 'GittiGidiyor', description: 'Sipariş ve stok yönetimi', status: 'coming', icon: '🛍️' },
    ],
  },
  {
    title: 'Muhasebe & Finans',
    description: 'Finansal süreçlerinizi otomatikleştirin',
    integrations: [
      { name: 'Paraşüt', description: 'Fatura ve muhasebe entegrasyonu', status: 'active', icon: '📊' },
      { name: 'Logo', description: 'ERP entegrasyonu', status: 'active', icon: '💼' },
      { name: 'Mikro', description: 'Muhasebe yazılımı bağlantısı', status: 'active', icon: '📈' },
      { name: 'Luca', description: 'e-Fatura ve e-Arşiv', status: 'active', icon: '📄' },
      { name: 'Netsis', description: 'Kurumsal ERP entegrasyonu', status: 'coming', icon: '🏢' },
    ],
  },
  {
    title: 'Kargo & Lojistik',
    description: 'Kargo süreçlerinizi hızlandırın',
    integrations: [
      { name: 'Yurtiçi Kargo', description: 'Otomatik gönderi oluşturma', status: 'active', icon: '🚚' },
      { name: 'Aras Kargo', description: 'Takip ve bildirim entegrasyonu', status: 'active', icon: '📬' },
      { name: 'MNG Kargo', description: 'Toplu gönderi yönetimi', status: 'active', icon: '📮' },
      { name: 'PTT Kargo', description: 'Kargo takip sistemi', status: 'active', icon: '✉️' },
      { name: 'Sürat Kargo', description: 'Hızlı teslimat entegrasyonu', status: 'coming', icon: '⚡' },
      { name: 'UPS', description: 'Uluslararası kargo', status: 'coming', icon: '🌍' },
    ],
  },
  {
    title: 'Ödeme Sistemleri',
    description: 'Güvenli ödeme altyapısı',
    integrations: [
      { name: 'iyzico', description: 'Online ödeme entegrasyonu', status: 'active', icon: '💳' },
      { name: 'PayTR', description: 'Sanal POS entegrasyonu', status: 'active', icon: '🔐' },
      { name: 'Stripe', description: 'Uluslararası ödemeler', status: 'active', icon: '💰' },
      { name: 'Papara', description: 'Dijital cüzdan entegrasyonu', status: 'coming', icon: '📲' },
    ],
  },
  {
    title: 'CRM & Pazarlama',
    description: 'Müşteri ilişkilerini güçlendirin',
    integrations: [
      { name: 'HubSpot', description: 'CRM ve pazarlama otomasyonu', status: 'active', icon: '🎯' },
      { name: 'Mailchimp', description: 'E-posta pazarlama', status: 'active', icon: '📧' },
      { name: 'WhatsApp Business', description: 'Müşteri iletişimi', status: 'active', icon: '💬' },
      { name: 'Zendesk', description: 'Müşteri destek sistemi', status: 'coming', icon: '🎧' },
    ],
  },
  {
    title: 'Barkod & Etiket',
    description: 'Ürün etiketleme ve takip',
    integrations: [
      { name: 'Zebra', description: 'Barkod yazıcı entegrasyonu', status: 'active', icon: '🏷️' },
      { name: 'Honeywell', description: 'El terminali bağlantısı', status: 'active', icon: '📟' },
      { name: 'Datalogic', description: 'Barkod okuyucu desteği', status: 'active', icon: '📊' },
    ],
  },
];

export default function IntegrationsPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Entegrasyonlar</h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              Stocker, 50+ platform ve servis ile entegre çalışır. Mevcut iş akışlarınızı bozmadan,
              tüm sistemlerinizi tek noktadan yönetin.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '50+', label: 'Entegrasyon' },
                { value: '99.9%', label: 'API Uptime' },
                { value: '< 100ms', label: 'Ortalama Yanıt' },
                { value: '7/24', label: 'Senkronizasyon' },
              ].map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="text-center">
                  <div className="text-4xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-slate-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Categories */}
        {integrationCategories.map((category, categoryIndex) => (
          <section key={category.title} className={`py-16 ${categoryIndex % 2 === 1 ? 'bg-slate-50' : ''}`}>
            <div className="max-w-6xl mx-auto px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{category.title}</h2>
                <p className="text-slate-500">{category.description}</p>
              </motion.div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.integrations.map((integration, index) => (
                  <motion.div
                    key={integration.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{integration.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">{integration.name}</h3>
                          {integration.status === 'active' ? (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-full">Aktif</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded-full">Yakında</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{integration.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* API Section */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-bold mb-6">Kendi Entegrasyonunuzu Oluşturun</h2>
                <p className="text-slate-400 mb-6">
                  RESTful API&apos;miz ile özel entegrasyonlar geliştirebilirsiniz. Kapsamlı dokümantasyon,
                  SDK&apos;lar ve sandbox ortamı ile hızlıca başlayın.
                </p>
                <div className="flex gap-4">
                  <Link href="/api-docs" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    API Dokümantasyonu
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-600 text-white font-medium rounded-xl hover:border-slate-500 hover:bg-slate-800 transition-colors">
                    Entegrasyon Desteği
                  </Link>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-800 rounded-2xl p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <pre className="text-slate-300 overflow-x-auto">
{`curl -X GET "https://api.stoocker.com/v1/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

{
  "data": [
    {
      "id": "prod_123",
      "name": "Ürün Adı",
      "sku": "SKU-001",
      "stock": 150
    }
  ]
}`}
                </pre>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Aradığınız entegrasyonu bulamadınız mı?</h2>
              <p className="text-slate-500 mb-6">Bize yazın, ihtiyacınıza özel entegrasyon çözümleri sunalım.</p>
              <Link href="/contact" className="inline-block px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">
                İletişime Geçin
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
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Şartlar</Link>
              <Link href="/api-docs" className="hover:text-slate-900 transition-colors">API</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
