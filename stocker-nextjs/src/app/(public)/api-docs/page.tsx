'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: boolean;
}

interface ApiCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  endpoints: Endpoint[];
}

const apiCategories: ApiCategory[] = [
  {
    id: 'products',
    title: 'Ürünler',
    description: 'Ürün oluşturma, güncelleme ve sorgulama',
    icon: '📦',
    endpoints: [
      { method: 'GET', path: '/api/v1/products', description: 'Tüm ürünleri listele', auth: true },
      { method: 'GET', path: '/api/v1/products/{id}', description: 'Tek ürün detayı', auth: true },
      { method: 'POST', path: '/api/v1/products', description: 'Yeni ürün oluştur', auth: true },
      { method: 'PUT', path: '/api/v1/products/{id}', description: 'Ürün güncelle', auth: true },
      { method: 'DELETE', path: '/api/v1/products/{id}', description: 'Ürün sil', auth: true },
      { method: 'GET', path: '/api/v1/products/search', description: 'Ürün ara', auth: true },
    ],
  },
  {
    id: 'inventory',
    title: 'Stok',
    description: 'Stok hareketleri ve sayım işlemleri',
    icon: '📊',
    endpoints: [
      { method: 'GET', path: '/api/v1/inventory', description: 'Stok durumunu görüntüle', auth: true },
      { method: 'POST', path: '/api/v1/inventory/adjust', description: 'Stok düzeltme', auth: true },
      { method: 'POST', path: '/api/v1/inventory/transfer', description: 'Depolar arası transfer', auth: true },
      { method: 'GET', path: '/api/v1/inventory/movements', description: 'Stok hareketleri', auth: true },
      { method: 'POST', path: '/api/v1/inventory/count', description: 'Stok sayımı başlat', auth: true },
    ],
  },
  {
    id: 'orders',
    title: 'Siparişler',
    description: 'Sipariş yönetimi ve takibi',
    icon: '🛒',
    endpoints: [
      { method: 'GET', path: '/api/v1/orders', description: 'Tüm siparişleri listele', auth: true },
      { method: 'GET', path: '/api/v1/orders/{id}', description: 'Sipariş detayı', auth: true },
      { method: 'POST', path: '/api/v1/orders', description: 'Yeni sipariş oluştur', auth: true },
      { method: 'PATCH', path: '/api/v1/orders/{id}/status', description: 'Sipariş durumu güncelle', auth: true },
      { method: 'POST', path: '/api/v1/orders/{id}/fulfill', description: 'Siparişi tamamla', auth: true },
    ],
  },
  {
    id: 'customers',
    title: 'Müşteriler',
    description: 'Müşteri bilgileri ve CRM',
    icon: '👥',
    endpoints: [
      { method: 'GET', path: '/api/v1/customers', description: 'Müşteri listesi', auth: true },
      { method: 'GET', path: '/api/v1/customers/{id}', description: 'Müşteri detayı', auth: true },
      { method: 'POST', path: '/api/v1/customers', description: 'Yeni müşteri ekle', auth: true },
      { method: 'PUT', path: '/api/v1/customers/{id}', description: 'Müşteri güncelle', auth: true },
      { method: 'GET', path: '/api/v1/customers/{id}/orders', description: 'Müşteri siparişleri', auth: true },
    ],
  },
  {
    id: 'warehouses',
    title: 'Depolar',
    description: 'Depo yönetimi ve lokasyonlar',
    icon: '🏭',
    endpoints: [
      { method: 'GET', path: '/api/v1/warehouses', description: 'Depo listesi', auth: true },
      { method: 'GET', path: '/api/v1/warehouses/{id}', description: 'Depo detayı', auth: true },
      { method: 'POST', path: '/api/v1/warehouses', description: 'Yeni depo ekle', auth: true },
      { method: 'GET', path: '/api/v1/warehouses/{id}/inventory', description: 'Depo stoku', auth: true },
    ],
  },
  {
    id: 'reports',
    title: 'Raporlar',
    description: 'Analitik ve raporlama',
    icon: '📈',
    endpoints: [
      { method: 'GET', path: '/api/v1/reports/sales', description: 'Satış raporu', auth: true },
      { method: 'GET', path: '/api/v1/reports/inventory', description: 'Stok raporu', auth: true },
      { method: 'GET', path: '/api/v1/reports/low-stock', description: 'Düşük stok uyarıları', auth: true },
      { method: 'GET', path: '/api/v1/reports/movements', description: 'Hareket raporu', auth: true },
    ],
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    description: 'Olay bildirimleri',
    icon: '🔔',
    endpoints: [
      { method: 'GET', path: '/api/v1/webhooks', description: 'Webhook listesi', auth: true },
      { method: 'POST', path: '/api/v1/webhooks', description: 'Webhook oluştur', auth: true },
      { method: 'DELETE', path: '/api/v1/webhooks/{id}', description: 'Webhook sil', auth: true },
      { method: 'POST', path: '/api/v1/webhooks/{id}/test', description: 'Webhook test et', auth: true },
    ],
  },
];

const methodColors = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
  PATCH: 'bg-purple-100 text-purple-700',
};

export default function ApiDocsPage() {
  const [activeCategory, setActiveCategory] = useState('products');
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentCategory = apiCategories.find(c => c.id === activeCategory);

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
            <Link href="/integrations" className="text-slate-500 hover:text-slate-900 transition-colors">Entegrasyonlar</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 text-center border-b border-slate-200">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">API Referansı</h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-8">
              Stocker API ile uygulamalarınızı entegre edin. RESTful mimari, JSON formatı ve
              kapsamlı endpoint desteği ile hızlıca başlayın.
            </p>
            <div className="flex justify-center gap-4">
              <a href="#quickstart" className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors">
                Hızlı Başlangıç
              </a>
              <a href="#endpoints" className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors">
                Endpoint&apos;lere Git
              </a>
            </div>
          </motion.div>
        </section>

        {/* Quick Start */}
        <section id="quickstart" className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Hızlı Başlangıç</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { step: '1', title: 'API Anahtarı Alın', description: 'Dashboard\'dan API anahtarınızı oluşturun' },
                { step: '2', title: 'İstek Gönderin', description: 'Authorization header ile API çağrısı yapın' },
                { step: '3', title: 'Yanıtı İşleyin', description: 'JSON formatında yanıt alın ve işleyin' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white rounded-xl border border-slate-200"
                >
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Code Example */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <button
                  onClick={() => copyToClipboard(`curl -X GET "https://api.stoocker.com/v1/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copiedCode ? '✓ Kopyalandı' : 'Kopyala'}
                </button>
              </div>
              <pre className="p-6 text-sm text-slate-300 overflow-x-auto">
                {`curl -X GET "https://api.stoocker.com/v1/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# Yanıt
{
  "success": true,
  "data": [
    {
      "id": "prod_abc123",
      "name": "Örnek Ürün",
      "sku": "SKU-001",
      "stock": 150,
      "price": 199.99
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Kimlik Doğrulama</h2>
            <p className="text-slate-500 mb-8">
              Tüm API istekleri Bearer token ile kimlik doğrulaması gerektirir.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Header Formatı</h3>
                <code className="text-sm bg-slate-200 px-3 py-1 rounded">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Rate Limiting</h3>
                <p className="text-sm text-slate-500">
                  1000 istek/dakika (Free), 10000 istek/dakika (Pro), Sınırsız (Enterprise)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section id="endpoints" className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">API Endpoint&apos;leri</h2>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <div className="lg:w-64 flex-shrink-0">
                {/* Mobile Dropdown */}
                <div className="block lg:hidden mb-6">
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {apiCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden lg:block sticky top-24 space-y-1">
                  {apiCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeCategory === category.id
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                          : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium">{category.title}</span>
                      {activeCategory === category.id && (
                        <motion.div layoutId="activeInd" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  ))}

                  {/* Run in Postman */}
                  <div className="pt-6 mt-6 border-t border-slate-200">
                    <a
                      href="#"
                      className="flex flex-col items-center justify-center p-4 bg-[#FF6C37]/10 border border-[#FF6C37]/20 rounded-xl hover:bg-[#FF6C37]/20 transition-colors group"
                    >
                      <Image src="https://run.pstmn.io/button.svg" alt="Run in Postman" width={128} height={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {currentCategory && (
                  <motion.div
                    key={currentCategory.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{currentCategory.icon}</span>
                        <h3 className="text-xl font-bold text-slate-900">{currentCategory.title}</h3>
                      </div>
                      <p className="text-slate-500">{currentCategory.description}</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {currentCategory.endpoints.map((endpoint, index) => (
                        <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${methodColors[endpoint.method]}`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm text-slate-700 font-mono">{endpoint.path}</code>
                            {endpoint.auth && (
                              <span className="ml-auto text-xs text-slate-400">🔒 Auth</span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-slate-500 ml-14">{endpoint.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SDKs */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">SDK&apos;lar & Kütüphaneler</h2>
            <p className="text-slate-500 mb-8">
              Favori programlama dilinizde hızlıca başlayın.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { name: 'JavaScript / Node.js', icon: '📦', status: 'stable' },
                { name: 'Python', icon: '🐍', status: 'stable' },
                { name: 'PHP', icon: '🐘', status: 'stable' },
                { name: 'C# / .NET', icon: '💜', status: 'beta' },
              ].map((sdk, index) => (
                <motion.div
                  key={sdk.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors text-center"
                >
                  <div className="text-3xl mb-3">{sdk.icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-1">{sdk.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sdk.status === 'stable' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {sdk.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-900 rounded-2xl text-white">
              <h2 className="text-2xl font-bold mb-4">Entegrasyona Başlayın</h2>
              <p className="text-slate-400 mb-6">Ücretsiz hesap oluşturun ve hemen API anahtarınızı alın.</p>
              <div className="flex justify-center gap-4">
                <Link href="/register" className="px-8 py-3 bg-white text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors">
                  Ücretsiz Başla
                </Link>
                <Link href="/contact" className="px-8 py-3 border border-slate-600 text-white font-medium rounded-xl hover:border-slate-500 transition-colors">
                  Satış ile Görüş
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
            <div>&copy; 2026 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/docs" className="hover:text-slate-900 transition-colors">Dokümantasyon</Link>
              <Link href="/status" className="hover:text-slate-900 transition-colors">Sistem Durumu</Link>
              <Link href="/changelog" className="hover:text-slate-900 transition-colors">Değişiklikler</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
