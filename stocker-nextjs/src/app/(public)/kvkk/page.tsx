import { Metadata } from 'next';
import { getPageBySlug } from '@/lib/api/services/cms-server';
import LegalPageClient from '@/components/legal/LegalPageClient';
import LegalPageSkeleton from '@/components/legal/LegalPageSkeleton';
import { Suspense } from 'react';

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('kvkk');

  return {
    title: page?.metaTitle || 'KVKK Aydinlatma Metni | Stoocker',
    description:
      page?.metaDescription ||
      'Stoocker KVKK aydinlatma metni. Kisisel verilerin korunmasi kanunu kapsaminda haklarinizi ogrenim.',
    openGraph: {
      title: page?.metaTitle || 'KVKK Aydinlatma Metni | Stoocker',
      description:
        page?.metaDescription ||
        'Stoocker KVKK aydinlatma metni.',
      type: 'website',
    },
  };
}

export default async function KVKKPage() {
  const page = await getPageBySlug('kvkk');

  return (
    <Suspense fallback={<LegalPageSkeleton />}>
      <LegalPageClient
        page={page}
        fallbackTitle="KVKK Aydinlatma Metni"
        fallbackSlug="kvkk"
        fallbackContent={defaultKVKKContent}
      />
    </Suspense>
  );
}

const defaultKVKKContent = `
# KVKK Aydinlatma Metni

**Kisisel Verilerin Korunmasi Kanunu Kapsaminda Aydinlatma**

**Son guncelleme: 25 Ocak 2026**

## 1. Veri Sorumlusu

Stoocker Teknoloji A.S. olarak, 6698 sayili Kisisel Verilerin Korunmasi Kanunu ("KVKK") kapsaminda veri sorumlusu sifatiyla kisisel verilerinizi islemekteyiz.

- **Veri Sorumlusu:** Stoocker Teknoloji A.S.
- **Adres:** Maslak Mah. Ahi Evran Cad. No:6 Sariyer/Istanbul
- **E-posta:** kvkk@stoocker.app
- **Telefon:** +90 (850) 123 45 67

## 2. Islenen Kisisel Veriler

Asagidaki kategorilerde kisisel verileriniz islenmektedir:

- **Kimlik Bilgileri:** Ad, soyad, T.C. kimlik numarasi, dogum tarihi
- **Iletisim Bilgileri:** E-posta adresi, telefon numarasi, adres
- **Finansal Bilgiler:** Fatura bilgileri, odeme kayitlari, banka hesap bilgileri
- **Kullanim Verileri:** IP adresi, tarayici bilgileri, kullanim istatistikleri
- **Calisan Verileri:** Kullanici hesap bilgileri, yetki seviyeleri

## 3. Veri Isleme Amaclari

Kisisel verileriniz asagidaki amaclarla islenmektedir:

- Hizmet sunumu ve sozlesme yukumluluklerinin yerine getirilmesi
- Musteri destegi ve iletisim faaliyetlerinin yurutulmesi
- Faturalandirma ve odeme islemlerinin gerceklestirilmesi
- Yasal yukumluluklerin yerine getirilmesi
- Hizmet kalitesinin artirilmasi ve analiz calismalari
- Guvenlik onlemlerinin alinmasi ve dolandiriciligin onlenmesi

## 4. Hukuki Sebepler

KVKK'nin 5. ve 6. maddeleri uyarinca kisisel verileriniz asagidaki hukuki sebeplere dayanilarak islenmektedir:

- Sozlesmenin kurulmasi veya ifasi icin gerekli olmasi
- Veri sorumlusunun hukuki yukumlulugu
- Veri sorumlusunun mesru menfaati
- Acik rizanizin bulunmasi (gerekli hallerde)

## 5. Veri Aktarimi

Kisisel verileriniz, yukarida belirtilen amaclarla sinirli olarak asagidaki taraflara aktarilabilir:

- Hizmet saglayicilar ve is ortaklari
- Yasal zorunluluk halinde yetkili kamu kurum ve kuruluslari
- Odeme hizmeti saglayicilari
- Bulut hizmet saglayicilari (AWS, veri merkezleri yurt disinda olabilir)

Yurt disina veri aktarimi halinde KVKK'nin 9. maddesi kapsaminda gerekli guvenceler saglanmaktadir.

## 6. Veri Saklama Suresi

Kisisel verileriniz, islenme amaclarinin gerektirdigi sure boyunca saklanmaktadir:

- Hesap bilgileri: Hesap aktif oldugu surece ve sonrasinda 10 yil
- Islem kayitlari: 10 yil (yasal zorunluluk)
- Kullanim verileri: 2 yil
- Pazarlama verileri: Onay geri cekilene kadar

Yasal saklama sureleri sona erdikten sonra verileriniz silinir, yok edilir veya anonim hale getirilir.

## 7. Haklariniz

KVKK'nin 11. maddesi uyarinca asagidaki haklara sahipsiniz:

- Kisisel verilerinizin islenip islenmedigini ogrenme
- Islenmisse buna iliskin bilgi talep etme
- Islenme amacini ve bunlarin amacina uygun kullanilip kullanilmadigini ogrenme
- Yurt icinde veya yurt disinda aktarildigi ucuncu kisileri bilme
- Eksik veya yanlis islenmis olmasi halinde duzeltilmesini isteme
- KVKK'nin 7. maddesindeki sartlar cercevesinde silinmesini veya yok edilmesini isteme
- Duzeltme, silme veya yok edilme islemlerinin aktarildigi ucuncu kisilere bildirilmesini isteme
- Islenen verilerin munhasiran otomatik sistemler vasitasiyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya cikmasina itiraz etme
- Kanuna aykiri olarak islenmesi sebebiyle zarara ugramaniz halinde zararin giderilmesini talep etme

## 8. Basvuru Yontemi

Yukarida belirtilen haklarinizi kullanmak icin:

- **E-posta:** kvkk@stoocker.app
- **Posta:** Stoocker Teknoloji A.S. - KVKK Basvurulari, Maslak Mah. Ahi Evran Cad. No:6 Sariyer/Istanbul

Basvurunuzda kimliginizi tespit edici bilgiler ve talebiniz acikca belirtilmelidir. Basvurular en gec 30 gun icinde ucretsiz olarak sonuclandirilir.
`;
