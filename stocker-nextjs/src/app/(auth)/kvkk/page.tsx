'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedBackground from '@/components/landing/AnimatedBackground'

const sections = [
  {
    title: 'Veri Sorumlusu',
    content: `Stocker Yazılım A.Ş. olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi işlemekteyiz.

Veri Sorumlusu: Stocker Yazılım A.Ş.
Adres: Maslak Mah. Ahi Evran Cad. No:6 Sarıyer/İstanbul
E-posta: kvkk@stocker.com
Telefon: +90 (850) 123 45 67`,
  },
  {
    title: 'İşlenen Kişisel Veriler',
    content: `Aşağıdaki kategorilerde kişisel verileriniz işlenmektedir:

• Kimlik Bilgileri: Ad, soyad, T.C. kimlik numarası, doğum tarihi
• İletişim Bilgileri: E-posta adresi, telefon numarası, adres
• Finansal Bilgiler: Fatura bilgileri, ödeme kayıtları, banka hesap bilgileri
• Kullanım Verileri: IP adresi, tarayıcı bilgileri, kullanım istatistikleri
• Çalışan Verileri: Kullanıcı hesap bilgileri, yetki seviyeleri`,
  },
  {
    title: 'Veri İşleme Amaçları',
    content: `Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:

• Hizmet sunumu ve sözleşme yükümlülüklerinin yerine getirilmesi
• Müşteri desteği ve iletişim faaliyetlerinin yürütülmesi
• Faturalandırma ve ödeme işlemlerinin gerçekleştirilmesi
• Yasal yükümlülüklerin yerine getirilmesi
• Hizmet kalitesinin artırılması ve analiz çalışmaları
• Güvenlik önlemlerinin alınması ve dolandırıcılığın önlenmesi`,
  },
  {
    title: 'Hukuki Sebepler',
    content: `KVKK'nın 5. ve 6. maddeleri uyarınca kişisel verileriniz aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:

• Sözleşmenin kurulması veya ifası için gerekli olması
• Veri sorumlusunun hukuki yükümlülüğü
• Veri sorumlusunun meşru menfaati
• Açık rızanızın bulunması (gerekli hallerde)`,
  },
  {
    title: 'Veri Aktarımı',
    content: `Kişisel verileriniz, yukarıda belirtilen amaçlarla sınırlı olarak aşağıdaki taraflara aktarılabilir:

• Hizmet sağlayıcılar ve iş ortakları
• Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları
• Ödeme hizmeti sağlayıcıları
• Bulut hizmet sağlayıcıları (AWS, veri merkezleri yurt dışında olabilir)

Yurt dışına veri aktarımı halinde KVKK'nın 9. maddesi kapsamında gerekli güvenceler sağlanmaktadır.`,
  },
  {
    title: 'Veri Saklama Süresi',
    content: `Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca saklanmaktadır:

• Hesap bilgileri: Hesap aktif olduğu sürece ve sonrasında 10 yıl
• İşlem kayıtları: 10 yıl (yasal zorunluluk)
• Kullanım verileri: 2 yıl
• Pazarlama verileri: Onay geri çekilene kadar

Yasal saklama süreleri sona erdikten sonra verileriniz silinir, yok edilir veya anonim hale getirilir.`,
  },
  {
    title: 'Haklarınız',
    content: `KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:

• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme
• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
• Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme
• KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme
• Düzeltme, silme veya yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme
• İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
• Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme`,
  },
  {
    title: 'Başvuru Yöntemi',
    content: `Yukarıda belirtilen haklarınızı kullanmak için:

E-posta: kvkk@stocker.com
Posta: Stocker Yazılım A.Ş. - KVKK Başvuruları, Maslak Mah. Ahi Evran Cad. No:6 Sarıyer/İstanbul

Başvurunuzda kimliğinizi tespit edici bilgiler ve talebiniz açıkça belirtilmelidir. Başvurular en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.`,
  },
];

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Stocker Logo" width={120} height={40} className="brightness-0 invert object-contain" priority /></Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Gizlilik</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Şartlar</Link>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">KVKK Aydınlatma Metni</h1>
          <p className="text-gray-400">Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma</p>
          <p className="text-gray-500 text-sm mt-2">Son güncelleme: 11 Aralık 2024</p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.section key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">{index + 1}</span>
                {section.title}
              </h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">{section.content}</div>
            </motion.section>
          ))}
        </div>

        {/* Download */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <h3 className="font-bold text-white mb-4">Aydınlatma Metnini İndirin</h3>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF İndir
            </button>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Şartlar</Link>
              <Link href="/kvkk" className="text-red-400">KVKK</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
