'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Server,
  FileKey,
  Activity,
  Database,
  Globe,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Uçtan Uca Şifreleme',
      description: 'Tüm veriler saklanırken ve transfer edilirken 256-bit AES ve TLS 1.3 protokolleri ile şifrelenir.',
    },
    {
      icon: Shield,
      title: 'Çok Faktörlü Kimlik Doğrulama',
      description: 'SMS, E-posta veya Authenticator uygulamaları ile hesap güvenliğiniz garanti altına alınır.',
    },
    {
      icon: Server,
      title: 'KVKK Teknik Tedbirler',
      description: 'Kişisel Verileri Koruma Kurumu tarafından yayınlanan rehbere uygun idari ve teknik tedbirler uygulanır.',
    },
    {
      icon: FileKey,
      title: 'Erişim Yönetimi (Saldırı Tespiti)',
      description: 'Rol tabanlı yetkilendirme (RBAC) ve yetkisiz erişim denemelerine karşı aktif IPS/IDS koruması.',
    },
    {
      icon: Activity,
      title: 'Loglama ve İzlenebilirlik',
      description: 'Sistem aktiviteleri (5651 sayılı kanun gereği) zaman damgalı olarak loglanır ve saklanır.',
    },
    {
      icon: Database,
      title: 'Felaket Kurtarma',
      description: 'Verileriniz coğrafi yedekli sunucularda tutulur, herhangi bir felaket anında veri kaybı önlenir.',
    }
  ];

  const certifications = [
    { name: 'ISO 27001', description: 'Bilgi Güvenliği Yönetim Sistemi', icon: '🏅' },
    { name: 'KVKK Uyumlu', description: 'Kişisel Verilerin Korunması', icon: '🇹🇷' },
    { name: 'GDPR Ready', description: 'Avrupa Veri Koruma Standartları', icon: '🇪🇺' },
    { name: 'SOC 2 Type II', description: 'Güvenlik ve Gizlilik Denetimi', icon: '🛡️' },
    { name: 'SSL Secure', description: '2048-bit SSL Sertifikası', icon: '🔒' },
  ];

  const practices = [
    {
      title: 'Sızma (Penetrasyon) Testleri',
      description: 'Bağımsız akredite kuruluşlar tarafından yılda en az iki kez sızma testleri yapılarak sistem açıkları taranır.'
    },
    {
      title: 'Güvenli Yazılım Yaşam Döngüsü',
      description: 'OWASP Top 10 standartlarına bağlı kalınarak, kod geliştirme aşamasından itibaren güvenlik testleri uygulanır.'
    },
    {
      title: 'Veri Minimizasyonu',
      description: 'Sadece hizmetin verilebilmesi için gerekli olan asgari düzeyde veri toplanır ve işlenir.'
    },
    {
      title: 'Personel Farkındalığı',
      description: 'Tüm çalışanlarımız düzenli olarak bilgi güvenliği ve KVKK farkındalık eğitimlerine tabi tutulur.'
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
        <section className="py-20 text-center px-4 bg-white border-b border-slate-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Veri Güvenliği Politikamız
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Stoocker olarak verilerinizi korumak için <span className="font-semibold text-slate-900">banka seviyesinde</span> güvenlik önlemleri alıyor, Türkiye mevzuatına (KVKK) tam uyum sağlıyoruz.
            </p>
          </motion.div>
        </section>

        {/* Certifications Banner */}
        <section className="py-10 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-2 group cursor-default"
                >
                  <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300">{cert.icon}</span>
                  <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-800">{cert.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Measures (Grid) */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">KVKK Teknik Tedbirler</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Veri güvenliğini sağlamak amacıyla uyguladığımız temel teknik prosedürler.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Detailed Practices */}
        <section className="py-20 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Left Column: Text Content */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">
                  Sürekli Denetim ve Gelişim
                </h2>
                <div className="space-y-8">
                  {practices.map((practice, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{practice.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{practice.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Alert Box */}
              <div className="bg-slate-900 rounded-2xl p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Shield className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-xl font-bold">Güvenlik Bildirimi</h3>
                  </div>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                    Sistemlerimizde herhangi bir güvenlik zafiyeti tespit etmeniz durumunda, sorumlu açıklama (responsible disclosure) ilkeleri çerçevesinde bizimle iletişime geçmenizi rica ederiz.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                      <Shield className="w-5 h-5 text-indigo-400" />
                      <span className="font-mono text-sm">security@stoocker.app</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                      <FileKey className="w-5 h-5 text-indigo-400" />
                      <span className="font-mono text-sm">PGP: stoocker.app/security.asc</span>
                    </div>
                  </div>

                  <p className="mt-8 text-xs text-slate-500">
                    * Bildirimleriniz güvenlik ekibimiz tarafından en geç 24 saat içinde değerlendirilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Güvenliğiniz Bizim İçin Önemli
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              Veri gizliliği ve güvenliği hakkında daha detaylı bilgi almak için dokümantasyonumuzu inceleyebilir veya bizimle iletişime geçebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                İletişime Geçin
              </Link>
              <Link
                href="/privacy"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Gizlilik Politikasını Oku
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
