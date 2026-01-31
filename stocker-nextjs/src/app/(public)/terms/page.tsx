import { Metadata } from 'next';
import { getPageBySlug } from '@/lib/api/services/cms-server';
import LegalPageClient from '@/components/legal/LegalPageClient';
import LegalPageSkeleton from '@/components/legal/LegalPageSkeleton';
import { Suspense } from 'react';

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('terms');

  return {
    title: page?.metaTitle || 'Kullanim Sartlari | Stoocker',
    description:
      page?.metaDescription ||
      'Stoocker kullanim sartlari ve kullanici sozlesmesi. Hizmet kosullarimizi okuyun.',
    openGraph: {
      title: page?.metaTitle || 'Kullanim Sartlari | Stoocker',
      description:
        page?.metaDescription ||
        'Stoocker kullanim sartlari ve kullanici sozlesmesi.',
      type: 'website',
    },
  };
}

export default async function TermsPage() {
  const page = await getPageBySlug('terms');

  return (
    <Suspense fallback={<LegalPageSkeleton />}>
      <LegalPageClient
        page={page}
        fallbackTitle="Kullanici Sozlesmesi"
        fallbackSlug="terms"
        fallbackContent={defaultTermsContent}
      />
    </Suspense>
  );
}

const defaultTermsContent = `
# Kullanici Sozlesmesi

**Son Guncelleme: 25 Ocak 2026**

## 1. Taraflar ve Konu

Isbu Kullanici Sozlesmesi ("Sozlesme"), **Stoocker Teknoloji A.S.** ("Sirket") ile https://stoocker.app web sitesine ("Platform") uye olan kullanici ("Kullanici") arasinda akdedilmistir.

Sozlesme'nin konusu, Kullanici'nin Platform uzerinden sunulan bulut tabanli on muhasebe, stok takibi ve CRM hizmetlerinden ("Hizmetler") faydalanma sartlarinin belirlenmesidir.

## 2. Uyelik ve Hesap Guvenligi

- Kullanici, uyelik olustururken verdigi bilgilerin dogru ve guncel oldugunu taahhut eder.
- Kullanici adi ve sifre guvenliginden tamamen Kullanici sorumludur. Sifrenin yetkisiz kullanimi durumunda Sirket sorumlu tutulamaz.
- Sirket, supheli durumlarda Kullanici hesabini askiya alma hakkini sakli tutar.

## 3. Abonelik, Odeme ve Iptal

Hizmetler, secilen pakete gore aylik veya yillik abonelik bazinda ucretlendirilir. Odemeler, guvenli odeme altyapisi (Iyzico/Stripe) uzerinden tahsil edilir.

**Iptal:** Kullanici diledigi zaman aboneligini iptal edebilir. Iptal islemi, mevcut donemin sonunda gecerli olur; kullanilmayan gunlerin ucret iadesi yapilmaz (Cayma hakki istisnalari saklidir).

## 4. Fikri Mulkiyet Haklari

Platform uzerindeki tum yazilim, tasarim, arayuz, kod, veritabani ve iceriklerin fikri mulkiyet haklari munhasiran Stoocker Teknoloji A.S.'ye aittir. Kullanici, Platform'u kopyalayamaz, tersine muhendislik yapamaz veya ticari amacla (kendi is surecleri disinda) cogaltamaz.

## 5. Sorumluluk Reddi (Disclaimer)

Hizmetler "oldugu gibi" (as-is) sunulmaktadir. Sirket, Hizmetlerin kesintisiz veya hatasiz olacagini garanti etmez. Kullanici verilerinin yedeklenmesi birincil olarak Sirket'in sorumlulugunda olsa da, Kullanici'nin kendi verilerini duzenli disa aktarmasi onerilir. Sirket, dolayli zararlardan (kar kaybi vb.) sorumlu tutulamaz.

## 6. Uyusmazliklarin Cozumu

Isbu Sozlesme, Turkiye Cumhuriyeti kanunlarina tabidir. Sozlesme'den dogabilecek her turlu uyusmazligin cozumunde **Istanbul (Caglayan) Mahkemeleri ve Icra Daireleri** yetkilidir.

---

Sorulariniz icin: legal@stoocker.app
`;
