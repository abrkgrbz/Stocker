# CRM Complete Test Scenarios - Qase.io Format

Bu dosya Qase.io'ya import edilebilir formattadir.

---

## IMPORT TALIMATLARI

### Qase.io Import:
1. Qase.io'da projenizi acin
2. Test Cases > Import tiklayin
3. CSV veya JSON dosyasini yukleyin
4. Field mapping yapin

---

# SUITE 1: MUSTERI YONETIMI (Customers)

## 1.1 Musteri Olusturma

| ID | Title | Preconditions | Steps | Expected Result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| CRM-CUS-001 | Yeni kurumsal musteri olusturma | CRM modulu acik, Musteri listesi sayfasinda | 1. "Yeni Musteri" butonuna tikla<br>2. Tur: Kurumsal sec<br>3. Firma Adi: "Test Firma A.S." gir<br>4. E-posta: "test@firma.com" gir<br>5. Telefon: "+90 212 555 0001" gir<br>6. Kaydet tikla | Musteri basariyla olusturulur, liste sayfasina yonlendirilir ve yeni musteri listede gorunur | Critical |
| CRM-CUS-002 | Yeni bireysel musteri olusturma | CRM modulu acik | 1. Yeni Musteri tikla<br>2. Tur: Bireysel sec<br>3. Ad: Ahmet, Soyad: Yilmaz gir<br>4. TC Kimlik: 12345678901 gir<br>5. E-posta gir<br>6. Kaydet | Bireysel musteri olusturulur | Critical |
| CRM-CUS-003 | Musteri ile adres bilgisi ekleme | Yeni musteri formu acik | 1. Temel bilgileri doldur<br>2. Adres sekmesine gec<br>3. Ulke, Sehir, Ilce sec<br>4. Adres detayini gir<br>5. Kaydet | Musteri adres bilgileriyle kaydedilir | High |
| CRM-CUS-004 | Musteri ile iletisim kisi ekleme | Yeni musteri formu acik | 1. Temel bilgileri doldur<br>2. Iletisim Kisileri sekmesine gec<br>3. Yeni Kisi Ekle tikla<br>4. Ad, Soyad, Pozisyon gir<br>5. Kaydet | Musteri iletisim kisileriyle kaydedilir | High |

## 1.2 Musteri Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-CUS-010 | Bos form validasyonu | 1. Yeni Musteri formunu ac<br>2. Hicbir alan doldurmadan Kaydet tikla | Zorunlu alan uyarilari gorunur: "Firma adi/Ad zorunludur", "E-posta zorunludur" | High |
| CRM-CUS-011 | E-posta format validasyonu | 1. E-posta alanina "gecersiz" gir<br>2. Alandan cik | "Gecerli bir e-posta adresi girin" uyarisi gorunur | High |
| CRM-CUS-012 | Telefon format validasyonu | 1. Telefon alanina "abc123" gir<br>2. Kaydet | "Gecerli telefon numarasi girin" uyarisi | Medium |
| CRM-CUS-013 | Vergi no validasyonu (10-11 hane) | 1. Kurumsal secili<br>2. Vergi No: "12345" gir<br>3. Kaydet | "Vergi numarasi 10 veya 11 haneli olmalidir" uyarisi | High |
| CRM-CUS-014 | TC Kimlik validasyonu | 1. Bireysel secili<br>2. TC: "0123456789" gir<br>3. Kaydet | "TC Kimlik 0 ile baslayamaz ve 11 haneli olmalidir" | High |
| CRM-CUS-015 | MERSIS no validasyonu | 1. MERSIS: "1234567890" gir (16 hane degil)<br>2. Kaydet | "MERSIS numarasi 16 haneli olmalidir" uyarisi | Medium |
| CRM-CUS-016 | Duplike e-posta kontrolu | 1. Mevcut bir musterinin e-postasini gir<br>2. Kaydet | "Bu e-posta adresi zaten kullaniliyor" uyarisi | High |

## 1.3 Musteri Duzenleme ve Silme

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-CUS-020 | Musteri bilgilerini guncelleme | 1. Listeden musteri sec<br>2. Duzenle tikla<br>3. Firma adini degistir<br>4. Kaydet | Degisiklikler kaydedilir, basari mesaji gorunur | Critical |
| CRM-CUS-021 | Musteri silme | 1. Musteri detay sayfasini ac<br>2. Sil butonuna tikla<br>3. Onay dialogunda Evet tikla | Musteri silinir, liste sayfasina yonlendirilir | High |
| CRM-CUS-022 | Silme iptali | 1. Sil tikla<br>2. Onay dialogunda Iptal tikla | Musteri silinmez, detay sayfasinda kalir | Medium |

## 1.4 Musteri KVKK

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-CUS-030 | KVKK aydinlatma metni onayi | 1. Yeni musteri formu ac<br>2. KVKK bolumune git<br>3. "Aydinlatma metnini okudum" checkboxini isaretle<br>4. Kaydet<br>5. Musteriyi tekrar ac | KVKK onayi kaydedilmis ve gorunur | High |
| CRM-CUS-031 | KVKK pazarlama izni | 1. KVKK bolumunde pazarlama checkbox isaretle<br>2. Kaydet ve tekrar ac | Pazarlama izni kaydedilmis | High |
| CRM-CUS-032 | KVKK veri isleme izni | 1. Veri isleme checkbox isaretle<br>2. Kaydet ve tekrar ac | Veri isleme izni kaydedilmis | High |

## 1.5 Musteri Detay

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-CUS-040 | Musteri detay sayfasi gorunumu | 1. Listeden musteriye tikla | Detay sayfasi acilir: Temel bilgiler, Adres, Iletisim kisileri, Iliskili kayitlar gorunur | High |
| CRM-CUS-041 | Musteri aktivite gecmisi | 1. Detay sayfasinda Aktiviteler sekmesine git | Musteriye ait tum aktiviteler kronolojik sirayla listelenir | Medium |
| CRM-CUS-042 | Musteri notlari | 1. Detayda Not Ekle tikla<br>2. Not icerigini gir<br>3. Kaydet | Not eklenir ve listede tarih damgasiyla gorunur | Medium |

---

# SUITE 2: LEAD YONETIMI (Leads)

## 2.1 Lead Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-LED-001 | Yeni lead olusturma | 1. Yeni Lead tikla<br>2. Ad: Mehmet, Soyad: Demir gir<br>3. E-posta: mehmet@test.com gir<br>4. Kaynak: Web Sitesi sec<br>5. Puan: 70 gir<br>6. Kaydet | Lead olusturulur, listede gorunur | Critical |
| CRM-LED-002 | Lead ile sirket bilgisi | 1. Yeni Lead formu ac<br>2. Sirket: ABC Ltd gir<br>3. Pozisyon: Satin Alma Muduru gir<br>4. Kaydet | Lead sirket bilgileriyle kaydedilir | High |
| CRM-LED-003 | Lead lokasyon bilgisi | 1. Lead formunda<br>2. Ulke: Turkiye sec<br>3. Sehir: Istanbul sec<br>4. Ilce: Kadikoy sec<br>5. Kaydet | Lead lokasyon bilgileriyle kaydedilir, cascade dropdown calisir | High |

## 2.2 Lead Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-LED-010 | Zorunlu alan validasyonu | 1. Sadece Ad gir<br>2. Kaydet | "Soyad zorunludur", "E-posta zorunludur" uyarilari | High |
| CRM-LED-011 | Puan araligi validasyonu (0-100) | 1. Puan: -10 gir<br>2. Puan: 150 gir | Negatif ve 100 ustu degerler reddedilir | Medium |
| CRM-LED-012 | E-posta format validasyonu | 1. E-posta: "test" gir<br>2. Kaydet | "Gecerli e-posta adresi girin" uyarisi | High |

## 2.3 Lead Rating ve Scoring

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-LED-020 | Rating butonu - Soguk | 1. Lead formunda Soguk butonuna tikla | Soguk secili gorunur (mavi arka plan), rating: Cold | Medium |
| CRM-LED-021 | Rating butonu - Ilik | 1. Ilik butonuna tikla | Ilik secili gorunur, rating: Warm | Medium |
| CRM-LED-022 | Rating butonu - Sicak | 1. Sicak butonuna tikla | Sicak secili gorunur, rating: Hot | Medium |
| CRM-LED-023 | Puan otomatik rating etkisi | 1. Puan: 80 gir<br>2. Rating kontrolu | Yuksek puanli leadler Sicak olarak isaretlenir (opsiyonel) | Low |

## 2.4 Lead Donusturme

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-LED-030 | Lead musteriye donusturme | 1. Lead detay sayfasini ac<br>2. "Musteriye Donustur" tikla<br>3. Donusum formunu doldur<br>4. Kaydet | Yeni musteri olusturulur, lead durumu "Donusturuldu" olur | Critical |
| CRM-LED-031 | Donusum sirasinda veri aktarimi | 1. Leadi musteriye donustur | Lead bilgileri (ad, e-posta, telefon, adres) musteriye aktarilir | High |

---

# SUITE 3: FIRSAT YONETIMI (Opportunities)

## 3.1 Firsat Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-OPP-001 | Yeni firsat olusturma | 1. Yeni Firsat tikla<br>2. Baslik: ERP Projesi gir<br>3. Musteri sec<br>4. Tutar: 150000 gir<br>5. Olasilik: %70 sec<br>6. Kaydet | Firsat olusturulur ve listede gorunur | Critical |
| CRM-OPP-002 | Firsat pipeline iliskilendirme | 1. Yeni firsat formunda<br>2. Pipeline: Satis Pipeline sec<br>3. Asama: Teklif sec<br>4. Kaydet | Firsat pipeline ve asamayla kaydedilir | High |
| CRM-OPP-003 | Firsat tahmini kapanis tarihi | 1. Tahmini Kapanis: 30 gun sonrasi sec<br>2. Kaydet | Tarih kaydedilir | High |

## 3.2 Firsat Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-OPP-010 | Musteri zorunlulugu | 1. Musteri secmeden form doldur<br>2. Kaydet | "Musteri secimi zorunludur" uyarisi | High |
| CRM-OPP-011 | Gecmis tarih validasyonu | 1. Tahmini kapanis olarak gecmis tarih sec | "Gecmis tarih secilemez" uyarisi veya tarih secilemez | Medium |
| CRM-OPP-012 | Olasilik araligi (0-100) | 1. Olasilik: 120 gir | "Olasilik 0-100 arasinda olmalidir" uyarisi | Medium |
| CRM-OPP-013 | Pipeline-Asama zorunlulugu | 1. Pipeline secmeden asama secmeye calis | Asama dropdown disabled olmali veya bos | High |

## 3.3 Firsat Durum Yonetimi

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-OPP-020 | Firsat kazanma | 1. Firsat detayinda Durum: Kazanildi sec<br>2. Kazanma detaylarini gir<br>3. Kaydet | Durum guncellenir, kazanma istatistikleri artar | High |
| CRM-OPP-021 | Firsat kaybetme | 1. Durum: Kaybedildi sec<br>2. Kayip Nedeni: Fiyat sec<br>3. Kaydet | Durum guncellenir, kayip nedeni kaydedilir | High |
| CRM-OPP-022 | Kayip nedeni zorunlulugu | 1. Durum: Kaybedildi sec<br>2. Kayip nedeni bos birak<br>3. Kaydet | "Kayip nedeni zorunludur" uyarisi | Medium |

---

# SUITE 4: DEAL YONETIMI (Deals)

## 4.1 Deal Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-DEA-001 | Yeni deal olusturma | 1. Yeni Deal tikla<br>2. Baslik: Yazilim Satisi gir<br>3. Musteri sec<br>4. Tutar: 50000 gir<br>5. Pipeline sec<br>6. Kaydet | Deal olusturulur | Critical |
| CRM-DEA-002 | Deal asama atama | 1. Deal formunda<br>2. Pipeline sec<br>3. Asama sec<br>4. Kaydet | Deal asama ile kaydedilir | High |

## 4.2 Deal Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-DEA-010 | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | "Baslik zorunludur", "Musteri zorunludur" uyarilari | High |
| CRM-DEA-011 | Tutar format validasyonu | 1. Tutar: abc gir | Sadece sayi kabul edilir | Medium |

## 4.3 Deal Asama Gecisleri

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-DEA-020 | Asama degisimi | 1. Deal detayinda asama dropdown ac<br>2. Farkli asama sec<br>3. Kaydet | Asama degisir, gecmis kaydedilir | High |
| CRM-DEA-021 | Kanban surukleme | 1. Kanban gorunumune gec<br>2. Deali baska asamaya surukle | Deal yeni asamaya tasinir | Medium |

---

# SUITE 5: KAMPANYA YONETIMI (Campaigns)

## 5.1 Kampanya Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-CAM-001 | Yeni kampanya olusturma | 1. Yeni Kampanya tikla<br>2. Adi: Yaz Kampanyasi 2025 gir<br>3. Tip: E-posta sec<br>4. Butce: 50000, Gelir: 150000, Hedef Lead: 500 gir<br>5. Kaydet | Kampanya olusturulur, ROI: %200, Lead/Maliyet: 100 TL hesaplanir | Critical |
| CRM-CAM-002 | Kampanya tarih araligi | 1. Baslangic: Bugun sec<br>2. Bitis: 30 gun sonra sec<br>3. Kaydet | Tarih araligi kaydedilir | High |

## 5.2 Kampanya Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-CAM-010 | Tarih araligi validasyonu | 1. Bitis tarihini baslangictan once sec<br>2. Kaydet | "Bitis tarihi baslangictan once olamaz" uyarisi | High |
| CRM-CAM-011 | Butce negatif deger | 1. Butce: -1000 gir | "Butce negatif olamaz" veya input red | Medium |

## 5.3 Kampanya Metrikleri

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-CAM-020 | ROI hesaplama | 1. Butce: 100000, Gelir: 150000 gir | ROI: %50 hesaplanir ve gorunur | High |
| CRM-CAM-021 | Zarar durumu | 1. Butce: 100000, Gelir: 80000 gir | Kar: -20000 (kirmizi), ROI: %-20 | Medium |
| CRM-CAM-022 | Lead basina maliyet | 1. Butce: 50000, Hedef Lead: 500 gir | Lead/Maliyet: 100 TL hesaplanir | Medium |

---

# SUITE 6: PIPELINE YONETIMI (Pipelines)

## 6.1 Pipeline Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-PIP-001 | Yeni pipeline olusturma | 1. Yeni Pipeline tikla<br>2. Adi: Satis Pipeline gir<br>3. Asamalar: Ilk Gorusme, Teklif, Muzakere, Kapanis ekle<br>4. Kaydet | Pipeline asamalarla olusturulur | Critical |
| CRM-PIP-002 | Asama sirasi belirleme | 1. Asamalari drag-drop ile sirala<br>2. Kaydet | Yeni siralama kaydedilir | High |

## 6.2 Pipeline Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-PIP-010 | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | "Pipeline adi zorunludur" uyarisi | High |
| CRM-PIP-011 | Minimum asama kontrolu | 1. Asama eklemeden Kaydet | "En az bir asama eklemelisiniz" uyarisi | Medium |

---

# SUITE 7: SEGMENT YONETIMI (Segments)

## 7.1 Segment Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-SEG-001 | Yeni segment olusturma (Manuel) | 1. Yeni Segment tikla<br>2. Adi: VIP Musteriler gir<br>3. Tip: Manuel sec<br>4. Renk sec<br>5. Kaydet | Segment olusturulur | Critical |
| CRM-SEG-002 | Dinamik segment olusturma | 1. Tip: Dinamik sec<br>2. Kriter ekle: Yillik Gelir >= 100000<br>3. Kaydet | Dinamik segment olusturulur, eslesen musteri sayisi gosterilir | Critical |
| CRM-SEG-003 | Coklu kriter ekleme | 1. Kriter 1: Yillik Gelir >= 100000<br>2. AND operator<br>3. Kriter 2: Sehir = Istanbul<br>4. Kaydet | Her iki kriteri saglayan musteriler segmente eklenir | High |

## 7.2 Segment Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-SEG-010 | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | "Segment adi zorunludur" uyarisi | High |
| CRM-SEG-011 | Dinamik segment kriter zorunlulugu | 1. Tip: Dinamik sec<br>2. Kriter eklemeden Kaydet | "Dinamik segmentler icin kriter zorunludur" | High |

## 7.3 Segment Uyelik

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-SEG-020 | Manuel uye ekleme | 1. Segment detayinda Uye Ekle tikla<br>2. Musteri ara ve sec<br>3. Ekle | Musteri segmente eklenir | High |
| CRM-SEG-021 | Uye cikarma | 1. Segment uyesini sec<br>2. Cikar tikla | Musteri segmentten cikarilir | Medium |
| CRM-SEG-022 | Dinamik segment guncelleme | 1. Kriterlere uyan yeni musteri ekle<br>2. Segment sayfasini yenile | Yeni musteri otomatik olarak segmentte gorunur | High |

---

# SUITE 8: RAKIP YONETIMI (Competitors)

## 8.1 Rakip Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-COM-001 | Yeni rakip olusturma | 1. Yeni Rakip tikla<br>2. Adi: XYZ Yazilim gir<br>3. Web: www.xyz.com gir<br>4. Sektor: Teknoloji sec<br>5. Kaydet | Rakip olusturulur | Critical |
| CRM-COM-002 | SWOT analizi ekleme | 1. Guclu Yonler: Fiyat, Marka Bilinirlik gir<br>2. Zayif Yonler: Musteri Desteği gir<br>3. Kaydet | SWOT bilgileri kaydedilir | High |

---

# SUITE 9: TOPLANTI YONETIMI (Meetings)

## 9.1 Toplanti Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-MEE-001 | Yeni toplanti olusturma | 1. Yeni Toplanti tikla<br>2. Baslik: Proje Toplantisi gir<br>3. Tarih/Saat: 15/02/2025 14:00 sec<br>4. Sure: 1 saat gir<br>5. Konum: Zoom gir<br>6. Kaydet | Toplanti olusturulur | Critical |
| CRM-MEE-002 | Katilimci ekleme | 1. Katilimcilar bolumunde<br>2. Musteri veya kullanici ara<br>3. Ekle | Katilimci eklenir | High |

## 9.2 Toplanti Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-MEE-010 | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | "Baslik zorunludur", "Tarih zorunludur" uyarilari | High |
| CRM-MEE-011 | Gecmis tarih kontrolu | 1. Gecmis tarih sec<br>2. Kaydet | "Gecmis tarihte toplanti olusturulamaz" uyarisi (opsiyonel) | Low |

---

# SUITE 10: CAGRI KAYITLARI (Call Logs)

## 10.1 Cagri Kaydi Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-CAL-001 | Yeni cagri kaydi | 1. Yeni Cagri Kaydi tikla<br>2. Ilgili Kisi: Ahmet Yilmaz sec<br>3. Telefon: +90 532 555 1234 gir<br>4. Yon: Giden sec<br>5. Sure: 15 dakika gir<br>6. Kaydet | Kayit olusturulur | Critical |
| CRM-CAL-002 | Cagri notu ekleme | 1. Notlar alanina gorusme ozetini gir<br>2. Kaydet | Not kaydedilir | High |

---

# SUITE 11: SATIS EKIPLERI (Sales Teams)

## 11.1 Ekip Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-STE-001 | Yeni ekip olusturma | 1. Yeni Satis Ekibi tikla<br>2. Adi: Istanbul Satis gir<br>3. Kod: IST-01 gir<br>4. Lider Adi: Ahmet Yilmaz gir<br>5. Bolge sec<br>6. Kaydet | Ekip olusturulur, lider ve bolge gorunur | Critical |
| CRM-STE-002 | Satis hedefi belirleme | 1. Satis Hedefi: 500000 gir<br>2. Periyod: Aylik sec<br>3. Para Birimi: TRY sec<br>4. Kaydet | Hedef kaydedilir | High |

## 11.2 Ekip Validasyonlari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-STE-010 | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | "Ekip adi zorunludur", "Ekip kodu zorunludur" uyarilari | High |

## 11.3 Ekip Detay

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-STE-020 | Ekip detay sayfasi | 1. Ekibe tikla | Lider, bolge, uyeler, hedef bilgileri gorunur | High |
| CRM-STE-021 | Olusturma tarihi kontrolu | 1. Yeni ekip olustur<br>2. Detay sayfasina git | Olusturma tarihi dogru gorunur (01/01/0001 degil) | High |
| CRM-STE-022 | Bolge adi kontrolu | 1. Bolge sec ve kaydet<br>2. Detay sayfasina git | Secilen bolge adi gorunur | High |

---

# SUITE 12: BOLGE YONETIMI (Territories)

## 12.1 Bolge Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-TER-001 | Yeni bolge olusturma | 1. Yeni Bolge tikla<br>2. Adi: Marmara Bolgesi gir<br>3. Kod: MAR-01 gir<br>4. Aciklama gir<br>5. Kaydet | Bolge olusturulur | Critical |

---

# SUITE 13: REFERANS YONETIMI (Referrals)

## 13.1 Referans Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-REF-001 | Yeni referans olusturma | 1. Yeni Referans tikla<br>2. Referans Veren: ABC Musteri sec<br>3. Referans Alinan: XYZ sec<br>4. Odul: 1000 TL gir<br>5. Kaydet | Referans olusturulur | Critical |

---

# SUITE 14: AKTIVITE YONETIMI (Activities)

## 14.1 Aktivite Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-ACT-001 | Yeni aktivite olusturma | 1. Yeni Aktivite tikla<br>2. Tip: Gorev sec<br>3. Baslik: Teklif Hazirla gir<br>4. Ilgili: Musteri sec<br>5. Bitis Tarihi: 20/02/2025 sec<br>6. Oncelik: Yuksek sec<br>7. Kaydet | Aktivite olusturulur | Critical |
| CRM-ACT-002 | Aktivite tamamlama | 1. Aktivite detayinda<br>2. Durum: Tamamlandi sec veya Tamamla tikla<br>3. Kaydet | Durum Tamamlandi olur, tamamlanma tarihi eklenir | High |

---

# SUITE 15: WORKFLOW YONETIMI (Workflows)

## 15.1 Workflow Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-WFL-001 | Yeni workflow olusturma | 1. Yeni Workflow tikla<br>2. Adi: Lead Donusum gir<br>3. Trigger: Yeni Lead sec<br>4. Adimlar ekle<br>5. Kaydet | Workflow olusturulur | Critical |
| CRM-WFL-002 | Workflow aktif/pasif | 1. Workflow detayinda<br>2. Aktif toggle tikla<br>3. Kaydet | Durum degisir | High |

---

# SUITE 16: DOKUMAN YONETIMI (Documents)

## 16.1 Dokuman Islemleri

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-DOC-001 | Dosya yukleme | 1. Yukle tikla<br>2. PDF dosya sec (<10MB)<br>3. Yukle | Dosya yuklenir ve listede gorunur | High |
| CRM-DOC-002 | Dosya silme | 1. Dokuman sec<br>2. Sil tikla<br>3. Onayla | Dokuman silinir | High |

---

# SUITE 17: SADAKAT PROGRAMLARI (Loyalty Programs)

## 17.1 Program Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-LOP-001 | Yeni program olusturma | 1. Yeni Program tikla<br>2. Adi: Altin Program gir<br>3. Puan/TL: 10 gir<br>4. Seviyeler ekle: Bronz, Gumus, Altin<br>5. Kaydet | Program olusturulur | Critical |

---

# SUITE 18: SADAKAT UYELIKLERI (Loyalty Memberships)

## 18.1 Uyelik Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-LOM-001 | Yeni uyelik olusturma | 1. Yeni Uyelik tikla<br>2. Musteri sec<br>3. Program sec<br>4. Seviye: Altin sec<br>5. Puan: 1000 gir<br>6. Kaydet | Uyelik olusturulur | Critical |

---

# SUITE 19: URUN ILGILERI (Product Interests)

## 19.1 Urun Ilgisi Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-PIN-001 | Yeni urun ilgisi | 1. Yeni Urun Ilgisi tikla<br>2. Urun: ERP Paketi gir<br>3. Ilgi Seviyesi: Yuksek sec<br>4. Musteri sec<br>5. Kaydet | Urun ilgisi olusturulur | Critical |

---

# SUITE 20: SOSYAL MEDYA PROFILLERI (Social Profiles)

## 20.1 Profil Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-SOP-001 | Yeni profil olusturma | 1. Yeni Profil tikla<br>2. Platform: Instagram sec<br>3. Kullanici Adi: abc_teknoloji gir<br>4. URL: instagram.com/abc gir<br>5. Takipci: 15000 gir<br>6. Kaydet | Profil olusturulur | Critical |

---

# SUITE 21: ANKET YANITLARI (Survey Responses)

## 21.1 Yanit Olusturma

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-SUR-001 | Yeni anket yaniti | 1. Yeni Yanit tikla<br>2. Tip: NPS sec<br>3. Adi: 2025 Q1 Memnuniyet gir<br>4. Durum: Tamamlandi sec<br>5. NPS Puani: 9 gir<br>6. Kaydet | Yanit olusturulur, Promoter olarak isaretlenir | Critical |
| CRM-SUR-002 | NPS kategori kontrolu | 1. NPS: 9-10 gir -> Promoter (yesil)<br>2. NPS: 7-8 gir -> Passive (sari)<br>3. NPS: 0-6 gir -> Detractor (kirmizi) | Kategoriler dogru gorunur | High |

---

# SUITE 22: GENEL UX TESTLERI

## 22.1 Liste Sayfalari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-UX-001 | Sayfalama | 1. 10dan fazla kayit ile<br>2. Sayfa numaralarini tikla | Sayfalama calisir, dogru kayitlar listelenir | Medium |
| CRM-UX-002 | Sayfa boyutu degistirme | 1. Boyut seciciden 25 sec | 25 kayit listelenir | Low |
| CRM-UX-003 | Arama islevi | 1. Arama kutusuna yaz | Eslesen sonuclar listelenir | Medium |
| CRM-UX-004 | Filtre temizleme | 1. Filtre uygula<br>2. Temizle tikla | Filtreler sifirlanir | Low |

## 22.2 Form Davranislari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-UX-010 | Kaydedilmemis degisiklik uyarisi | 1. Form doldur<br>2. Kaydetmeden sayfadan cik | "Kaydedilmemis degisiklikleriniz var" uyarisi | High |
| CRM-UX-011 | Form reset | 1. Formu doldur<br>2. Iptal tikla | Form sifirlanir veya onceki sayfaya doner | Medium |

## 22.3 Responsive Tasarim

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-UX-020 | Mobil gorunum (<768px) | 1. Pencereyi daralt<br>2. Formlari kontrol et | Elemanlar duzgun stack olur, kullanilabilir | Medium |
| CRM-UX-021 | Tablet gorunum (768-1024px) | 1. Tablet boyutuna getir | Grid duzgun calisir | Medium |

---

# SUITE 23: HATA SENARYOLARI

## 23.1 Network Hatalari

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-ERR-001 | Internet kesintisi | 1. Form doldur<br>2. Interneti kes<br>3. Kaydet | Kullanici dostu hata mesaji, veriler kaybolmaz | High |
| CRM-ERR-002 | Server 500 hatasi | 1. Backend kapatildiginda islem yap | "Bir hata olustu, lutfen tekrar deneyin" mesaji | High |

## 23.2 Veri Bütünlugu

| ID | Title | Steps | Expected Result | Priority |
|----|-------|-------|-----------------|----------|
| CRM-ERR-010 | Silinen kayda erisim | 1. Kayit ID'si ile URL'e git (silinmis)<br>2. Enter | "Kayit bulunamadi" mesaji veya 404 sayfasi | Medium |
| CRM-ERR-011 | Yetkisiz erisim | 1. Yetkisiz kullanici ile<br>2. CRM URL'ine git | Erisim engellenir veya login'e yonlendirilir | Critical |

---

# ISTATISTIKLER

- **Toplam Suite:** 23
- **Toplam Test Case:** ~150
- **Kritik Testler:** ~40
- **Yuksek Oncelikli:** ~60
- **Orta Oncelikli:** ~35
- **Dusuk Oncelikli:** ~15

---

# NOTLAR

1. Her test case icin preconditions, test data ve cleanup adimlari ayrica dokumante edilmelidir
2. Automation icin Playwright test scripti olusturulabilir
3. API testleri ayri bir suite olarak eklenebilir
4. Performance testleri (load test) ayri planlanmalidir
5. Security testleri (penetration test) ayri planlanmalidir

---

*Son Guncelleme: Ocak 2026*
*Versiyon: 2.0*
