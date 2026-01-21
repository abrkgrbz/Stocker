# 📋 ENVANTER MODÜLÜ KAPSAMLI TEST PLANI
# Son Güncelleme: 21/01/2026 11:15
# Toplam Sayfa: 115+

================================================================================
## 🎯 TEST DURUMU ÖZET TABLOSU
================================================================================

### DURUM AÇIKLAMALARI:
- ✅ TAM TEST = Liste + Yeni + Düzenleme + Silme test edildi
- 🔄 KISMI TEST = Sadece liste veya bazı işlemler test edildi
- ❌ TEST EDİLMEDİ = Hiç test edilmedi
- 🚫 HATALI = Test edildi ama hata var
- 🔧 DÜZELTİLDİ = Hata tespit edilip kod düzeltildi (deploy bekliyor)
- ⚠️ POTANSİYEL BUG = Kayıt yapıldı ama beklenmeyen davranış

================================================================================
## 📅 SON TEST OTURUMU SONUÇLARI (22/01/2026 - GECE 01:15)
================================================================================

### ✅ EK FORM TESTLERİ (YENİ TAMAMLANDI):

| Test | Sonuç | Oluşturulan Kayıt | Detay |
|------|-------|-------------------|-------|
| Tedarikçi Ürünleri Form | ✅ | NIKE-ABC-001 | ABC Ticaret Ltd. için Nike Spor Ayakkabı eklendi (₺850, 7 gün) |
| Fiyat Listeleri Form | ✅ | PL-E2E-001 | "E2E Test Fiyat Listesi" - TRY, %10 global indirim |
| Barkod Tanımları Form | ✅ | 8691234567890 | Nike Spor Ayakkabı için EAN-13 barkod eklendi |

### 🔄 END-TO-END İŞ AKIŞI TESTLERİ (TAMAMLANDI - 21/01/2026 11:15):

| E2E Test | Sonuç | Bug | Detay |
|----------|-------|-----|-------|
| E2E-IA-1: Stok Transfer Onay Akışı | ❌ HATALI | **BUG-E2E-001** | "Onaya Gönder" butonu tıklandığında hiçbir aksiyon yok |
| E2E-IA-2: Stok Sayım Tam Akışı | 🟡 KISMİ | **BUG-E2E-004** | Sayım oluşturma ✅, "Başlat" butonu çalışmıyor (E2E-4 ile doğrulandı) |
| E2E-IA-3: Kalite Kontrol Tam Akışı | ❌ HATALI | **BUG-E2E-007** | /quality-control → /reorder-rules'a redirect ediyor |
| E2E-IA-4: Konsinye Stok Satış Akışı | 🟡 KISMİ | **BUG-E2E-008** | Listeleme ✅, "Satış Kaydet" dropdown'da yok |
| E2E-IA-5: Reorder Rules Akışı | ❌ HATALI | **BUG-E2E-009** | /reorder-rules → /stock-transfers'e redirect ediyor |
| E2E-IA-6: Lot/Batch ve Raf Ömrü | 🟡 KISMİ | **BUG-E2E-003** | Listeleme ✅, Ürün dropdown boş, Shelf Life ✅ |
| E2E-5: Stok Düzeltme Akışı | ❌ HATALI | **BUG-E2E-010** | Sayfa sürekli /stock-transfers'e redirect, form erişilemiyor |
| E2E-6: Depo Transfer Tam Akışı | ❌ HATALI | **BUG-E2E-011** | "Yeni Transfer" /stock-adjustments'a yönlendiriyor, "Onaya Gönder" anasayfaya |
| E2E-7: Ürün Yaşam Döngüsü | ✅ BAŞARILI | - | Tüm adımlar başarılı (Ctrl+K ile navigasyon workaround) |

### 🐛 TESPİT EDİLEN KRİTİK BUGLAR (E2E):

| Bug ID | Sayfa | Sorun | Etki | Öncelik |
|--------|-------|-------|------|---------|
| BUG-E2E-001 | /stock-transfers/[id] | "Onaya Gönder" butonu Modal açmıyor, API çağrısı yok | Transfer workflow bloklandı | 🔴 KRİTİK |
| BUG-E2E-003 | /lot-batches/new | Ürün dropdown'da "Veri Yok" - ürünler listelenmiyor | Yeni lot oluşturulamıyor | 🟡 ORTA |
| BUG-E2E-004 | /stock-counts/[id] | "Başlat" butonu Modal.confirm açmıyor | Stok sayımı başlatılamıyor | 🔴 KRİTİK |
| BUG-E2E-007 | /quality-control | Sayfa /reorder-rules'a otomatik redirect | Kalite kontrol sayfası erişilemez | 🔴 KRİTİK |
| BUG-E2E-008 | /consignment-stocks | "Satış Kaydet" seçeneği dropdown menüde yok | Konsinye satış kaydedilemıyor | 🟡 ORTA |
| BUG-E2E-009 | /reorder-rules | Sayfa /stock-transfers'e otomatik redirect | Reorder rules sayfası erişilemez | 🔴 KRİTİK |
| BUG-E2E-010 | /stock-adjustments | Sayfa sürekli /stock-transfers'e redirect | Stok düzeltme erişilemez | 🔴 KRİTİK |
| BUG-E2E-011 | /stock-transfers/new | "Yeni Transfer" butonu /stock-adjustments'a yönlendiriyor | Yeni transfer oluşturulamıyor | 🔴 KRİTİK |
| BUG-E2E-012 | Genel Navigasyon | UI elementlerine tıklanınca beklenmeyen /stock-transfers yönlendirmesi | Navigasyon tutarsız | 🔴 KRİTİK |

### 📊 E2E TEST SONUÇ ÖZETİ (21/01/2026 11:15):
- **Toplam E2E Test**: 9
- **Tam Başarılı**: 1 (Ürün Yaşam Döngüsü)
- **Kısmi Başarılı**: 3 (Sayım, Konsinye, Lot/Batch)
- **Tamamen Başarısız**: 5 (Transfer, Kalite Kontrol, Reorder Rules, Düzeltme, Transfer Akışı)
- **Tespit Edilen Bug**: 9

### 🔍 BUG DETAYLARI:

**BUG-E2E-001 - Stock Transfer "Onaya Gönder" Butonu:**
- Sayfa: `/inventory/stock-transfers/[id]`
- Kod: `stocker-nextjs/src/app/(dashboard)/inventory/stock-transfers/[id]/page.tsx`
- Sorun: "Onaya Gönder" butonu tıklandığında hiçbir aksiyon gerçekleşmiyor
- Beklenen: Modal açılmalı veya durum "Onay Bekliyor" olarak değişmeli
- Test: TR-E2E-TEST-001 transferi ile test edildi

**BUG-E2E-004 - Stock Count "Başlat" Butonu:**
- Sayfa: `/inventory/stock-counts/[id]`
- Kod: `stocker-nextjs/src/app/(dashboard)/inventory/stock-counts/[id]/page.tsx`
- Sorun: `handleStart()` fonksiyonu `Modal.confirm` çağırıyor ama modal açılmıyor
- Test 1: COUNT-E2E-TEST-002 sayımı ile test edildi
- Test 2 (E2E-4): COUNT-E2E-4-TEST sayımı ile tekrar doğrulandı (21/01/2026 10:40)
  - Sayım başarıyla oluşturuldu (2 kalem: Nike 95, Samsung 90)
  - "Başlat" butonuna tıklandığında hiçbir network isteği gönderilmiyor
  - Durum "Taslak" olarak kalıyor, "Devam Eden" olmuyur
- Pattern: BUG-E2E-001 ile aynı (Modal.confirm pattern sorunu)

**BUG-E2E-007 - Quality Control Routing Hatası (YENİ):**
- Sayfa: `/inventory/quality-control`
- Sorun: Sayfa yüklendikten kısa süre sonra `/inventory/reorder-rules` sayfasına otomatik redirect
- Beklenen: Kalite kontrol listesi görüntülenmeli
- Test: URL ile ve menüden erişim denendi, her ikisinde de aynı sorun
- Olası Neden: Route guard veya useEffect içinde yanlış yönlendirme mantığı

**BUG-E2E-008 - Consignment Stock "Satış Kaydet" Eksik (YENİ):**
- Sayfa: `/inventory/consignment-stocks`
- Sorun: Satır işlemleri dropdown menüsünde "Satış Kaydet" seçeneği mevcut değil
- Mevcut Seçenekler: Görüntüle, Düzenle, Askıya Al, Anlaşmayı Kapat, Sil
- Beklenen: "Satış Kaydet" seçeneği olmalı
- Test: CON-20260120-EFA169 kaydı ile test edildi

**BUG-E2E-009 - Reorder Rules Routing Hatası (YENİ):**
- Sayfa: `/inventory/reorder-rules`
- Sorun: Sayfa yüklendikten kısa süre sonra `/inventory/stock-transfers` sayfasına otomatik redirect
- Beklenen: Reorder rules listesi görüntülenmeli
- Test: URL ile ve menüden erişim denendi, her ikisinde de aynı sorun
- Olası Neden: BUG-E2E-007 ile aynı root cause - routing konfigürasyonu

### 🧪 E2E-5, E2E-6, E2E-7 TEST SONUÇLARI (21/01/2026 11:15):

**E2E-5: Stok Düzeltme Akışı** ❌
- Login: ✅ Başarılı
- Sayfa Erişimi: ❌ Sürekli /stock-transfers'e redirect
- Düzeltme Oluşturma: ❌ Form erişilemedi
- Onay Akışı: ❌ Test edilemedi
- **Tespit:** BUG-E2E-010 - Kritik navigasyon sorunu

**E2E-6: Depo Transfer Tam Akışı** ❌
- Login: ✅ Başarılı
- Transfer Listesi: ✅ 4 transfer listelendi
- "Yeni Transfer" Butonu: ❌ /stock-adjustments'a yönlendiriyor (BUG-E2E-011)
- "Onaya Gönder" Butonu: ❌ Anasayfaya yönlendiriyor
- Satır İşlemleri "Onaya Gönder": ❌ Arama dialogu açıp /products'a yönlendiriyor
- **Tespit:** BUG-E2E-011, BUG-E2E-012

**E2E-7: Ürün Yaşam Döngüsü** ✅
- Login: ✅ Başarılı
- Ürün Oluşturma: ✅ PRD-E2E-7-TEST başarıyla oluşturuldu
- Ürün Düzenleme: ✅ Kategori değiştirildi
- Stok Kontrolü: ✅ Stok görünümünde kontrol edildi
- Pasife Alma: ✅ Ürün pasife alındı
- Filtre: ✅ Pasif ürünler filtrelenebildi
- **NOT:** Navigasyon için Ctrl+K arama workaround kullanıldı

---

### 🧪 E2E-4: STOK SAYIMI AKIŞI TESTİ (21/01/2026 10:40):

**Test Amacı:** Tam stok sayım workflow'unu test etmek (oluştur → başlat → say → tamamla → düzeltme)

| Adım | Sonuç | Detay |
|------|-------|-------|
| 1. Başlangıç Stok Kontrolü | ✅ | PRD-003 Nike: 95, PRD-002 Samsung: 90 (Ana Depo) |
| 2. Yeni Sayım Oluşturma | ✅ | COUNT-E2E-4-TEST, Tam Sayım, Ana Depo, 2 kalem yüklendi |
| 3. Sayım Detay Görüntüleme | ✅ | Sistem Toplam: 185, Sayılan: 0, Durum: Taslak |
| 4. "Başlat" Butonu | ❌ | **BUG-E2E-004**: Buton tıklanıyor ama API çağrısı yok |
| 5. Fiili Miktar Girişi | ⏳ | Başlat çalışmadığı için test edilemedi |
| 6. Sayım Tamamlama | ⏳ | Başlat çalışmadığı için test edilemedi |
| 7. Otomatik Düzeltme | ⏳ | Başlat çalışmadığı için test edilemedi |

**Sonuç:** 🟡 KISMİ - Sayım oluşturma başarılı, workflow "Başlat" butonunda bloklandı

---

### 🔧 ROUTING HATALARI ROOT CAUSE ANALİZİ:
Birden fazla sayfa yanlış sayfalara redirect ediyor:
- `/inventory/quality-control` → `/inventory/reorder-rules`
- `/inventory/reorder-rules` → `/inventory/stock-transfers`
- `/inventory/consignment-stocks` (URL ile) → `/inventory/shelf-life`

**Muhtemel Çözüm Alanları:**
1. `stocker-nextjs/src/app/(dashboard)/inventory/layout.tsx` - Route tanımları
2. Middleware veya auth guard'larda yanlış redirect mantığı
3. useEffect içinde sayfa yönlendirmesi yapan kod

---

## 📅 ÖNCEKİ TEST OTURUMU SONUÇLARI (21/01/2026 - AKŞAM 21:55)

---

## 📅 ÖNCEKİ TEST OTURUMU SONUÇLARI (21/01/2026 - GECE 00:45)

### ✅ BU OTURUMDA TEST EDİLEN FORMLAR:

| Test | Sonuç | Oluşturulan Kayıt | Detay |
|------|-------|-------------------|-------|
| Cycle Counts (Dönemsel Sayımlar) Form | ✅ | CC-20260120-CF418D | Ana Depo, Standart Sayım, 21-31/01/2026 |
| Reorder Rules Form | ✅ | (Kayıt başarılı mesajı) | Samsung Galaxy S24, Ana Depo, Tetikleyici: <10 adet |
| Serial Numbers Form | ⚠️ | - | Modal açılıyor, validation çalışıyor AMA ürün listesi boş ("Veri Yok") - Seri takibi aktif ürün yok |
| Lot Batches Form | ⚠️ | - | Modal açılıyor, validation çalışıyor AMA ürün listesi boş ("Veri Yok") - Lot takibi aktif ürün yok |
| Product Bundles Form | ❌ | - | **400 Error** - bundleType enum serialization sorunu devam ediyor |
| Shelf Lives Page | ❌ | - | **404 Error** - Frontend sayfası hala eksik |

### ❌ DEVAM EDEN BUGLAR:

| Bug | Durum | Detay |
|-----|-------|-------|
| Product Bundles - bundleType Enum | ❌ HATALI | `$.bundleType: The JSON value could not be converted to BundleType` - Frontend enum string, backend int bekliyor |
| Shelf Lives - 404 | ❌ HATALI | Frontend sayfası (`/inventory/shelf-lives`) mevcut değil |
| Reorder Rules - Liste Görünmüyor | ⚠️ | Form "Başarılı!" mesajı gösteriyor ama liste hala boş (Toplam Kural: 0). |

### 📝 NOTLAR:
- Serial Numbers ve Lot Batches formları teknik olarak çalışıyor, sadece sistemde seri/lot takibi aktif ürün yok
- Bu formları tam test etmek için önce bir ürünün seri/lot takibini aktifleştirmek gerekiyor

### ✅ ÖNCEKİ OTURUM (GECE 00:30) - TAMAM:

| Test | Sonuç | Oluşturulan Kayıt | Detay |
|------|-------|-------------------|-------|
| Stock Transfers Form | ✅ | TR-TEST-002 | Ana Depo → E-Ticaret Depo, 3 Samsung Galaxy S24 |
| Stock Counts Form | ✅ | COUNT-2026-002 | Ana Depo Aylık Sayımı, 2 ürün (Nike: 95, Samsung: 90) |
| Quality Controls Form | ✅ | QC-20260120-D619D1 | Samsung Galaxy S24, Giriş Denetimi, Lot: LOT-SAMSUNG-2026-001 |
| Inventory Adjustments Form | ✅ | ADJ-20260120-879E5C | Sayım Farkı, -1 Samsung (95→94), Onaya gönderildi |
| Consignment Stocks Form | ✅ | CON-20260120-B24A53 | Teknoloji Tedarik A.Ş., 10 Laptop, 12.000 TRY, Aktif |

================================================================================
## 📅 ÖNCEKİ TEST OTURUMU (20/01/2026 - AKŞAM)
================================================================================

### DEPLOY SONRASI DOĞRULAMA TESTLERİ:

| Test | Sonuç | Detay |
|------|-------|-------|
| Shelf Life Rule Form | ✅ | Enum fix ÇALIŞIYOR - Kayıt başarılı (ID: 1) |
| Warehouse Delete Modal | ✅ | State-based modal ÇALIŞIYOR - Modal açılıyor |
| Reorder Rules List | ✅ | Sayfa yükleniyor |
| Reorder Rules Form | ⚠️ | Kayıt "başarılı" mesajı ama listede görünmüyor |
| Serial Numbers List | ✅ | Sayfa yükleniyor, mevcut kayıt görünüyor |
| Serial Numbers Form | 🔄 | Ürün listesi boş (Seri takibi aktif ürün yok) |
| Lot Batches List | ✅ | Sayfa yükleniyor, mevcut kayıt görünüyor |
| Lot Batches Form | 🔄 | Ürün listesi boş (Lot takibi aktif ürün yok) |

### 🔧 BULUNAN VE DÜZELTİLEN BUG:
**Reorder Rules - IReorderRuleRepository DI Kaydı Eksik:**
- **Belirti**: Form "Başarılı!" gösteriyor ama liste boş kalıyor
- **Kök Neden**: `IReorderRuleRepository` DI container'da kayıtlı değildi
- **Dosya**: `src/Modules/Stocker.Modules.Inventory/Infrastructure/DependencyInjection.cs`
- **Düzeltme**: Satır 107'ye `services.AddScoped<IReorderRuleRepository>(...)` eklendi
- **Durum**: 🔧 DEPLOY BEKLİYOR

### ÖNCEKİ OTURUM (ÖĞLEN):

| Test | Sonuç | Detay |
|------|-------|-------|
| Packaging Type Form | ✅ | Kategori enum string, çalışıyor |
| Dashboard API | ✅ | Tüm API'ler 200 döndü |
| Barcode Lookup API | ✅ | API 200 döndü |

### TÜM DÜZELTMELER DEPLOY EDİLDİ VE DOĞRULANDI ✅

================================================================================
## 1️⃣ ÜRÜN YÖNETİMİ (Product Management)
================================================================================

| Sayfa | URL | Liste | Yeni | Düzenle | Detay | Sil | Durum |
|-------|-----|-------|------|---------|-------|-----|-------|
| Ürünler | /products | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ TAM |
| Kategoriler | /categories | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ TAM |
| Markalar | /brands | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ TAM |
| Birimler | /units | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ TAM |
| Ürün Varyantları | /product-variants | ✅ | ❌ | ❌ | ❌ | ❌ | 🔄 KISMI |
| Ürün Paketleri | /product-bundles | ✅ | ❌ | ❌ | ❌ | ❌ | 🔄 KISMI |
| Ürün Özellikleri | /product-attributes | ✅ | ❌ | ❌ | ❌ | ❌ | 🔄 KISMI |

**Alt Sayfalar:**
| Sayfa | URL | Durum |
|-------|-----|-------|
| Ürün Detay | /products/[id] | ✅ |
| Ürün Düzenle | /products/[id]/edit | ✅ |
| Yeni Ürün | /products/new | ✅ |
| Kategori Detay | /categories/[id] | ✅ |
| Kategori Düzenle | /categories/[id]/edit | ✅ |
| Yeni Kategori | /categories/new | ✅ |
| Marka Detay | /brands/[id] | ✅ |
| Marka Düzenle | /brands/[id]/edit | ✅ |
| Yeni Marka | /brands/new | ✅ |
| Birim Detay | /units/[id] | ✅ |
| Birim Düzenle | /units/[id]/edit | ✅ |
| Yeni Birim | /units/new | ✅ |
| Varyant Detay | /product-variants/[id] | ❌ |
| Varyant Düzenle | /product-variants/[id]/edit | ❌ |
| Yeni Varyant | /product-variants/new | ❌ |
| Paket Detay | /product-bundles/[id] | ❌ |
| Paket Düzenle | /product-bundles/[id]/edit | ❌ |
| Yeni Paket | /product-bundles/new | ❌ |
| Özellik Detay | /product-attributes/[id] | ❌ |
| Özellik Düzenle | /product-attributes/[id]/edit | ❌ |
| Yeni Özellik | /product-attributes/new | ❌ |

**Öncelik**: DÜŞÜK (Temel CRUD çalışıyor)

================================================================================
## 2️⃣ DEPO YÖNETİMİ (Warehouse Management)
================================================================================

| Sayfa | URL | Liste | Yeni | Düzenle | Detay | Sil | Durum |
|-------|-----|-------|------|---------|-------|-----|-------|
| Depolar | /warehouses | ✅ | ✅ | ✅ | ✅ | 🔧 | 🔧 SİLME DÜZELTİLDİ |
| Depo Bölgeleri | /warehouse-zones | ✅ | ✅ | ❌ | ❌ | ❌ | 🔄 KISMI |
| Lokasyonlar | /locations | ✅ | ✅ | ❌ | ❌ | ❌ | 🔄 KISMI |

**Alt Sayfalar:**
| Sayfa | URL | Durum |
|-------|-----|-------|
| Depo Detay | /warehouses/[id] | ✅ |
| Depo Düzenle | /warehouses/[id]/edit | ✅ |
| Yeni Depo | /warehouses/new | ✅ |
| Bölge Detay | /warehouse-zones/[id] | ❌ |
| Bölge Düzenle | /warehouse-zones/[id]/edit | ❌ |
| Yeni Bölge | /warehouse-zones/new | ✅ |
| Lokasyon Detay | /locations/[id] | ❌ |
| Lokasyon Düzenle | /locations/[id]/edit | ❌ |
| Yeni Lokasyon | /locations/new | ✅ |

**Öncelik**: ORTA (Silme düzeltildi - deploy bekliyor)

================================================================================
## 3️⃣ STOK İŞLEMLERİ (Stock Operations)
================================================================================

| Sayfa | URL | Liste | Yeni | Düzenle | Detay | Sil | Durum |
|-------|-----|-------|------|---------|-------|-----|-------|
| Stok Görünümü | /stock | ✅ | - | - | - | - | ✅ TAM |
| Stok Hareketleri | /stock-movements | ✅ | ✅ | - | ❌ | - | 🔄 KISMI |
| Stok Transferleri | /stock-transfers | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ YENİ TAMAM |
| Stok Düzeltmeleri | /stock-adjustments | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ YENİ TAMAM |
| Stok Sayımları | /stock-counts | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ YENİ TAMAM |
| Stok Rezervasyonları | /stock-reservations | ✅ | ❌ | - | ❌ | ❌ | 🔄 KISMI |
| Stok Uyarıları | /stock-alerts | ✅ | - | - | - | - | ✅ TAM |
| Konsinye Stoklar | /consignment-stocks | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ YENİ TAMAM |

**Alt Sayfalar:**
| Sayfa | URL | Durum |
|-------|-----|-------|
| Hareket Detay | /stock-movements/[id] | ❌ |
| Yeni Hareket | /stock-movements/new | ✅ |
| Transfer Detay | /stock-transfers/[id] | ❌ |
| Transfer Düzenle | /stock-transfers/[id]/edit | ❌ |
| Yeni Transfer | /stock-transfers/new | ✅ |
| Düzeltme Yeni | /stock-adjustments/new | ✅ |
| Sayım Detay | /stock-counts/[id] | ❌ |
| Sayım Düzenle | /stock-counts/[id]/edit | ❌ |
| Yeni Sayım | /stock-counts/new | ✅ |
| Rezervasyon Detay | /stock-reservations/[id] | ❌ |
| Yeni Rezervasyon | /stock-reservations/new | ❌ |
| Konsinye Detay | /consignment-stocks/[id] | ❌ |
| Konsinye Düzenle | /consignment-stocks/[id]/edit | ❌ |
| Yeni Konsinye | /consignment-stocks/new | ❌ |

**Öncelik**: YÜKSEK (Kritik iş akışları)

================================================================================
## 4️⃣ İZLEME & TAKİP (Tracking)
================================================================================

| Sayfa | URL | Liste | Yeni | Düzenle | Detay | Sil | Durum |
|-------|-----|-------|------|---------|-------|-----|-------|
| Seri Numaraları | /serial-numbers | ✅ | ❌ | ❌ | ❌ | ❌ | 🔄 KISMI |
| Lot/Batch | /lot-batches | ✅ | ❌ | ❌ | ❌ | ❌ | 🔄 KISMI |
| Raf Ömrü Dashboard | /shelf-life | ✅ | - | - | - | - | ✅ TAM |
| Raf Ömrü Kuralları | /shelf-life/rules | ✅ | 🔧 | ❌ | ❌ | ❌ | 🔧 ENUM FIX |

**Alt Sayfalar:**
| Sayfa | URL | Durum |
|-------|-----|-------|
| Seri No Detay | /serial-numbers/[id] | ❌ |
| Yeni Seri No | /serial-numbers/new | ❌ |
| Lot Detay | /lot-batches/[id] | ❌ |
| Lot Düzenle | /lot-batches/[id]/edit | ❌ |
| Yeni Lot | /lot-batches/new | ❌ |
| Raf Ömrü Kural Detay | /shelf-life/rules/[id] | ❌ |
| Yeni Raf Ömrü Kuralı | /shelf-life/rules/new | 🔧 |

**Öncelik**: ORTA (Enum fix deploy bekliyor)

================================================================================
## 5️⃣ KALİTE YÖNETİMİ (Quality Management)
================================================================================

| Sayfa | URL | Liste | Yeni | Düzenle | Detay | Sil | Durum |
|-------|-----|-------|------|---------|-------|-----|-------|
| Kalite Kontrol | /quality-control | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ YENİ TAMAM |
| Dönemsel Sayımlar | /cycle-counts | ✅ | 🔄 | ❌ | ❌ | ❌ | 🔄 KISMI (timeout) |
| Sipariş Kuralları | /reorder-rules | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ HİÇ TEST EDİLMEDİ |

**Alt Sayfalar:**
| Sayfa | URL | Durum |
|-------|-----|-------|
| Kalite Detay | /quality-control/[id] | ❌ |
| Yeni Kalite | /quality-control/new | ❌ |
| Dönemsel Sayım Detay | /cycle-counts/[id] | ❌ |
| Yeni Dönemsel Sayım | /cycle-counts/new | ❌ |
| Sipariş Kuralı Detay | /reorder-rules/[id] | ❌ |
| Sipariş Kuralı Düzenle | /reorder-rules/[id]/edit | ❌ |
| Yeni Sipariş Kuralı | /reorder-rules/new | ❌ |

**Öncelik**: KRİTİK (Hiç test edilmemiş sayfalar var)

================================================================================
## 6️⃣ TEDARİKÇİ YÖNETİMİ (Supplier Management)
================================================================================

| Sayfa | URL | Liste | Yeni | Düzenle | Detay | Sil | Durum |
|-------|-----|-------|------|---------|-------|-----|-------|
| Tedarikçiler | /suppliers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ TAM |
| Tedarikçi Ürünleri | /suppliers/[id]/products | ✅ | ✅ | ❌ | - | ❌ | ✅ YENİ TEST EDİLDİ |
| Fiyat Listeleri | /price-lists | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ YENİ EKLEME OK |

**Alt Sayfalar:**
| Sayfa | URL | Durum |
|-------|-----|-------|
| Tedarikçi Detay | /suppliers/[id] | ✅ |
| Tedarikçi Düzenle | /suppliers/[id]/edit | ✅ |
| Yeni Tedarikçi | /suppliers/new | ✅ |
| Ted. Ürün Yeni | /suppliers/[id]/products/new | ✅ |
| Ted. Ürün Düzenle | /suppliers/[id]/products/[productId]/edit | ❌ |
| Fiyat Listesi Detay | /price-lists/[id] | ❌ |
| Fiyat Listesi Düzenle | /price-lists/[id]/edit | ❌ |
| Yeni Fiyat Listesi | /price-lists/new | ✅ |

**Öncelik**: ORTA

================================================================================
## 7️⃣ BARKOD İŞLEMLERİ (Barcode Operations)
================================================================================

| Sayfa | URL | Liste | Yeni | Düzenle | Detay | Sil | Durum |
|-------|-----|-------|------|---------|-------|-----|-------|
| Barkod Arama (3 tab) | /barcodes | ✅ | - | - | - | - | ✅ TAM (API 200) |
| Barkod Tanımları | /barcode-definitions | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ YENİ EKLEME OK |

**Alt Sayfalar:**
| Sayfa | URL | Durum |
|-------|-----|-------|
| Barkod Tanım Düzenle | /barcode-definitions/[id]/edit | ❌ |
| Yeni Barkod Tanım | /barcode-definitions/new | ✅ |

**Öncelik**: DÜŞÜK

================================================================================
## 8️⃣ TANIMLAR (Definitions)
================================================================================

| Sayfa | URL | Liste | Yeni | Düzenle | Detay | Sil | Durum |
|-------|-----|-------|------|---------|-------|-----|-------|
| Ambalaj Tipleri | /packaging-types | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ YENİ TAMAM |

**Alt Sayfalar:**
| Sayfa | URL | Durum |
|-------|-----|-------|
| Ambalaj Düzenle | /packaging-types/[id]/edit | ❌ |
| Yeni Ambalaj | /packaging-types/new | ✅ |

**Öncelik**: DÜŞÜK

================================================================================
## 9️⃣ RAPORLAR & ANALİZ (Reports & Analysis)
================================================================================

| Sayfa | URL | Görüntüleme | Filtreler | Export | Durum |
|-------|-----|-------------|-----------|--------|-------|
| Dashboard | /inventory | ✅ | - | - | ✅ TAM (API 200) |
| Analitik | /analytics | ✅ | ✅ | ✅ | ✅ TAM |
| Analiz | /analysis | ✅ | ✅ | ✅ | 🔄 (Integer overflow) |
| Tahminleme | /forecasting | ✅ | ✅ | ✅ | ✅ TAM |
| Maliyetlendirme | /costing | ✅ | ✅ | ✅ | ✅ TAM |
| Denetim İzi | /audit-trail | ✅ | ✅ | - | ✅ TAM |

**Öncelik**: DÜŞÜK (Çoğu çalışıyor)

================================================================================
## 📊 GÜNCEL İSTATİSTİKLER
================================================================================

### SAYFA DAĞILIMI:
```
TOPLAM SAYFA: ~115
├── ✅ TAM TEST EDİLEN: ~30 sayfa
├── 🔄 KISMI TEST: ~35 sayfa
├── ❌ HİÇ TEST EDİLMEYEN: ~45 sayfa
├── 🔧 DÜZELTİLDİ (deploy bekliyor): 3 sayfa
└── 🚫 HATALI: 0 sayfa (hepsi düzeltildi)
```

### FORM DAĞILIMI (new/edit):
```
TOPLAM FORM: ~60 form
├── ✅ Test edildi ve çalışıyor: ~20 form
├── 🔧 Düzeltildi (deploy bekliyor): 2 form
├── ❌ Test edilmedi: ~38 form
```

### DEPLOY BEKLİYOR:
1. ~~ShelfLifeType, ShelfLifeRuleType, ExpiryAction enum fix~~ ✅ DEPLOY EDİLDİ VE ÇALIŞIYOR
2. ~~Warehouse delete modal fix~~ ✅ DEPLOY EDİLDİ VE ÇALIŞIYOR
3. **YENİ**: IReorderRuleRepository DI registration fix

================================================================================
## 🔥 TEST ÖNCELİK SIRASI
================================================================================

### AŞAMA 1: KRİTİK - HİÇ TEST EDİLMEMİŞ FORMLAR
**Öncelik: 🔴 EN YÜKSEK**

| # | Sayfa | URL | Not |
|---|-------|-----|-----|
| 1 | Sipariş Kuralları | /reorder-rules | Hiç test edilmedi |
| 2 | Yeni Sipariş Kuralı | /reorder-rules/new | Kritik iş akışı |
| 3 | Yeni Seri Numarası | /serial-numbers/new | İzleme kritik |
| 4 | Yeni Lot/Batch | /lot-batches/new | Lot takibi |
| 5 | Yeni Rezervasyon | /stock-reservations/new | Sipariş akışı |
| 6 | Yeni Konsinye | /consignment-stocks/new | Konsinye yönetimi |

### AŞAMA 2: YÜKSEK - DETAY & DÜZENLEME SAYFALARI
**Öncelik: 🟡 YÜKSEK**

| # | Sayfa | URL |
|---|-------|-----|
| 1 | Transfer Detay | /stock-transfers/[id] |
| 2 | Transfer Düzenle | /stock-transfers/[id]/edit |
| 3 | Sayım Detay | /stock-counts/[id] |
| 4 | Hareket Detay | /stock-movements/[id] |
| 5 | Varyant Detay/Edit | /product-variants/[id] |
| 6 | Paket Detay/Edit | /product-bundles/[id] |
| 7 | Bölge Detay/Edit | /warehouse-zones/[id] |
| 8 | Lokasyon Detay/Edit | /locations/[id] |

### AŞAMA 3: ORTA - ALT SAYFALAR
**Öncelik: 🟢 ORTA**

| # | Sayfa | URL |
|---|-------|-----|
| 1 | Tedarikçi Ürünleri | /suppliers/[id]/products |
| 2 | Yeni Fiyat Listesi | /price-lists/new |
| 3 | Yeni Barkod Tanımı | /barcode-definitions/new |
| 4 | Yeni Kalite Kontrol | /quality-control/new |
| 5 | Yeni Dönemsel Sayım | /cycle-counts/new |
| 6 | Yeni Ürün Özelliği | /product-attributes/new |

### AŞAMA 4: DÜŞÜK - SİLME İŞLEMLERİ
**Öncelik: 🔵 DÜŞÜK**

Tüm entity'ler için:
- Silme modal/popconfirm açılıyor mu?
- API isteği başarılı mı?
- İlişkili kayıt kontrolü yapılıyor mu?
- Cascade delete doğru çalışıyor mu?

================================================================================
## 📝 TEST NOTLARI
================================================================================

### Bilinen Sorunlar (Çözüldü):
1. ~~Warehouse delete - Modal.confirm çalışmıyor~~ → State-based modal ile düzeltildi
2. ~~Shelf Life Rule - Enum type mismatch~~ → String enum ile düzeltildi

### Test Ortamı:
- Tenant URL: https://qwe.stoocker.app
- Tenant: qwe
- Test Kullanıcısı: Anıl Gürbüz

### Giriş Bilgileri:
- Login URL: https://auth.stoocker.app/login
- E-posta: rafof40045@feanzier.com
- Şifre: A.bg010203

### Playwright Test Notları:
- Dropdown menüler için snapshot alınmalı
- Modal açılma/kapanma için wait kullanılmalı
- Form submit sonrası success/error toast kontrol edilmeli

================================================================================
## 🧪 NEGATİF TEST SENARYOLARI (Validation)
================================================================================

### Amaç: Hatalı veri girildiğinde sistemin düzgün tepki verip vermediği

| # | Senaryo | Beklenen Davranış | Test Durumu |
|---|---------|-------------------|-------------|
| 1 | Stok Düzeltme: Miktar -50 girilirse | 400 Bad Request + uyarı mesajı | ❌ |
| 2 | Raf Ömrü: Geçmiş tarih girilirse | Validation uyarısı | ❌ |
| 3 | Mükerrer Barkod: Aynı barkodla 2. ürün | 400 Bad Request (500 değil!) | ❌ |
| 4 | Mükerrer Kod: Aynı ürün kodu ile kayıt | 400 Bad Request + açıklayıcı mesaj | ❌ |
| 5 | Zorunlu alan boş bırakılırsa | Frontend validation engeli | ❌ |
| 6 | Maksimum karakter limiti aşılırsa | Validation uyarısı | ❌ |
| 7 | Transfer: Mevcut stoktan fazla transfer | Stok yetersiz uyarısı | ❌ |
| 8 | Fiyat: Negatif değer girilirse | Validation uyarısı | ❌ |

### API Hata Yanıtı Standardı Kontrolü:
- 400 Bad Request: Validation hataları (kullanıcı hatası)
- 404 Not Found: Kayıt bulunamadı
- 409 Conflict: Mükerrer kayıt
- 500 Internal Error: Sunucu hatası (OLMAMALI!)

================================================================================
## 🔗 VERİ BÜTÜNLÜĞÜ TESTLERİ (Data Integrity)
================================================================================

### Cascade Delete & Referential Integrity

| # | Senaryo | Beklenen Davranış | Test Durumu |
|---|---------|-------------------|-------------|
| 1 | İçinde stok olan depoyu silme | "Depo boşaltılmadan silinemez" uyarısı | ❌ |
| 2 | Ürünü olan kategoriyi silme | "Kategoride ürün var" uyarısı | ❌ |
| 3 | Ürünü olan markayı silme | "Markada ürün var" uyarısı | ❌ |
| 4 | Kullanılan birimi silme | "Birim kullanımda" uyarısı | ❌ |
| 5 | Aktif transferi olan depoyu silme | Transfer tamamlanana kadar engellenme | ❌ |
| 6 | Rezervasyonu olan stoğu düzeltme | Rezervasyon miktarı uyarısı | ❌ |
| 7 | Ürün varyantı olan ürünü silme | Cascade kontrol | ❌ |
| 8 | Lot/Batch kaydı olan ürünü silme | Cascade kontrol | ❌ |
| 9 | Seri numarası olan ürünü silme | Cascade kontrol | ❌ |
| 10 | Fiyat listesindeki ürünü silme | Cascade kontrol | ❌ |

### Soft Delete Kontrolü:
- Silinen kayıtlar gerçekten siliniyor mu yoksa pasife mi çekiliyor?
- Pasif kayıtlar listede gösteriliyor mu (filtre ile)?
- Silinen kayıtla aynı kod/isim tekrar kullanılabiliyor mu?

================================================================================
## 📱 MOBİL / RESPONSIVE TESTLERİ
================================================================================

### Kritik Mobil Sayfalar (Saha kullanımı):

| # | Sayfa | Mobil Önemi | Test Durumu |
|---|-------|-------------|-------------|
| 1 | /stock-counts/new | 🔴 KRİTİK - Saha sayımı | ❌ |
| 2 | /stock-adjustments/new | 🔴 KRİTİK - Anlık düzeltme | ❌ |
| 3 | /barcodes | 🔴 KRİTİK - Barkod okutma | ❌ |
| 4 | /stock-movements/new | 🟡 YÜKSEK - Hareket kaydı | ❌ |
| 5 | /stock-transfers/new | 🟡 YÜKSEK - Transfer kaydı | ❌ |
| 6 | /quality-control/new | 🟡 YÜKSEK - Kalite kontrol | ❌ |
| 7 | /serial-numbers/new | 🟡 YÜKSEK - Seri no kaydı | ❌ |
| 8 | /stock | 🟢 ORTA - Stok görüntüleme | ❌ |

### Kontrol Noktaları:
- [ ] Tablolar yatay scroll ile kullanılabilir mi?
- [ ] Form alanları dar ekranda düzgün görünüyor mu?
- [ ] Butonlar tıklanabilir boyutta mı?
- [ ] Modal/Drawer'lar mobilde tam ekran açılıyor mu?
- [ ] DatePicker mobilde kullanılabilir mi?
- [ ] Select dropdown'ları mobilde scroll edilebilir mi?

### Viewport Boyutları:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1280px+

================================================================================
## 🔄 END-TO-END İŞ AKIŞI TESTLERİ
================================================================================

### E2E-1: Reorder Rules → Stock Alert Akışı
**Amaç**: Yeniden sipariş kurallarının stok uyarılarını tetiklemesi
**Önkoşul**: Test ürünü ve deposu mevcut
**Tahmini Süre**: 10-15 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /products | Test ürünü seç veya oluştur | Ürün ID not al | [x] ✅ Samsung Galaxy S24 (PRD-002) mevcut |
| 2 | /stock | Mevcut stok miktarını not al | Başlangıç: X adet | [x] ✅ Ana Depo: 90 adet |
| 3 | /reorder-rules/new | Yeni kural oluştur | Form açılır | [x] ✅ Form açıldı |
| 3a | | Ürün: Test ürünü | Seçildi | [x] ✅ PRD-002 - Samsung Galaxy S24 seçildi |
| 3b | | Min Stok: 10 | Girildi | [x] ✅ 10 girildi (varsayılan) |
| 3c | | Reorder Point: 20 | Girildi | [x] ✅ Gün cinsinden: 7 (varsayılan) |
| 3d | | Reorder Quantity: 50 | Girildi | [x] ✅ 100 girildi (varsayılan) |
| 3e | | Kaydet | "Başarılı" mesajı | [x] ✅ "Yeniden sipariş kuralı başarıyla oluşturuldu" mesajı alındı |
| 4 | /reorder-rules | Liste kontrol | Yeni kural listede | [x] 🐛 **BUG-E2E-002**: Kural listede görünmüyor! "0 Toplam Kural" |
| 5 | /stock-adjustments/new | Stoğu azalt | Form açılır | [ ] ⏳ BLOCKER: Kural listede yok |
| 5a | | Ürün: Test ürünü | Seçildi | [ ] ⏳ BLOCKER |
| 5b | | Fiili Miktar: 5 | Girildi | [ ] ⏳ BLOCKER |
| 5c | | Sebep: StockCountVariance | Seçildi | [ ] ⏳ BLOCKER |
| 5d | | Kaydet | "Başarılı" mesajı | [ ] ⏳ BLOCKER |
| 6 | /stock | Stok güncellendi mi? | Stok: 5 adet | [ ] ⏳ BLOCKER |
| 7 | /stock-alerts | Low stock uyarısı var mı? | Uyarı listede | [ ] ⏳ BLOCKER |
| 8 | /inventory | Dashboard widget kontrolü | Uyarı sayısı > 0 | [ ] ⏳ BLOCKER |

**🐛 BUG-E2E-002 - Kritik**:
- **Sayfa**: /inventory/reorder-rules (Liste sayfası)
- **Sorun**: Reorder rule başarılı mesajı alındı ama listede görünmüyor
- **Beklenen**: Oluşturulan kural listede "E2E Test Reorder Rule" adıyla görünmeli
- **Gerçek**: "Yeniden siparis kurali bulunamadi" - 0 kayıt
- **API**: GET /api/inventory/forecasting/reorder-rules => 200 (boş liste dönüyor)
- **Etki**: Reorder rules akışı tamamen bloklandı - kurallar kaydedilmiyor veya listeleme çalışmıyor
- **Tarih**: 2026-01-21

**Temizlik**: Test sonrası oluşturulan kuralı sil (N/A - kural görünmüyor)
**Test Durumu**: 🟡 KISMİ - Kural oluşturma formu çalışıyor ama listeleme blocker bug nedeniyle test edilemedi

---

### E2E-2: Stok Transfer Akışı
**Amaç**: Depolar arası stok transferinin doğru çalışması
**Önkoşul**: 2 depo, en az 100 adetlik stok
**Tahmini Süre**: 15-20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /warehouses | Depo A ve Depo B mevcudiyeti | 2 depo var | [x] ✅ 5 depo mevcut (Ana Depo, E-Ticaret Depo, Merkez Depo, Test Deposu, Yan Depo) |
| 2 | /stock | Depo A'da stok kontrol | ≥100 adet | [x] ✅ Ana Depo: Samsung Galaxy S24 = 90 adet |
| 2a | | Depo B'de stok kontrol | Not al: Y adet | [x] ✅ E-Ticaret Depo: Laptop = 5 adet |
| 3 | /stock-transfers/new | Transfer oluştur | Form açılır | [x] ✅ Form açıldı |
| 3a | | Kaynak Depo: Depo A | Seçildi | [x] ✅ Ana Depo (WH-001) seçildi |
| 3b | | Hedef Depo: Depo B | Seçildi | [x] ✅ E-Ticaret Depo (WH-ECOM) seçildi |
| 3c | | Ürün ekle | Ürün seçildi | [x] ✅ Samsung Galaxy S24 (PRD-002) seçildi |
| 3d | | Miktar: 50 | Girildi | [x] ✅ 10 adet girildi |
| 3e | | Kaydet | "Başarılı", transfer ID | [x] ✅ Transfer No: TR-E2E-TEST-001, "Transfer oluşturuldu" mesajı |
| 4 | /stock-transfers/[id] | Transfer detay | Status: Pending | [x] ✅ Status: Taslak (Draft) görünüyor |
| 4a | | Onayla butonu | Buton görünür | [x] ✅ "Onaya Gönder" butonu görünür |
| 4b | | Onayla | Status: Completed | [x] 🐛 **BUG-E2E-001**: Butona tıklandığında Modal.confirm açılmıyor, API çağrısı yapılmıyor |
| 5 | /stock | Depo A stok kontrolü | 100-50 = 50 adet | [ ] ⏳ BLOCKER: Transfer onaylanamadı |
| 5a | | Depo B stok kontrolü | Y+50 adet | [ ] ⏳ BLOCKER: Transfer onaylanamadı |
| 6 | /stock-movements | Hareket kayıtları | 2 kayıt (çıkış+giriş) | [ ] ⏳ BLOCKER: Transfer onaylanamadı |
| 6a | | Çıkış kaydı | Type: TransferOut, -50 | [ ] ⏳ BLOCKER |
| 6b | | Giriş kaydı | Type: TransferIn, +50 | [ ] ⏳ BLOCKER |
| 7 | /audit-trail | Denetim kaydı | Transfer log var | [ ] ⏳ BLOCKER |

**Edge Cases**:
- [ ] Yetersiz stok ile transfer deneme → Hata mesajı
- [ ] Aynı depoya transfer deneme → Engellenmeli
- [ ] Pending transfer iptal etme → İptal edilebilmeli

**🐛 BUG-E2E-001 - Kritik**:
- **Sayfa**: /inventory/stock-transfers/[id] (Detay sayfası)
- **Sorun**: "Onaya Gönder" butonu tıklandığında hiçbir şey olmuyor
- **Beklenen**: Modal.confirm açılmalı, API POST /stock-transfers/{id}/submit çağrılmalı
- **Gerçek**: Modal açılmıyor, API çağrısı yok, buton active state'de kalıyor
- **Dosya**: stocker-nextjs/src/app/(dashboard)/inventory/stock-transfers/[id]/page.tsx (satır 118-128)
- **Etki**: Transfer workflow tamamen bloklandı - Draft → Pending geçişi yapılamıyor
- **Tarih**: 2026-01-21

**Test Durumu**: 🟡 KISMİ - Transfer oluşturuldu ama onaylama blocker bug nedeniyle test edilemedi

---

### E2E-3: Raf Ömrü Uyarı Akışı
**Amaç**: Son kullanma tarihi yaklaşan ürünlerin uyarı üretmesi
**Önkoşul**: Lot takibi aktif ürün
**Tahmini Süre**: 15 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /products | Lot takibi aktif ürün bul/oluştur | trackLotBatch: true | [x] ✅ Samsung Galaxy S24 (PRD-002) lot takibi aktif - Mevcut lot: PRD-20260120-V7ZR (50 adet) |
| 2 | /shelf-life/rules/new | Raf ömrü kuralı oluştur | Form açılır | [ ] ⏳ Test edilmedi - ShelfLife API 404 hatası (önceki testlerde tespit) |
| 2a | | Ürün/Kategori seç | Seçildi | [ ] ⏳ BLOCKER |
| 2b | | Kural Tipi: Days | Seçildi | [ ] ⏳ BLOCKER |
| 2c | | Uyarı Günü: 30 | Girildi | [ ] ⏳ BLOCKER |
| 2d | | Kritik Günü: 7 | Girildi | [ ] ⏳ BLOCKER |
| 2e | | Aksiyon: Alert | Seçildi | [ ] ⏳ BLOCKER |
| 2f | | Kaydet | "Başarılı" mesajı | [ ] ⏳ BLOCKER |
| 3 | /shelf-life/rules | Kural listede | Görünür | [ ] ⏳ BLOCKER |
| 4 | /lot-batches/new | Yeni lot oluştur | Form açılır | [x] ✅ Form açıldı |
| 4a | | Ürün: Test ürünü | Seçildi | [x] 🐛 **BUG-E2E-003**: Ürün dropdown'da "Veri Yok" - lot takibi aktif ürünler listelenmiyor |
| 4b | | Lot No: TEST-LOT-001 | Girildi | [x] ✅ E2E-TEST-LOT-001 girildi |
| 4c | | SKT: Bugün + 25 gün | Tarih seçildi | [ ] ⏳ BLOCKER: Ürün seçilemiyor |
| 4d | | Miktar: 100 | Girildi | [ ] ⏳ BLOCKER |
| 4e | | Kaydet | "Başarılı" mesajı | [ ] ⏳ BLOCKER |
| 5 | /shelf-life | Dashboard kontrol | Expiring Soon listesi | [x] ✅ Sayfa açılıyor - 0 Toplam Lot (mevcut lot 363 gün sonra, uyarı eşiğinde değil) |
| 5a | | Test lotu görünür mü? | Listede var | [ ] ⏳ BLOCKER: Test lotu oluşturulamadı |
| 6 | /stock-alerts | Expiry alert kontrolü | Alert type: Expiry | [ ] ⏳ BLOCKER |
| 7 | /inventory | Widget kontrolü | Expiry count > 0 | [ ] ⏳ BLOCKER |

**Edge Cases**:
- [ ] SKT geçmiş lot oluşturma → Uyarı/engel
- [ ] Kritik eşik altı lot → Kritik uyarı rengi
- [ ] Expired lot → Farklı status/aksiyon

**🐛 BUG-E2E-003 - Kritik**:
- **Sayfa**: /inventory/lot-batches (Yeni Lot Modal)
- **Sorun**: Ürün dropdown'unda "Veri Yok" görünüyor - lot takibi aktif ürünler listelenmiyor
- **Beklenen**: trackLotBatch: true olan ürünler dropdown'da listelenmeli (Samsung Galaxy S24 görünmeli)
- **Gerçek**: "Veri Yok" - dropdown boş
- **Not**: Mevcut PRD-20260120-V7ZR lotu var, yani Samsung Galaxy S24'te lot takibi aktif
- **Etki**: Yeni lot oluşturulamıyor, raf ömrü E2E test akışı bloklandı
- **Tarih**: 2026-01-21

**Test Durumu**: 🟡 KISMİ - Shelf Life ve Lot sayfaları açılıyor, mevcut lot görünüyor ama yeni lot oluşturulamıyor

---

### E2E-4: Stok Sayımı Akışı
**Amaç**: Fiziksel sayım ve fark düzeltme sürecinin çalışması
**Önkoşul**: Bilinen miktarda stok
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /stock | Başlangıç stoku not al | Sistem: 100 adet | [ ] |
| 2 | /stock-counts/new | Sayım başlat | Form açılır | [ ] |
| 2a | | Depo seç | Seçildi | [ ] |
| 2b | | Sayım tipi: Full | Seçildi | [ ] |
| 2c | | Ürün ekle | Test ürünü eklendi | [ ] |
| 2d | | Kaydet | Sayım ID oluştu | [ ] |
| 3 | /stock-counts/[id] | Sayım detay | Status: InProgress | [ ] |
| 3a | | Sistem miktarı gösteriliyor | 100 adet | [ ] |
| 4 | | Fiili miktar gir: 95 | Girildi | [ ] |
| 4a | | Fark hesaplandı mı? | Fark: -5 | [ ] |
| 4b | | Sayımı tamamla | Status: Completed | [ ] |
| 5 | /stock-adjustments | Otomatik düzeltme oluştu mu? | Adjustment kaydı | [ ] |
| 5a | | Düzeltme tipi | Decrease | [ ] |
| 5b | | Miktar | 5 adet | [ ] |
| 5c | | Sebep | StockCountVariance | [ ] |
| 6 | /stock | Güncel stok kontrolü | 95 adet | [ ] |
| 7 | /stock-movements | Hareket kaydı | CountAdjustment, -5 | [ ] |
| 8 | /audit-trail | Denetim kaydı | Count + Adjustment log | [ ] |

**Edge Cases**:
- [ ] Sistem = Fiili (fark yok) → Düzeltme oluşmamalı
- [ ] Negatif fark → Decrease adjustment
- [ ] Pozitif fark → Increase adjustment
- [ ] Sayım iptal → Düzeltme oluşmamalı

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-5: Tedarikçi Sipariş Önerisi
**Amaç**: Düşük stok → Tedarikçi sipariş önerisi akışı
**Önkoşul**: Tedarikçi, ürün ilişkisi, reorder rule
**Tahmini Süre**: 15 dakika
**Not**: Cross-module test (Inventory + Purchase)

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /suppliers | Test tedarikçisi var mı? | Tedarikçi ID | [ ] |
| 2 | /suppliers/[id]/products | Ürün-tedarikçi ilişkisi | En az 1 ürün | [ ] |
| 2a | | Birim fiyat tanımlı mı? | Fiyat > 0 | [ ] |
| 3 | /reorder-rules | Ürün için kural var mı? | Kural mevcut | [ ] |
| 3a | | Min stok değeri | 10 adet | [ ] |
| 3b | | Reorder quantity | 50 adet | [ ] |
| 4 | /stock | Stoğu min altına düşür | Stok: 8 adet | [ ] |
| 5 | /stock-alerts | Low stock alert | Görünür | [ ] |
| 6 | [Purchase Module] | Sipariş önerisi kontrolü | - | [ ] |
| 6a | /purchase/suggestions | Öneri listesi | Test ürünü var | [ ] |
| 6b | | Tedarikçi önerisi | Doğru tedarikçi | [ ] |
| 6c | | Önerilen miktar | 50 adet | [ ] |
| 6d | | Tahmini maliyet | Fiyat x 50 | [ ] |
| 7 | | Sipariş oluştur | PO draft oluştu | [ ] |

**Entegrasyon Noktaları**:
- Inventory → Purchase: Reorder trigger
- Purchase → Inventory: PO receipt → Stock increase

**Test Durumu**: ❌ TEST EDİLMEDİ (Cross-module)

---

### E2E-6: Seri Numarası Takip Akışı
**Amaç**: Seri numaralı ürün yaşam döngüsü takibi
**Önkoşul**: Seri takibi aktif ürün
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /products | Seri takibi aktif ürün | trackSerialNumber: true | [ ] |
| 2 | /serial-numbers/new | Yeni seri no oluştur | Form açılır | [ ] |
| 2a | | Ürün seç | Test ürünü | [ ] |
| 2b | | Seri No: SN-TEST-001 | Girildi | [ ] |
| 2c | | Status: Available | Seçildi | [ ] |
| 2d | | Kaydet | "Başarılı" mesajı | [ ] |
| 3 | /serial-numbers | Listede görünür | SN-TEST-001 | [ ] |
| 4 | /stock | Stok +1 artı mı? | Evet | [ ] |
| 5 | /stock-transfers/new | Seri no ile transfer | Form açılır | [ ] |
| 5a | | Seri no seç: SN-TEST-001 | Seçildi | [ ] |
| 5b | | Transfer oluştur | Transfer başarılı | [ ] |
| 6 | /serial-numbers/[id] | Status değişti mi? | InTransit | [ ] |
| 7 | /stock-transfers/[id] | Transfer onayla | Completed | [ ] |
| 8 | /serial-numbers/[id] | Status güncellendi mi? | Available (yeni depo) | [ ] |
| 9 | | Hareket geçmişi | Transfer kaydı var | [ ] |

**Edge Cases**:
- [ ] Aynı seri no tekrar oluşturma → Engellenmeli
- [ ] Sold seri no transfer → Engellenmeli
- [ ] Seri no arama (barkod lookup) → Doğru kayıt

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-7: Konsinye Stok Akışı
**Amaç**: Konsinye stok alım ve satış süreci
**Önkoşul**: Tedarikçi, depo, ürün
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /consignment-stocks/new | Konsinye giriş | Form açılır | [ ] |
| 1a | | Tedarikçi seç | Seçildi | [ ] |
| 1b | | Depo seç | Seçildi | [ ] |
| 1c | | Ürün ekle | Test ürünü | [ ] |
| 1d | | Miktar: 100 | Girildi | [ ] |
| 1e | | Birim maliyet: 10₺ | Girildi | [ ] |
| 1f | | Kaydet | "Başarılı" mesajı | [ ] |
| 2 | /consignment-stocks | Listede görünür | Status: Active | [ ] |
| 3 | /stock | Stok artış kontrolü | +100 (konsinye) | [ ] |
| 3a | | Konsinye vs Own ayrımı | Görünür | [ ] |
| 4 | [Sales] | Satış yap (50 adet) | Satış başarılı | [ ] |
| 5 | /consignment-stocks/[id] | Kalan miktar | 50 adet | [ ] |
| 5a | | Satılan miktar | 50 adet | [ ] |
| 5b | | Borç tutarı | 50 x 10₺ = 500₺ | [ ] |
| 6 | /consignment-stocks/[id] | Tedarikçiye ödeme | Ödeme kaydı | [ ] |
| 7 | | Konsinyeyi kapat | Status: Closed | [ ] |

**Edge Cases**:
- [ ] Konsinye iade → Tedarikçiye geri gönder
- [ ] Kısmi satış + iade kombinasyonu
- [ ] Konsinye expired lot kontrolü

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-8: Çoklu Depo Stok Görünümü
**Amaç**: Tüm depolardaki stokların doğru gösterimi
**Önkoşul**: En az 3 depo, farklı stoklarla
**Tahmini Süre**: 10 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /stock | Filtre: Tüm depolar | Toplam stok görünür | [ ] |
| 1a | | Depo bazlı breakdown | Her depo ayrı satır | [ ] |
| 2 | | Filtre: Depo A | Sadece Depo A stoku | [ ] |
| 3 | | Filtre: Depo B | Sadece Depo B stoku | [ ] |
| 4 | | Ürün ara | Ürün tüm depolarda | [ ] |
| 5 | | Export (Excel) | Tüm veri export | [ ] |
| 5a | | Export doğrulama | Veriler tutarlı | [ ] |
| 6 | /analytics | Depo karşılaştırma | Grafikler doğru | [ ] |
| 7 | /inventory | Dashboard totals | Tüm depolar toplamı | [ ] |

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-9: Ürün Varyant Stok Yönetimi
**Amaç**: Varyantlı ürünlerde stok takibinin doğruluğu
**Önkoşul**: Varyantlı ürün (renk/beden)
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /products/new | Ana ürün oluştur | Ürün ID | [ ] |
| 1a | | hasVariants: true | Seçildi | [ ] |
| 2 | /product-variants/new | Varyant 1: Kırmızı-S | Oluşturuldu | [ ] |
| 2a | | Varyant 2: Kırmızı-M | Oluşturuldu | [ ] |
| 2b | | Varyant 3: Mavi-S | Oluşturuldu | [ ] |
| 3 | /stock-movements/new | Varyant 1'e stok giriş | 50 adet | [ ] |
| 3a | | Varyant 2'ye stok giriş | 30 adet | [ ] |
| 3b | | Varyant 3'e stok giriş | 20 adet | [ ] |
| 4 | /stock | Ana ürün stoku | Toplam: 100 | [ ] |
| 4a | | Varyant breakdown | 50+30+20 = 100 | [ ] |
| 5 | /products/[id] | Ürün detay stok | 100 adet | [ ] |
| 5a | | Varyant bazlı gösterim | Her varyant ayrı | [ ] |
| 6 | /stock-transfers/new | Varyant bazlı transfer | Sadece seçili varyant | [ ] |
| 7 | /stock-alerts | Varyant bazlı uyarı | Doğru varyant | [ ] |

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-10: Paket (Bundle) Stok Yönetimi
**Amaç**: Paket ürünlerde bileşen stok kontrolü
**Önkoşul**: Birden fazla ürün
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /stock | Bileşen A stoku | 100 adet | [ ] |
| 1a | | Bileşen B stoku | 50 adet | [ ] |
| 2 | /product-bundles/new | Paket oluştur | Form açılır | [ ] |
| 2a | | Bileşen A: 2 adet | Eklendi | [ ] |
| 2b | | Bileşen B: 1 adet | Eklendi | [ ] |
| 2c | | Kaydet | Paket ID | [ ] |
| 3 | /stock | Paket stoku hesapla | Min(100/2, 50/1) = 50 | [ ] |
| 4 | [Sales] | Paket sat (10 adet) | Satış başarılı | [ ] |
| 5 | /stock | Bileşen A stoku | 100-20 = 80 | [ ] |
| 5a | | Bileşen B stoku | 50-10 = 40 | [ ] |
| 5b | | Paket stoku | Min(80/2, 40/1) = 40 | [ ] |
| 6 | /stock-movements | Hareket kayıtları | Bileşen bazlı çıkış | [ ] |

**Edge Cases**:
- [ ] Bileşen yetersiz → Paket satılamaz
- [ ] Bileşen stok uyarısı → Paket uyarısı

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-11: Barkod ile Hızlı İşlem Akışı
**Amaç**: Barkod okutarak hızlı stok işlemleri yapabilme
**Önkoşul**: Barkod tanımlı ürünler
**Tahmini Süre**: 15 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /products/[id] | Ürüne barkod ekle | Barkod: 8690000000001 | [ ] |
| 2 | /barcodes | Barkod arama tab'ı | Sayfa açıldı | [ ] |
| 2a | | Barkod gir: 8690000000001 | Ürün bulundu | [ ] |
| 2b | | Ürün bilgileri görünür | Ad, stok, fiyat | [ ] |
| 3 | /stock-movements/new | Barkod ile ürün ekleme | Form açıldı | [ ] |
| 3a | | Barkod okut/gir | Ürün otomatik seçildi | [ ] |
| 3b | | Miktar gir: 10 | Girildi | [ ] |
| 3c | | Kaydet | Hareket oluştu | [ ] |
| 4 | /stock-counts/new | Barkod ile sayım | Form açıldı | [ ] |
| 4a | | Barkod tara | Ürün listeye eklendi | [ ] |
| 4b | | Fiili miktar gir | Girildi | [ ] |
| 5 | /stock-transfers/new | Barkod ile transfer | Form açıldı | [ ] |
| 5a | | Barkod tara | Ürün eklendi | [ ] |
| 6 | /barcodes | Toplu barkod tarama | Tab: Toplu Tarama | [ ] |
| 6a | | 5 barkod art arda | Tümü listeye eklendi | [ ] |

**Edge Cases**:
- [ ] Geçersiz barkod → "Ürün bulunamadı" mesajı
- [ ] Aynı barkod 2 kez → Miktar artırma seçeneği
- [ ] Barkod formatı kontrolü → EAN-13, UPC-A, Code128

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-12: Depo Lokasyon Yönetimi Akışı
**Amaç**: Depo içi lokasyon bazlı stok takibi
**Önkoşul**: Depo, bölge, lokasyon yapısı
**Tahmini Süre**: 25 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /warehouses/new | Depo oluştur | Depo ID: 1 | [ ] |
| 2 | /warehouse-zones/new | Bölge oluştur | Zone: A (Soğuk Depo) | [ ] |
| 2a | | Bölge 2 oluştur | Zone: B (Kuru Depo) | [ ] |
| 3 | /locations/new | Lokasyon oluştur | A-01-01 (Raf-Sıra-Kolon) | [ ] |
| 3a | | Lokasyon 2 oluştur | A-01-02 | [ ] |
| 3b | | Lokasyon 3 oluştur | B-01-01 | [ ] |
| 4 | /stock-movements/new | Lokasyona stok girişi | Ürün → A-01-01: 50 adet | [ ] |
| 4a | | Farklı lokasyona giriş | Ürün → B-01-01: 30 adet | [ ] |
| 5 | /stock | Lokasyon bazlı görüntüleme | A-01-01: 50, B-01-01: 30 | [ ] |
| 6 | /stock-transfers/new | Lokasyonlar arası transfer | A-01-01 → A-01-02: 20 | [ ] |
| 7 | /stock | Transfer sonrası kontrol | A-01-01: 30, A-01-02: 20 | [ ] |
| 8 | /locations/[id] | Lokasyon stok detayı | Tüm ürünler listesi | [ ] |
| 9 | /warehouse-zones/[id] | Bölge stok özeti | Zone A toplam stok | [ ] |

**Edge Cases**:
- [ ] Dolu lokasyon silme → Engellenmeli
- [ ] Lokasyon kapasitesi aşımı → Uyarı
- [ ] Lokasyon arama (barkod ile) → Hızlı erişim

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-13: Kalite Kontrol Akışı
**Amaç**: Mal kabul ve kalite kontrol sürecinin işleyişi
**Önkoşul**: Ürün, tedarikçi, depo
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | [Purchase] | Sipariş teslim alındı | GRN (Goods Receipt) | [ ] |
| 2 | /quality-control/new | Kalite kontrol başlat | Form açıldı | [ ] |
| 2a | | GRN seç | Teslim alınan ürünler | [ ] |
| 2b | | Kontrol tipi: Incoming | Seçildi | [ ] |
| 3 | | Kontrol kriterleri | Checklist görünür | [ ] |
| 3a | | Görsel kontrol: ✓ | Geçti | [ ] |
| 3b | | Ambalaj kontrolü: ✓ | Geçti | [ ] |
| 3c | | Miktar kontrolü: ✓ | Geçti | [ ] |
| 3d | | Belge kontrolü: ✓ | Geçti | [ ] |
| 4 | | Sonuç: Kabul | QC Status: Passed | [ ] |
| 4a | | Kaydet | "Başarılı" mesajı | [ ] |
| 5 | /stock | Stok güncellendi mi? | QC sonrası stok eklendi | [ ] |
| 6 | /quality-control/new | Kısmi red senaryosu | Form açıldı | [ ] |
| 6a | | 100 üründen 10'u hatalı | Red: 10 adet | [ ] |
| 6b | | Kabul: 90 adet | Kısmi kabul | [ ] |
| 7 | /stock | Sadece 90 adet eklendi | Doğru miktar | [ ] |
| 8 | [Returns] | Red edilen için iade | Tedarikçi iadesi | [ ] |

**Edge Cases**:
- [ ] Tümü red → Stok eklenmemeli
- [ ] QC bekleyen ürün satışa çıkmamalı
- [ ] QC raporu PDF export

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-14: Dönemsel Sayım (Cycle Count) Akışı
**Amaç**: ABC analizi bazlı dönemsel sayım yönetimi
**Önkoşul**: ABC sınıflandırması yapılmış ürünler
**Tahmini Süre**: 25 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /analysis | ABC analizi çalıştır | Ürünler sınıflandırıldı | [ ] |
| 1a | | A sınıfı: 20 ürün | Yüksek değerli | [ ] |
| 1b | | B sınıfı: 50 ürün | Orta değerli | [ ] |
| 1c | | C sınıfı: 130 ürün | Düşük değerli | [ ] |
| 2 | /cycle-counts/new | Dönemsel sayım planla | Form açıldı | [ ] |
| 2a | | Sayım tipi: ABC-based | Seçildi | [ ] |
| 2b | | A sınıfı frekansı: Haftalık | Ayarlandı | [ ] |
| 2c | | B sınıfı frekansı: Aylık | Ayarlandı | [ ] |
| 2d | | C sınıfı frekansı: Çeyreklik | Ayarlandı | [ ] |
| 2e | | Kaydet | Plan oluşturuldu | [ ] |
| 3 | /cycle-counts | Planlanan sayımlar | Takvim görünümü | [ ] |
| 4 | /cycle-counts/[id] | Bugünkü sayım başlat | A sınıfı 5 ürün | [ ] |
| 4a | | Ürün 1 sayıldı | Sistem: 100, Fiili: 98 | [ ] |
| 4b | | Ürün 2 sayıldı | Sistem: 50, Fiili: 50 | [ ] |
| 4c | | Sayımı tamamla | Fark raporu | [ ] |
| 5 | /stock-adjustments | Otomatik düzeltmeler | 2 adet eksik düzeltme | [ ] |
| 6 | /analytics | Sayım doğruluk oranı | Accuracy: 99.5% | [ ] |

**Edge Cases**:
- [ ] Sayım zamanı kaçırıldı → Uyarı
- [ ] Kritik fark eşiği → Yönetici onayı gerekli
- [ ] Sayım geçmişi ve trend analizi

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-15: Stok Maliyetlendirme Akışı
**Amaç**: Farklı maliyetlendirme yöntemlerinin doğru çalışması
**Önkoşul**: Farklı fiyatlarla alım yapılmış ürün
**Tahmini Süre**: 30 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /products/[id] | Maliyet yöntemi: FIFO | Ayarlandı | [ ] |
| 2 | /stock-movements/new | Alım 1: 100 adet x 10₺ | Toplam: 1000₺ | [ ] |
| 2a | | Alım 2: 50 adet x 12₺ | Toplam: 600₺ | [ ] |
| 2b | | Alım 3: 50 adet x 15₺ | Toplam: 750₺ | [ ] |
| 3 | /stock | Toplam stok: 200 adet | Toplam maliyet: 2350₺ | [ ] |
| 3a | | Ortalama maliyet | 2350/200 = 11.75₺ | [ ] |
| 4 | [Sales] | Satış: 120 adet | FIFO hesaplama | [ ] |
| 4a | | FIFO maliyeti | 100x10 + 20x12 = 1240₺ | [ ] |
| 5 | /stock | Kalan stok: 80 adet | Kalan maliyet: 1110₺ | [ ] |
| 5a | | Kalan avg maliyet | 1110/80 = 13.875₺ | [ ] |
| 6 | /costing | Maliyet raporu | FIFO detayları | [ ] |
| 7 | /products/[id] | Maliyet yöntemi: LIFO | Değiştirildi | [ ] |
| 8 | [Sales] | Yeni satış: 30 adet | LIFO hesaplama | [ ] |
| 8a | | LIFO maliyeti | 30x15 = 450₺ | [ ] |
| 9 | /products/[id] | Maliyet yöntemi: WAC | Değiştirildi | [ ] |
| 10 | /costing | Yöntem karşılaştırma | FIFO vs LIFO vs WAC | [ ] |

**Edge Cases**:
- [ ] Negatif stok maliyeti → Engellenmeli
- [ ] Maliyet yöntemi değişikliği → Geçmiş etkilenmemeli
- [ ] Dönem sonu maliyet raporu

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-16: Stok Rezervasyon Akışı
**Amaç**: Sipariş bazlı stok rezervasyonu
**Önkoşul**: Yeterli stok, aktif sipariş
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /stock | Başlangıç stoku: 100 | Available: 100 | [ ] |
| 2 | [Sales] | Sipariş oluştur: 30 adet | Sipariş ID: SO-001 | [ ] |
| 3 | /stock-reservations | Otomatik rezervasyon | 30 adet reserved | [ ] |
| 4 | /stock | Stok durumu kontrol | Total: 100, Available: 70, Reserved: 30 | [ ] |
| 5 | [Sales] | 2. sipariş: 50 adet | Sipariş ID: SO-002 | [ ] |
| 6 | /stock | Güncel durum | Total: 100, Available: 20, Reserved: 80 | [ ] |
| 7 | [Sales] | 3. sipariş: 30 adet | Yetersiz stok uyarısı? | [ ] |
| 7a | | Partial reserve? | 20 adet reserve, 10 backorder | [ ] |
| 8 | /stock-reservations | Rezervasyon listesi | 3 kayıt görünür | [ ] |
| 9 | [Sales] | SO-001 iptal | Sipariş iptal edildi | [ ] |
| 10 | /stock-reservations | Rezervasyon serbest | 30 adet released | [ ] |
| 11 | /stock | Güncel durum | Available: 50, Reserved: 50 | [ ] |
| 12 | [Sales] | SO-002 sevk et | Shipment oluşturuldu | [ ] |
| 13 | /stock | Sevk sonrası | Total: 50, Available: 50, Reserved: 0 | [ ] |

**Edge Cases**:
- [ ] Manuel rezervasyon iptali → Yetki kontrolü
- [ ] Rezervasyon süresi dolması → Auto-release
- [ ] Partial shipment → Kalan rezervasyon

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-17: Tedarikçi Fiyat Listesi Akışı
**Amaç**: Tedarikçi bazlı fiyat yönetimi ve karşılaştırma
**Önkoşul**: Birden fazla tedarikçi, aynı ürün
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /suppliers | 3 tedarikçi mevcut | A, B, C tedarikçileri | [ ] |
| 2 | /price-lists/new | Tedarikçi A fiyat listesi | Form açıldı | [ ] |
| 2a | | Ürün X: 10₺ | Eklendi | [ ] |
| 2b | | Ürün Y: 25₺ | Eklendi | [ ] |
| 2c | | Geçerlilik: 01/01 - 31/12 | Ayarlandı | [ ] |
| 2d | | Kaydet | Liste oluşturuldu | [ ] |
| 3 | /price-lists/new | Tedarikçi B fiyat listesi | Form açıldı | [ ] |
| 3a | | Ürün X: 9₺ | Eklendi | [ ] |
| 3b | | Ürün Y: 28₺ | Eklendi | [ ] |
| 4 | /price-lists/new | Tedarikçi C fiyat listesi | Form açıldı | [ ] |
| 4a | | Ürün X: 11₺ | Eklendi | [ ] |
| 4b | | Ürün Y: 22₺ | Eklendi | [ ] |
| 5 | /products/[X] | Fiyat karşılaştırma | En ucuz: B (9₺) | [ ] |
| 6 | /products/[Y] | Fiyat karşılaştırma | En ucuz: C (22₺) | [ ] |
| 7 | [Purchase] | Sipariş önerisi | X: Ted.B, Y: Ted.C | [ ] |
| 8 | /price-lists | Toplu fiyat güncelleme | %5 zam uygula | [ ] |
| 9 | /price-lists/[id] | Fiyat geçmişi | Değişiklik logu | [ ] |

**Edge Cases**:
- [ ] Geçerlilik süresi dolmuş fiyat → Uyarı
- [ ] Minimum sipariş miktarı → Fiyat kırılımları
- [ ] Döviz bazlı fiyat listesi → Kur hesaplama

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-18: Stok Tahminleme Akışı
**Amaç**: Geçmiş verilere dayalı stok tahmini
**Önkoşul**: En az 3 aylık satış verisi
**Tahmini Süre**: 15 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /forecasting | Tahmin sayfası | Dashboard yüklendi | [ ] |
| 2 | | Ürün seç: Test ürünü | Seçildi | [ ] |
| 3 | | Tahmin periyodu: 3 ay | Ayarlandı | [ ] |
| 4 | | Tahmin hesapla | Sonuç gösterildi | [ ] |
| 4a | | Ay 1 tahmini | X adet | [ ] |
| 4b | | Ay 2 tahmini | Y adet | [ ] |
| 4c | | Ay 3 tahmini | Z adet | [ ] |
| 5 | | Güven aralığı | %95 confidence | [ ] |
| 6 | | Sezonsal pattern | Grafik görünür | [ ] |
| 7 | | Sipariş önerisi | Reorder tavsiyesi | [ ] |
| 8 | /analytics | Tahmin doğruluğu | MAPE, MAE metrikleri | [ ] |
| 9 | | Geçmiş tahminler | Tahmin vs Gerçek | [ ] |
| 10 | /reorder-rules | Tahmini kullanarak kural | Dynamic reorder point | [ ] |

**Edge Cases**:
- [ ] Yetersiz veri → "Veri yetersiz" uyarısı
- [ ] Aykırı değerler (outliers) → Filtreleme seçeneği
- [ ] Yeni ürün (veri yok) → Manuel tahmin girişi

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-19: Denetim İzi (Audit Trail) Akışı
**Amaç**: Tüm stok işlemlerinin tam izlenebilirliği
**Önkoşul**: Çeşitli stok işlemleri yapılmış olmalı
**Tahmini Süre**: 15 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /audit-trail | Sayfa açıldı | Tüm loglar listelendi | [ ] |
| 2 | | Filtre: Bugün | Son 24 saat logları | [ ] |
| 3 | | Filtre: Ürün X | Ürüne özel loglar | [ ] |
| 4 | | Filtre: Kullanıcı Y | Kullanıcı işlemleri | [ ] |
| 5 | | Filtre: İşlem tipi = Transfer | Transferler | [ ] |
| 6 | | Log detay görüntüle | Kim, ne, ne zaman, nerede | [ ] |
| 6a | | Önceki değer | Before: 100 | [ ] |
| 6b | | Sonraki değer | After: 80 | [ ] |
| 6c | | IP adresi | Kayıtlı | [ ] |
| 7 | | Export (Excel) | Tüm loglar export | [ ] |
| 8 | | Export (PDF) | Rapor formatı | [ ] |
| 9 | /stock | Ürün stok geçmişi | Timeline görünümü | [ ] |
| 10 | /products/[id] | Ürün audit trail | Ürüne özel değişiklikler | [ ] |

**Edge Cases**:
- [ ] Silinen kayıt logu → Soft delete görünür
- [ ] Toplu işlem logu → Batch ID ile gruplanmış
- [ ] Log saklama süresi → Retention policy

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-20: Multi-Warehouse Transfer Zinciri
**Amaç**: Çoklu depo arası zincirleme transfer
**Önkoşul**: En az 3 depo (Merkez, Bölge, Şube)
**Tahmini Süre**: 25 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /warehouses | 3 depo doğrulama | Merkez, Bölge, Şube | [ ] |
| 2 | /stock | Merkez stoku: 1000 | Başlangıç durumu | [ ] |
| 2a | | Bölge stoku: 0 | Boş | [ ] |
| 2b | | Şube stoku: 0 | Boş | [ ] |
| 3 | /stock-transfers/new | Merkez → Bölge: 500 | Transfer 1 oluşturuldu | [ ] |
| 4 | /stock-transfers/[1] | Transfer 1 onayla | Completed | [ ] |
| 5 | /stock | Merkez: 500, Bölge: 500 | Güncel durum | [ ] |
| 6 | /stock-transfers/new | Bölge → Şube: 200 | Transfer 2 oluşturuldu | [ ] |
| 7 | /stock-transfers/[2] | Transfer 2 onayla | Completed | [ ] |
| 8 | /stock | Final durum | M:500, B:300, Ş:200 | [ ] |
| 9 | /stock-movements | Hareket zinciri | Tüm transferler görünür | [ ] |
| 10 | /analytics | Depo akış analizi | Sankey diagram | [ ] |
| 11 | /stock-transfers | Toplu transfer | Excel import ile | [ ] |

**Edge Cases**:
- [ ] Transit sırasında 2. transfer → Engellemeli veya uyarı
- [ ] Transfer iptal zinciri → Geri alma senaryosu
- [ ] Kısmi teslim → Partial receipt

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-21: Negatif Stok Yönetimi
**Amaç**: Negatif stok senaryolarının kontrolü
**Önkoşul**: Sistem ayarı: Negatif stok izinli/yasaklı
**Tahmini Süre**: 15 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | [Settings] | Negatif stok: Yasaklı | Ayar kaydedildi | [ ] |
| 2 | /stock | Ürün stoku: 10 adet | Başlangıç | [ ] |
| 3 | [Sales] | Satış: 15 adet | Hata: Yetersiz stok | [ ] |
| 4 | /stock-adjustments/new | -15 düzeltme | Hata: Negatif olmaz | [ ] |
| 5 | [Settings] | Negatif stok: İzinli | Ayar değiştirildi | [ ] |
| 6 | [Sales] | Satış: 15 adet | Satış başarılı | [ ] |
| 7 | /stock | Stok durumu | -5 adet (negatif) | [ ] |
| 8 | /stock-alerts | Negatif stok uyarısı | Kritik uyarı | [ ] |
| 9 | /stock-movements/new | Stok girişi: 20 adet | Giriş başarılı | [ ] |
| 10 | /stock | Stok durumu | 15 adet (pozitif) | [ ] |
| 11 | /analytics | Negatif stok raporu | Tarihçe görünür | [ ] |

**Edge Cases**:
- [ ] Varyant bazlı negatif → Ana ürün pozitif ama varyant negatif
- [ ] Lokasyon bazlı negatif → Toplam pozitif ama lokasyon negatif
- [ ] Negatif maliyet hesaplama → WAC negatif stokta

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-22: Ürün Birleştirme/Ayrıştırma
**Amaç**: Ürün dönüşüm işlemleri (Kit assembly/disassembly)
**Önkoşul**: Paket ürün ve bileşenleri
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /stock | Bileşen A: 100, B: 100 | Başlangıç stokları | [ ] |
| 1a | | Paket P: 0 | Paket stoku yok | [ ] |
| 2 | /stock-adjustments/new | Assembly işlemi | Form açıldı | [ ] |
| 2a | | İşlem tipi: Assembly | Seçildi | [ ] |
| 2b | | Paket: P (10 adet) | Üretilecek miktar | [ ] |
| 2c | | Bileşenler otomatik | A: 20, B: 10 (x10) | [ ] |
| 2d | | Kaydet | Assembly başarılı | [ ] |
| 3 | /stock | Güncel stoklar | A:80, B:90, P:10 | [ ] |
| 4 | /stock-movements | Hareket kayıtları | Assembly kaydı | [ ] |
| 5 | /stock-adjustments/new | Disassembly işlemi | Form açıldı | [ ] |
| 5a | | İşlem tipi: Disassembly | Seçildi | [ ] |
| 5b | | Paket: P (5 adet) | Ayrıştırılacak | [ ] |
| 5c | | Bileşenler otomatik | A: +10, B: +5 | [ ] |
| 5d | | Kaydet | Disassembly başarılı | [ ] |
| 6 | /stock | Final stoklar | A:90, B:95, P:5 | [ ] |
| 7 | /costing | Maliyet hesaplama | Assembly maliyeti | [ ] |

**Edge Cases**:
- [ ] Yetersiz bileşen → Assembly engellemesi
- [ ] Kısmi assembly → İzin var mı?
- [ ] Scrap/fire (hurda) → Disassembly sonucu kayıp

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-23: Stok Uyarı Bildirimleri
**Amaç**: Stok uyarılarının bildirim sistemi
**Önkoşul**: E-posta/SMS yapılandırması
**Tahmini Süre**: 15 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | [Settings] | Bildirim ayarları | Sayfa açıldı | [ ] |
| 1a | | Low stock: E-posta | Aktif | [ ] |
| 1b | | Expiry: E-posta + SMS | Aktif | [ ] |
| 1c | | Negative: SMS | Aktif | [ ] |
| 2 | /reorder-rules/new | Kural oluştur (Min:10) | Oluşturuldu | [ ] |
| 3 | /stock-adjustments/new | Stoğu 5'e düşür | Adjustment başarılı | [ ] |
| 4 | /stock-alerts | Low stock uyarısı | Görünür | [ ] |
| 5 | [E-posta] | Bildirim geldi mi? | E-posta alındı | [ ] |
| 6 | /lot-batches/new | SKT yakın lot oluştur | Lot oluşturuldu | [ ] |
| 7 | /stock-alerts | Expiry uyarısı | Görünür | [ ] |
| 8 | [E-posta + SMS] | Bildirimler geldi mi? | Alındı | [ ] |
| 9 | [Settings] | Bildirim geçmişi | Gönderim logları | [ ] |
| 10 | | Bildirim sıklığı | Anlık/Günlük özet | [ ] |

**Edge Cases**:
- [ ] Bildirim kapatma → Susturma (mute) özelliği
- [ ] Eskalasyon → 24 saat içinde aksiyon yoksa yöneticiye
- [ ] Bildirim limiti → Flood protection

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-24: Dashboard Widget'ları Akışı
**Amaç**: Ana sayfa widget'larının doğru veri gösterimi
**Önkoşul**: Çeşitli stok verileri
**Tahmini Süre**: 15 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /inventory | Dashboard yüklendi | Tüm widget'lar | [ ] |
| 2 | | Toplam Stok Değeri | Doğru hesaplama | [ ] |
| 3 | | Low Stock Sayısı | /stock-alerts ile tutarlı | [ ] |
| 4 | | Expiring Soon Sayısı | /shelf-life ile tutarlı | [ ] |
| 5 | | Bugünkü Hareketler | /stock-movements ile tutarlı | [ ] |
| 6 | | Depo Doluluk Oranı | Doğru yüzde | [ ] |
| 7 | | Son 7 Gün Grafiği | Trend doğru | [ ] |
| 8 | | Top 10 Ürün | Stok değerine göre | [ ] |
| 9 | | Bekleyen Transferler | Pending transfers | [ ] |
| 10 | | Widget tıklama | İlgili sayfaya yönlendirme | [ ] |
| 11 | | Widget refresh | Manuel yenileme | [ ] |
| 12 | | Widget özelleştirme | Sıralama, gizleme | [ ] |

**Edge Cases**:
- [ ] Veri yokken widget → "Veri yok" mesajı
- [ ] Yavaş yükleme → Loading skeleton
- [ ] Hata durumu → Retry butonu

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-25: Rapor Export Akışı
**Amaç**: Tüm raporların farklı formatlarda export edilmesi
**Önkoşul**: Yeterli veri
**Tahmini Süre**: 20 dakika

| Adım | Sayfa | İşlem | Beklenen Sonuç | Kontrol |
|------|-------|-------|----------------|---------|
| 1 | /stock | Stok listesi | Veri yüklendi | [ ] |
| 2 | | Export: Excel | .xlsx indirildi | [ ] |
| 2a | | Excel doğrulama | Tüm kolonlar var | [ ] |
| 3 | | Export: CSV | .csv indirildi | [ ] |
| 3a | | CSV encoding | UTF-8 Türkçe karakterler | [ ] |
| 4 | | Export: PDF | .pdf indirildi | [ ] |
| 4a | | PDF formatı | Tablo düzgün | [ ] |
| 5 | /analytics | Analiz raporu | Veri yüklendi | [ ] |
| 5a | | Grafik export | PNG/SVG | [ ] |
| 6 | /audit-trail | Denetim raporu | Veri yüklendi | [ ] |
| 6a | | Export: PDF | Detaylı rapor | [ ] |
| 7 | /costing | Maliyet raporu | Veri yüklendi | [ ] |
| 7a | | Export: Excel | Hesaplamalar doğru | [ ] |
| 8 | /forecasting | Tahmin raporu | Veri yüklendi | [ ] |
| 8a | | Export: PDF | Grafik + tablo | [ ] |
| 9 | | Zamanlanmış rapor | Haftalık e-posta | [ ] |

**Edge Cases**:
- [ ] Büyük veri seti → Asenkron export
- [ ] Export sırasında hata → Retry seçeneği
- [ ] Özel rapor şablonu → Template kaydetme

**Test Durumu**: ❌ TEST EDİLMEDİ

---

### E2E-26: Ürün CRUD Tam Döngüsü
**Amaç**: Ürün yaşam döngüsünün tam testi | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | /products/new → Form doldur (Ad, Kod, Kategori, Marka, Birim, Fiyat) | Kayıt başarılı | [ ] |
| 2 | /products → Liste kontrolü | Ürün görünür | [ ] |
| 3 | /products/[id] → Detay | Bilgiler doğru | [ ] |
| 4 | /products/[id]/edit → Fiyat güncelle | Güncellendi | [ ] |
| 5 | Sil → Onayla | Silindi, listede yok | [ ] |

**Test Durumu**: ❌

---

### E2E-27: Kategori Hiyerarşisi
**Amaç**: Alt kategori yapısı | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Ana kategori: Elektronik | Oluşturuldu | [ ] |
| 2 | Alt kategori: Telefon (Parent: Elektronik) | Hiyerarşi doğru | [ ] |
| 3 | Alt-alt: Akıllı Telefon (Parent: Telefon) | 3 seviye | [ ] |
| 4 | /categories → Tree görünümü | Yapı doğru | [ ] |
| 5 | Ana kategori sil | Alt kategori uyarısı | [ ] |

**Test Durumu**: ❌

---

### E2E-28: Ürün Arama/Filtreleme
**Amaç**: Gelişmiş arama | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | İsme göre ara | Filtrelendi | [ ] |
| 2 | Koda göre ara | Bulundu | [ ] |
| 3 | Kategori filtresi | Doğru ürünler | [ ] |
| 4 | Fiyat aralığı (Min-Max) | Filtrelendi | [ ] |
| 5 | Stok durumu (Var/Yok) | Filtrelendi | [ ] |
| 6 | Çoklu filtre kombinasyonu | Çalışıyor | [ ] |

**Test Durumu**: ❌

---

### E2E-29: Toplu Ürün İşlemleri
**Amaç**: Bulk operasyonlar | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | 5 ürün seç → Toplu pasif yap | 5 ürün pasif | [ ] |
| 2 | 3 ürün seç → Kategori değiştir | Güncellendi | [ ] |
| 3 | 2 ürün seç → Toplu sil | Silindi | [ ] |
| 4 | Excel import | X ürün eklendi | [ ] |
| 5 | Excel export | Dosya indirildi | [ ] |

**Test Durumu**: ❌

---

### E2E-30: Ürün Görselleri
**Amaç**: Görsel yönetimi | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Görsel yükle (JPG/PNG) | Upload başarılı | [ ] |
| 2 | Çoklu görsel ekle | Galeri oluştu | [ ] |
| 3 | Ana görsel seç | Primary işaretlendi | [ ] |
| 4 | Sıralama (drag-drop) | Sıra değişti | [ ] |
| 5 | Görsel sil | Silindi | [ ] |

**Test Durumu**: ❌

---

### E2E-31: Depo CRUD
**Amaç**: Depo yaşam döngüsü | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Yeni depo (Ad, Kod, Adres) | Oluşturuldu | [ ] |
| 2 | Liste kontrolü | Görünür | [ ] |
| 3 | Detay sayfası | Bilgiler doğru | [ ] |
| 4 | Düzenleme | Güncellendi | [ ] |
| 5 | Silme (boş depo) | Silindi | [ ] |
| 6 | Silme (dolu depo) | Engellendi | [ ] |

**Test Durumu**: ❌

---

### E2E-32: Depo Bölge/Lokasyon
**Amaç**: Depo içi yapılandırma | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Bölge oluştur: Zone-A | Oluşturuldu | [ ] |
| 2 | Lokasyon: A-01-01 | Oluşturuldu | [ ] |
| 3 | Lokasyon: A-01-02 | Oluşturuldu | [ ] |
| 4 | Stok girişi → Lokasyona | Lokasyon stoku | [ ] |
| 5 | Lokasyonlar arası transfer | Başarılı | [ ] |

**Test Durumu**: ❌

---

### E2E-33: Stok Hareket Tipleri
**Amaç**: Tüm hareket tiplerinin testi | **Süre**: 25 dk

| Adım | Tip | Miktar | Beklenen Stok | ✓ |
|------|-----|--------|---------------|---|
| 1 | Satın Alma | +50 | 50 | [ ] |
| 2 | Satış | -20 | 30 | [ ] |
| 3 | Müşteri İadesi | +5 | 35 | [ ] |
| 4 | Tedarikçi İadesi | -10 | 25 | [ ] |
| 5 | Düzeltme (+) | +3 | 28 | [ ] |
| 6 | Düzeltme (-) | -2 | 26 | [ ] |
| 7 | Fire/Hurda | -1 | 25 | [ ] |

**Test Durumu**: ❌

---

### E2E-34: Tedarikçi Yönetimi
**Amaç**: Tedarikçi tam akışı | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Yeni tedarikçi (Firma, Vergi No, İletişim) | Oluşturuldu | [ ] |
| 2 | Ürün ilişkilendir + Fiyat | Eklendi | [ ] |
| 3 | Tedarikçi detayda ürün listesi | Görünür | [ ] |
| 4 | Ürün detayda tedarikçi listesi | Görünür | [ ] |
| 5 | En ucuz tedarikçi önerisi | Doğru hesaplama | [ ] |

**Test Durumu**: ❌

---

### E2E-35: Birim Dönüşümleri
**Amaç**: Birim çevrimi | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Ana birim: Adet | Oluşturuldu | [ ] |
| 2 | Alt birim: Düzine (12 adet) | Oluşturuldu | [ ] |
| 3 | Alt birim: Koli (24 adet) | Oluşturuldu | [ ] |
| 4 | 2 Koli giriş | +48 adet stok | [ ] |
| 5 | Stok görünümü | 48 adet = 4 düzine = 2 koli | [ ] |

**Test Durumu**: ❌

---

### E2E-36: Transfer Durumları
**Amaç**: Transfer state machine | **Süre**: 20 dk

| Adım | İşlem | Status | ✓ |
|------|-------|--------|---|
| 1 | Transfer oluştur | Draft | [ ] |
| 2 | Submit | Pending | [ ] |
| 3 | Approve | Approved | [ ] |
| 4 | Ship | InTransit | [ ] |
| 5 | Receive | Completed | [ ] |
| 6 | Alternatif: Reject | Rejected | [ ] |
| 7 | Alternatif: Cancel | Cancelled | [ ] |

**Test Durumu**: ❌

---

### E2E-37: Kısmi Transfer
**Amaç**: Partial shipment/receipt | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Transfer: 100 adet | Oluşturuldu | [ ] |
| 2 | Kısmi sevk: 60 adet | Partial shipment | [ ] |
| 3 | Kaynak stok kontrolü | -60 | [ ] |
| 4 | Kalan sevk: 40 adet | Complete shipment | [ ] |
| 5 | Kısmi teslim: 80 adet | Partial receipt | [ ] |
| 6 | Fark kaydı | 20 adet eksik | [ ] |

**Test Durumu**: ❌

---

### E2E-38: Sayım Tipleri
**Amaç**: Farklı sayım metodları | **Süre**: 20 dk

| Adım | Tip | Açıklama | ✓ |
|------|-----|----------|---|
| 1 | Full Count | Tüm ürünler | [ ] |
| 2 | Partial Count | Seçili ürünler | [ ] |
| 3 | Blind Count | Sistem miktarı gizli | [ ] |
| 4 | Cycle Count | ABC bazlı periyodik | [ ] |
| 5 | Location Count | Lokasyon bazlı | [ ] |

**Test Durumu**: ❌

---

### E2E-39: Lot/Batch Takibi
**Amaç**: Lot yaşam döngüsü | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Lot takipli ürün oluştur | trackLotBatch: true | [ ] |
| 2 | Lot girişi (LOT-001, SKT, Miktar) | Lot oluştu | [ ] |
| 3 | Farklı lot girişi (LOT-002) | 2. lot | [ ] |
| 4 | FEFO satış | İlk expire olan çıkar | [ ] |
| 5 | Lot bazlı stok raporu | Lot detayları | [ ] |
| 6 | Lot izlenebilirlik | Giriş→Çıkış zinciri | [ ] |

**Test Durumu**: ❌

---

### E2E-40: Seri No Durumları
**Amaç**: Serial number state machine | **Süre**: 15 dk

| Adım | Status | Geçiş | ✓ |
|------|--------|-------|---|
| 1 | Available | Yeni giriş | [ ] |
| 2 | Reserved | Sipariş rezerve | [ ] |
| 3 | Sold | Satış tamamlandı | [ ] |
| 4 | InTransit | Transfer sırasında | [ ] |
| 5 | Returned | Müşteri iadesi | [ ] |
| 6 | Defective | Arızalı | [ ] |
| 7 | Scrapped | Hurda | [ ] |

**Test Durumu**: ❌

---

### E2E-41: ABC-XYZ Analizi
**Amaç**: Stok sınıflandırma | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | ABC analizi çalıştır | A/B/C sınıfları | [ ] |
| 2 | XYZ analizi çalıştır | X/Y/Z sınıfları | [ ] |
| 3 | Matris görünümü | AX, AY, AZ... CZ | [ ] |
| 4 | Filtreleme (sadece A) | A sınıfı ürünler | [ ] |
| 5 | Reorder rule önerisi | ABC bazlı frekans | [ ] |

**Test Durumu**: ❌

---

### E2E-42: Stok Değerleme
**Amaç**: Envanter değeri hesaplama | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Toplam stok değeri | Doğru hesaplama | [ ] |
| 2 | Depo bazlı değer | Her depo ayrı | [ ] |
| 3 | Kategori bazlı değer | Kategori toplamları | [ ] |
| 4 | Dönemsel karşılaştırma | Bu ay vs Geçen ay | [ ] |
| 5 | Değer trend grafiği | Son 12 ay | [ ] |

**Test Durumu**: ❌

---

### E2E-43: Minimum Stok Uyarıları
**Amaç**: Low stock alerting | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Reorder rule: Min=10, Reorder=20 | Kural oluştu | [ ] |
| 2 | Stok: 15 adet | Uyarı yok | [ ] |
| 3 | Satış: -10 adet → Stok: 5 | Low stock alert | [ ] |
| 4 | /stock-alerts listesi | Ürün görünür | [ ] |
| 5 | E-posta bildirimi | Gönderildi | [ ] |
| 6 | Stok girişi: +25 → Stok: 30 | Alert kapandı | [ ] |

**Test Durumu**: ❌

---

### E2E-44: SKT Uyarıları
**Amaç**: Expiry alerting | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Shelf life rule: 30 gün uyarı | Kural oluştu | [ ] |
| 2 | Lot: SKT = Bugün + 60 gün | Uyarı yok | [ ] |
| 3 | Lot: SKT = Bugün + 25 gün | Expiry warning | [ ] |
| 4 | Lot: SKT = Bugün + 5 gün | Critical warning | [ ] |
| 5 | Lot: SKT = Dün | Expired alert | [ ] |
| 6 | /shelf-life dashboard | Tüm uyarılar | [ ] |

**Test Durumu**: ❌

---

### E2E-45: Stok Geçmişi
**Amaç**: Stock history tracking | **Süre**: 10 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | /products/[id] → Stok geçmişi tab | Timeline görünümü | [ ] |
| 2 | Tarih aralığı filtresi | Filtrelendi | [ ] |
| 3 | Hareket tipi filtresi | Filtrelendi | [ ] |
| 4 | Grafik görünümü | Stok trendi | [ ] |
| 5 | Export | Excel/PDF | [ ] |

**Test Durumu**: ❌

---

### E2E-46: API Authentication
**Amaç**: API güvenlik testleri | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Token olmadan istek | 401 Unauthorized | [ ] |
| 2 | Geçersiz token | 401 Unauthorized | [ ] |
| 3 | Expired token | 401 Unauthorized | [ ] |
| 4 | Geçerli token | 200 OK | [ ] |
| 5 | Farklı tenant erişimi | 403 Forbidden | [ ] |

**Test Durumu**: ❌

---

### E2E-47: API Rate Limiting
**Amaç**: Rate limit kontrolü | **Süre**: 10 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Normal istek hızı | 200 OK | [ ] |
| 2 | 100 istek/dakika | Limit aşıldı | [ ] |
| 3 | 429 Too Many Requests | Rate limit mesajı | [ ] |
| 4 | Retry-After header | Bekleme süresi | [ ] |
| 5 | Bekleme sonrası | Normal çalışma | [ ] |

**Test Durumu**: ❌

---

### E2E-48: Concurrent Edit
**Amaç**: Eşzamanlı düzenleme | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | User A: Ürün düzenleme aç | Form açıldı | [ ] |
| 2 | User B: Aynı ürün düzenleme | Form açıldı | [ ] |
| 3 | User A: Kaydet | Başarılı | [ ] |
| 4 | User B: Kaydet | Conflict uyarısı | [ ] |
| 5 | User B: Refresh & retry | Başarılı | [ ] |

**Test Durumu**: ❌

---

### E2E-49: Form Validation
**Amaç**: Frontend validation | **Süre**: 15 dk

| Adım | Alan | Test | Beklenen | ✓ |
|------|------|------|----------|---|
| 1 | Zorunlu alan | Boş bırak | Hata mesajı | [ ] |
| 2 | Email | Geçersiz format | Hata mesajı | [ ] |
| 3 | Telefon | Geçersiz format | Hata mesajı | [ ] |
| 4 | Sayı | Negatif değer | Hata mesajı | [ ] |
| 5 | Tarih | Geçersiz tarih | Hata mesajı | [ ] |
| 6 | Max length | Aşım | Hata mesajı | [ ] |

**Test Durumu**: ❌

---

### E2E-50: Backend Validation
**Amaç**: API validation | **Süre**: 15 dk

| Adım | Senaryo | Beklenen | ✓ |
|------|---------|----------|---|
| 1 | Mükerrer kod | 400 Bad Request | [ ] |
| 2 | Mükerrer barkod | 400 Bad Request | [ ] |
| 3 | Negatif stok (yasaklı) | 400 Bad Request | [ ] |
| 4 | Geçersiz enum değeri | 400 Bad Request | [ ] |
| 5 | Referans bütünlüğü | 400 Bad Request | [ ] |

**Test Durumu**: ❌

---

### E2E-51: Mobil Stok Sayımı
**Amaç**: Saha sayımı mobil test | **Süre**: 15 dk | **Viewport**: 375px

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | /stock-counts/new mobilde aç | Responsive form | [ ] |
| 2 | Barkod input focus | Klavye açıldı | [ ] |
| 3 | Ürün listesi scroll | Smooth scroll | [ ] |
| 4 | Miktar input | Numpad görünür | [ ] |
| 5 | Kaydet butonu | Erişilebilir | [ ] |

**Test Durumu**: ❌

---

### E2E-52: Mobil Barkod Tarama
**Amaç**: Mobil barkod işlemleri | **Süre**: 10 dk | **Viewport**: 375px

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | /barcodes mobilde aç | Responsive | [ ] |
| 2 | Kamera erişimi | İzin istendi | [ ] |
| 3 | Barkod tara | Ürün bulundu | [ ] |
| 4 | Sonuç kartı | Bilgiler görünür | [ ] |
| 5 | Hızlı işlem butonları | Tıklanabilir | [ ] |

**Test Durumu**: ❌

---

### E2E-53: Mobil Transfer Onayı
**Amaç**: Saha transfer onayı | **Süre**: 10 dk | **Viewport**: 375px

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | /stock-transfers/[id] mobilde | Detay görünür | [ ] |
| 2 | Ürün listesi | Scroll çalışıyor | [ ] |
| 3 | Onayla butonu | Görünür & tıklanabilir | [ ] |
| 4 | Onay modalı | Tam ekran | [ ] |
| 5 | İmza/PIN girişi | Kullanılabilir | [ ] |

**Test Durumu**: ❌

---

### E2E-54: Tablet Dashboard
**Amaç**: Tablet görünümü | **Süre**: 10 dk | **Viewport**: 768px

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | /inventory tablet'te | 2 kolon layout | [ ] |
| 2 | Widget'lar | Grid düzeni | [ ] |
| 3 | Sidebar | Collapse edilebilir | [ ] |
| 4 | Tablolar | Yatay scroll | [ ] |
| 5 | Grafikler | Responsive | [ ] |

**Test Durumu**: ❌

---

### E2E-55: Offline Modu
**Amaç**: Çevrimdışı çalışma | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | İnternet kes | Offline indicator | [ ] |
| 2 | Sayfa yenile | Cached version | [ ] |
| 3 | Form doldur | Local storage | [ ] |
| 4 | Kaydet dene | Queue'ya eklendi | [ ] |
| 5 | İnternet aç | Auto sync | [ ] |
| 6 | Veri kontrolü | Senkronize edildi | [ ] |

**Test Durumu**: ❌

---

### E2E-56: Büyük Liste Performansı
**Amaç**: 10,000+ kayıt performansı | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | /products (10K ürün) | < 3sn yükleme | [ ] |
| 2 | Scroll (virtualization) | Smooth | [ ] |
| 3 | Arama | < 500ms yanıt | [ ] |
| 4 | Filtreleme | < 1sn | [ ] |
| 5 | Export | Progress göstergesi | [ ] |

**Test Durumu**: ❌

---

### E2E-57: Dashboard Yükleme
**Amaç**: Dashboard API performansı | **Süre**: 10 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | /inventory ilk yükleme | < 2sn | [ ] |
| 2 | Widget'lar parallel load | Skeleton UI | [ ] |
| 3 | Tüm widget'lar yüklendi | < 5sn toplam | [ ] |
| 4 | Refresh | < 3sn | [ ] |
| 5 | Network tab | Gereksiz istek yok | [ ] |

**Test Durumu**: ❌

---

### E2E-58: Arama Performansı
**Amaç**: Typeahead arama | **Süre**: 10 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Ürün arama (3 karakter) | Debounce 300ms | [ ] |
| 2 | Sonuçlar | < 500ms | [ ] |
| 3 | Highlight match | Görünür | [ ] |
| 4 | Keyboard navigation | Çalışıyor | [ ] |
| 5 | Enter ile seçim | Yönlendirme | [ ] |

**Test Durumu**: ❌

---

### E2E-59: Form Submit Performansı
**Amaç**: Form kayıt süresi | **Süre**: 10 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Basit ürün kaydet | < 1sn | [ ] |
| 2 | Görsel + ürün kaydet | < 3sn | [ ] |
| 3 | 10 satırlı transfer | < 2sn | [ ] |
| 4 | Loading indicator | Görünür | [ ] |
| 5 | Çift tıklama koruması | Aktif | [ ] |

**Test Durumu**: ❌

---

### E2E-60: Rapor Üretimi
**Amaç**: Rapor oluşturma süresi | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Stok raporu (1K ürün) | < 5sn | [ ] |
| 2 | Maliyet raporu | < 10sn | [ ] |
| 3 | Hareket raporu (30 gün) | < 15sn | [ ] |
| 4 | Excel export (5K satır) | < 10sn | [ ] |
| 5 | PDF export | < 20sn | [ ] |

**Test Durumu**: ❌

---

### E2E-61: Sales Module Entegrasyonu
**Amaç**: Satış → Stok entegrasyonu | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Satış siparişi oluştur | SO-001 | [ ] |
| 2 | /stock-reservations | Rezervasyon oluştu | [ ] |
| 3 | Sipariş onayla | Stok düştü | [ ] |
| 4 | /stock-movements | Satış hareketi | [ ] |
| 5 | Sipariş iptal | Stok geri geldi | [ ] |

**Test Durumu**: ❌

---

### E2E-62: Purchase Module Entegrasyonu
**Amaç**: Satın alma → Stok | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Satın alma siparişi | PO-001 | [ ] |
| 2 | Mal kabul (GRN) | Stok arttı | [ ] |
| 3 | /stock-movements | Alım hareketi | [ ] |
| 4 | Kısmi teslim | Kalan stok | [ ] |
| 5 | Tedarikçi iade | Stok düştü | [ ] |

**Test Durumu**: ❌

---

### E2E-63: Finance Module Entegrasyonu
**Amaç**: Stok değer → Muhasebe | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Stok değeri hesapla | X₺ | [ ] |
| 2 | Muhasebe kaydı kontrol | Envanter hesabı | [ ] |
| 3 | Stok düzeltme | Maliyet etkisi | [ ] |
| 4 | Fire kaydı | Gider hesabı | [ ] |
| 5 | Dönem sonu | Kapanış fişi | [ ] |

**Test Durumu**: ❌

---

### E2E-64: Manufacturing Entegrasyonu
**Amaç**: Üretim → Stok | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Üretim emri oluştur | WO-001 | [ ] |
| 2 | Hammadde rezervasyonu | Stok reserved | [ ] |
| 3 | Üretim başlat | Hammadde çıkış | [ ] |
| 4 | Üretim tamamla | Mamul giriş | [ ] |
| 5 | Fire kaydı | Kayıp miktar | [ ] |

**Test Durumu**: ❌

---

### E2E-65: Webhook Notifications
**Amaç**: Event-driven bildirimler | **Süre**: 15 dk

| Adım | Olay | Webhook | ✓ |
|------|------|---------|---|
| 1 | Low stock | POST /webhook/low-stock | [ ] |
| 2 | Expiry alert | POST /webhook/expiry | [ ] |
| 3 | Transfer complete | POST /webhook/transfer | [ ] |
| 4 | Stock adjustment | POST /webhook/adjustment | [ ] |
| 5 | Webhook retry | 3 deneme sonra fail | [ ] |

**Test Durumu**: ❌

---

### E2E-66: Cascade Delete Koruması
**Amaç**: Referans bütünlüğü | **Süre**: 15 dk

| Adım | Silme Denemesi | Beklenen | ✓ |
|------|----------------|----------|---|
| 1 | Ürünü olan kategori | Engellendi | [ ] |
| 2 | Stoğu olan ürün | Engellendi | [ ] |
| 3 | Stoğu olan depo | Engellendi | [ ] |
| 4 | Kullanılan birim | Engellendi | [ ] |
| 5 | Hareketi olan transfer | Engellendi | [ ] |

**Test Durumu**: ❌

---

### E2E-67: Data Import Hataları
**Amaç**: Import error handling | **Süre**: 15 dk

| Adım | Hata Tipi | Beklenen | ✓ |
|------|-----------|----------|---|
| 1 | Geçersiz dosya formatı | Hata mesajı | [ ] |
| 2 | Eksik zorunlu alan | Satır numarası | [ ] |
| 3 | Mükerrer kayıt | Skip/Update seçeneği | [ ] |
| 4 | Geçersiz referans | İlgili hücre | [ ] |
| 5 | Kısmi başarı | X/Y başarılı | [ ] |

**Test Durumu**: ❌

---

### E2E-68: Session Timeout
**Amaç**: Oturum yönetimi | **Süre**: 10 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | 30 dk inaktif | Uyarı göster | [ ] |
| 2 | Süre uzat | Session yenilendi | [ ] |
| 3 | Timeout | Login'e yönlendir | [ ] |
| 4 | Kaydedilmemiş form | Veri kaybı uyarısı | [ ] |
| 5 | Yeniden login | Önceki sayfaya dön | [ ] |

**Test Durumu**: ❌

---

### E2E-69: Error Boundary
**Amaç**: UI hata yakalama | **Süre**: 10 dk

| Adım | Hata Senaryosu | Beklenen | ✓ |
|------|----------------|----------|---|
| 1 | Component crash | Error boundary | [ ] |
| 2 | Retry butonu | Çalışıyor | [ ] |
| 3 | Hata raporu | Sentry/Log | [ ] |
| 4 | Graceful degradation | Sayfa çalışıyor | [ ] |
| 5 | User feedback | Toast mesajı | [ ] |

**Test Durumu**: ❌

---

### E2E-70: Network Error Handling
**Amaç**: Ağ hatası yönetimi | **Süre**: 10 dk

| Adım | Senaryo | Beklenen | ✓ |
|------|---------|----------|---|
| 1 | API timeout | Retry seçeneği | [ ] |
| 2 | 500 Server Error | Kullanıcı mesajı | [ ] |
| 3 | Network disconnect | Offline modu | [ ] |
| 4 | Slow connection | Loading state | [ ] |
| 5 | Reconnect | Auto retry | [ ] |

**Test Durumu**: ❌

---

### E2E-71: Rol Tabanlı Erişim
**Amaç**: RBAC kontrolü | **Süre**: 20 dk

| Adım | Rol | Erişim | ✓ |
|------|-----|--------|---|
| 1 | Admin | Tüm işlemler | [ ] |
| 2 | Manager | CRUD + Onay | [ ] |
| 3 | Operator | CRUD (sınırlı) | [ ] |
| 4 | Viewer | Sadece okuma | [ ] |
| 5 | Yetkisiz endpoint | 403 Forbidden | [ ] |

**Test Durumu**: ❌

---

### E2E-72: Audit Log Completeness
**Amaç**: Denetim kaydı tam olmalı | **Süre**: 15 dk

| Adım | İşlem | Log İçeriği | ✓ |
|------|-------|-------------|---|
| 1 | Ürün oluştur | Create + user + timestamp | [ ] |
| 2 | Ürün güncelle | Before/After values | [ ] |
| 3 | Ürün sil | Delete + reason | [ ] |
| 4 | Stok hareketi | Tüm detaylar | [ ] |
| 5 | Login/Logout | Session bilgisi | [ ] |

**Test Durumu**: ❌

---

### E2E-73: Multi-Tenant Isolation
**Amaç**: Tenant veri izolasyonu | **Süre**: 15 dk

| Adım | Test | Beklenen | ✓ |
|------|------|----------|---|
| 1 | Tenant A ürün oluştur | Sadece A görür | [ ] |
| 2 | Tenant B aynı kodu dene | Mükerrer değil | [ ] |
| 3 | API ile cross-tenant | 403 Forbidden | [ ] |
| 4 | URL manipulation | 404 Not Found | [ ] |
| 5 | Report isolation | Sadece kendi verisi | [ ] |

**Test Durumu**: ❌

---

### E2E-74: Backup & Restore
**Amaç**: Veri yedekleme | **Süre**: 20 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Manuel backup tetikle | Backup başladı | [ ] |
| 2 | Backup tamamlandı | Dosya oluştu | [ ] |
| 3 | Veri sil | Silinmiş | [ ] |
| 4 | Restore başlat | Progress göster | [ ] |
| 5 | Restore sonrası | Veri geri geldi | [ ] |

**Test Durumu**: ❌

---

### E2E-75: Data Export GDPR
**Amaç**: Veri dışa aktarım (KVKK) | **Süre**: 15 dk

| Adım | İşlem | Beklenen Sonuç | ✓ |
|------|-------|----------------|---|
| 1 | Veri export talebi | İstek oluştu | [ ] |
| 2 | Export hazırla | Tüm kişisel veri | [ ] |
| 3 | Download link | Güvenli link | [ ] |
| 4 | Link süresi | 24 saat geçerli | [ ] |
| 5 | Veri silme talebi | Anonymize edildi | [ ] |

**Test Durumu**: ❌

================================================================================
## 🔄 E2E 76-100: EDGE CASES & REGRESSION
================================================================================

### E2E-76: Concurrent Stock Update Race Condition
**Amaç**: Eşzamanlı stok güncellemesi | **Süre**: 25 dk

| Adım | Kullanıcı A | Kullanıcı B | Beklenen | ✓ |
|------|-------------|-------------|----------|---|
| 1 | Ürün stok: 100 | Ürün stok: 100 | Aynı veri | [ ] |
| 2 | -30 satış başlat | -80 satış başlat | Pending | [ ] |
| 3 | Commit | Commit attempt | A başarılı | [ ] |
| 4 | Stok: 70 | Conflict error | B reddedildi | [ ] |
| 5 | - | Refresh & retry | Stok yetersiz | [ ] |

**Edge Cases**: Optimistic locking, retry mechanism, deadlock prevention
**Test Durumu**: ❌

---

### E2E-77: Maximum Field Length Boundaries
**Amaç**: Alan uzunluk limitleri | **Süre**: 15 dk

| Adım | Alan | Limit | Test Değeri | Sonuç | ✓ |
|------|------|-------|-------------|-------|---|
| 1 | SKU | 50 | 50 karakter | ✅ Kabul | [ ] |
| 2 | SKU | 50 | 51 karakter | ❌ Hata | [ ] |
| 3 | Ürün Adı | 200 | 200 karakter | ✅ Kabul | [ ] |
| 4 | Açıklama | 2000 | 2001 karakter | ❌ Hata | [ ] |
| 5 | Barkod | 128 | 128 karakter | ✅ Kabul | [ ] |

**Test Durumu**: ❌

---

### E2E-78: Decimal Precision Edge Cases
**Amaç**: Ondalık hassasiyet testleri | **Süre**: 20 dk

| Adım | İşlem | Değer | Beklenen | ✓ |
|------|-------|-------|----------|---|
| 1 | Birim fiyat | 0.001 | Kabul (3 decimal) | [ ] |
| 2 | Miktar | 0.0001 | Red (max 3) | [ ] |
| 3 | Toplam | 999999.999 | Kabul | [ ] |
| 4 | Yuvarlama | 0.005 * 3 | 0.015 (banker's) | [ ] |
| 5 | Currency | $1,234.56 | Format doğru | [ ] |

**Test Durumu**: ❌

---

### E2E-79: Date/Time Edge Cases
**Amaç**: Tarih/saat sınır durumları | **Süre**: 20 dk

| Adım | Senaryo | Test | Beklenen | ✓ |
|------|---------|------|----------|---|
| 1 | Geçmiş tarih | 01/01/2020 | Uyarı + kabul | [ ] |
| 2 | Gelecek SKT | +10 yıl | Kabul | [ ] |
| 3 | Timezone | UTC vs local | Doğru görüntü | [ ] |
| 4 | Yıl sonu | 31/12/2025 | Kabul | [ ] |
| 5 | Artık yıl | 29/02/2024 | Kabul | [ ] |
| 6 | DST geçişi | Saat ileri/geri | Doğru hesaplama | [ ] |

**Test Durumu**: ❌

---

### E2E-80: Special Characters in Search
**Amaç**: Özel karakter arama | **Süre**: 15 dk

| Adım | Karakter | Arama | Sonuç | ✓ |
|------|----------|-------|-------|---|
| 1 | Türkçe | "İĞÜŞÖÇ" | Doğru bulundu | [ ] |
| 2 | SQL injection | "'; DROP TABLE" | Güvenli escape | [ ] |
| 3 | HTML | "<script>" | Encode edildi | [ ] |
| 4 | Unicode | "日本語" | Destekleniyor | [ ] |
| 5 | Emoji | "📦🏷️" | Filter/ignore | [ ] |
| 6 | Wildcard | "*test*" | Literal arama | [ ] |

**Test Durumu**: ❌

---

### E2E-81: Large Dataset Pagination
**Amaç**: Büyük veri sayfalama | **Süre**: 25 dk

| Adım | Veri Seti | Sayfa | Beklenen | ✓ |
|------|-----------|-------|----------|---|
| 1 | 10,000 ürün | Sayfa 1 | 20 kayıt, <2sn | [ ] |
| 2 | Filter + sort | Sayfa 50 | Doğru sıralama | [ ] |
| 3 | Son sayfa | Sayfa 500 | Doğru total | [ ] |
| 4 | Sayfa değiştir | 1→250→500 | Scroll korundu | [ ] |
| 5 | Export all | 10,000 | Async + progress | [ ] |

**Test Durumu**: ❌

---

### E2E-82: File Upload Edge Cases
**Amaç**: Dosya yükleme sınırları | **Süre**: 20 dk

| Adım | Dosya | Boyut | Sonuç | ✓ |
|------|-------|-------|-------|---|
| 1 | JPG | 5MB | ✅ Kabul | [ ] |
| 2 | PNG | 10MB | ❌ Boyut aşımı | [ ] |
| 3 | SVG | 100KB | ❌ Tip yasak | [ ] |
| 4 | Executable | .exe | ❌ Güvenlik | [ ] |
| 5 | Corrupted | Bozuk JPG | ❌ Validation | [ ] |
| 6 | 0 byte | Boş dosya | ❌ Red | [ ] |

**Test Durumu**: ❌

---

### E2E-83: Bulk Operation Limits
**Amaç**: Toplu işlem limitleri | **Süre**: 20 dk

| Adım | İşlem | Miktar | Sonuç | ✓ |
|------|-------|--------|-------|---|
| 1 | Bulk select | 100 | ✅ Kabul | [ ] |
| 2 | Bulk select | 1000 | ⚠️ Uyarı | [ ] |
| 3 | Bulk delete | 500 | Async job | [ ] |
| 4 | Bulk update | 200 | Progress bar | [ ] |
| 5 | Bulk export | 5000 | Email link | [ ] |

**Test Durumu**: ❌

---

### E2E-84: Session Management Edge Cases
**Amaç**: Oturum yönetimi | **Süre**: 20 dk

| Adım | Senaryo | Test | Beklenen | ✓ |
|------|---------|------|----------|---|
| 1 | Dual tab | Aynı kullanıcı | Senkron | [ ] |
| 2 | Logout tab A | Tab B click | Login redirect | [ ] |
| 3 | Token expire | Form submit | Refresh token | [ ] |
| 4 | Force logout | Admin action | Immediate end | [ ] |
| 5 | Remember me | Browser restart | Session valid | [ ] |

**Test Durumu**: ❌

---

### E2E-85: Undo/Redo Operations
**Amaç**: Geri alma işlemleri | **Süre**: 20 dk

| Adım | İşlem | Undo | Beklenen | ✓ |
|------|-------|------|----------|---|
| 1 | Stok ayarla | Ctrl+Z | Önceki değer | [ ] |
| 2 | Ürün sil | Restore | Ürün geri | [ ] |
| 3 | Bulk edit | Rollback | Tümü geri | [ ] |
| 4 | Transfer | Cancel | Stoklar eski | [ ] |
| 5 | İşlem zinciri | 3x undo | Sıralı geri | [ ] |

**Test Durumu**: ❌

---

### E2E-86: Copy/Paste/Duplicate
**Amaç**: Kopyalama işlemleri | **Süre**: 15 dk

| Adım | İşlem | Kaynak | Sonuç | ✓ |
|------|-------|--------|-------|---|
| 1 | Ürün duplicate | Mevcut ürün | Yeni SKU ile kopya | [ ] |
| 2 | Stok kartı copy | Template | Alanlar dolu | [ ] |
| 3 | Transfer copy | Önceki transfer | Draft oluştu | [ ] |
| 4 | Excel paste | Clipboard | Satırlar import | [ ] |
| 5 | Deep copy | Kategori+ürünler | Hiyerarşi korundu | [ ] |

**Test Durumu**: ❌

---

### E2E-87: Print/Export Formats
**Amaç**: Yazdırma ve export | **Süre**: 20 dk

| Adım | Format | İçerik | Sonuç | ✓ |
|------|--------|--------|-------|---|
| 1 | PDF | Stok raporu | A4 format, logo | [ ] |
| 2 | Excel | Ürün listesi | Formüller korundu | [ ] |
| 3 | CSV | Ham veri | UTF-8 encoding | [ ] |
| 4 | Print | Barkod etiket | Zebra compatible | [ ] |
| 5 | JSON | API export | Valid schema | [ ] |

**Test Durumu**: ❌

---

### E2E-88: Keyboard Navigation
**Amaç**: Klavye navigasyonu | **Süre**: 15 dk

| Adım | Kısayol | İşlem | Sonuç | ✓ |
|------|---------|-------|-------|---|
| 1 | Tab | Form fields | Sıralı geçiş | [ ] |
| 2 | Enter | Submit | Form gönderildi | [ ] |
| 3 | Escape | Modal | Kapatıldı | [ ] |
| 4 | Arrow keys | Table rows | Satır seçimi | [ ] |
| 5 | Ctrl+S | Save | Kaydet | [ ] |
| 6 | Ctrl+F | Search | Arama açıldı | [ ] |

**Test Durumu**: ❌

---

### E2E-89: Browser Compatibility
**Amaç**: Tarayıcı uyumluluğu | **Süre**: 30 dk

| Adım | Tarayıcı | Versiyon | Test | ✓ |
|------|----------|----------|------|---|
| 1 | Chrome | Latest | Full flow | [ ] |
| 2 | Firefox | Latest | Full flow | [ ] |
| 3 | Safari | Latest | Full flow | [ ] |
| 4 | Edge | Latest | Full flow | [ ] |
| 5 | Chrome | Mobile | Touch events | [ ] |

**Test Durumu**: ❌

---

### E2E-90: Localization/i18n
**Amaç**: Çoklu dil desteği | **Süre**: 20 dk

| Adım | Dil | Test | Beklenen | ✓ |
|------|-----|------|----------|---|
| 1 | TR→EN | Dil değiştir | Tüm metinler | [ ] |
| 2 | EN→TR | Geri dön | Kayıp yok | [ ] |
| 3 | Date format | TR vs EN | dd/MM vs MM/dd | [ ] |
| 4 | Number format | TR vs EN | 1.234,56 vs 1,234.56 | [ ] |
| 5 | RTL | Arapça test | Layout mirror | [ ] |

**Test Durumu**: ❌

---

### E2E-91: Cache Invalidation
**Amaç**: Önbellek yönetimi | **Süre**: 20 dk

| Adım | İşlem | Cache | Beklenen | ✓ |
|------|-------|-------|----------|---|
| 1 | Ürün güncelle | List cache | Refresh | [ ] |
| 2 | Stok değişimi | Dashboard | Real-time update | [ ] |
| 3 | Kategori sil | Dropdown | Listeden kalktı | [ ] |
| 4 | Hard refresh | Ctrl+F5 | Tümü yenilendi | [ ] |
| 5 | API cache | ETags | 304 response | [ ] |

**Test Durumu**: ❌

---

### E2E-92: Notification System
**Amaç**: Bildirim sistemi | **Süre**: 20 dk

| Adım | Tetikleyici | Kanal | Sonuç | ✓ |
|------|-------------|-------|-------|---|
| 1 | Min stok | In-app | Badge + toast | [ ] |
| 2 | SKT yaklaşan | Email | HTML email | [ ] |
| 3 | Transfer onay | Push | Mobile push | [ ] |
| 4 | Toplu import | WebSocket | Progress update | [ ] |
| 5 | Hata | All channels | Multi-channel | [ ] |

**Test Durumu**: ❌

---

### E2E-93: Data Integrity Constraints
**Amaç**: Veri bütünlüğü | **Süre**: 25 dk

| Adım | Constraint | Test | Sonuç | ✓ |
|------|------------|------|-------|---|
| 1 | FK violation | Olmayan kategori | Error 400 | [ ] |
| 2 | Unique violation | Duplicate SKU | Error + message | [ ] |
| 3 | Check constraint | Negatif fiyat | Validation error | [ ] |
| 4 | Cascade delete | Kategori sil | Ürünler orphan değil | [ ] |
| 5 | Circular ref | Self-parent | Prevention | [ ] |

**Test Durumu**: ❌

---

### E2E-94: API Versioning
**Amaç**: API versiyon yönetimi | **Süre**: 15 dk

| Adım | Versiyon | Endpoint | Sonuç | ✓ |
|------|----------|----------|-------|---|
| 1 | v1 | /api/v1/products | Legacy response | [ ] |
| 2 | v2 | /api/v2/products | New schema | [ ] |
| 3 | No version | /api/products | Latest (v2) | [ ] |
| 4 | Invalid | /api/v99/products | 404 | [ ] |
| 5 | Deprecation | v1 call | Warning header | [ ] |

**Test Durumu**: ❌

---

### E2E-95: Webhook Reliability
**Amaç**: Webhook güvenilirliği | **Süre**: 20 dk

| Adım | Senaryo | Test | Beklenen | ✓ |
|------|---------|------|----------|---|
| 1 | Success | Endpoint up | 200, logged | [ ] |
| 2 | Failure | Endpoint down | Retry queue | [ ] |
| 3 | Timeout | Slow response | 30s timeout | [ ] |
| 4 | Retry | 3x fail | DLQ + alert | [ ] |
| 5 | Signature | HMAC verify | Valid/invalid | [ ] |

**Test Durumu**: ❌

---

### E2E-96: Smoke Test Suite
**Amaç**: Hızlı sağlık kontrolü | **Süre**: 10 dk

| Adım | Modül | Test | Beklenen | ✓ |
|------|-------|------|----------|---|
| 1 | Auth | Login | Token alındı | [ ] |
| 2 | Products | List | 200 + data | [ ] |
| 3 | Warehouses | List | 200 + data | [ ] |
| 4 | Stock | Get | Current levels | [ ] |
| 5 | Dashboard | Load | Widgets render | [ ] |

**Kullanım**: Her deployment sonrası
**Test Durumu**: ❌

---

### E2E-97: Regression - Recent Bug Fixes
**Amaç**: Son düzeltme kontrolü | **Süre**: 30 dk

| Adım | Bug ID | Açıklama | Regression Test | ✓ |
|------|--------|----------|-----------------|---|
| 1 | #127 | Form onFinish type | TypeScript compile | [ ] |
| 2 | #128 | Shelf life enum | Dropdown values | [ ] |
| 3 | #129 | Delete modal | Modal açılması | [ ] |
| 4 | #130 | ABC overflow | UI görünümü | [ ] |
| 5 | #131 | Barcode lookup | API endpoint | [ ] |

**Kullanım**: Her sprint sonunda
**Test Durumu**: ❌

---

### E2E-98: Load Test Baseline
**Amaç**: Yük testi referansı | **Süre**: 30 dk

| Adım | Metrik | Hedef | Ölçüm | ✓ |
|------|--------|-------|-------|---|
| 1 | Concurrent users | 100 | [____] | [ ] |
| 2 | Requests/sec | 500 | [____] | [ ] |
| 3 | Avg response | <200ms | [____] | [ ] |
| 4 | P95 response | <500ms | [____] | [ ] |
| 5 | Error rate | <0.1% | [____] | [ ] |

**Araç**: k6 veya Artillery
**Test Durumu**: ❌

---

### E2E-99: Disaster Recovery
**Amaç**: Felaket kurtarma | **Süre**: 45 dk

| Adım | Senaryo | Test | Beklenen | ✓ |
|------|---------|------|----------|---|
| 1 | DB failover | Primary down | Replica active | [ ] |
| 2 | Data restore | Point-in-time | 15min RPO | [ ] |
| 3 | Cache flush | Redis restart | Cold start OK | [ ] |
| 4 | Service restart | All pods down | Auto recovery | [ ] |
| 5 | Full restore | Backup import | Data intact | [ ] |

**Test Durumu**: ❌

---

### E2E-100: End-to-End Business Cycle
**Amaç**: Tam iş döngüsü | **Süre**: 60 dk

| Adım | İşlem | Doğrulama | ✓ |
|------|-------|-----------|---|
| 1 | Ürün oluştur | SKU, barkod, kategori | [ ] |
| 2 | Depo tanımla | Lokasyon, kapasite | [ ] |
| 3 | Satın alma girişi | +100 adet, maliyet | [ ] |
| 4 | Kalite kontrol | QC passed | [ ] |
| 5 | Depo transfer | A→B, 50 adet | [ ] |
| 6 | Satış çıkışı | -30 adet, FIFO | [ ] |
| 7 | Müşteri iadesi | +5 adet, QC | [ ] |
| 8 | Sayım farkı | Ayarlama yapıldı | [ ] |
| 9 | Rapor çıktısı | Tüm hareketler | [ ] |
| 10 | Audit trail | Zincir tamamlandı | [ ] |

**Kritik**: Tüm adımlar birbirine bağlı, veri bütünlüğü kontrol
**Test Durumu**: ❌

================================================================================
## 🚀 SONRAKİ ADIMLAR
================================================================================

1. **Deploy**: Mevcut düzeltmeleri production'a deploy et
2. **Smoke Test**: Her deployment sonrası E2E-96
3. **Regression**: Sprint sonlarında E2E-97
4. **Critical Path**: E2E-1 ile E2E-25 öncelikli
5. **Performance**: Aylık E2E-56-60 ve E2E-98
6. **Security**: Çeyreklik E2E-71-75
7. **Full Cycle**: Quarterly E2E-100 (tam döngü)

================================================================================
## 📊 E2E TEST ÖZET TABLOSU
================================================================================

| Grup | Testler | Kapsam | Süre |
|------|---------|--------|------|
| Temel Akışlar | 1-25 | Core business flows | ~7 saat |
| Ürün/Stok/API | 26-50 | CRUD + Validation | ~6 saat |
| Mobil/Performans | 51-60 | Responsive + Speed | ~2 saat |
| Entegrasyon | 61-65 | Cross-module | ~1.5 saat |
| Hata/Güvenlik | 66-75 | Edge cases + Security | ~2.5 saat |
| Edge/Regression | 76-100 | Boundaries + Smoke | ~7.5 saat |
| **TOPLAM** | **100** | **Full Coverage** | **~26.5 saat** |

================================================================================
## 📋 TEST CHECKLIST ŞABLONU
================================================================================

### Yeni Sayfa Test Checklist:
```
[ ] Liste sayfası yükleniyor
[ ] Yeni kayıt formu açılıyor
[ ] Zorunlu alan validation çalışıyor
[ ] Başarılı kayıt oluşturuluyor
[ ] Detay sayfası açılıyor
[ ] Düzenleme formu açılıyor
[ ] Güncelleme başarılı
[ ] Silme onay modal'ı açılıyor
[ ] Silme başarılı (cascade kontrol ile)
[ ] Hata durumunda 500 yerine 400 dönüyor
[ ] Mobilde (375px) kullanılabilir
```

### E2E Test Checklist:
```
[ ] Başlangıç durumu kayıt edildi
[ ] Her adım ayrı ayrı başarılı
[ ] Beklenen sonuç oluştu
[ ] İlişkili tablolar güncellendi
[ ] Audit trail kaydı var
[ ] Undo/rollback mümkün mü test edildi
```

================================================================================
