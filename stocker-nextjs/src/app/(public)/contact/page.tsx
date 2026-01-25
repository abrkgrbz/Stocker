'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  FileText,
  LifeBuoy
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'E-posta',
      value: 'info@stoocker.com',
      href: 'mailto:info@stoocker.com',
      desc: 'Genel sorularınız için bize yazın.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Phone,
      title: 'Telefon',
      value: '+90 (850) 123 45 67',
      href: 'tel:+908501234567',
      desc: 'Hafta içi 09:00 - 18:00 arası.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: MapPin,
      title: 'Ofis',
      value: 'Maslak, Sarıyer, İstanbul',
      href: 'https://maps.google.com',
      desc: 'Genel merkezimizi ziyaret edin.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: MessageCircle,
      title: 'Canlı Destek',
      value: '7/24 Online',
      href: '/support',
      desc: 'Anında yanıt alın.',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
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
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Bize Ulaşın
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Sorularınız mı var? Ekibimiz size yardımcı olmaktan mutluluk duyar.
              Aşağıdaki kanallardan bize ulaşabilir veya formu doldurabilirsiniz.
            </p>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Contact Methods Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={index}
                  href={method.href} // Added href to make the card appear clickable for users
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{method.title}</h3>
                  <p className="text-sm font-medium text-slate-900 mb-1">{method.value}</p>
                  <p className="text-xs text-slate-500">{method.desc}</p>
                </motion.a>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Bize Yazın</h2>
                  <p className="text-slate-500">Formu doldurun, en kısa sürede size dönüş yapalım.</p>
                </div>

                {submitted ? (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Mesajınız Alındı!</h3>
                    <p className="text-slate-600 max-w-sm mx-auto">
                      Bizimle iletişime geçtiğiniz için teşekkürler. Ekibimiz en kısa sürede size e-posta yoluyla dönüş yapacaktır.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-sm font-medium text-slate-900 hover:text-indigo-600 underline"
                    >
                      Yeni mesaj gönder
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Adınız Soyadınız</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition-all outline-none"
                          placeholder="Adınız Soyadınız"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">E-posta Adresi</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition-all outline-none"
                          placeholder="ornek@sirket.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Konu</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition-all outline-none appearance-none"
                      >
                        <option value="">Konu seçiniz</option>
                        <option value="sales">Satış & Paketler</option>
                        <option value="support">Teknik Destek</option>
                        <option value="partnership">İş Ortaklığı</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Mesajınız</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition-all outline-none resize-none"
                        placeholder="Mesajınızı buraya yazın..."
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        {isSubmitting ? (
                          <>Gönderiliyor...</>
                        ) : (
                          <>
                            Mesajı Gönder <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Working Hours */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Çalışma Saatleri</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-slate-500">Pazartesi - Cuma</span>
                    <span className="font-medium text-slate-900">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-slate-500">Cumartesi</span>
                    <span className="font-medium text-slate-900">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Pazar</span>
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-semibold">Kapalı</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Yardımcı Kaynaklar</h3>
                </div>
                <ul className="space-y-3">
                  <li>
                    <Link href="/help" className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors text-sm group">
                      <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                      <span>Sıkça Sorulan Sorular</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs" className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors text-sm group">
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                      <span>Dokümantasyon</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/status" className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors text-sm group">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span>Sistem Durumu: <span className="text-emerald-600 font-medium">Aktif</span></span>
                    </Link>
                  </li>
                </ul>
              </motion.div>
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
