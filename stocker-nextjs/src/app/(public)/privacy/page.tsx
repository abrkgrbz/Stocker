import { Metadata } from 'next';
import { getPageBySlug } from '@/lib/api/services/cms-server';
import LegalPageClient from '@/components/legal/LegalPageClient';
import LegalPageSkeleton from '@/components/legal/LegalPageSkeleton';
import { Suspense } from 'react';

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('privacy');

  return {
    title: page?.metaTitle || 'Gizlilik Politikasi | Stoocker',
    description:
      page?.metaDescription ||
      'Stoocker gizlilik politikasi ve KVKK aydinlatma metni. Verilerinizin nasil islendigini ogrenim.',
    openGraph: {
      title: page?.metaTitle || 'Gizlilik Politikasi | Stoocker',
      description:
        page?.metaDescription ||
        'Stoocker gizlilik politikasi ve KVKK aydinlatma metni.',
      type: 'website',
    },
  };
}

export default async function PrivacyPage() {
  const page = await getPageBySlug('privacy');

  return (
    <Suspense fallback={<LegalPageSkeleton />}>
      <LegalPageClient
        page={page}
        fallbackTitle="Gizlilik Politikasi ve KVKK Aydinlatma Metni"
        fallbackSlug="privacy"
        fallbackContent={defaultPrivacyContent}
      />
    </Suspense>
  );
}

const defaultPrivacyContent = `
# Gizlilik Politikasi ve KVKK Aydinlatma Metni

**Son Guncelleme: 25 Ocak 2026**

## 1. Veri Sorumlusu

6698 sayili Kisisel Verilerin Korunmasi Kanunu ("KVKK") uyarinca, Stoocker Teknoloji A.S. ("Sirket") olarak, veri sorumlusu sifatiyla, kisisel verilerinizi asagida aciklanan amaclar kapsaminda; hukuka ve durustluk kurallarina uygun bir sekilde isleyebilecek, kaydedebilecek, saklayabilecek, siniflandirabilecek, guncelleyebilecek ve mevzuatin izin verdigi hallerde ucuncu kisilere aciklayabilecek/devredebilecegiz.

## 2. Islenen Kisisel Verileriniz

- **Kimlik Bilgileri:** Ad, soyad, T.C. kimlik numarasi.
- **Iletisim Bilgileri:** E-posta adresi, telefon numarasi, adres.
- **Musteri Islem Bilgileri:** Siparis gecmisi, fatura bilgileri, talep ve sikayetler.
- **Islem Guvenligi Bilgileri:** IP adresi, log kayitlari, cihaz bilgileri, sifre ve parola bilgileri.
- **Pazarlama Bilgileri:** Cerez kayitlari, hedefleme bilgileri, aliskanliklar ve begeniler.

## 3. Kisisel Verilerin Islenme Amaci

Kisisel verileriniz su amaclarla islenmektedir:

- Sirketimiz tarafindan sunulan urun ve hizmetlerden sizleri faydalandirmak icin gerekli calismalarin is birimlerimiz tarafindan yapilmasi,
- Sirketimiz ve Sirketimizle is iliskisi icerisinde olan ilgili kisilerin hukuki ve ticari guvenliginin temini,
- Sirketimizin ticari ve is stratejilerinin belirlenmesi ve uygulanmasi,
- Musteri memnuniyetinin artirilmasi,
- Yasal mevzuattan kaynaklanan yukumluluklerin yerine getirilmesi.

## 4. Islenen Kisisel Verilerin Kimlere ve Hangi Amacla Aktarilabilecegi

Toplanan kisisel verileriniz; yukarida belirtilen amaclarin gerceklestirilmesi dogrultusunda, is ortaklarimiza, tedarikçilerimize, kanunen yetkili kamu kurumlarina ve ozel kisilere, KVKK'nin 8. ve 9. maddelerinde belirtilen kisisel veri isleme sartlari ve amaclari cercevesinde aktarilabilecektir. Sunucularimizin bir kismi yedekleme ve guvenlik amaciyla yurt disinda (AB standartlarinda guvenli veri merkezlerinde) tutulabilmektedir.

## 5. Kisisel Verilerin Toplanma Yontemi ve Hukuki Sebebi

Kisisel verileriniz, internet sitemiz, mobil uygulamamiz, cagri merkezimiz veya e-posta yoluyla elektronik ortamda toplanmaktadir. Bu veriler, KVKK'nin 5. maddesinde belirtilen "sozlesmenin kurulmasi veya ifasi", "hukuki yukumlulugun yerine getirilmesi" ve "ilgili kisinin temel hak ve ozgurluklerine zarar vermemek kaydiyla veri sorumlusunun mesru menfaatleri" hukuki sebeplerine dayanilarak toplanmaktadir.

## 6. Kisisel Veri Sahibinin Haklari (KVKK Madde 11)

KVKK'nin 11. maddesi uyarinca veri sahipleri su haklara sahiptir:

- Kisisel veri islenip islenmedigini ogrenme,
- Kisisel verileri islenmisse buna iliskin bilgi talep etme,
- Kisisel verilerin islenme amacini ve bunlarin amacina uygun kullanilip kullanilmadigini ogrenme,
- Yurt icinde veya yurt disinda kisisel verilerin aktarildigi ucuncu kisileri bilme,
- Kisisel verilerin eksik veya yanlis islenmis olmasi halinde bunlarin duzeltilmesini isteme,
- Kisisel verilerin silinmesini veya yok edilmesini isteme,
- Islenen verilerin munhasiran otomatik sistemler vasitasiyla analiz edilmesi suretiyle kisinin kendisi aleyhine bir sonucun ortaya cikmasina itiraz etme,
- Kisisel verilerin kanuna aykiri olarak islenmesi sebebiyle zarara ugramasi halinde zararin giderilmesini talep etme.

---

KVKK basvurulari icin: kvkk@stoocker.app
`;
