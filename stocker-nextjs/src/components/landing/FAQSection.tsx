'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const faqs = [
  {
    question: 'Stocker nasıl çalışır?',
    answer: 'Stocker, bulut tabanlı bir stok yönetim sistemidir. Ürünlerinizi ekleyip, stok hareketlerinizi kaydedebilir, anlık raporlar alabilir ve tüm işlemlerinizi tek bir yerden yönetebilirsiniz. Kurulum son derece basittir ve birkaç dakika içinde kullanmaya başlayabilirsiniz.',
  },
  {
    question: 'Hangi cihazlardan erişebilirim?',
    answer: 'Stocker\'a bilgisayar, tablet ve mobil cihazlardan erişebilirsiniz. Responsive tasarımımız sayesinde tüm cihazlarda sorunsuz çalışır. Ayrıca mobil uygulamamız ile iOS ve Android cihazlarınızdan da kolayca erişim sağlayabilirsiniz.',
  },
  {
    question: 'Verilerim güvende mi?',
    answer: 'Evet, verileriniz en üst düzey güvenlik standartları ile korunmaktadır. SSL şifreleme, düzenli yedekleme, iki faktörlü kimlik doğrulama ve enterprise seviye güvenlik önlemleri kullanıyoruz. Verileriniz günlük olarak yedeklenir ve şifreli olarak saklanır.',
  },
  {
    question: 'Ücretsiz deneme süresi var mı?',
    answer: '14 gün ücretsiz deneme hakkınız bulunmaktadır. Deneme süresi boyunca tüm özelliklere tam erişim sağlayabilirsiniz. Kredi kartı bilgisi gerekmez ve deneme süresi sonunda otomatik ücretlendirme yapılmaz.',
  },
  {
    question: 'Başka sistemlerle entegrasyon mümkün mü?',
    answer: 'Evet, Stocker popüler e-ticaret platformları, muhasebe yazılımları ve ERP sistemleri ile entegre çalışabilir. REST API\'miz sayesinde kendi sistemlerinizle de kolayca entegrasyon yapabilirsiniz. Teknik ekibimiz entegrasyon sürecinde size destek sağlar.',
  },
  {
    question: 'Müşteri desteği nasıl çalışıyor?',
    answer: 'Profesyonel ve Kurumsal planlarda 7/24 canlı destek sunuyoruz. Email, telefon ve canlı sohbet üzerinden Türkçe destek alabilirsiniz. Ayrıca detaylı dökümantasyon ve video eğitimlerimiz de mevcuttur. Başlangıç paketinde ise email desteği bulunmaktadır.',
  },
  {
    question: 'İptal ve iade politikası nedir?',
    answer: 'Dilediğiniz zaman planınızı iptal edebilirsiniz. İptal işleminiz sonraki fatura döneminizde geçerli olur ve kalan süre boyunca sistemi kullanmaya devam edebilirsiniz. İlk 30 gün içinde memnun kalmazsanız, koşulsuz para iade garantisi sunuyoruz.',
  },
  {
    question: 'Kullanıcı limiti var mı?',
    answer: 'Her plan için farklı kullanıcı limitleri bulunmaktadır. Başlangıç planında 1, Profesyonel planda 10, Kurumsal planda ise sınırsız kullanıcı hakkı vardır. İhtiyacınız olduğunda ek kullanıcı paketi satın alabilir veya planınızı yükseltebilirsiniz.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-xl text-gray-600">
            Aklınıza takılan soruların cevaplarını burada bulabilirsiniz
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 group"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors pr-8">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"
                  >
                    {openIndex === index ? <MinusOutlined /> : <PlusOutlined />}
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Başka sorularınız mı var?
          </h3>
          <p className="text-gray-600 mb-6">
            Ekibimiz size yardımcı olmaktan mutluluk duyar
          </p>
          <motion.a
            href="mailto:info@stocker.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Bize Ulaşın
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
