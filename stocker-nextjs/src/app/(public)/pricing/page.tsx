'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Başlangıç',
    price: '₺99',
    period: '/ay',
    description: 'Küçük işletmeler ve yeni başlayanlar için ideal.',
    features: [
      '10 Kullanıcı',
      '1000 Ürün Kapasitesi',
      'Temel Stok Takibi',
      'Standart Raporlar',
      'E-posta Desteği',
    ],
    notIncluded: [
      'API Erişimi',
      'Gelişmiş Entegrasyonlar',
      'Özel Alan Adı',
    ],
    highlight: false,
    buttonText: 'Hemen Başla',
    buttonVariant: 'outline',
  },
  {
    id: 'pro',
    name: 'Profesyonel',
    price: '₺299',
    period: '/ay',
    description: 'Büyüyen işletmeler için kapsamlı çözümler.',
    features: [
      '50 Kullanıcı',
      'Sınırsız Ürün',
      'Çoklu Depo Yönetimi',
      'Gelişmiş Raporlama',
      'Öncelikli Destek',
      'API Erişimi (Basic)',
      'Pazaryeri Entegrasyonu',
    ],
    notIncluded: [
      'Özel Sunucu',
      'SLA Garantisi',
    ],
    highlight: true,
    highlightText: 'En Popüler',
    buttonText: 'Ücretsiz Dene',
    buttonVariant: 'primary',
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    price: 'Özel Fiyat',
    period: '',
    description: 'Büyük ölçekli operasyonlar için terzi işi çözüm.',
    features: [
      'Sınırsız Kullanıcı',
      'Sınırsız Depo & Ürün',
      'Özel Raporlar & Dashboard',
      '7/24 Telefon Desteği',
      'Full API Erişimi',
      'Özel Entegrasyonlar',
      'SLA & Yedekleme Garantisi',
      'Yerinde Kurulum Desteği',
    ],
    notIncluded: [],
    highlight: false,
    buttonText: 'Teklif İste',
    buttonVariant: 'outline',
  },
];

const FAQS = [
  {
    question: 'Deneme süresi bittikten sonra ne olur?',
    answer: '14 günlük deneme süreniz bittikten sonra verileriniz 30 gün boyunca saklanır. Bu süre içinde bir plan seçip ödeme yaparsanız kaldığınız yerden devam edebilirsiniz.',
  },
  {
    question: 'İstediğim zaman plan değiştirebilir miyim?',
    answer: 'Evet, dilediğiniz zaman planlar arasında geçiş yapabilirsiniz. Yükseltmelerde aradaki fark, düşürmelerde ise kalan süre hesabınıza kredi olarak yansır.',
  },
  {
    question: 'API erişimi tüm planlarda var mı?',
    answer: 'API erişimi Profesyonel ve Kurumsal planlarımızda mevcuttur. Başlangıç planında API erişimi bulunmamaktadır.',
  },
  {
    question: 'Ödeme yöntemleri nelerdir?',
    answer: 'Kredi kartı (Visa, Mastercard, Amex) ve yıllık alımlarda havale/EFT ile ödeme yapabilirsiniz.',
  },
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

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
              Şeffaf Fiyatlandırma
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Gizli ücret yok. İşletmenizin büyüklüğüne uygun planı seçin, hemen başlayın.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}
              >
                Aylık
              </button>
              <button
                onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                <span
                  className={`${billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`text-sm font-medium transition-colors flex items-center gap-2 ${billingInterval === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}
              >
                Yıllık
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  %20 İndirim
                </span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {PLANS.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative rounded-2xl bg-white p-8 shadow-lg border transition-all duration-200
                    ${plan.highlight
                      ? 'border-indigo-600 ring-1 ring-indigo-600 shadow-indigo-100'
                      : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                      {plan.highlightText}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="mt-2 text-sm text-slate-500 min-h-[40px]">{plan.description}</p>
                  </div>

                  <div className="mb-6 flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight text-slate-900">{plan.price}</span>
                    <span className="text-sm font-semibold text-slate-500 ml-1">{plan.period}</span>
                  </div>

                  <div className="mb-8">
                    <Link
                      href="/register"
                      className={`
                        block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all
                        ${plan.buttonVariant === 'primary'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20'
                          : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }
                      `}
                    >
                      {plan.buttonText}
                    </Link>
                  </div>

                  <ul className="space-y-4 text-sm text-slate-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-slate-400">
                        <X className="h-5 w-5 flex-shrink-0 text-slate-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-24 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              Sıkça Sorulan Sorular
            </h2>
            <div className="space-y-8">
              {FAQS.map((faq, index) => (
                <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <h3 className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-3">
                    <HelpCircle className="h-5 w-5 text-indigo-500" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 leading-relaxed ml-8">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Hala Sorularınız mı Var?
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Satış ekibimizle iletişime geçin, size en uygun çözümü birlikte bulalım.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-3 bg-white text-slate-900 font-medium rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                İletişime Geçin
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
            <Link href="/contact" className="text-slate-500 hover:text-slate-900">İletişim</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
