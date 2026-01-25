'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  CreditCard,
  Truck,
  MessageSquare,
  Printer,
  Box,
  ArrowRight,
  CheckCircle2,
  Globe,
  Zap
} from 'lucide-react';

// Brand Logo Component with Inline SVGs
const BrandLogo = ({ name, className = "w-8 h-8" }: { name: string, className?: string }) => {
  const logos: Record<string, React.ReactNode> = {
    'Trendyol': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12Z" fill="#F27A1A" />
        <path d="M16 8L10 16L8 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'Hepsiburada': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#FF6000" />
        <path d="M7 12H17M12 7V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    'Amazon Türkiye': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#232F3E" />
        <path d="M16.5 13C16.5 13 15 15.5 12 15.5C9 15.5 7.5 13.5 7.5 13.5" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 8.5C16 8.5 15.5 8 14.5 8C13.5 8 13.5 9 13.5 9V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9.5 9C9.5 9 10 8 11 8C12 8 12 9 12 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    'N11': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#5E267E" />
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">n11</text>
      </svg>
    ),
    'Çiçeksepeti': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#0057D9" />
        <path d="M12 6L14 10L12 14L10 10L12 6Z" fill="white" />
        <path d="M12 14L15 17L12 20L9 17L12 14Z" fill="white" fillOpacity="0.7" />
      </svg>
    ),
    'Paraşüt': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#FF5722" />
        <path d="M12 6L17 16H7L12 6Z" fill="white" />
      </svg>
    ),
    'Logo': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#DC1E24" />
        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="serif">L</text>
      </svg>
    ),
    'Mikro': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0066CC" />
        <path d="M6 8V16L12 12V8L6 8Z" fill="white" />
        <path d="M18 8V16L12 12V8L18 8Z" fill="white" fillOpacity="0.7" />
      </svg>
    ),
    'iyzico': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#1A5AE5" />
        <path d="M8 8H16V16H8V8Z" fill="white" />
        <path d="M14 10H18V14H14V10Z" fill="#1A5AE5" />
      </svg>
    ),
    'Stripe': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#635BFF" />
        <path d="M7 10C7 10 9 8 12 8C15 8 16 9 16 11C16 13 14 13 12 13C10 13 9 13.5 9 14.5C9 15.5 10.5 16 12 16C13.5 16 15 15.5 15 15.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    'WhatsApp Business': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#25D366" />
        <path d="M7.5 7.5C9.5 5.5 12.5 5.5 14.5 7.5C16.5 9.5 16.5 12.5 14.5 14.5L12 17L9.5 14.5C7.5 12.5 7.5 9.5 7.5 7.5Z" stroke="white" strokeWidth="2" />
        <path d="M11 10H13M12 9V11" stroke="white" strokeLinecap="round" />
      </svg>
    ),
    'HubSpot': (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#FF7A59" />
        <circle cx="12" cy="12" r="3" fill="white" />
        <circle cx="16" cy="9" r="1.5" fill="white" />
        <circle cx="17" cy="15" r="1" fill="white" />
      </svg>
    ),
  };

  return logos[name] || (
    <div className={`flex items-center justify-center bg-slate-100 rounded-lg text-slate-500 font-bold ${className}`}>
      {name.charAt(0)}
    </div>
  );
};

const integrationCategories = [
  {
    title: 'E-Ticaret Platformları',
    description: 'Türkiye\'nin en popüler e-ticaret platformlarıyla entegrasyon.',
    icon: ShoppingCart,
    items: [
      { name: 'Trendyol', description: 'Stok ve sipariş senkronizasyonu', status: 'active' },
      { name: 'Hepsiburada', description: 'Otomatik stok güncellemesi', status: 'active' },
      { name: 'N11', description: 'Ürün ve sipariş yönetimi', status: 'active' },
      { name: 'Amazon Türkiye', description: 'FBA ve stok entegrasyonu', status: 'active' },
      { name: 'Çiçeksepeti', description: 'Ürün kataloğu senkronizasyonu', status: 'active' },
      { name: 'GittiGidiyor', description: 'Sipariş ve stok yönetimi', status: 'coming' },
    ],
  },
  {
    title: 'Muhasebe & Finans',
    description: 'Finansal süreçlerinizi otomatikleştirin.',
    icon: CreditCard,
    items: [
      { name: 'Paraşüt', description: 'Fatura ve muhasebe entegrasyonu', status: 'active' },
      { name: 'Logo', description: 'ERP entegrasyonu', status: 'active' },
      { name: 'Mikro', description: 'Muhasebe yazılımı bağlantısı', status: 'active' },
      { name: 'Luca', description: 'e-Fatura ve e-Arşiv', status: 'active' },
      { name: 'iyzico', description: 'Online ödeme entegrasyonu', status: 'active' },
      { name: 'Stripe', description: 'Uluslararası ödemeler', status: 'active' },
    ],
  },
  {
    title: 'Kargo & Lojistik',
    description: 'Kargo süreçlerinizi hızlandırın.',
    icon: Truck,
    items: [
      { name: 'Yurtiçi Kargo', description: 'Otomatik gönderi oluşturma', status: 'active' },
      { name: 'Aras Kargo', description: 'Takip ve bildirim entegrasyonu', status: 'active' },
      { name: 'MNG Kargo', description: 'Toplu gönderi yönetimi', status: 'active' },
      { name: 'PTT Kargo', description: 'Kargo takip sistemi', status: 'active' },
      { name: 'UPS', description: 'Uluslararası kargo', status: 'coming' },
    ],
  },
  {
    title: 'CRM & İletişim',
    description: 'Müşteri ilişkilerini güçlendirin.',
    icon: MessageSquare,
    items: [
      { name: 'HubSpot', description: 'CRM ve pazarlama otomasyonu', status: 'active' },
      { name: 'WhatsApp Business', description: 'Müşteri iletişimi', status: 'active' },
      { name: 'Mailchimp', description: 'E-posta pazarlama', status: 'active' },
      { name: 'Zendesk', description: 'Müşteri destek sistemi', status: 'coming' },
    ],
  },
  {
    title: 'Donanım & Barkod',
    description: 'Fiziksel cihazlarınızla tam uyum.',
    icon: Printer,
    items: [
      { name: 'Zebra', description: 'Barkod yazıcı entegrasyonu', status: 'active' },
      { name: 'Honeywell', description: 'El terminali bağlantısı', status: 'active' },
      { name: 'Datalogic', description: 'Barkod okuyucu desteği', status: 'active' },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/stoocker_black.png"
                alt="Stoocker"
                width={120}
                height={40}
                priority
                className="object-contain"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                Dokümantasyon
              </Link>
              <Link href="/api-docs" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                API
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-slate-900 py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto relative z-10"
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-xl">
              <Globe className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
              Tüm İş Akışınız <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">
                Tek Platformda
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Stocker; e-ticaret siteleriniz, muhasebe yazılımınız ve kargo operasyonlarınızla tam entegre çalışır.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                Entegrasyon Talep Et
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/api-docs" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors flex items-center justify-center gap-2">
                API Dokümantasyonu
                <Zap className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-10 relative z-20 space-y-20">
          {integrationCategories.map((category, catIndex) => {
            const Icon = category.icon;
            return (
              <div key={catIndex}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                    <p className="text-slate-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: itemIndex * 0.05 }}
                      className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all group flex items-start gap-4"
                    >
                      <div className="flex-shrink-0">
                        <BrandLogo name={item.name} className="w-12 h-12 rounded-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-slate-900 truncate pr-2">{item.name}</h3>
                          {item.status === 'active' ? (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500" title="Aktif" />
                          ) : (
                            <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">Yakında</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 leading-snug mb-3">
                          {item.description}
                        </p>
                        {item.status === 'active' && (
                          <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                            Bağla
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <section className="py-20 bg-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl font-bold mb-6">Özel Bir Entegrasyona mı İhtiyacınız Var?</h2>
            <p className="text-indigo-200 mb-8 text-lg">
              Stocker API ile kendi çözümlerinizi geliştirebilir veya ekibimizden
              size özel entegrasyon desteği alabilirsiniz.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                Bizimle İletişime Geçin
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">© 2026 Stoocker. Tüm hakları saklıdır.</span>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900">Gizlilik</Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900">Kullanım Şartları</Link>
            <Link href="/api-docs" className="text-slate-500 hover:text-slate-900">API</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

