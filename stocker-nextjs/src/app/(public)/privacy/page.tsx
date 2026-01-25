'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  FileText,
  Eye,
  Server,
  Globe,
  Users
} from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Veri Sorumlusu',
      content: (
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Stoocker Teknoloji A.Ş. ("Şirket") olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında; hukuka ve dürüstlük kurallarına uygun bir şekilde işleyebilecek, kaydedebilecek, saklayabilecek, sınıflandırabilecek, güncelleyebilecek ve mevzuatın izin verdiği hallerde üçüncü kişilere açıklayabilecek/devredebileceğiz.
        </p>
      ),
      icon: Shield
    },
    {
      title: '2. İşlenen Kişisel Verileriniz',
      content: (
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası.</li>
          <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres.</li>
          <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, fatura bilgileri, talep ve şikayetler.</li>
          <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, log kayıtları, cihaz bilgileri, şifre ve parola bilgileri.</li>
          <li><strong>Pazarlama Bilgileri:</strong> Çerez kayıtları, hedefleme bilgileri, alışkanlıklar ve beğeniler.</li>
        </ul>
      ),
      icon: FileText
    },
    {
      title: '3. Kişisel Verilerin İşlenme Amacı',
      content: (
        <p>
          Kişisel verileriniz şu amaçlarla işlenmektedir:
          <br /><br />
          Şirketimiz tarafından sunulan ürün ve hizmetlerden sizleri faydalandırmak için gerekli çalışmaların iş birimlerimiz tarafından yapılması,
          Şirketimiz ve Şirketimizle iş ilişkisi içerisinde olan ilgili kişilerin hukuki ve ticari güvenliğinin temini,
          Şirketimizin ticari ve iş stratejilerinin belirlenmesi ve uygulanması,
          Müşteri memnuniyetinin artırılması,
          Yasal mevzuattan kaynaklanan yükümlülüklerin yerine getirilmesi.
        </p>
      ),
      icon: Eye
    },
    {
      title: '4. İşlenen Kişisel Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği',
      content: (
        <p>
          Toplanan kişisel verileriniz; yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda, iş ortaklarımıza, tedarikçilerimize, kanunen yetkili kamu kurumlarına ve özel kişilere, KVKK’nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde aktarılabilecektir. Sunucularımızın bir kısmı yedekleme ve güvenlik amacıyla yurt dışında (AB standartlarında güvenli veri merkezlerinde) tutulabilmektedir.
        </p>
      ),
      icon: Globe
    },
    {
      title: '5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi',
      content: (
        <p>
          Kişisel verileriniz, internet sitemiz, mobil uygulamamız, çağrı merkezimiz veya e-posta yoluyla elektronik ortamda toplanmaktadır. Bu veriler, KVKK’nın 5. maddesinde belirtilen "sözleşmenin kurulması veya ifası", "hukuki yükümlülüğün yerine getirilmesi" ve "ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri" hukuki sebeplerine dayanılarak toplanmaktadır.
        </p>
      ),
      icon: Server
    },
    {
      title: '6. Kişisel Veri Sahibinin Hakları (KVKK Madde 11)',
      content: (
        <div className="space-y-4">
          <p>KVKK’nın 11. maddesi uyarınca veri sahipleri şu haklara sahiptir:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
            <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
            <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
            <li>Kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme,</li>
            <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme.</li>
          </ul>
        </div>
      ),
      icon: Users
    }
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
        <section className="py-16 text-center px-4 bg-white border-b border-slate-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-900">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Gizlilik Politikası ve KVKK Aydınlatma Metni
            </h1>
            <p className="text-slate-500">
              Son Güncelleme: 25 Ocak 2026
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
                  className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {section.content}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Box */}
          <div className="mt-12 bg-indigo-50 rounded-xl p-8 text-center border border-indigo-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">KVKK Başvuruları İçin</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Kanunun 11. maddesindeki haklarınızı kullanmakla ilgili taleplerinizi "Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ"e uygun olarak bize iletebilirsiniz.
            </p>
            <a
              href="mailto:kvkk@stoocker.app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              kvkk@stoocker.app
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
            <Link href="/privacy" className="text-slate-900 font-medium">Gizlilik</Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900">Kullanım Şartları</Link>
            <Link href="/contact" className="text-slate-500 hover:text-slate-900">İletişim</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
