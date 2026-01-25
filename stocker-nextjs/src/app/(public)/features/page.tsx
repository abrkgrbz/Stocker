'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Users,
  ShoppingCart,
  Boxes,
  Briefcase,
  Package,
  BarChart3,
  Wallet,
  Factory,
  Search,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Puzzle
} from 'lucide-react';
import { Tag } from 'antd';

// Module tier configuration (visual only for public page)
const TIER_CONFIG = {
  standard: {
    label: 'Standard',
    color: 'blue',
  },
  premium: {
    label: 'Premium',
    color: 'purple',
  },
  enterprise: {
    label: 'Enterprise',
    color: 'gold',
  },
} as const;

// Module definitions based on dashboard modules
const MODULES = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Müşteri ilişkileri yönetimi ve satış fırsatları',
    icon: Users,
    tier: 'premium' as const,
    features: ['Müşteri Yönetimi', 'Satış Pipeline', 'Aktivite Takibi', 'Raporlama'],
  },
  {
    id: 'inventory',
    name: 'Stok Yönetimi',
    description: 'Envanter takibi ve depo operasyonları',
    icon: Boxes,
    tier: 'standard' as const,
    features: ['Ürün Kataloğu', 'Depo Takibi', 'Barkod Sistemi', 'Stok Uyarıları'],
  },
  {
    id: 'sales',
    name: 'Satış',
    description: 'Sipariş, fatura ve ödeme yönetimi',
    icon: ShoppingCart,
    tier: 'standard' as const,
    features: ['Sipariş Yönetimi', 'Faturalama', 'Ödeme Takibi', 'Raporlar'],
  },
  {
    id: 'hr',
    name: 'İnsan Kaynakları',
    description: 'Personel yönetimi ve bordro işlemleri',
    icon: Briefcase,
    tier: 'standard' as const,
    features: ['Personel Kartları', 'İzin Takibi', 'Bordro', 'Performans'],
  },
  {
    id: 'purchase',
    name: 'Satın Alma',
    description: 'Tedarik zinciri ve satın alma süreçleri',
    icon: Package,
    tier: 'standard' as const,
    features: ['Tedarikçiler', 'Satın Alma Siparişleri', 'Mal Kabul', 'Ödemeler'],
  },
  {
    id: 'finance',
    name: 'Finans',
    description: 'Muhasebe, nakit akışı ve finansal yönetim',
    icon: Wallet,
    tier: 'premium' as const,
    features: ['Hesap Planı', 'Fatura Yönetimi', 'Nakit Akışı', 'Banka İşlemleri'],
  },
  {
    id: 'analytics',
    name: 'Raporlama',
    description: 'İş zekası ve gelişmiş analitik',
    icon: BarChart3,
    tier: 'enterprise' as const,
    features: ['Dashboard Builder', 'KPI Takibi', 'Veri Görselleştirme', 'Export'],
  },
  {
    id: 'manufacturing',
    name: 'Üretim Yönetimi',
    description: 'Üretim planlama, iş emirleri, MRP ve kalite kontrol',
    icon: Factory,
    tier: 'enterprise' as const,
    features: ['Üretim Planlama', 'İş Emirleri', 'Reçete/BOM', 'Kalite Kontrol'],
  },
  {
    id: 'integrations',
    name: 'Entegrasyonlar',
    description: 'Diğer uygulamalarla tam uyumlu çalışın',
    icon: Puzzle,
    tier: 'standard' as const,
    features: ['Pazaryeri Entegrasyonu', 'Kargo Entegrasyonu', 'SMS/E-posta', 'Open API'],
  },
];

const ADDITIONAL_FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Kurumsal Güvenlik',
    description: '256-bit SSL şifreleme ve düzenli yedekleme ile verileriniz güvende.',
  },
  {
    icon: Globe,
    title: 'Her Yerden Erişim',
    description: 'Bulut tabanlı altyapı sayesinde ofis, ev veya sahadan kesintisiz erişim.',
  },
  {
    icon: Zap,
    title: 'Hızlı Kurulum',
    description: 'Dakikalar içinde hesabınızı oluşturun ve kullanmaya başlayın.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/stoocker_black.png"
                alt="Stocker"
                width={120}
                height={40}
                priority
                className="object-contain"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              İşletmeniz İçin Güçlü Modüller
            </h1>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed">
              Stocker, işletmenizin tüm süreçlerini tek bir platformda yönetmenizi sağlar.
              İhtiyacınız olan modülleri seçin ve hemen kullanmaya başlayın.
            </p>
          </motion.div>
        </section>

        {/* Modules Grid */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {MODULES.map((module, index) => {
                const Icon = module.icon;
                const tier = TIER_CONFIG[module.tier];

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                          <Icon className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-lg">{module.name}</h3>
                            <Tag color={tier.color} className="text-xs border-0 bg-opacity-10">
                              {tier.label}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-500 mb-6 min-h-[40px]">
                      {module.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      {module.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <Link
                        href={`/register?module=${module.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors group-hover:translate-x-1 duration-200"
                      >
                        İncele <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="bg-white py-24 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              {ADDITIONAL_FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden relative isolate">
              {/* Abstract background shapes */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden opacity-30 pointer-events-none -z-10">
                <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-[30%] w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
                  İşletmenizi Büyütmeye Hazır mısınız?
                </h2>
                <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                  14 gün boyunca tüm modülleri <span className="text-white font-semibold">ücretsiz deneyin</span>.
                  Kredi kartı gerekmez, taahhüt yok.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 !text-white font-bold text-base rounded-xl hover:bg-indigo-500 hover:scale-105 transition-all duration-200 shadow-lg shadow-indigo-500/25"
                  >
                    Ücretsiz Hesabınızı Oluşturun
                  </Link>
                  <Link
                    href="/demo"
                    className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 !text-white font-bold text-base rounded-xl hover:bg-white/10 hover:scale-105 backdrop-blur-sm transition-all duration-200"
                  >
                    Demo İsteyin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">© 2024 Stocker. Tüm hakları saklıdır.</span>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900">Gizlilik</Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900">Kullanım Şartları</Link>
            <Link href="/contact" className="text-slate-500 hover:text-slate-900">İletişim</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
