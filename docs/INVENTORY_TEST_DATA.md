# Envanter Manuel Test Verileri ve Senaryolari

Bu dokuman, Envanter (Inventory) modullerini manuel olarak test etmek icin hazirlanmis kapsamli test verilerini icerir. Her modul icin **Standart (Yaygin)**, **Minimum (Hizli)** ve **Validasyon (Sinir)** senaryolari tanimlanmistir.

---

## 1. Kategoriler (Categories)
**Sayfa:** `/inventory/categories/new`
**Zorunlu Alanlar:** Kategori Kodu, Kategori Adi.

### 1. Standart Kategori (Yaygin Senaryo)
Tipik bir urun kategorisini simule eder.

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Kategori Kodu** | KAT-ELEK | Zorunlu, benzersiz |
| **Kategori Adi** | Elektronik | Zorunlu |
| **Aciklama** | Elektronik urunler ve bilesenler | |
| **Ust Kategori** | (Bos - ana kategori) | |
| **Siralama** | 1 | |

### 2. Minimum Veri (Hizli Test)
Sadece zorunlu alanlarin validasyonunu gecmek icin.

| Alan | Deger |
| :--- | :--- |
| **Kategori Kodu** | KAT-TEST |
| **Kategori Adi** | Test Kategorisi |

### 3. Alt Kategori (Hiyerarsik Yapi)

| Alan | Deger |
| :--- | :--- |
| **Kategori Kodu** | KAT-BIL |
| **Kategori Adi** | Bilgisayar |
| **Aciklama** | Bilgisayar ve bilesen urunleri |
| **Ust Kategori** | Elektronik |
| **Siralama** | 1 |

### 4. Validasyon Sinir Testi
- **Benzersizlik**: Ayni kategori kodunu tekrar girin. *"Bu kod zaten kullaniliyor"* uyarisini gorun.
- **Bos Birakma**: Kategori Adi girmeden kaydetmeyi deneyin.

---

## 2. Markalar (Brands)
**Sayfa:** `/inventory/brands/new`
**Zorunlu Alanlar:** Marka Kodu, Marka Adi.

### 1. Standart Marka (Yaygin Senaryo)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Marka Kodu** | BRD-APP | Zorunlu, benzersiz |
| **Marka Adi** | Apple | Zorunlu |
| **Aciklama** | Apple Inc. urunleri | |
| **Logo URL** | https://example.com/apple-logo.png | |
| **Web Sitesi** | https://www.apple.com | |

### 2. Minimum Veri

| Alan | Deger |
| :--- | :--- |
| **Marka Kodu** | BRD-TEST |
| **Marka Adi** | Test Markasi |

### 3. Yerli Marka

| Alan | Deger |
| :--- | :--- |
| **Marka Kodu** | BRD-VES |
| **Marka Adi** | Vestel |
| **Aciklama** | Vestel Elektronik urunleri |
| **Web Sitesi** | https://www.vestel.com.tr |

---

## 3. Birimler (Units)
**Sayfa:** `/inventory/units/new`
**Zorunlu Alanlar:** Birim Kodu, Birim Adi.

### 1. Standart Birim (Temel Birim)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Birim Kodu** | ADET | Zorunlu, benzersiz |
| **Birim Adi** | Adet | Zorunlu |
| **Sembol** | ad | |
| **Temel Birim** | (Bos - kendisi temel) | |
| **Donusum Katsayisi** | 1 | |

### 2. Turetilmis Birim (Paket)

| Alan | Deger |
| :--- | :--- |
| **Birim Kodu** | PAKET12 |
| **Birim Adi** | 12'li Paket |
| **Sembol** | pk |
| **Temel Birim** | Adet |
| **Donusum Katsayisi** | 12 |

### 3. Agirlik Birimi

| Alan | Deger |
| :--- | :--- |
| **Birim Kodu** | KG |
| **Birim Adi** | Kilogram |
| **Sembol** | kg |
| **Temel Birim** | (Bos) |
| **Donusum Katsayisi** | 1 |

### 4. Turetilmis Agirlik Birimi

| Alan | Deger |
| :--- | :--- |
| **Birim Kodu** | GR |
| **Birim Adi** | Gram |
| **Sembol** | g |
| **Temel Birim** | Kilogram |
| **Donusum Katsayisi** | 0.001 |

---

## 4. Tedarikciler (Suppliers)
**Sayfa:** `/inventory/suppliers/new`
**Zorunlu Alanlar:** Tedarikci Kodu, Tedarikci Adi.

### 1. Standart Tedarikci (Yaygin Senaryo)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Tedarikci Kodu** | SUP-001 | Zorunlu, benzersiz |
| **Tedarikci Adi** | ABC Elektronik Ltd. | Zorunlu |
| **Vergi No** | 1234567890 | |
| **Vergi Dairesi** | Kadikoy | |
| **E-posta** | info@abcelektronik.com | |
| **Telefon** | 0216 555 00 00 | |
| **Adres** | Kadikoy, Istanbul | |
| **Sehir** | Istanbul | |
| **Ulke** | Turkiye | |
| **Posta Kodu** | 34700 | |
| **Web Sitesi** | https://www.abcelektronik.com | |
| **Yetkili Kisi** | Ahmet Yilmaz | |
| **Yetkili Telefon** | 0532 111 22 33 | |
| **Yetkili E-posta** | ahmet@abcelektronik.com | |
| **Odeme Vadesi (Gun)** | 30 | |
| **Kredi Limiti** | 500.000 | |
| **Tercih Edilen mi?** | Evet | |

### 2. Minimum Veri

| Alan | Deger |
| :--- | :--- |
| **Tedarikci Kodu** | SUP-TEST |
| **Tedarikci Adi** | Test Tedarikci |

### 3. Yurt Disi Tedarikci

| Alan | Deger |
| :--- | :--- |
| **Tedarikci Kodu** | SUP-INT |
| **Tedarikci Adi** | Global Tech Inc. |
| **E-posta** | sales@globaltech.com |
| **Sehir** | Shenzhen |
| **Ulke** | China |
| **Odeme Vadesi (Gun)** | 60 |
| **Tercih Edilen mi?** | Hayir |

---

## 5. Depolar (Warehouses)
**Sayfa:** `/inventory/warehouses/new`
**Zorunlu Alanlar:** Depo Kodu, Depo Adi.

### 1. Standart Depo (Ana Depo)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Depo Kodu** | WH-IST | Zorunlu, benzersiz |
| **Depo Adi** | Istanbul Ana Depo | Zorunlu |
| **Aciklama** | Istanbul merkez dagitim deposu | |
| **Adres** | Tuzla Organize Sanayi, Istanbul | |
| **Sehir** | Istanbul | |
| **Ulke** | Turkiye | |
| **Posta Kodu** | 34940 | |
| **Telefon** | 0216 444 00 00 | |
| **Depo Muduru** | Mehmet Demir | |
| **Toplam Alan (m2)** | 5000 | |
| **Varsayilan mi?** | Evet | |

### 2. Minimum Veri

| Alan | Deger |
| :--- | :--- |
| **Depo Kodu** | WH-TEST |
| **Depo Adi** | Test Deposu |

### 3. Ikincil Depo

| Alan | Deger |
| :--- | :--- |
| **Depo Kodu** | WH-ANK |
| **Depo Adi** | Ankara Bolge Deposu |
| **Aciklama** | Ic Anadolu bolge dagitim deposu |
| **Sehir** | Ankara |
| **Toplam Alan (m2)** | 2000 |
| **Varsayilan mi?** | Hayir |

---

## 6. Depo Bolgeleri (Warehouse Zones)
**Sayfa:** `/inventory/warehouse-zones/new`
**Zorunlu Alanlar:** Depo, Bolge Kodu, Bolge Adi, Bolge Tipi.

### 1. Standart Depolama Bolgesi

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Depo** | Istanbul Ana Depo | Zorunlu |
| **Bolge Kodu** | Z-GENEL | Zorunlu |
| **Bolge Adi** | Genel Depolama | Zorunlu |
| **Aciklama** | Standart urun depolama alani | |
| **Bolge Tipi** | Storage | Zorunlu |
| **Toplam Alan (m2)** | 2000 | |
| **Kullanilabilir Alan (m2)** | 1800 | |
| **Max Palet Kapasitesi** | 500 | |
| **Max Yukseklik (m)** | 6 | |
| **Oncelik** | 1 | |
| **Varsayilan Toplama Bolgesi** | Evet | |
| **Varsayilan Yerlestirme Bolgesi** | Evet | |

### 2. Sicaklik Kontrollü Bolge

| Alan | Deger |
| :--- | :--- |
| **Depo** | Istanbul Ana Depo |
| **Bolge Kodu** | Z-SOGUK |
| **Bolge Adi** | Soguk Depolama |
| **Aciklama** | Sicaklik kontrollü depolama alani |
| **Bolge Tipi** | ColdStorage |
| **Sicaklik Kontrollu mu?** | Evet |
| **Min. Sicaklik (C)** | 2 |
| **Max. Sicaklik (C)** | 8 |
| **Hedef Sicaklik (C)** | 4 |
| **Sicaklik Izleme Gerekli mi?** | Evet |

### 3. Karantina Bolgesi

| Alan | Deger |
| :--- | :--- |
| **Depo** | Istanbul Ana Depo |
| **Bolge Kodu** | Z-KARANTINA |
| **Bolge Adi** | Karantina Alani |
| **Aciklama** | Kontrol bekleyen urunler |
| **Bolge Tipi** | Quarantine |
| **Karantina Bolgesi mi?** | Evet |
| **Ozel Erisim Gerekli mi?** | Evet |
| **Erisim Seviyesi** | 3 |

### 4. Tehlikeli Madde Bolgesi

| Alan | Deger |
| :--- | :--- |
| **Depo** | Istanbul Ana Depo |
| **Bolge Kodu** | Z-TEHLIKELI |
| **Bolge Adi** | Tehlikeli Madde Deposu |
| **Aciklama** | Tehlikeli sinifi urunler |
| **Bolge Tipi** | Hazardous |
| **Tehlikeli mi?** | Evet |
| **Tehlike Sinifi** | Class 3 |
| **UN Numarasi** | UN1203 |
| **Ozel Erisim Gerekli mi?** | Evet |

---

## 7. Lokasyonlar (Locations)
**Sayfa:** `/inventory/locations/new`
**Zorunlu Alanlar:** Depo, Lokasyon Kodu, Lokasyon Adi.

### 1. Standart Lokasyon (Raf)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Depo** | Istanbul Ana Depo | Zorunlu |
| **Lokasyon Kodu** | A-01-01-01 | Zorunlu, benzersiz |
| **Lokasyon Adi** | Koridor A Raf 1 Kat 1 | Zorunlu |
| **Aciklama** | Elektronik urunler icin | |
| **Koridor** | A | |
| **Raf** | 01 | |
| **Kutu** | 01 | |
| **Kapasite** | 100 | Birim cinsinden |

### 2. Minimum Veri

| Alan | Deger |
| :--- | :--- |
| **Depo** | Istanbul Ana Depo |
| **Lokasyon Kodu** | LOC-TEST |
| **Lokasyon Adi** | Test Lokasyonu |

### 3. Yer Seviyesi Lokasyon

| Alan | Deger |
| :--- | :--- |
| **Depo** | Istanbul Ana Depo |
| **Lokasyon Kodu** | B-FLOOR |
| **Lokasyon Adi** | B Koridor Yer Alani |
| **Aciklama** | Buyuk urunler icin yer seviyesi |
| **Koridor** | B |
| **Kapasite** | 50 |

---

## 8. Urun Ozellikleri (Product Attributes)
**Sayfa:** `/inventory/product-attributes/new`
**Zorunlu Alanlar:** Ozellik Kodu, Ozellik Adi, Ozellik Tipi.

### 1. Renk Ozelligi (Secenekli)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Ozellik Kodu** | ATTR-COLOR | Zorunlu, benzersiz |
| **Ozellik Adi** | Renk | Zorunlu |
| **Aciklama** | Urun renk secenekleri | |
| **Ozellik Tipi** | Select | Secim listesi |
| **Zorunlu mu?** | Hayir | |
| **Filtrelenebilir mi?** | Evet | |
| **Aranabilir mi?** | Evet | |
| **Listede Goster** | Evet | |
| **Siralama** | 1 | |
| **Secenekler** | Siyah, Beyaz, Kirmizi, Mavi, Yesil | Her biri ayri |

### 2. Beden Ozelligi

| Alan | Deger |
| :--- | :--- |
| **Ozellik Kodu** | ATTR-SIZE |
| **Ozellik Adi** | Beden |
| **Ozellik Tipi** | Select |
| **Zorunlu mu?** | Hayir |
| **Filtrelenebilir mi?** | Evet |
| **Secenekler** | XS, S, M, L, XL, XXL |

### 3. Metin Ozelligi

| Alan | Deger |
| :--- | :--- |
| **Ozellik Kodu** | ATTR-MATERIAL |
| **Ozellik Adi** | Materyal |
| **Ozellik Tipi** | Text |
| **Filtrelenebilir mi?** | Evet |

### 4. Sayi Ozelligi

| Alan | Deger |
| :--- | :--- |
| **Ozellik Kodu** | ATTR-WARRANTY |
| **Ozellik Adi** | Garanti Suresi (Ay) |
| **Ozellik Tipi** | Number |
| **Varsayilan Deger** | 24 |

---

## 9. Urunler (Products)
**Sayfa:** `/inventory/products/new`
**Zorunlu Alanlar:** Urun Kodu, Urun Adi, Kategori, Birim.

### 1. Standart Urun (Yaygin Senaryo)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Urun Kodu** | PRD-001 | Zorunlu, benzersiz |
| **Urun Adi** | iPhone 15 Pro 256GB | Zorunlu |
| **Aciklama** | Apple iPhone 15 Pro akilli telefon | |
| **Barkod** | 8690000001234 | |
| **SKU** | APPLE-IPH15P-256 | |
| **Kategori** | Elektronik | Zorunlu |
| **Marka** | Apple | |
| **Birim** | Adet | Zorunlu |
| **Urun Tipi** | Finished | Mamul |
| **Birim Fiyat** | 65.000 | |
| **Fiyat Para Birimi** | TRY | |
| **Maliyet** | 55.000 | |
| **Maliyet Para Birimi** | TRY | |
| **Agirlik** | 0.187 | |
| **Agirlik Birimi** | kg | |
| **Uzunluk** | 15.9 | cm |
| **Genislik** | 7.68 | cm |
| **Yukseklik** | 0.83 | cm |
| **Min. Stok Seviyesi** | 10 | |
| **Max. Stok Seviyesi** | 100 | |
| **Yeniden Siparis Seviyesi** | 20 | |
| **Yeniden Siparis Miktari** | 50 | |
| **Tedarik Suresi (Gun)** | 7 | |
| **Seri No Takip** | Evet | |
| **Lot/Parti Takip** | Hayir | |

### 2. Minimum Veri (Hizli Test)

| Alan | Deger |
| :--- | :--- |
| **Urun Kodu** | PRD-TEST |
| **Urun Adi** | Test Urunu |
| **Kategori** | Test Kategorisi |
| **Birim** | Adet |

### 3. Hammadde Urunu

| Alan | Deger |
| :--- | :--- |
| **Urun Kodu** | RM-001 |
| **Urun Adi** | Aluminyum Profil 6060 |
| **Aciklama** | 6060 T6 aluminyum ekstruzyon profil |
| **Kategori** | Hammadde |
| **Birim** | Kilogram |
| **Urun Tipi** | RawMaterial |
| **Maliyet** | 120 |
| **Min. Stok Seviyesi** | 500 |
| **Lot/Parti Takip** | Evet |

### 4. Yari Mamul

| Alan | Deger |
| :--- | :--- |
| **Urun Kodu** | SF-001 |
| **Urun Adi** | Islenmis Kasa |
| **Kategori** | Yari Mamul |
| **Birim** | Adet |
| **Urun Tipi** | SemiFinished |
| **Maliyet** | 250 |

### 5. Lot Takipli Urun (Gida)

| Alan | Deger |
| :--- | :--- |
| **Urun Kodu** | PRD-FOOD-001 |
| **Urun Adi** | Organik Zeytinyagi 1L |
| **Kategori** | Gida |
| **Birim** | Adet |
| **Urun Tipi** | Finished |
| **Lot/Parti Takip** | Evet |
| **Seri No Takip** | Hayir |

### 6. Validasyon Sinir Testi
- **Negatif Fiyat**: Birim Fiyat alanina negatif deger girin.
- **Min > Max**: Min. Stok Seviyesini Max. Stok Seviyesinden buyuk girin.
- **Bos Zorunlu Alan**: Urun Adi girmeden kaydetmeyi deneyin.

---

## 10. Urun Varyantlari (Product Variants)
**Sayfa:** `/inventory/products/{productId}/variants/new`
**Zorunlu Alanlar:** Urun, SKU, Varyant Adi.

### 1. Renk Varyanti

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Urun** | iPhone 15 Pro 256GB | Zorunlu |
| **SKU** | APPLE-IPH15P-256-BLK | Zorunlu, benzersiz |
| **Barkod** | 8690000001235 | |
| **Varyant Adi** | Siyah | Zorunlu |
| **Fiyat** | 65.000 | |
| **Maliyet** | 55.000 | |
| **Agirlik** | 0.187 | |
| **Varsayilan mi?** | Evet | |
| **Stok Takip** | Evet | |
| **Dusuk Stok Esigi** | 5 | |
| **Siralama** | 1 | |
| **Ozellik - Renk** | Siyah | |

### 2. Beden Varyanti (Tekstil)

| Alan | Deger |
| :--- | :--- |
| **Urun** | Erkek T-Shirt |
| **SKU** | TSH-001-M |
| **Varyant Adi** | Medium |
| **Fiyat** | 299 |
| **Varsayilan mi?** | Evet |
| **Ozellik - Beden** | M |

---

## 11. Fiyat Listeleri (Price Lists)
**Sayfa:** `/inventory/price-lists/new`
**Zorunlu Alanlar:** Liste Kodu, Liste Adi, Para Birimi.

### 1. Standart Fiyat Listesi

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Liste Kodu** | PL-RETAIL | Zorunlu, benzersiz |
| **Liste Adi** | Perakende Fiyat Listesi | Zorunlu |
| **Aciklama** | Standart perakende satis fiyatlari | |
| **Para Birimi** | TRY | Zorunlu |
| **Gecerlilik Baslangic** | 01/01/2026 | |
| **Gecerlilik Bitis** | 31/12/2026 | |
| **Varsayilan mi?** | Evet | |
| **Oncelik** | 1 | |

### 2. Toptan Fiyat Listesi

| Alan | Deger |
| :--- | :--- |
| **Liste Kodu** | PL-WHOLESALE |
| **Liste Adi** | Toptan Fiyat Listesi |
| **Aciklama** | Bayi ve toptan musteriler icin |
| **Para Birimi** | TRY |
| **Genel Iskonto (%)** | 15 |
| **Oncelik** | 2 |

### 3. Kampanya Fiyat Listesi

| Alan | Deger |
| :--- | :--- |
| **Liste Kodu** | PL-CAMPAIGN |
| **Liste Adi** | Yaz Kampanyasi |
| **Para Birimi** | TRY |
| **Gecerlilik Baslangic** | 01/06/2026 |
| **Gecerlilik Bitis** | 31/08/2026 |
| **Genel Iskonto (%)** | 20 |
| **Oncelik** | 3 |

---

## 12. Stok Hareketleri (Stock Movements)
**Sayfa:** `/inventory/stock-movements/new`
**Zorunlu Alanlar:** Belge No, Hareket Tarihi, Urun, Depo, Hareket Tipi, Miktar.

### 1. Giris Hareketi (Satin Alma)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Belge No** | SM-2026-001 | Zorunlu, benzersiz |
| **Hareket Tarihi** | (Bugun) | Zorunlu |
| **Urun** | iPhone 15 Pro 256GB | Zorunlu |
| **Depo** | Istanbul Ana Depo | Zorunlu |
| **Kaynak Lokasyon** | (Bos) | |
| **Hedef Lokasyon** | A-01-01-01 | |
| **Hareket Tipi** | Inbound | Giris - Zorunlu |
| **Miktar** | 50 | Zorunlu |
| **Birim Maliyet** | 55.000 | |
| **Referans Belge Tipi** | PurchaseOrder | |
| **Referans Belge No** | PO-2026-001 | |
| **Aciklama** | Satin alma siparisi ile giris | |

### 2. Cikis Hareketi (Satis)

| Alan | Deger |
| :--- | :--- |
| **Belge No** | SM-2026-002 |
| **Hareket Tarihi** | (Bugun) |
| **Urun** | iPhone 15 Pro 256GB |
| **Depo** | Istanbul Ana Depo |
| **Kaynak Lokasyon** | A-01-01-01 |
| **Hareket Tipi** | Outbound |
| **Miktar** | 5 |
| **Referans Belge Tipi** | SalesOrder |
| **Referans Belge No** | SO-2026-001 |

### 3. Duzeltme Hareketi

| Alan | Deger |
| :--- | :--- |
| **Belge No** | SM-2026-003 |
| **Hareket Tarihi** | (Bugun) |
| **Urun** | iPhone 15 Pro 256GB |
| **Depo** | Istanbul Ana Depo |
| **Hareket Tipi** | Adjustment |
| **Miktar** | -2 |
| **Aciklama** | Sayim farki duzeltmesi |

### 4. Lokasyon Transferi

| Alan | Deger |
| :--- | :--- |
| **Belge No** | SM-2026-004 |
| **Hareket Tarihi** | (Bugun) |
| **Urun** | iPhone 15 Pro 256GB |
| **Depo** | Istanbul Ana Depo |
| **Kaynak Lokasyon** | A-01-01-01 |
| **Hedef Lokasyon** | B-01-01-01 |
| **Hareket Tipi** | Transfer |
| **Miktar** | 10 |

---

## 13. Stok Transferleri (Stock Transfers)
**Sayfa:** `/inventory/stock-transfers/new`
**Zorunlu Alanlar:** Transfer No, Transfer Tarihi, Kaynak Depo, Hedef Depo.

### 1. Depolar Arasi Transfer

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Transfer No** | TRF-2026-001 | Zorunlu, benzersiz |
| **Transfer Tarihi** | (Bugun) | Zorunlu |
| **Kaynak Depo** | Istanbul Ana Depo | Zorunlu |
| **Hedef Depo** | Ankara Bolge Deposu | Zorunlu |
| **Transfer Tipi** | InterWarehouse | |
| **Aciklama** | Haftalik stok transferi | |
| **Tahmini Varis Tarihi** | (3 gun sonra) | |
| **Kalemler:** | | |
| - Urun | iPhone 15 Pro 256GB | |
| - Kaynak Lokasyon | A-01-01-01 | |
| - Hedef Lokasyon | (Bos - otomatik) | |
| - Talep Edilen Miktar | 20 | |

### 2. Acil Transfer

| Alan | Deger |
| :--- | :--- |
| **Transfer No** | TRF-2026-002 |
| **Transfer Tarihi** | (Bugun) |
| **Kaynak Depo** | Istanbul Ana Depo |
| **Hedef Depo** | Ankara Bolge Deposu |
| **Transfer Tipi** | Emergency |
| **Aciklama** | Acil stok talebi |
| **Tahmini Varis Tarihi** | (Yarin) |

---

## 14. Stok Rezervasyonlari (Stock Reservations)
**Sayfa:** `/inventory/stock-reservations/new`
**Zorunlu Alanlar:** Rezervasyon No, Urun, Depo, Miktar, Rezervasyon Tipi.

### 1. Satis Siparisi Rezervasyonu

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Rezervasyon No** | RES-2026-001 | Zorunlu, benzersiz |
| **Urun** | iPhone 15 Pro 256GB | Zorunlu |
| **Depo** | Istanbul Ana Depo | Zorunlu |
| **Lokasyon** | A-01-01-01 | |
| **Miktar** | 5 | Zorunlu |
| **Rezervasyon Tipi** | SalesOrder | Zorunlu |
| **Referans Belge Tipi** | SalesOrder | |
| **Referans Belge No** | SO-2026-001 | |
| **Son Gecerlilik** | (1 hafta sonra) | |
| **Notlar** | Musteri siparisi icin rezerve | |

### 2. Uretim Siparisi Rezervasyonu

| Alan | Deger |
| :--- | :--- |
| **Rezervasyon No** | RES-2026-002 |
| **Urun** | Aluminyum Profil 6060 |
| **Depo** | Istanbul Ana Depo |
| **Miktar** | 100 |
| **Rezervasyon Tipi** | Production |
| **Referans Belge Tipi** | ProductionOrder |
| **Referans Belge No** | PO-2026-001 |

---

## 15. Stok Sayimlari (Stock Counts)
**Sayfa:** `/inventory/stock-counts/new`
**Zorunlu Alanlar:** Sayim No, Sayim Tarihi, Depo, Sayim Tipi.

### 1. Tam Depo Sayimi

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Sayim No** | CNT-2026-001 | Zorunlu, benzersiz |
| **Sayim Tarihi** | (Bugun) | Zorunlu |
| **Depo** | Istanbul Ana Depo | Zorunlu |
| **Lokasyon** | (Bos - tum depo) | |
| **Sayim Tipi** | Full | Zorunlu |
| **Aciklama** | Yilsonu genel sayimi | |
| **Otomatik Duzelt** | Hayir | Onay sonrasi |

### 2. Lokasyon Bazli Sayim

| Alan | Deger |
| :--- | :--- |
| **Sayim No** | CNT-2026-002 |
| **Sayim Tarihi** | (Bugun) |
| **Depo** | Istanbul Ana Depo |
| **Lokasyon** | A-01-01-01 |
| **Sayim Tipi** | Partial |
| **Aciklama** | A koridoru sayimi |

### 3. Cevrimsel Sayim

| Alan | Deger |
| :--- | :--- |
| **Sayim No** | CNT-2026-003 |
| **Sayim Tarihi** | (Bugun) |
| **Depo** | Istanbul Ana Depo |
| **Sayim Tipi** | Cycle |
| **Aciklama** | Haftalik A sinifi urun sayimi |

---

## 16. Envanter Duzeltmeleri (Inventory Adjustments)
**Sayfa:** `/inventory/inventory-adjustments/new`
**Zorunlu Alanlar:** Depo, Duzeltme Tipi, Sebep.

### 1. Sayim Farki Duzeltmesi

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Depo** | Istanbul Ana Depo | Zorunlu |
| **Lokasyon** | A-01-01-01 | |
| **Duzeltme Tipi** | CountVariance | Zorunlu |
| **Sebep** | Sayim farki | Zorunlu |
| **Aciklama** | Yilsonu sayim duzeltmesi | |
| **Duzeltme Tarihi** | (Bugun) | |
| **Stok Sayim Referansi** | CNT-2026-001 | |
| **Kalemler:** | | |
| - Urun | iPhone 15 Pro 256GB | |
| - Sistem Miktari | 50 | |
| - Gercek Miktar | 48 | |
| - Birim Maliyet | 55.000 | |
| - Sebep Kodu | DAMAGE | |
| - Notlar | 2 adet hasarli tespit edildi | |

### 2. Hasar/Fire Duzeltmesi

| Alan | Deger |
| :--- | :--- |
| **Depo** | Istanbul Ana Depo |
| **Duzeltme Tipi** | Damage |
| **Sebep** | Hasarli urun |
| **Aciklama** | Tasima sirasinda hasar |
| **Kalemler:** | |
| - Urun | iPhone 15 Pro 256GB |
| - Sistem Miktari | 48 |
| - Gercek Miktar | 47 |
| - Sebep Kodu | TRANSPORT_DAMAGE |

### 3. Fazla Stok Duzeltmesi

| Alan | Deger |
| :--- | :--- |
| **Depo** | Istanbul Ana Depo |
| **Duzeltme Tipi** | Surplus |
| **Sebep** | Fazla stok tespit |
| **Kalemler:** | |
| - Urun | Test Urunu |
| - Sistem Miktari | 100 |
| - Gercek Miktar | 105 |
| - Sebep Kodu | RECEIVING_ERROR |

---

## 17. Tedarikci Urunleri (Supplier Products)
**Sayfa:** `/inventory/suppliers/{supplierId}/products/new`
**Zorunlu Alanlar:** Tedarikci, Urun, Birim Maliyet.

### 1. Standart Tedarikci Urun Iliskisi

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Tedarikci** | ABC Elektronik Ltd. | Zorunlu |
| **Urun** | iPhone 15 Pro 256GB | Zorunlu |
| **Tedarikci Urun Kodu** | APP-15P-256 | |
| **Birim Maliyet** | 55.000 | Zorunlu |
| **Para Birimi** | TRY | |
| **Min. Siparis Miktari** | 10 | |
| **Tedarik Suresi (Gun)** | 7 | |
| **Tercih Edilen mi?** | Evet | |

### 2. Alternatif Tedarikci

| Alan | Deger |
| :--- | :--- |
| **Tedarikci** | Global Tech Inc. |
| **Urun** | iPhone 15 Pro 256GB |
| **Tedarikci Urun Kodu** | IPH15PRO256 |
| **Birim Maliyet** | 52.000 |
| **Para Birimi** | USD |
| **Min. Siparis Miktari** | 50 |
| **Tedarik Suresi (Gun)** | 21 |
| **Tercih Edilen mi?** | Hayir |

---

## Hizli Referans - Test Siralama Onerisi

Modulleri test ederken asagidaki sirayi takip etmenizi oneririz (bagimliliklar nedeniyle):

1. **Kategoriler** - Temel yapi
2. **Markalar** - Urunler icin gerekli
3. **Birimler** - Urunler icin gerekli
4. **Urun Ozellikleri** - Varyantlar icin gerekli
5. **Tedarikciler** - Satin alma sureci
6. **Depolar** - Stok yonetimi icin temel
7. **Depo Bolgeleri** - Detayli depo yonetimi
8. **Lokasyonlar** - Depoya bagli
9. **Urunler** - Kategori, marka, birime bagli
10. **Urun Varyantlari** - Urune bagli
11. **Fiyat Listeleri** - Urune bagli
12. **Tedarikci Urunleri** - Tedarikci ve urune bagli
13. **Stok Hareketleri** - Urun ve depoya bagli
14. **Stok Transferleri** - Depolara bagli
15. **Stok Rezervasyonlari** - Urun ve depoya bagli
16. **Stok Sayimlari** - Depoya bagli
17. **Envanter Duzeltmeleri** - Sayim ve stoka bagli

---

## Enum Degerler Referansi

### Urun Tipi (ProductType)
- `Finished` - Mamul Urun
- `SemiFinished` - Yari Mamul
- `RawMaterial` - Hammadde
- `Service` - Hizmet

### Stok Hareket Tipi (StockMovementType)
- `Inbound` - Giris
- `Outbound` - Cikis
- `Transfer` - Transfer
- `Adjustment` - Duzeltme
- `Return` - Iade
- `Scrap` - Hurda

### Transfer Durumu (TransferStatus)
- `Draft` - Taslak
- `Pending` - Beklemede
- `Approved` - Onaylandi
- `Shipped` - Gonderildi
- `InTransit` - Yolda
- `Received` - Teslim Alindi
- `Completed` - Tamamlandi
- `Cancelled` - Iptal

### Transfer Tipi (TransferType)
- `InterWarehouse` - Depolar Arasi
- `IntraWarehouse` - Depo Ici
- `Emergency` - Acil
- `Regular` - Normal

### Rezervasyon Durumu (ReservationStatus)
- `Active` - Aktif
- `Fulfilled` - Karsilandi
- `PartiallyFulfilled` - Kismen Karsilandi
- `Expired` - Suresi Doldu
- `Cancelled` - Iptal

### Rezervasyon Tipi (ReservationType)
- `SalesOrder` - Satis Siparisi
- `Production` - Uretim
- `Transfer` - Transfer
- `Manual` - Manuel

### Sayim Durumu (StockCountStatus)
- `Draft` - Taslak
- `InProgress` - Devam Ediyor
- `Completed` - Tamamlandi
- `Approved` - Onaylandi
- `Cancelled` - Iptal

### Sayim Tipi (StockCountType)
- `Full` - Tam Sayim
- `Partial` - Kismi Sayim
- `Cycle` - Cevrimsel Sayim
- `Spot` - Spot Sayim

### Ozellik Tipi (AttributeType)
- `Text` - Metin
- `Number` - Sayi
- `Select` - Secim
- `MultiSelect` - Coklu Secim
- `Boolean` - Evet/Hayir
- `Date` - Tarih
- `Color` - Renk

---

*Son Guncelleme: Ocak 2026*
