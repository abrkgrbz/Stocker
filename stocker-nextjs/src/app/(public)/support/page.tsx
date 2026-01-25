'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Search,
  MessageCircle,
  Mail,
  Phone,
  Book,
  CreditCard,
  Settings,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const categories = [
    {
      icon: Settings,
      title: 'Hesap Ayarları',
      description: 'Hesap yönetimi, şifre değişikliği ve profil ayarları hakkında bilgi alın.',
    },
    {
      icon: CreditCard,
      title: 'Ödeme ve Faturalar',
      description: 'Abonelik planları, ödeme yöntemleri ve fatura geçmişi işlemleri.',
    },
    {
      icon: Shield,
      title: 'Güvenlik ve Gizlilik',
      description: 'Güvenlik önlemleri, 2FA kurulumu ve veri gizliliği politikaları.',
    },
    {
      icon: Book,
      title: 'Kullanım Kılavuzları',
      description: 'Platformun tüm özelliklerini detaylıca öğrenin ve uzmanlaşın.',
    },
  ];

  const faqs = [
    {
      question: 'Şifremi unuttum, nasıl sıfırlayabilirim?',
      answer: 'Giriş sayfasındaki "Şifremi Unuttum" bağlantısına tıklayarak kayıtlı e-posta adresinize sıfırlama bağlantısı gönderebilirsiniz.'
    },
    {
      question: 'Aboneliğimi nasıl iptal edebilirim?',
      answer: 'Hesap ayarları > Abonelik menüsünden mevcut planınızı görüntüleyebilir ve iptal işlemini gerçekleştirebilirsiniz.'
    },
    {
      question: 'Stoocker güvenli mi?',
      answer: 'Evet, verileriniz banka seviyesinde şifreleme ile korunmaktadır. Detaylı bilgi için Güvenlik sayfamızı inceleyebilirsiniz.'
    },
    {
      question: 'Farklı kullanıcı yetkileri tanımlayabilir miyim?',
      answer: 'Evet, Kurumsal planda admin, editör ve görüntüleyici gibi farklı roller atayabilirsiniz.'
    },
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
              <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                Dokümantasyon
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
        <section className="bg-slate-900 py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto relative z-10"
          >
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Size Nasıl Yardımcı Olabiliriz?
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Sorularınızın cevaplarını bulun veya destek ekibimizle iletişime geçin.
            </p>

            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/20 transition-all backdrop-blur-sm"
                placeholder="Bir konu arayın (örn. Fatura, API, Güvenlik)..."
              />
            </div>
          </motion.div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4 max-w-7xl mx-auto -mt-10 relative z-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{category.title}</h3>
                  <p className="text-slate-600 text-sm">{category.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Support Channels & FAQ */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Contact Form */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  İletişime Geçin
                </h3>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">Mesajınız Alındı!</h4>
                    <p className="text-slate-600 text-sm">En kısa sürede size dönüş yapacağız.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={ticketForm.email}
                        onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Konu</label>
                      <select
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      >
                        <option value="">Seçiniz...</option>
                        <option value="technical">Teknik Destek</option>
                        <option value="billing">Ödeme ve Fatura</option>
                        <option value="feature">Özellik İsteği</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mesajınız</label>
                      <textarea
                        required
                        rows={4}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                        value={ticketForm.message}
                        onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                      {!isSubmitting && <Send className="w-4 h-4" />}
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-indigo-600" />
                  Canlı Destek
                </h4>
                <p className="text-slate-600 text-sm mb-4">
                  Mesai saatleri içerisinde (09:00 - 18:00) destek ekibimizle anlık görüşebilirsiniz.
                </p>
                <button className="w-full py-2 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                  Sohbet Başlat
                </button>
              </div>
            </div>

            {/* FAQs */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-indigo-600" />
                Sıkça Sorulan Sorular
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-900">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6 pt-2 text-slate-600 border-t border-slate-100 bg-slate-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Aradığınız cevabı bulamadınız mı?</h4>
                <p className="text-slate-600 mb-6">
                  Merak ettiğiniz diğer konular için detaylı dokümantasyonumuzu inceleyebilirsiniz.
                </p>
                <Link href="/docs" className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 group">
                  Dokümantasyona Git
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
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
            <Link href="/support" className="text-slate-900 font-medium">Destek</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

