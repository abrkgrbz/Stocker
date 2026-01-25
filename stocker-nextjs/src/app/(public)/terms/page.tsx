'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FileText,
  UserCheck,
  CreditCard,
  ShieldAlert,
  Gavel,
  Scale,
  Copyright,
  HelpCircle,
  Mail
} from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = "25 Ocak 2026";

  const sections = [
    {
      title: '1. Taraflar ve Konu',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p>
            İşbu Kullanıcı Sözleşmesi ("Sözleşme"), <strong>Stoocker Teknoloji A.Ş.</strong> ("Şirket") ile https://stoocker.app web sitesine ("Platform") üye olan kullanıcı ("Kullanıcı") arasında akdedilmiştir.
          </p>
          <p>
            Sözleşme'nin konusu, Kullanıcı'nın Platform üzerinden sunulan bulut tabanlı ön muhasebe, stok takibi ve CRM hizmetlerinden ("Hizmetler") faydalanma şartlarının belirlenmesidir.
          </p>
        </div>
      )
    },
    {
      title: '2. Üyelik ve Hesap Güvenliği',
      icon: UserCheck,
      content: (
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Kullanıcı, üyelik oluştururken verdiği bilgilerin doğru ve güncel olduğunu taahhüt eder.</li>
          <li>Kullanıcı adı ve şifre güvenliğinden tamamen Kullanıcı sorumludur. Şifrenin yetkisiz kullanımı durumunda Şirket sorumlu tutulamaz.</li>
          <li>Şirket, şüpheli durumlarda Kullanıcı hesabını askıya alma hakkını saklı tutar.</li>
        </ul>
      )
    },
    {
      title: '3. Abonelik, Ödeme ve İptal',
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <p>
            Hizmetler, seçilen pakete göre aylık veya yıllık abonelik bazında ücretlendirilir. Ödemeler, güvenli ödeme altyapısı (Iyzico/Stripe) üzerinden tahsil edilir.
          </p>
          <p>
            <strong>İptal:</strong> Kullanıcı dilediği zaman aboneliğini iptal edebilir. İptal işlemi, mevcut dönemin sonunda geçerli olur; kullanılmayan günlerin ücret iadesi yapılmaz (Cayma hakkı istisnaları saklıdır).
          </p>
        </div>
      )
    },
    {
      title: '4. Fikri Mülkiyet Hakları',
      icon: Copyright,
      content: (
        <p>
          Platform üzerindeki tüm yazılım, tasarım, arayüz, kod, veritabanı ve içeriklerin fikri mülkiyet hakları münhasıran Stoocker Teknoloji A.Ş.'ye aittir. Kullanıcı, Platform'u kopyalayamaz, tersine mühendislik yapamaz veya ticari amaçla (kendi iş süreçleri dışında) çoğaltamaz.
        </p>
      )
    },
    {
      title: '5. Sorumluluk Reddi (Disclaimer)',
      icon: ShieldAlert,
      content: (
        <p>
          Hizmetler "olduğu gibi" (as-is) sunulmaktadır. Şirket, Hizmetlerin kesintisiz veya hatasız olacağını garanti etmez. Kullanıcı verilerinin yedeklenmesi birincil olarak Şirket'in sorumluluğunda olsa da, Kullanıcı'nın kendi verilerini düzenli dışa aktarması önerilir. Şirket, dolaylı zararlardan (kar kaybı vb.) sorumlu tutulamaz.
        </p>
      )
    },
    {
      title: '6. Uyuşmazlıkların Çözümü',
      icon: Gavel,
      content: (
        <div className="space-y-4">
          <p>
            İşbu Sözleşme, Türkiye Cumhuriyeti kanunlarına tabidir. Sözleşme'den doğabilecek her türlü uyuşmazlığın çözümünde <strong>İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
          </p>
        </div>
      )
    }
  ];

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
        <section className="py-16 text-center px-4 bg-white border-b border-slate-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-900">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Kullanıcı Sözleşmesi
            </h1>
            <p className="text-slate-500">
              Son Güncelleme: {lastUpdated}
            </p>
          </motion.div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-top gap-4 mb-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-4">
                        {section.title}
                      </h2>
                      <div className="text-slate-600 leading-relaxed text-sm sm:text-base">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Box */}
          <div className="mt-12 bg-indigo-50 rounded-xl p-8 text-center border border-indigo-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Sorularınız mı var?</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Sözleşme şartları hakkında hukuki veya teknik sorularınız için hukuk ekibimizle iletişime geçebilirsiniz.
            </p>
            <a
              href="mailto:legal@stoocker.app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              <Mail className="w-4 h-4" />
              legal@stoocker.app
            </a>
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
            <Link href="/terms" className="text-slate-900 font-medium">Kullanım Şartları</Link>
            <Link href="/contact" className="text-slate-500 hover:text-slate-900">İletişim</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
