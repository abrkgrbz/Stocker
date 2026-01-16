# CRM Modülü Test Senaryoları

**Versiyon:** 1.0
**Tarih:** 2025-01-16
**Test Eden:**  _______________
**Test Ortamı:** [ ] Development  [ ] Staging  [ ] Production

---

## Kullanım Kılavuzu

### Sonuç Durumları
- ✅ **BAŞARILI** - Beklenen sonuç alındı
- ❌ **BAŞARISIZ** - Beklenen sonuç alınamadı
- ⚠️ **KISMI** - Kısmen çalışıyor, iyileştirme gerekli
- ⏭️ **ATLANDI** - Test edilmedi

### Her Test İçin Doldurulacak Alanlar
1. **Durum**: ✅/❌/⚠️/⏭️
2. **Gerçekleşen Sonuç**: Ne olduğunu yazın
3. **Notlar**: Varsa ekstra bilgi, hata mesajı, ekran görüntüsü linki

---

# 1. MÜŞTERİ YÖNETİMİ (Customers)

## 1.1 Yeni Müşteri Oluşturma (Kurumsal)

### Test 1.1.1: Zorunlu Alanlarla Kurumsal Müşteri Oluşturma

| Alan | Değer |
|------|-------|
| **Ön Koşul** | CRM modülüne erişim yetkisi olan kullanıcı ile giriş yapılmış olmalı |
| **Navigasyon** | CRM → Müşteriler → Yeni Müşteri |

**Adımlar:**
1. "Yeni Müşteri" butonuna tıklayın
2. Müşteri tipi olarak "Kurumsal" seçili olduğunu doğrulayın
3. Aşağıdaki bilgileri girin:

| Alan | Girdi |
|------|-------|
| Firma Adı | ABC Teknoloji A.Ş. |
| E-posta | info@abcteknoloji.com |
| Telefon | +90 212 555 0001 |
| Şirket Türü | Anonim Şirket (A.Ş.) |
| Sektör | Teknoloji |
| Durum | Aktif |

4. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- Müşteri başarıyla oluşturulur
- Müşteri listesine yönlendirilir
- Yeni müşteri listede görünür
- Başarı mesajı gösterilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [X] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Başarıyla Gerçekleşti |
| **Notlar** | |

---

### Test 1.1.2: Zorunlu Alan Validasyonu

**Adımlar:**
1. Yeni müşteri formunu açın
2. Hiçbir alan doldurmadan "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- Form submit edilmez
- "Müşteri adı zorunludur" uyarısı görünür
- "E-posta zorunludur" uyarısı görünür
- Hatalı alanlar kırmızı ile vurgulanır

| Test Sonucu | |
|-------------|---|
| **Durum** | [X ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Başarıyla Gerçekleşti |
| **Notlar** | |

---

### Test 1.1.3: E-posta Format Validasyonu

**Adımlar:**
1. Yeni müşteri formunu açın
2. E-posta alanına geçersiz değerler girin:
   - `abctest` (@ yok)
   - `abc@` (domain yok)
   - `abc@test` (TLD yok)
3. Her girişte formu kaydetmeye çalışın

**Beklenen Sonuç:**
- "Geçerli bir e-posta adresi girin" uyarısı görünür
- Form kaydedilmez

| Test Sonucu | |
|-------------|---|
| **Durum** | [X ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Başarıyla Gerçekleşti |
| **Notlar** | |

---

### Test 1.1.4: Vergi Numarası Validasyonu

**Adımlar:**
1. Yeni kurumsal müşteri formunu açın
2. Vergi numarası alanına geçersiz değerler girin:
   - `12345` (5 hane - çok kısa)
   - `123456789012` (12 hane - çok uzun)
   - `ABCDEFGHIJ` (harf içeriyor)

**Beklenen Sonuç:**
- "Geçerli bir vergi numarası girin (10-11 hane)" uyarısı görünür

| Test Sonucu | |
|-------------|---|
| **Durum** | [X ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Başarıyla Gerçekleşti |
| **Notlar** | |

---

### Test 1.1.5: MERSIS No Validasyonu (Kurumsal)

**Adımlar:**
1. Kurumsal müşteri formunda MERSIS No alanına girin:
   - `12345` (16 haneden az)
   - `12345678901234567` (16 haneden fazla)

**Beklenen Sonuç:**
- "MERSIS No 16 haneli olmalıdır" uyarısı görünür
- Sadece rakam girişine izin verilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ X] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | Başarıyla Gerçekleşti |
| **Notlar** | |

---

## 1.2 Bireysel Müşteri Oluşturma

### Test 1.2.1: TC Kimlik No Validasyonu

**Adımlar:**
1. Müşteri tipini "Bireysel" olarak değiştirin
2. TC Kimlik No alanına geçersiz değerler girin:
   - `0123456789` (0 ile başlıyor)
   - `1234567890` (10 hane)
   - `123456789012` (12 hane)
   - `ABCDEFGHIJK` (harf)

**Beklenen Sonuç:**
- 11 haneden farklı değerlerde "TC Kimlik No 11 haneli olmalıdır" uyarısı
- 0 ile başlayanlarda "TC Kimlik No 0 ile başlayamaz" uyarısı
- Sadece rakam girişine izin verilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [X ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Gerçekleşmedi |
| **Notlar** |12312321313 girmeme rağmen geçersiz demedi |

---

## 1.3 Müşteri Düzenleme

### Test 1.3.1: Mevcut Müşteri Bilgilerini Güncelleme

**Ön Koşul:** En az bir müşteri kaydı mevcut olmalı

**Adımlar:**
1. Müşteri listesinden bir müşteriyi seçin
2. Düzenle butonuna tıklayın
3. Firma adını değiştirin: "ABC Teknoloji A.Ş." → "ABC Yazılım Ltd."
4. E-posta adresini değiştirin
5. Kaydet butonuna tıklayın

**Beklenen Sonuç:**
- Değişiklikler kaydedilir
- Güncelleme başarı mesajı gösterilir
- Liste sayfasında güncel bilgiler görünür

| Test Sonucu | |
|-------------|---|
| **Durum** | [X ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Başarıyla Gerçekleşti |
| **Notlar** | |

---

## 1.4 KVKK Rıza Yönetimi

### Test 1.4.1: KVKK Checkbox İşaretleme

**Adımlar:**
1. Yeni müşteri formunu açın
2. KVKK bölümüne gidin
3. Her üç checkbox'ı işaretleyin:
   - Kişisel Veri İşleme İzni
   - Pazarlama İletişimi İzni
   - Elektronik İletişim İzni
4. Müşteriyi kaydedin
5. Kaydedilen müşteriyi tekrar açın

**Beklenen Sonuç:**
- Tüm KVKK izinleri kaydedilir
- Düzenleme sayfasında checkbox'lar işaretli görünür

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [X ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** |Kullanıcıyı ekledim ve güncelledim ona rağmen checkbox'lar işaretli gözükmüyor   |

---

# 2. LEAD (POTANSİYEL MÜŞTERİ) YÖNETİMİ

## 2.1 Yeni Lead Oluşturma

### Test 2.1.1: Zorunlu Alanlarla Lead Oluşturma

| Alan | Değer |
|------|-------|
| **Navigasyon** | CRM → Leadler → Yeni Lead |

**Adımlar:**
1. "Yeni Lead" butonuna tıklayın
2. Aşağıdaki bilgileri girin:

| Alan | Girdi |
|------|-------|
| Ad | Ahmet |
| Soyad | Yılmaz |
| E-posta | ahmet.yilmaz@test.com |
| Kaynak | Web Sitesi |
| Durum | Yeni |
| Puan | 60 |
| Rating | Sıcak |

3. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- Lead başarıyla oluşturulur
- Lead listesine yönlendirilir
- "Yeni" durumunda listeye eklenir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ X] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Başarıyla oluşturulup liste sayfasına yönlendi ancak Puan 0 olarak gözükmekte |
| **Notlar** | |

---

### Test 2.1.2: Lead Zorunlu Alan Validasyonu

**Adımlar:**
1. Yeni lead formunu açın
2. Sadece Ad alanını doldurun (diğerlerini boş bırakın)
3. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- "Soyad zorunludur" uyarısı
- "E-posta zorunludur" uyarısı
- "Kaynak seçimi zorunludur" uyarısı

| Test Sonucu | |
|-------------|---|
| **Durum** | [X] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |"E-posta zorunludur" uyarısı verdi |
| **Notlar** | |

---

### Test 2.1.3: Lead Rating (Sıcaklık) Değiştirme

**Adımlar:**
1. Yeni lead formunu açın
2. Header bölümündeki rating butonlarını test edin:
   - "Soğuk" butonuna tıklayın
   - "Ilık" butonuna tıklayın
   - "Sıcak" butonuna tıklayın

**Beklenen Sonuç:**
- Her butona tıklandığında görsel seçim değişir
- Aktif buton beyaz arka plana sahip olur
- Seçilen değer form verilerine yansır

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [X] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Herhangi bir değişiklik olmadı |
| **Notlar** | |

---

### Test 2.1.4: Lead Puan Aralığı

**Adımlar:**
1. Lead formunda puan alanına test değerleri girin:
   - -10 (negatif)
   - 0 (minimum)
   - 50 (orta)
   - 100 (maksimum)
   - 150 (maksimumun üstünde)

**Beklenen Sonuç:**
- Negatif değer kabul edilmez
- 0-100 arasında değerler kabul edilir
- 100'den büyük değer kabul edilmez veya 100'e düşürülür

| Test Sonucu | |
|-------------|---|
| **Durum** | [X] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |-10 ve  150 değerlerini kabul etmedi |
| **Notlar** | |

---

## 2.2 Lead Lokasyon Seçimi

### Test 2.2.1: Cascade Lokasyon Dropdown

**Adımlar:**
1. Lead formunda Adres Bilgileri bölümüne gidin
2. Ülke seçin: Türkiye
3. Şehir seçin: İstanbul
4. İlçe seçin: Kadıköy

**Beklenen Sonuç:**
- Ülke seçildikten sonra şehir listesi yüklenir
- Şehir seçildikten sonra ilçe listesi yüklenir
- Seçimler kaydedildikten sonra korunur

| Test Sonucu | |
|-------------|---|
| **Durum** | [ X] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

# 3. FIRSAT (DEAL) YÖNETİMİ

## 3.1 Yeni Fırsat Oluşturma

### Test 3.1.1: Zorunlu Alanlarla Fırsat Oluşturma

| Alan | Değer |
|------|-------|
| **Ön Koşul** | En az bir müşteri ve bir pipeline mevcut olmalı |
| **Navigasyon** | CRM → Fırsatlar → Yeni Fırsat |

**Adımlar:**
1. "Yeni Fırsat" butonuna tıklayın
2. Aşağıdaki bilgileri girin:

| Alan | Girdi |
|------|-------|
| Başlık | ERP Yazılım Projesi |
| Müşteri | ABC Teknoloji A.Ş. (dropdown'dan seç) |
| Tutar | 150000 |
| Para Birimi | TRY |
| Olasılık | 70% |
| Pipeline | Varsayılan Pipeline |
| Aşama | İlk aşama |
| Tahmini Kapanış | (bugünden sonraki bir tarih) |
| Durum | Açık |

3. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- Fırsat başarıyla oluşturulur
- Fırsat listesine yönlendirilir
- Seçilen pipeline/aşamada görünür

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [X ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Başarıyla Eklendi ibaresi yer aldı|
| **Notlar** |Ancak tabloda herhangi bir Lead gözükmüyor                                                                                                                                                                                                                                              |

---

### Test 3.1.2: Müşteri Seçimi Zorunluluğu

**Adımlar:**
1. Yeni fırsat formunu açın
2. Müşteri seçmeden form doldurun
3. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- "Müşteri seçimi zorunludur" uyarısı görünür
- Form kaydedilmez

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [X ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 3.1.3: Tahmini Kapanış Tarihi Validasyonu

**Adımlar:**
1. Yeni fırsat formunu açın
2. Tahmini kapanış tarihi seçmeye çalışın:
   - Geçmiş bir tarih seçmeye çalışın

**Beklenen Sonuç:**
- Geçmiş tarihler seçilemez (disabled)
- "Tahmini kapanış tarihi zorunludur" uyarısı tarih seçilmeden kaydedilmeye çalışıldığında

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ X] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 3.1.4: Pipeline ve Aşama Bağımlılığı

**Adımlar:**
1. Yeni fırsat formunda pipeline seçmeden aşama seçmeye çalışın
2. Bir pipeline seçin
3. O pipeline'a ait aşamaların listelendiğini kontrol edin
4. Farklı bir pipeline seçin
5. Aşama listesinin güncellendiğini kontrol edin

**Beklenen Sonuç:**
- Pipeline seçilmeden aşama seçilemez ("Önce pipeline seçin" mesajı)
- Pipeline değişince aşama listesi güncellenir
- Önceki aşama seçimi sıfırlanır

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [X ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 3.1.5: Durum "Kayıp" Seçildiğinde

**Adımlar:**
1. Fırsat formunda durumu "Kaybedildi" olarak değiştirin
2. "Kayıp Nedeni" alanının görünüp görünmediğini kontrol edin
3. Bir kayıp nedeni yazın ve kaydedin

**Beklenen Sonuç:**
- "Kayıp Bilgileri" bölümü görünür hale gelir
- "Kayıp Nedeni" textarea'sı aktif olur
- Bilgiler kaydedilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

## 3.2 Finansal Bilgiler

### Test 3.2.1: Tutar Formatlama

**Adımlar:**
1. Tutar alanına "1000000" girin
2. Alanın dışına tıklayın

**Beklenen Sonuç:**
- Tutar "1,000,000" şeklinde formatlanır (binlik ayırıcı)

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 3.2.2: Olasılık Aralığı

**Adımlar:**
1. Olasılık alanına test değerleri girin:
   - -5 (negatif)
   - 0
   - 50
   - 100
   - 120 (100'den fazla)

**Beklenen Sonuç:**
- 0-100 arasında değerler kabul edilir
- Negatif ve 100'den büyük değerler kabul edilmez

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

# 4. KAMPANYA YÖNETİMİ

## 4.1 Yeni Kampanya Oluşturma

### Test 4.1.1: Kampanya Temel Bilgileri

| Alan | Değer |
|------|-------|
| **Navigasyon** | CRM → Kampanyalar → Yeni Kampanya |

**Adımlar:**
1. Aşağıdaki bilgileri girin:

| Alan | Girdi |
|------|-------|
| Kampanya Adı | Yaz Kampanyası 2025 |
| Kampanya Tipi | E-posta |
| Planlanan Bütçe | 50000 |
| Beklenen Gelir | 150000 |
| Hedef Lead Sayısı | 500 |
| Tarih Aralığı | 01/02/2025 - 28/02/2025 |
| Durum | Planlandı |

2. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- Kampanya başarıyla oluşturulur
- ROI otomatik hesaplanır: (150000-50000)/50000 = %200
- Lead başına maliyet hesaplanır: 50000/500 = 100₺

| Test Sonucu | |
|-------------|---|
| **Durum** | [X ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Kampanya oluştu ancak listeye hemen gelmedi yenileye basınca geldi |
| **Notlar** |Kapanya tipini daha belirgin hale getirelim ilk başta nerde olduğunu anlayamadım |

---

### Test 4.1.2: Otomatik Metrik Hesaplamaları

**Adımlar:**
1. Kampanya formunda şu değerleri girin:
   - Planlanan Bütçe: 100,000₺
   - Beklenen Gelir: 80,000₺ (zarar durumu)
   - Hedef Lead: 200

2. Hesaplanan metrikleri kontrol edin

**Beklenen Sonuç:**
- Beklenen Kar: -20,000₺ (kırmızı renkte)
- ROI: %-20
- Lead Başına Maliyet: 500₺

| Test Sonucu | |
|-------------|---|
| **Durum** | [X ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 4.1.3: Gerçekleşen Değerler Bölümü

**Adımlar:**
1. Kampanya durumunu "Devam Ediyor" olarak değiştirin
2. "Gerçekleşen Değerler" bölümünün görünüp görünmediğini kontrol edin
3. Şu değerleri girin:
   - Gerçekleşen Maliyet: 45,000₺
   - Gerçekleşen Gelir: 120,000₺
   - Gerçekleşen Lead: 450
   - Dönüşen Lead: 50

**Beklenen Sonuç:**
- Bölüm sadece "Devam Ediyor", "Tamamlandı", "Beklemede", "İptal" durumlarında görünür
- Gerçekleşen kar otomatik hesaplanır
- Dönüşüm oranı otomatik hesaplanır: 50/450 = %11.1

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [X ] ⏭️ |
| **Gerçekleşen Sonuç** |Evet beklenen gerçekleşti ancak değerleri girip kaydet dedikten sonra lead güncellenmedi |
| **Notlar** | |

---

### Test 4.1.4: Tarih Aralığı Validasyonu

**Adımlar:**
1. Tarih aralığı seçici ile:
   - Başlangıç tarihi: 15/02/2025
   - Bitiş tarihi: 10/02/2025 (başlangıçtan önce)

**Beklenen Sonuç:**
- Bitiş tarihi başlangıç tarihinden önce seçilemez
- Validasyon uyarısı gösterilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [X ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

# 5. HATA SENARYOLARI

## 5.1 Ağ Hataları

### Test 5.1.1: İnternet Bağlantısı Kesik İken Kaydetme

**Adımlar:**
1. Herhangi bir form doldurun
2. İnternet bağlantısını kesin (ağ bağdaştırıcısını devre dışı bırakın)
3. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- Kullanıcı dostu bir hata mesajı gösterilir
- Form verileri kaybolmaz
- İnternet bağlantısı geldiğinde tekrar denenebilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [ X] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 5.1.2: Sunucu Timeout

**Adımlar:**
1. Çok büyük veri ile form kaydetmeye çalışın
2. Veya sunucu yavaş yanıt verirken bekleyin

**Beklenen Sonuç:**
- Loading göstergesi görünür
- Timeout durumunda anlamlı hata mesajı
- Kullanıcı tekrar deneyebilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [X ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

## 5.2 Validasyon Hataları

### Test 5.2.1: Duplicate E-posta Kontrolü

**Ön Koşul:** info@test.com e-postası ile bir müşteri mevcut

**Adımlar:**
1. Yeni müşteri oluşturun
2. E-posta: info@test.com (mevcut)
3. Kaydet

**Beklenen Sonuç:**
- "Bu e-posta adresi zaten kullanılıyor" uyarısı
- Form kaydedilmez

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [X ] ⏭️ |
| **Gerçekleşen Sonuç** |A customer with this email already exists hatası verdi ama ingilizce !! |
| **Notlar** | |

---

### Test 5.2.2: Boş Form ile Kaydetme

**Adımlar:**
1. Herhangi bir "Yeni" formunu açın
2. Hiçbir alan doldurmadan "Kaydet"e tıklayın

**Beklenen Sonuç:**
- Tüm zorunlu alanlar için uyarı mesajları
- Form ilk hatalı alana scroll yapmalı
- Form kaydedilmez

| Test Sonucu | |
|-------------|---|
| **Durum** | [ X] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

## 5.3 Yetkilendirme Hataları

### Test 5.3.1: Yetkisiz Erişim

**Adımlar:**
1. CRM yetkisi olmayan bir kullanıcı ile giriş yapın
2. Doğrudan URL ile `/crm/customers/new` adresine gitmeye çalışın

**Beklenen Sonuç:**
- Erişim engellenir
- "Bu sayfaya erişim yetkiniz yok" mesajı
- Dashboard'a yönlendirme

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [X ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Kullanıcıya gösterilmiyor ama kullanıcı url yolu ile sayfaya gidebiliyor |
| **Notlar** | |

---

### Test 5.3.2: Oturum Süresi Dolması

**Adımlar:**
1. Forma veri girin
2. Token/session süresinin dolmasını bekleyin (veya simüle edin)
3. "Kaydet"e tıklayın

**Beklenen Sonuç:**
- "Oturumunuz sona erdi, lütfen tekrar giriş yapın" mesajı
- Login sayfasına yönlendirme
- Form verileri mümkünse local storage'da saklanmalı

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [X ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

## 5.4 Edge Cases

### Test 5.4.1: Özel Karakterler

**Adımlar:**
1. Firma adına özel karakterler girin:
   - `ABC & Partners <script>alert('xss')</script>`
   - `Müşteri "Örnek" Ltd.`
   - `Test'in Şirketi`

**Beklenen Sonuç:**
- Özel karakterler doğru şekilde kaydedilir ve gösterilir
- XSS saldırıları engellenir (script çalışmaz)
- Türkçe karakterler (ş, ı, ğ, ü, ö, ç) doğru görünür

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [X ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** |ABC & Partners <script>alert('xss')</script> olarak kaydedildi yani karakter olarak doğru mu değil mi emin değilim |

---

### Test 5.4.2: Çok Uzun Değerler

**Adımlar:**
1. Firma adına 500 karakterlik uzun metin girin
2. Notlar alanına çok uzun metin girin

**Beklenen Sonuç:**
- Karakter sınırı olan alanlar sınırda kesilir veya uyarı verir
- Notlar alanı için makul bir limit var (örn: 2000 karakter)

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [X ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 5.4.3: Negatif Sayılar

**Adımlar:**
1. Şu alanlara negatif değer girmeye çalışın:
   - Yıllık Gelir: -50000
   - Çalışan Sayısı: -10
   - Deal Tutar: -100000
   - Kredi Limiti: -5000

**Beklenen Sonuç:**
- Negatif değerler kabul edilmez
- Minimum değer 0 olmalı

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 5.4.4: Boşluk ve Whitespace

**Adımlar:**
1. E-posta alanına başta/sonda boşluklu girin: `  test@test.com  `
2. Firma adına sadece boşluk girin: `     `

**Beklenen Sonuç:**
- E-posta başındaki/sonundaki boşluklar temizlenir (trim)
- Sadece boşluk olan alanlar "boş" olarak değerlendirilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

# 6. KULLANICI DENEYİMİ (UX) TESTLERİ

## 6.1 Form Davranışları

### Test 6.1.1: Tab Navigasyonu

**Adımlar:**
1. Form'da ilk alana tıklayın
2. Tab tuşu ile tüm alanlar arasında gezinin

**Beklenen Sonuç:**
- Tab sırası mantıklı (yukarıdan aşağı, soldan sağa)
- Tüm form elemanları tab ile erişilebilir
- Disabled alanlar atlanır

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [X ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 6.1.2: Enter ile Kaydetme

**Adımlar:**
1. Input alanındayken Enter tuşuna basın

**Beklenen Sonuç:**
- Tek satırlık inputlarda Enter form submit etmez veya validasyonla birlikte çalışır
- Textarea'larda Enter yeni satır oluşturur

| Test Sonucu | |
|-------------|---|
| **Durum** | [X] ✅ [ ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

### Test 6.1.3: Kaydedilmemiş Değişiklikler Uyarısı

**Adımlar:**
1. Form'a veri girin
2. Kaydetmeden sayfadan ayrılmaya çalışın (geri butonu veya menü linki)

**Beklenen Sonuç:**
- "Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?" uyarısı
- Kullanıcı "Hayır" derse sayfada kalır
- Kullanıcı "Evet" derse veriler kaybolur ve çıkılır

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [X ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Herhangi bir uyarı vermeden çıkış yapabildim |
| **Notlar** | |

---

### Test 6.1.4: Loading State

**Adımlar:**
1. "Kaydet" butonuna tıklayın
2. Sunucu yanıtı gelene kadar UI'ı gözlemleyin

**Beklenen Sonuç:**
- Kaydet butonu disabled olur
- Loading spinner/indicator görünür
- Form alanları disabled olur (çift tıklama önlenir)
- Kullanıcı başka işlem yapamaz

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [X ] ❌ [ ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

## 6.2 Responsive Tasarım

### Test 6.2.1: Mobil Görünüm (< 768px)

**Adımlar:**
1. Tarayıcı penceresini daraltın veya mobil cihaz kullanın
2. Tüm form sayfalarını kontrol edin

**Beklenen Sonuç:**
- Form elemanları düzgün stack olur
- Butonlar erişilebilir
- Dropdown'lar düzgün açılır
- Date picker kullanılabilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [X] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Berbat iç içe geçmiş bir görüntü mevcut |
| **Notlar** | |

---

### Test 6.2.2: Tablet Görünüm (768px - 1024px)

**Adımlar:**
1. Tarayıcı penceresini tablet boyutuna getirin
2. Form layoutunu kontrol edin

**Beklenen Sonuç:**
- Grid düzgün çalışır
- İki kolonlu alanlar düzgün görünür
- Tüm içerik ekrana sığar

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ X ] ⚠️ [ ] ⏭️ |
| **Gerçekleşen Sonuç** |Berbat iç içe geçmiş bir görüntü mevcut  |
| **Notlar** | |

---

## 6.3 Tema Desteği

### Test 6.3.1: Dark Mode

**Adımlar:**
1. Sistem veya uygulama temasını dark mode'a çevirin
2. Tüm CRM sayfalarını kontrol edin

**Beklenen Sonuç:**
- Arka plan renkleri dark tema ile uyumlu
- Metin okunabilir
- Input alanları düzgün görünür
- Hata mesajları okunabilir

| Test Sonucu | |
|-------------|---|
| **Durum** | [ ] ✅ [ ] ❌ [ ] ⚠️ [X ] ⏭️ |
| **Gerçekleşen Sonuç** | |
| **Notlar** | |

---

# 7. TEST ÖZET RAPORU

## Test İstatistikleri

| Kategori | Toplam | Başarılı | Başarısız | Kısmi | Atlanan |
|----------|--------|----------|-----------|-------|---------|
| Müşteri Yönetimi | 7 | | | | |
| Lead Yönetimi | 5 | | | | |
| Fırsat Yönetimi | 7 | | | | |
| Kampanya Yönetimi | 4 | | | | |
| Hata Senaryoları | 8 | | | | |
| UX Testleri | 7 | | | | |
| **TOPLAM** | **38** | | | | |

## Kritik Bulgular

### Yüksek Öncelikli Sorunlar
1.
2.
3.

### Orta Öncelikli Sorunlar
1.
2.
3.

### Düşük Öncelikli Sorunlar
1.
2.
3.

## Genel Değerlendirme

**Test Tarihi:**
**Test Eden:**
**Genel Sonuç:** [ ] Kabul Edildi [ ] Şartlı Kabul [ ] Reddedildi

**Notlar:**

---

**İmza:** _______________ **Tarih:** _______________
