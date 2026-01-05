# CRM Manual Test Verileri ve Senaryoları

Bu doküman, CRM modüllerini manuel olarak test etmek için hazırlanmış kapsamlı test verilerini içerir. Her modül için **Standart (Yaygın)**, **Minimum (Hızlı)** ve **Validasyon (Sınır)** senaryoları tanımlanmıştır.

---

## 1. Satış Ekipleri (Sales Teams)
**Sayfa:** `/crm/sales-teams/new`

### 1. Standart Satış Ekibi (Yaygın Senaryo)
Tipik bir bölge satış ofisini simüle eder.

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Takım Adı** | Marmara Bölge Satış Ofisi | Zorunlu |
| **Ekip Kodu** | MRM-SALES-01 | Zorunlu (Max 20) |
| **Açıklama** | İstanbul merkezli kurumsal satış operasyonlarını yürüten ekip. | |
| **Durum** | Aktif | (Switch açık) |
| **Ekip E-postası** | marmara.satis@sirket.com | |
| **Lider Adı** | Ahmet Yılmaz | |
| **Satış Hedefi** | 750.000 | |
| **Para Birimi** | ₺ TRY | |
| **Hedef Periyodu** | Aylık (Monthly) | |
| **Bölge** | (Marmara Bölgesi) | Varsa seçin |
| **İletişim Kanalı** | Microsoft Teams | |

### 2. Minimum Veri (Hızlı Test)
Sadece zorunlu alanların validasyonunu geçmek için.

| Alan | Değer |
| :--- | :--- |
| **Takım Adı** | X Projesi Ekibi |
| **Ekip Kodu** | X-TEAM |

### 3. Yıllık Hedefli Yurtdışı Ekibi (Tam Donanımlı)
Farklı para birimi ve periyot testi için.

| Alan | Değer |
| :--- | :--- |
| **Takım Adı** | EMEA Sales Force |
| **Açıklama** | Avrupa, Orta Doğu ve Afrika pazarı satış operasyonları. |
| **Ekip Kodu** | EMEA-HQ |
| **Ekip E-postası** | emea@globalcorp.com |
| **Lider Adı** | Sarah Connor |
| **Satış Hedefi** | 1.500.000 |
| **Para Birimi** | € EUR |
| **Hedef Periyodu** | Yıllık (Yearly) |
| **İletişim Kanalı** | Slack |

### 4. Validasyon Sınır Testi
Hata mesajlarını test etmek için.

- **Karakter Sınırı**: Takım Adı alanına 101 karakterlik veri girin. *"En fazla 100 karakter olabilir"* uyarısını görün.
- **Kod Sınırı**: Takım Kodu alanına `BU_KOD_YIRMI_KARAKTERDEN_UZUN` girin. Hata almayı bekleyin.

---

## 2. Müşteriler (Customers)
**Sayfa:** `/crm/customers/new`
**Zorunlu Alanlar:** Şirket Adı, Müşteri Tipi.

### 1. Standart Kurumsal Müşteri (Yaygın Senaryo)

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Şirket Adı** | Teknoloji Çözümleri A.Ş. | Zorunlu |
| **Müşteri Tipi** | Kurumsal | Zorunlu |
| **İletişim Kişisi** | Mehmet Demir | |
| **E-posta** | info@teknolojicozumleri.com.tr | Format kontrolü |
| **Telefon** | 0212 555 10 20 | |
| **Web Sitesi** | https://teknolojicozumleri.com.tr | |
| **Sektör** | Bilişim / Yazılım | |
| **Vergi No** | 1234567890 | |
| **Vergi Dairesi** | Şişli | |
| **Durum** | Aktif | |

### 2. Minimum Veri (Hızlı Test)

| Alan | Değer |
| :--- | :--- |
| **Şirket Adı** | Hızlı Ticaret Ltd. |
| **Müşteri Tipi** | Kurumsal |

### 3. Detaylı Bireysel Müşteri

| Alan | Değer |
| :--- | :--- |
| **Şirket Adı** | (Bireysel - Ad Soyad Girilebilir) |
| **Müşteri Tipi** | Bireysel |
| **İletişim Kişisi** | Ayşe Yılmaz |
| **E-posta** | ayse.yilmaz@gmail.com |
| **Konum** | Türkiye > İstanbul > Kadıköy | (Cascade seçim) |
| **Kredi Limiti** | 50.000 |
| **Ödeme Vadesi** | 30 Gün |

### 4. Validasyon Sınır Testi
- **Boş Bırakma**: Şirket Adı girmeden kaydetmeyi deneyin.
- **Hatalı Email**: E-posta alanına `mail.com` yazıp kaydedin (Format hatası beklenir).

---

## 3. Potansiyel Müşteriler (Leads)
**Sayfa:** `/crm/leads/new`
**Zorunlu Alanlar:** Ad, Soyad, Kaynak, Durum.

### 1. Standart Web Formu Leadi

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Ad** | Burak | Zorunlu |
| **Soyad** | Yıldız | Zorunlu |
| **Unvan** | Satın Alma Müdürü | |
| **Şirket** | İnşaat Yapı Ltd. | |
| **E-posta** | burak@insaatyapi.com | |
| **Cep** | 90 532 111 22 33 | Int. Format |
| **Kaynak** | Web Sitesi | Zorunlu |
| **Durum** | Yeni | Zorunlu |
| **Skor** | 10 | |

### 2. Minimum Veri

| Alan | Değer |
| :--- | :--- |
| **Ad** | Can |
| **Soyad** | Öz |
| **Kaynak** | Referans |
| **Durum** | Yeni |

### 4. Validasyon Sınır Testi
- **Skor Limiti**: Skor alanına `150` girin. (Max 100 olmalı).
- **Zorunlu Alan**: Soyad girmeden kaydetmeye çalışın.

---

## 4. Anlaşmalar (Deals)
**Sayfa:** `/crm/deals/new`
**Zorunlu Alanlar:** Başlık, Müşteri, Pipeline, Aşama, Tutar, Olasılık, Tahmini Kapanış.

### 1. Standart Satış Fırsatı

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Başlık** | Yıllık Lisans Yenileme | Zorunlu |
| **Müşteri** | (Listeden seçin) | Zorunlu |
| **Pipeline** | Standart Satış | Zorunlu |
| **Aşama** | Teklif Gönderildi | Zorunlu |
| **Tutar** | 120.000 | Zorunlu |
| **Para Birimi** | ₺ TRY | |
| **Olasılık (%)** | 60 | Zorunlu (0-100) |
| **Tahmini Kap.** | (Gelecek ayın sonu) | Zorunlu |
| **Öncelik** | Yüksek | |
| **Kaynak** | E-posta | |

### 2. Minimum Veri

| Alan | Değer |
| :--- | :--- |
| **Başlık** | Hızlı Satış |
| **Müşteri** | (Rastgele Seç) |
| **Tutar** | 5.000 |
| **Olasılık** | 50 |
| **Tahmini Kap.** | (Bugün) |

### 4. Validasyon Sınır Testi
- **Olasılık Hatası**: Olasılık alanına `110` veya `-5` girin.
- **Tutar Negatif**: Tutar alanına `-100` girin.

---

## 5. Fırsatlar (Opportunities)
**Sayfa:** `/crm/opportunities/new`
**Zorunlu Alanlar:** Fırsat Adı, Tutar, Müşteri, Tahmini Kapanış.

### 1. Erken Aşama Fırsatı

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Fırsat Adı** | 2026 Q1 Bütçe Planlaması | Zorunlu |
| **Tutar** | 50.000 | Zorunlu |
| **Para Birimi** | ₺ TRY | |
| **Durum** | Açık (Open) | |
| **Müşteri** | (Listeden Seç) | Zorunlu |
| **Olasılık (%)** | 20 | |
| **Tahmini Kap.** | (3 ay sonra) | Zorunlu |
| **Kaynak** | Etkinlik | |

### 2. Minimum Veri

| Alan | Değer |
| :--- | :--- |
| **Fırsat Adı** | Küçük Potansiyel |
| **Tutar** | 1.000 |
| **Müşteri** | (Rasgele Seç) |
| **Tahmini Kap.** | (Yarın) |

### 4. Validasyon
- **Tarih Geçmiş**: Tahmini kapanış tarihini düne ayarlamayı deneyin (Engellenmeli).

---

## 6. Pipeline'lar (Pipelines)
**Sayfa:** `/crm/pipelines/new`
**Zorunlu Alanlar:** Pipeline Adı, Pipeline Aşamaları (En az 1 aşama).

### 1. Özel Satış Hunisi

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Pipeline Adı** | Kurumsal Satış Hunisi | Zorunlu |
| **Açıklama** | B2B büyük ölçekli satışlar için süreç | |
| **Tip** | Satış (Sales) | |
| **Sıralama** | 2 | |
| **Para Birimi** | USD | |
| **Aşama 1** | İletişim (10%, Mavi) | |
| **Aşama 2** | Demo (40%, Turuncu) | |
| **Aşama 3** | Teklif (70%, Mor) | |
| **Aşama 4** | Sözleşme (100%, Yeşil - Kazanıldı) | "Kazanıldı" switch açık |

### 2. Minimum Veri

| Alan | Değer |
| :--- | :--- |
| **Pipeline Adı** | Basit Huni |
| **Aşama 1** | Başlangıç (50%) |

### 4. Validasyon
- **Aşamasız Kayıt**: Tüm aşamaları silip kaydetmeyi deneyin (*"En az 1 aşama eklemelisiniz"* hatası beklenir).

---

## 7. Kampanyalar (Campaigns)
**Sayfa:** `/crm/campaigns/new`
**Zorunlu Alanlar:** Ad, Tip, Durum, Tarih Aralığı.

### 1. Sosyal Medya Kampanyası

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Ad** | Black Friday Kampanyası | Zorunlu |
| **Tip** | Sosyal Medya | Zorunlu |
| **Durum** | Planlandı | Zorunlu |
| **Bütçe Maliyeti** | 50.000 | |
| **Beklenen Gelir** | 250.000 | |
| **Hedef Lead** | 500 | |
| **Tarih Aralığı** | (Önümüzdeki hafta) | Zorunlu |

---

## 8. Arama Kayıtları (Call Logs)
**Sayfa:** `/crm/call-logs/new`
**Zorunlu Alanlar:** Arayan Numara, Arama Numarası, Aranan Numara, Yön.

### 1. Standart Giden Arama

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Arayan Numara** | 0850 111 22 33 | Şirket No |
| **Yön** | Giden (Outbound) | |
| **Arama No** | CALL-2024-001 | Sistem üretebilir |
| **Aranan Numara** | 0532 999 88 77 | Müşteri No |
| **Durum** | Tamamlandı | |
| **Sonuç** | Randevu Alındı | |
| **Notlar** | Müşteri haftaya müsait. | |

---

## 9. Toplantılar (Meetings)
**Sayfa:** `/crm/meetings/new`
**Zorunlu Alanlar:** Başlık, Başlangıç Tarihi, Bitiş Tarihi.

### 1. Online Demo Toplantısı

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Başlık** | Ürün Demosu - X A.Ş. | Zorunlu |
| **Toplantı Tipi** | Demo | |
| **Konum Tipi** | Online | |
| **Platform** | Zoom | (Online seçince gelir) |
| **Link** | https://zoom.us/j/123 | |
| **Başlangıç** | (Yarın 14:00) | Zorunlu |
| **Bitiş** | (Yarın 15:00) | Zorunlu |
| **Öncelik** | Normal | |

### 4. Validasyon
- **Tarih Sırası**: Bitiş tarihini, Başlangıç tarihinden önce seçmeyi deneyin.

---

## 10. Rakipler (Competitors)
**Sayfa:** `/crm/competitors/new`
**Zorunlu Alanlar:** Ad.

### 1. Standart Rakip

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Ad** | Rakip Firması A.Ş. | Zorunlu |
| **Tehdit Düzeyi** | Yüksek | |
| **Fiyat Karş.** | Daha Düşük | (Bizden ucuz) |
| **Web Sitesi** | www.rakip.com | |
| **Durum** | Aktif | |

---

## 11. Bölgeler (Territories)
**Sayfa:** `/crm/territories/new`
**Zorunlu Alanlar:** Ad, Kod.

### 1. Bölge Tanımı

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Ad** | Ege Bölgesi | Zorunlu |
| **Kod** | TR-EGE | Zorunlu (Max 20) |
| **Tip** | Bölge (Region) | |
| **Satış Hedefi** | 2.000.000 | |
| **Hedef Yılı** | 2024 | |

### 4. Validasyon
- **Kod Uzunluğu**: Kod alanına çok uzun metin yapıştırın. (Max 20).

---

## 12. Sadakat Programları (Loyalty)
**Sayfa:** `/crm/loyalty-programs/new`
**Zorunlu Alanlar:** Ad, Kod.

### 1. Puan Programı

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Ad** | Standart Puan Programı | Zorunlu |
| **Kod** | LOY-STD | Zorunlu |
| **Program Tipi** | Puan Tabanlı | |
| **Kazanım** | 1 Puan / 1 ₺ | |
| **Puan Değeri** | 0.01 ₺ | |
| **Min. Harcama** | 0 | |

---

## 13. Referanslar (Referrals)
**Sayfa:** `/crm/referrals/new`
**Zorunlu Alanlar:** Referans Veren Adı, Edilen Adı, Referans Tarihi.

### 1. Müşteri Referansı

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Ref. Veren Adı** | Ali Veli | Zorunlu |
| **Ref. Veren Email**| ali@mail.com | |
| **Edilen Adı** | Ayşe Demir | Zorunlu |
| **Edilen Email** | ayse@mail.com | |
| **Ödül Tipi** | İndirim | |
| **Referans Tarihi**| (Bugün) | Zorunlu |

---

## 14. Segmentler (Segments)
**Sayfa:** `/crm/segments/new`

### 1. Dinamik Segment (VIP)

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Ad** | VIP Müşteriler | Zorunlu |
| **Tip** | Dinamik | |
| **Kriter** | (Kural oluşturucu görünmeli) | Dinamik seçince zorunlu |
| **Renk** | #FF0000 | |

---

## 15. İş Akışları (Workflows)
**Sayfa:** `/crm/workflows/new`
**Zorunlu Alanlar:** Ad, Açıklama, Tetikleyici, Entity Tipi.

### 1. Hoş Geldin E-postası

| Alan | Değer | Not |
| :--- | :--- | :--- |
| **Ad** | Yeni Müşteri Karşılama | Zorunlu (Min 3) |
| **Açıklama** | Yeni kayıt olan müşteriye mail atar. | Zorunlu (Min 10) |
| **Tetikleyici** | Kayıt Oluşturulduğunda | |
| **Entity Tipi** | Müşteri (Customer) | |
| **Durum** | Aktif | |

### 4. Validasyon
- **Kısa Açıklama**: Açıklama kısmına "test" yazın. (Min 10 karakter hatası beklenir).
