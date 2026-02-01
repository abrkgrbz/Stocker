# 🎬 STOCKER ENVANTER MODÜLÜ - Video Senaryo Paketi

## 📋 İçerik Planı

Envanter modülü çok kapsamlı olduğu için **6 ayrı video** olarak planlandı:

| # | Video | Süre | İçerik |
|---|-------|------|--------|
| 1 | Temel Tanımlar | 8 dk | Ürün, Kategori, Marka, Birim |
| 2 | Depo Yönetimi | 6 dk | Depo, Bölge, Lokasyon |
| 3 | Stok İşlemleri | 10 dk | Hareketler, Transfer, Düzeltme |
| 4 | Sayım & Rezervasyon | 7 dk | Fiziksel sayım, Stok rezerve |
| 5 | İleri Özellikler | 8 dk | Varyant, Seri No, Lot/Parti |
| 6 | Analiz & Raporlar | 6 dk | Dashboard, ABC, Tahminleme |

**Toplam Süre:** ~45 dakika

---

## 🎬 VİDEO 1: Temel Tanımlar (Ürün, Kategori, Marka, Birim)

**Toplam Süre:** 8 dakika
**Hedef Kitle:** Tüm kullanıcılar (zorunlu izleme)

---

### 📍 SAHNE 1: Giriş (0:00 - 0:20)

**Ekranda:** Stocker ana dashboard → Envanter menüsü açık

**Anlatım:**
> "Stocker Envanter modülüne hoş geldiniz. Bu videoda envanter yönetiminin temel yapı taşlarını öğreneceksiniz: Ürünler, Kategoriler, Markalar ve Birimler. Bu tanımlar diğer tüm envanter işlemlerinin temelidir."

**Aksiyon:** Mouse ile sol menüdeki "Envanter" başlığını göster, alt menüleri aç

---

### 📍 SAHNE 2: Birimler - Genel Bakış (0:20 - 1:00)

**Ekranda:** `/inventory/units` sayfası

**Anlatım:**
> "İlk olarak Birimler'den başlayalım. Birimler, ürünlerinizin ölçü birimlerini tanımlar. Adet, kilogram, metre, litre gibi... Sistem varsayılan olarak temel birimleri içerir, ancak işletmenize özel birimler de ekleyebilirsiniz."

**Aksiyon:**
- Birimler listesini göster
- Tablo sütunlarını açıkla (Kod, Ad, Sembol, Aktif)

---

### 📍 SAHNE 3: Yeni Birim Oluşturma (1:00 - 1:45)

**Ekranda:** Birim ekleme formu

**Anlatım:**
> "Yeni bir birim ekleyelim. Örneğin, tekstil sektöründeyseniz 'Top' birimi gerekebilir."

**Demo Verisi:**

| Alan | Değer |
|------|-------|
| Birim Kodu | TOP |
| Birim Adı | Top |
| Sembol | top |
| Açıklama | Kumaş topu birimi |

**Aksiyon:**
1. "Yeni Birim" butonuna tıkla
2. Formu doldur
3. Kaydet
4. Listede göster

**Anlatım (devam):**
> "Kaydet butonuna tıkladığımızda birim sistemde tanımlandı. Artık ürün oluştururken bu birimi seçebiliriz."

---

### 📍 SAHNE 4: Markalar - Genel Bakış (1:45 - 2:30)

**Ekranda:** `/inventory/brands` sayfası

**Anlatım:**
> "Markalar bölümünde ürünlerinizin marka bilgilerini yönetirsiniz. Bu özellikle toptan satış yapan işletmeler için önemlidir. Marka bazlı filtreleme ve raporlama yapabilirsiniz."

**Demo Verisi - Yeni Marka:**

| Alan | Değer |
|------|-------|
| Marka Adı | TechPro |
| Kod | TECHPRO |
| Açıklama | Elektronik aksesuarları |
| Web Sitesi | www.techpro.com |
| Logo | [Logo yükle] |

**Aksiyon:**
1. Marka listesini göster
2. Yeni marka ekle
3. Logo yükleme özelliğini göster

---

### 📍 SAHNE 5: Kategoriler - Hiyerarşik Yapı (2:30 - 4:00)

**Ekranda:** `/inventory/categories` sayfası

**Anlatım:**
> "Kategoriler, envanter modülünün en kritik yapısıdır. Stocker'da kategoriler hiyerarşik yapıdadır - yani alt kategoriler oluşturabilirsiniz. Bu sayede ürünlerinizi düzenli bir şekilde organize edebilirsiniz."

**Ekranda:** Kategori ağacı görünümü göster

**Anlatım (devam):**
> "Örneğin: Elektronik → Bilgisayar → Dizüstü şeklinde 3 seviyeli bir kategori yapısı kurabilirsiniz."

**Demo Verisi - Ana Kategori:**

| Alan | Değer |
|------|-------|
| Kategori Adı | Elektronik |
| Kod | ELEC |
| Üst Kategori | (Boş - ana kategori) |
| Açıklama | Elektronik ürünler |

**Demo Verisi - Alt Kategori:**

| Alan | Değer |
|------|-------|
| Kategori Adı | Bilgisayar |
| Kod | COMP |
| Üst Kategori | Elektronik |
| Açıklama | Bilgisayar ve aksesuarları |

**Aksiyon:**
1. Kategori listesini ağaç görünümünde göster
2. Ana kategori oluştur
3. Alt kategori oluştur (üst kategori seçimi)
4. Hiyerarşiyi göster

**Anlatım (devam):**
> "💡 İpucu: Kategori yapınızı baştan iyi planlayın. Sonradan değiştirmek mümkün olsa da, raporlarınızın tutarlılığı için başlangıçta doğru kurulum önemlidir."

---

### 📍 SAHNE 6: Ürünler - Liste Ekranı (4:00 - 5:00)

**Ekranda:** `/inventory/products` sayfası

**Anlatım:**
> "Şimdi asıl konumuza, Ürünler ekranına geçelim. Bu ekran envanter yönetiminin kalbidir. Tüm ürünlerinizi buradan görüntüler, filtreler ve yönetirsiniz."

**Aksiyon:**
1. Ürün listesi tablosunu göster
2. Sütunları açıkla:
   - Ürün Kodu (SKU)
   - Ürün Adı
   - Kategori
   - Marka
   - Birim
   - Stok Miktarı
   - Durum (Aktif/Pasif)

**Anlatım (devam):**
> "Tablonun üstündeki filtreler ile ürünlerinizi kategoriye, markaya, stok durumuna göre filtreleyebilirsiniz. Ayrıca arama çubuğu ile ürün adı veya koduna göre hızlıca arama yapabilirsiniz."

**Aksiyon:**
- Filtreleme özelliklerini göster
- Arama yaparak göster
- Sayfalama kontrollerini göster

---

### 📍 SAHNE 7: Yeni Ürün Oluşturma (5:00 - 7:00)

**Ekranda:** `/inventory/products/new` sayfası

**Anlatım:**
> "Yeni bir ürün oluşturalım. Form birkaç bölümden oluşuyor. İlk bölümde temel bilgileri giriyoruz."

**Demo Verisi - Temel Bilgiler:**

| Alan | Değer |
|------|-------|
| Ürün Kodu (SKU) | LP-001 |
| Ürün Adı | Laptop Çantası 15.6" |
| Barkod | 8690000001234 |
| Kategori | Elektronik > Bilgisayar |
| Marka | TechPro |
| Birim | Adet |
| Ürün Tipi | Mamul (Finished) |

**Aksiyon:**
1. Temel bilgileri doldur
2. Her alanı açıkla

**Anlatım (devam):**
> "Ürün tipi önemli bir seçimdir. Stocker'da 6 farklı ürün tipi var:
> - Hammadde: Üretimde kullanılan malzemeler
> - Yarı Mamul: Üretim sürecindeki ürünler
> - Mamul: Satışa hazır ürünler
> - Hizmet: Fiziksel olmayan satışlar
> - Sarf Malzeme: Ofis malzemeleri gibi
> - Sabit Kıymet: Demirbaşlar"

**Demo Verisi - Fiyat Bilgileri:**

| Alan | Değer |
|------|-------|
| Alış Fiyatı | 150,00 ₺ |
| Satış Fiyatı | 249,00 ₺ |
| KDV Oranı | %20 |

**Demo Verisi - Stok Bilgileri:**

| Alan | Değer |
|------|-------|
| Minimum Stok | 10 |
| Maksimum Stok | 100 |
| Yeniden Sipariş Noktası | 20 |

**Aksiyon:**
1. Fiyat bilgilerini gir
2. Stok limitlerini açıkla

**Anlatım (devam):**
> "Minimum stok seviyesi, sistemin sizi uyaracağı alt sınırdır. Stok bu seviyenin altına düştüğünde uyarı alırsınız. Yeniden sipariş noktası ise otomatik sipariş önerisi için kullanılır."

**Demo Verisi - Ürün Görseli:**

**Anlatım:**
> "Ürüne görsel eklemek için Görseller sekmesine geçiyoruz. Ana görsel ve galeri görselleri yükleyebilirsiniz."

**Aksiyon:**
1. Görsel yükle
2. Ana görsel olarak işaretle
3. Kaydet butonuna tıkla

**Anlatım (devam):**
> "Tüm bilgileri girdikten sonra Kaydet butonuna tıklıyoruz. Ürünümüz başarıyla oluşturuldu!"

---

### 📍 SAHNE 8: Ürün Düzenleme ve Toplu İşlemler (7:00 - 7:40)

**Ekranda:** Ürün listesi

**Anlatım:**
> "Mevcut bir ürünü düzenlemek için satıra tıklayın veya üç nokta menüsünden 'Düzenle' seçin. Ayrıca birden fazla ürün seçerek toplu işlem yapabilirsiniz."

**Aksiyon:**
1. Birkaç ürün seç (checkbox)
2. Toplu işlem çubuğunu göster
3. "Toplu Düzenle", "Dışa Aktar", "Sil" seçeneklerini göster

**Anlatım (devam):**
> "Seçili ürünleri Excel'e aktarabilir, toplu olarak kategori değiştirebilir veya pasife alabilirsiniz."

---

### 📍 SAHNE 9: İpuçları ve Kapanış (7:40 - 8:00)

**Ekranda:** Ürün listesi genel görünüm

**Anlatım:**
> "💡 Birkaç önemli ipucu:
>
> 1. Ürün kodlarınızı tutarlı bir sistemle oluşturun. Örneğin: KATEGORİ-NUMARA formatı.
>
> 2. Barkod alanını mutlaka doldurun - satış noktasında hız kazandırır.
>
> 3. Minimum stok seviyelerini gerçekçi belirleyin - çok düşük stoksuz kalmanıza, çok yüksek gereksiz uyarılara neden olur.
>
> 4. Görselleri optimize edilmiş boyutta yükleyin - sistem performansını etkiler.
>
> Bir sonraki videomuzda Depo Yönetimi'ni öğreneceğiz. Görüşmek üzere!"

---

## 🎬 VİDEO 2: Depo Yönetimi (Depo, Bölge, Lokasyon)

**Toplam Süre:** 6 dakika
**Hedef Kitle:** Depo yöneticileri, sistem yöneticileri

---

### 📍 SAHNE 1: Giriş (0:00 - 0:20)

**Ekranda:** Envanter menüsü → Depo Yönetimi alt başlıkları

**Anlatım:**
> "Bu videoda Stocker'ın depo yönetimi yapısını öğreneceksiniz. Sistem 3 seviyeli bir hiyerarşi kullanır: Depo, Bölge ve Lokasyon. Bu yapı sayesinde stoklarınızın fiziksel konumunu tam olarak takip edebilirsiniz."

---

### 📍 SAHNE 2: Depo Oluşturma (0:20 - 1:30)

**Ekranda:** `/inventory/warehouses` sayfası

**Anlatım:**
> "En üst seviye Depo'dur. Fiziksel depo binalarınızı veya mağazalarınızı temsil eder."

**Demo Verisi:**

| Alan | Değer |
|------|-------|
| Depo Kodu | WH-IST-01 |
| Depo Adı | İstanbul Ana Depo |
| Adres | Tuzla Organize Sanayi |
| Şehir | İstanbul |
| Sorumlu | Ahmet Yılmaz |
| Telefon | 0216 XXX XX XX |
| Kapasite | 5000 m² |
| Depo Tipi | Ana Depo |

**Aksiyon:**
1. Yeni depo ekle
2. Adres bilgilerini gir
3. Depo tipini seç (Ana Depo, Şube, Transit, Konsiye)

**Anlatım (devam):**
> "Depo tipi önemlidir:
> - Ana Depo: Merkez deponuz
> - Şube: Mağaza veya bayii stokları
> - Transit: Yoldaki mallar için
> - Konsiye: Müşteride bekleyen mallar"

---

### 📍 SAHNE 3: Depo Bölgeleri (1:30 - 2:30)

**Ekranda:** `/inventory/warehouse-zones` sayfası

**Anlatım:**
> "Depo Bölgeleri, deponuzun içindeki mantıksal alanları tanımlar. Örneğin: A Blok, Soğuk Hava Deposu, Raf Alanı gibi."

**Demo Verisi:**

| Alan | Değer |
|------|-------|
| Depo | İstanbul Ana Depo |
| Bölge Kodu | ZONE-A |
| Bölge Adı | A Blok - Elektronik |
| Açıklama | Elektronik ürünler alanı |
| Kapasite | 1000 m² |

**Aksiyon:**
1. Bölge oluştur
2. Depoya bağla
3. Birden fazla bölge ekle

**Anlatım (devam):**
> "Her depo için birden fazla bölge tanımlayabilirsiniz. Bu özellikle büyük depolarda ürün organizasyonu için kritiktir."

---

### 📍 SAHNE 4: Lokasyonlar (2:30 - 4:00)

**Ekranda:** `/inventory/locations` sayfası

**Anlatım:**
> "Lokasyonlar en detaylı seviyedir. Raf, göz veya palet konumlarını temsil eder. Örneğin: A-01-001 (A Blok, 1. Koridor, 1. Raf)"

**Demo Verisi:**

| Alan | Değer |
|------|-------|
| Depo | İstanbul Ana Depo |
| Bölge | A Blok - Elektronik |
| Lokasyon Kodu | A-01-001 |
| Lokasyon Adı | A1 Raf 1. Göz |
| Lokasyon Tipi | Raf |
| Maksimum Kapasite | 50 adet |
| Mevcut Doluluk | 0 |

**Aksiyon:**
1. Lokasyon oluştur
2. Depo ve bölge seçimi yap
3. Kapasite bilgilerini gir

**Anlatım (devam):**
> "Lokasyon kodlaması için tutarlı bir sistem öneriyoruz: BÖLGE-KORİDOR-RAF-GÖZ formatı. Örneğin A-01-03-02 → A Bölgesi, 1. Koridor, 3. Raf, 2. Göz anlamına gelir."

**Aksiyon:**
- Toplu lokasyon ekleme özelliğini göster (varsa)
- Lokasyon listesini filtrele

---

### 📍 SAHNE 5: Depo Yapısı Görselleştirme (4:00 - 4:45)

**Ekranda:** Depo detay sayfası veya özet

**Anlatım:**
> "Oluşturduğumuz yapıyı özetleyelim:"

```
📦 İstanbul Ana Depo
   ├── 📁 A Blok - Elektronik
   │   ├── 📍 A-01-001
   │   ├── 📍 A-01-002
   │   └── 📍 A-01-003
   └── 📁 B Blok - Tekstil
       ├── 📍 B-01-001
       └── 📍 B-01-002
```

> "Bu hiyerarşi sayesinde her ürünün tam olarak nerede olduğunu bilirsiniz."

---

### 📍 SAHNE 6: İpuçları ve Kapanış (4:45 - 6:00)

**Ekranda:** Depo listesi

**Anlatım:**
> "💡 Depo yönetimi ipuçları:
>
> 1. Lokasyon kodlarını barkodlayın - el terminali ile hızlı işlem
>
> 2. ABC analizi kullanın - çok satan ürünleri kolay erişilen lokasyonlara yerleştirin
>
> 3. Her lokasyona kapasite tanımlayın - aşırı doluluk problemlerini önler
>
> 4. Transit depoyu aktif kullanın - yoldaki malları takip edin
>
> 5. Konsiye stok için ayrı depo açın - müşterideki malları ayırın
>
> Bir sonraki videomuzda Stok İşlemleri'ni detaylı öğreneceğiz. Görüşmek üzere!"

---

## 🎬 VİDEO 3: Stok İşlemleri (Hareketler, Transfer, Düzeltme)

**Toplam Süre:** 10 dakika
**Hedef Kitle:** Depo personeli, muhasebe

---

### 📍 SAHNE 1: Giriş (0:00 - 0:30)

**Ekranda:** Envanter menüsü → Stok İşlemleri

**Anlatım:**
> "Stok işlemleri, envanter yönetiminin günlük operasyonlarını kapsar. Bu videoda 3 temel işlemi öğreneceksiniz:
> - Stok Hareketleri: Tüm giriş-çıkışların kaydı
> - Stok Transferi: Depolar arası mal aktarımı
> - Stok Düzeltme: Manuel stok güncellemeleri"

---

### 📍 SAHNE 2: Stok Durumu Görüntüleme (0:30 - 1:30)

**Ekranda:** `/inventory/stock` sayfası

**Anlatım:**
> "Önce mevcut stok durumunu görelim. Bu ekran tüm ürünlerinizin anlık stok miktarlarını gösterir. Depo ve lokasyon bazında filtreleyebilirsiniz."

**Aksiyon:**
1. Stok listesini göster
2. Depo filtresi uygula
3. Düşük stok uyarılarını göster (kırmızı satırlar)
4. Stok değeri toplamını göster

**Anlatım (devam):**
> "Kırmızı ile işaretli satırlar minimum stok seviyesinin altındaki ürünlerdir. Bu uyarıları dikkate alarak sipariş planlaması yapmalısınız."

---

### 📍 SAHNE 3: Stok Hareketleri - Liste (1:30 - 2:30)

**Ekranda:** `/inventory/stock-movements` sayfası

**Anlatım:**
> "Stok Hareketleri ekranı tüm stok giriş ve çıkışlarının kaydını tutar. Sistemde 15 farklı hareket tipi vardır."

**Hareket Tipleri Tablosu:**

| Hareket Tipi | Açıklama |
|--------------|----------|
| Purchase (Satın Alma) | Tedarikçiden mal girişi |
| Sales (Satış) | Müşteriye mal çıkışı |
| Return (İade) | Müşteriden veya tedarikçiye iade |
| Transfer | Depolar arası transfer |
| Adjustment (Düzeltme) | Manuel stok düzeltmesi |
| Production (Üretim) | Üretimden giriş |
| Consumption (Tüketim) | Üretimde kullanım |
| Scrap (Fire) | Zayi olan mallar |
| Sample (Numune) | Numune çıkışı |
| Reservation (Rezerve) | Sipariş için ayırma |

**Aksiyon:**
1. Hareket listesini göster
2. Tarih aralığı filtrele
3. Hareket tipine göre filtrele
4. Bir harekete tıklayıp detay göster

---

### 📍 SAHNE 4: Yeni Stok Hareketi (2:30 - 4:00)

**Ekranda:** Stok hareketi oluşturma formu

**Anlatım:**
> "Manuel stok hareketi oluşturalım. Örneğin, sayım sonucu fazlalık tespit ettiniz ve sisteme giriş yapmanız gerekiyor."

**Demo Verisi:**

| Alan | Değer |
|------|-------|
| Hareket Tipi | Düzeltme (Adjustment) |
| Hareket Yönü | Giriş |
| Ürün | Laptop Çantası 15.6" |
| Miktar | 5 |
| Kaynak Depo | İstanbul Ana Depo |
| Lokasyon | A-01-001 |
| Açıklama | Sayım fazlası |
| Referans No | ADJ-2024-001 |

**Aksiyon:**
1. Formu doldur
2. Her alanı açıkla
3. Kaydet

**Anlatım (devam):**
> "Hareket kaydedildiğinde stok miktarı otomatik güncellenir. Bu işlem geri alınamaz, bu yüzden dikkatli olun. Hatalı giriş yaptıysanız ters hareket oluşturmanız gerekir."

---

### 📍 SAHNE 5: Stok Transferi (4:00 - 6:30)

**Ekranda:** `/inventory/stock-transfers` sayfası

**Anlatım:**
> "Stok transferi, bir depodan diğerine mal aktarımı için kullanılır. Bu işlem 4 aşamalıdır: Oluştur → Onayla → Yola Çıkar → Teslim Al"

**Transfer Durumları:**

| Durum | Açıklama |
|-------|----------|
| Draft (Taslak) | Oluşturuldu, henüz onaylanmadı |
| Pending (Beklemede) | Onay bekliyor |
| Approved (Onaylandı) | Onaylandı, sevke hazır |
| In Transit (Yolda) | Sevk edildi, teslim bekleniyor |
| Received (Teslim Alındı) | Transfer tamamlandı |
| Cancelled (İptal) | İptal edildi |

**Demo - Yeni Transfer:**

| Alan | Değer |
|------|-------|
| Transfer No | TRF-2024-001 |
| Kaynak Depo | İstanbul Ana Depo |
| Hedef Depo | Ankara Şube |
| Transfer Tipi | Standart |
| Öncelik | Normal |
| Planlanan Tarih | [Bugün + 2 gün] |

**Transfer Kalemleri:**

| Ürün | Miktar | Kaynak Lokasyon |
|------|--------|-----------------|
| Laptop Çantası | 20 | A-01-001 |
| Mouse Pad | 50 | A-01-002 |

**Aksiyon:**
1. Yeni transfer oluştur
2. Kaynak ve hedef depo seç
3. Ürün ve miktar ekle
4. Taslak olarak kaydet
5. Onaya gönder

**Anlatım (devam):**
> "Transfer oluşturulduğunda kaynak depodaki stok 'rezerve' edilir. Böylece aynı ürün başka bir işlemde kullanılamaz. Onay sürecini atlayamazsınız - bu stok güvenliği için kritiktir."

**Aksiyon (devam):**
6. Transferi onayla
7. "Yola Çıkar" butonuna tıkla
8. Hedef depoda "Teslim Al" işlemi

**Anlatım (devam):**
> "Teslim alındığında:
> - Kaynak depodan stok düşer
> - Hedef depoya stok eklenir
> - Her iki tarafta da stok hareketi oluşur
> - Tüm süreç audit trail'e kaydedilir"

---

### 📍 SAHNE 6: Stok Düzeltme (6:30 - 8:30)

**Ekranda:** `/inventory/stock-adjustments` sayfası

**Anlatım:**
> "Stok düzeltme, fiziksel sayım sonucu sistemdeki stok ile gerçek stok arasındaki farkı düzeltmek için kullanılır. Bu işlem de onay sürecine tabidir."

**Demo Verisi:**

| Alan | Değer |
|------|-------|
| Düzeltme No | ADJ-2024-001 |
| Düzeltme Tarihi | [Bugün] |
| Depo | İstanbul Ana Depo |
| Sebep | Yıllık Sayım |
| Açıklama | 2024 yıl sonu sayımı |

**Düzeltme Kalemleri:**

| Ürün | Sistem Stok | Sayım | Fark | Lokasyon |
|------|-------------|-------|------|----------|
| Laptop Çantası | 45 | 43 | -2 | A-01-001 |
| Mouse Pad | 100 | 105 | +5 | A-01-002 |

**Aksiyon:**
1. Yeni düzeltme oluştur
2. Depo ve sebep seç
3. Ürünleri ekle, sayım miktarlarını gir
4. Sistem farkı otomatik hesaplar
5. Kaydet ve onaya gönder

**Anlatım (devam):**
> "Dikkat: Stok düzeltmeleri mali sonuçlar doğurur. Eksik stok = zarar, fazla stok = potansiyel kayıt hatası. Bu yüzden onay mekanizması zorunludur."

**Aksiyon (devam):**
6. Düzeltmeyi onayla (yetkili kullanıcı)
7. Stok değişimini göster

---

### 📍 SAHNE 7: Hareket Geçmişi ve Audit (8:30 - 9:30)

**Ekranda:** Bir ürünün stok hareket detayı

**Anlatım:**
> "Her ürünün tam hareket geçmişini görebilirsiniz. Bu özellik stok tutarsızlıklarını araştırırken çok değerlidir."

**Aksiyon:**
1. Bir ürün seç
2. "Hareket Geçmişi" sekmesine git
3. Kronolojik hareket listesini göster

**Anlatım (devam):**
> "Her hareket için:
> - Kim yaptı
> - Ne zaman yaptı
> - Hangi belgeden kaynaklandı
> - Önceki ve sonraki stok miktarı
>
> bilgilerini görebilirsiniz. Bu tam izlenebilirlik sağlar."

---

### 📍 SAHNE 8: İpuçları ve Kapanış (9:30 - 10:00)

**Anlatım:**
> "💡 Stok işlemleri ipuçları:
>
> 1. Günlük hareketleri mutlaka kontrol edin - anormallikler erken fark edilir
>
> 2. Transfer onay sürecini atlamayın - yetkisiz mal çıkışını önler
>
> 3. Düzeltme sebeplerini detaylı yazın - denetimde lazım olacak
>
> 4. Fire ve zayiat için ayrı hareket tipi kullanın - raporlamada ayrışır
>
> 5. Düzenli sayım yapın - büyük farkları önler
>
> Bir sonraki videomuzda Sayım ve Rezervasyon işlemlerini öğreneceğiz. Görüşmek üzere!"

---

## 🎬 VİDEO 4: Sayım & Rezervasyon

**Toplam Süre:** 7 dakika
**Hedef Kitle:** Depo yöneticileri, operasyon ekibi

---

### 📍 SAHNE 1: Giriş (0:00 - 0:20)

**Anlatım:**
> "Bu videoda fiziksel sayım süreçlerini ve stok rezervasyon sistemini öğreneceksiniz. Her iki özellik de stok doğruluğunu ve müşteri memnuniyetini sağlamak için kritiktir."

---

### 📍 SAHNE 2: Stok Sayımı Türleri (0:20 - 1:00)

**Ekranda:** `/inventory/stock-counts` sayfası

**Anlatım:**
> "Stocker'da 6 farklı sayım türü vardır:"

| Sayım Türü | Kullanım Alanı |
|------------|----------------|
| Full (Tam) | Tüm depo sayımı - yıl sonu |
| Cycle (Döngüsel) | Düzenli aralıklarla bölüm bölüm |
| Spot (Anlık) | Şüpheli ürünler için |
| Annual (Yıllık) | Yıllık envanter kontrolü |
| Category (Kategori) | Belirli kategori sayımı |
| ABC | Değere göre öncelikli sayım |

---

### 📍 SAHNE 3: Yeni Sayım Başlatma (1:00 - 3:00)

**Ekranda:** Yeni sayım formu

**Demo Verisi:**

| Alan | Değer |
|------|-------|
| Sayım No | CNT-2024-001 |
| Sayım Türü | Cycle (Döngüsel) |
| Depo | İstanbul Ana Depo |
| Bölge | A Blok - Elektronik |
| Başlangıç Tarihi | [Bugün] |
| Sorumlu | Mehmet Kaya |

**Aksiyon:**
1. Sayım oluştur
2. Depo/bölge seç
3. Ürün listesini otomatik getir
4. Sayım ekibini ata

**Anlatım:**
> "Sayım başlatıldığında sistem otomatik olarak seçilen bölgedeki tüm ürünleri listeler. Mevcut sistem stoğu gösterilir veya gizlenir - bu ayarlanabilir."

---

### 📍 SAHNE 4: Sayım Girişi (3:00 - 4:30)

**Ekranda:** Sayım detay ekranı

**Demo - Sayım Girişi:**

| Ürün | Lokasyon | Sistem | Sayım | Fark |
|------|----------|--------|-------|------|
| Laptop Çantası | A-01-001 | 45 | 43 | -2 |
| Mouse Pad | A-01-002 | 100 | 100 | 0 |
| USB Kablo | A-01-003 | 200 | 198 | -2 |

**Aksiyon:**
1. Her satıra sayım miktarı gir
2. Farkların otomatik hesaplandığını göster
3. Notlar ekle (varsa)

**Anlatım:**
> "Sayım miktarlarını girerken el terminali veya barkod okuyucu kullanabilirsiniz. Sistem farkları otomatik hesaplar ve renk kodlarıyla gösterir."

---

### 📍 SAHNE 5: Sayım Onay ve Düzeltme (4:30 - 5:30)

**Aksiyon:**
1. Sayımı tamamla
2. Onaya gönder
3. Yetkili olarak onayla
4. Otomatik düzeltme fişi oluşumunu göster

**Anlatım:**
> "Sayım onaylandığında sistem otomatik olarak stok düzeltme fişi oluşturur. Bu şekilde sayım sonuçları stok miktarlarına yansır ve tüm süreç kayıt altına alınır."

---

### 📍 SAHNE 6: Stok Rezervasyonu (5:30 - 6:30)

**Ekranda:** `/inventory/stock-reservations` sayfası

**Anlatım:**
> "Stok rezervasyonu, belirli bir stok miktarını belirli bir işlem için ayırmak anlamına gelir. Örneğin: Müşteri siparişi için ürün rezerve edilir."

**Rezervasyon Türleri:**

| Tür | Açıklama |
|-----|----------|
| SalesOrder | Satış siparişi için |
| Transfer | Transfer için |
| Production | Üretim için |
| Project | Proje için |

**Demo:**

| Alan | Değer |
|------|-------|
| Ürün | Laptop Çantası |
| Miktar | 10 |
| Rezervasyon Türü | Satış Siparişi |
| Referans | SO-2024-001 |
| Son Geçerlilik | [Bugün + 7 gün] |

**Anlatım (devam):**
> "Rezerve edilen stok, mevcut stoktan düşmez ancak 'kullanılabilir stok' hesaplamasında çıkarılır. Bu sayede aynı ürünü iki farklı siparişe satma riski ortadan kalkar."

---

### 📍 SAHNE 7: Kapanış (6:30 - 7:00)

**Anlatım:**
> "💡 Sayım ve rezervasyon ipuçları:
>
> 1. ABC analizini kullanın - A sınıfı ürünleri daha sık sayın
>
> 2. Döngüsel sayımı tercih edin - tüm depoyu durdurmadan sürekli kontrol
>
> 3. Rezervasyon sürelerini kısa tutun - 7 gün yeterli
>
> 4. Süresi dolan rezervasyonları düzenli temizleyin
>
> Bir sonraki videomuzda ileri özellikleri öğreneceğiz. Görüşmek üzere!"

---

## 🎬 VİDEO 5: İleri Özellikler (Varyant, Seri No, Lot/Parti)

**Toplam Süre:** 8 dakika
**Hedef Kitle:** İleri düzey kullanıcılar

---

### 📍 SAHNE 1: Giriş (0:00 - 0:30)

**Anlatım:**
> "Bu videoda Stocker'ın ileri düzey envanter özelliklerini öğreneceksiniz:
> - Ürün Varyantları: Beden, renk gibi çeşitler
> - Seri Numarası Takibi: Tekil ürün izleme
> - Lot/Parti Takibi: Toplu üretim izleme
> - Raf Ömrü Yönetimi: Son kullanma tarihi takibi"

---

### 📍 SAHNE 2: Ürün Özellikleri (Attributes) (0:30 - 1:30)

**Ekranda:** `/inventory/product-attributes` sayfası

**Anlatım:**
> "Varyant oluşturmadan önce özellik tanımlamalısınız. Özellikler, ürünlerinizin farklılık gösterdiği boyutlardır."

**Demo - Özellik Tanımlama:**

| Özellik Adı | Özellik Değerleri |
|-------------|-------------------|
| Beden | XS, S, M, L, XL, XXL |
| Renk | Siyah, Beyaz, Mavi, Kırmızı |
| Materyal | Pamuk, Polyester, Karışık |

**Aksiyon:**
1. "Beden" özelliği oluştur
2. Değerleri ekle
3. "Renk" özelliği oluştur

---

### 📍 SAHNE 3: Ürün Varyantları (1:30 - 3:00)

**Ekranda:** `/inventory/product-variants` sayfası

**Anlatım:**
> "Varyantlar, bir ana ürünün farklı kombinasyonlarıdır. Örneğin: T-Shirt → Siyah/M, Siyah/L, Beyaz/M, Beyaz/L"

**Demo - Varyant Oluşturma:**

| Alan | Değer |
|------|-------|
| Ana Ürün | Basic T-Shirt |
| Özellik 1 | Renk: Siyah |
| Özellik 2 | Beden: M |
| Varyant SKU | TSH-BLK-M |
| Ek Fiyat | +0 ₺ |

**Aksiyon:**
1. Ana ürün seç
2. Özellik kombinasyonu seç
3. Varyant SKU oluştur
4. Toplu varyant oluşturma özelliğini göster

**Anlatım (devam):**
> "Toplu oluşturma özelliği ile tüm kombinasyonları tek seferde oluşturabilirsiniz. 3 renk × 6 beden = 18 varyant otomatik oluşur."

---

### 📍 SAHNE 4: Seri Numarası Takibi (3:00 - 4:30)

**Ekranda:** `/inventory/serial-numbers` sayfası

**Anlatım:**
> "Seri numarası takibi, yüksek değerli veya garanti gerektiren ürünler için kullanılır. Her birim tekil olarak izlenir."

**Demo:**

| Alan | Değer |
|------|-------|
| Ürün | Laptop |
| Seri No | SN-2024-00001 |
| Durum | Stokta (In Stock) |
| Lokasyon | A-01-001 |
| Garanti Bitiş | 2026-01-15 |

**Seri Durumları:**

| Durum | Açıklama |
|-------|----------|
| Available | Satışa hazır |
| InStock | Depoda |
| Reserved | Rezerve edilmiş |
| Sold | Satıldı |
| Defective | Arızalı |
| Returned | İade edildi |

**Anlatım (devam):**
> "Seri numaralı ürün satıldığında, o seri numarası müşteriye bağlanır. Garanti sorgusu veya iade işleminde bu bilgi kullanılır."

---

### 📍 SAHNE 5: Lot/Parti Takibi (4:30 - 6:00)

**Ekranda:** `/inventory/lot-batches` sayfası

**Anlatım:**
> "Lot takibi, aynı üretim partisinden gelen ürünleri gruplamak için kullanılır. Özellikle gıda, ilaç ve kozmetik sektörlerinde zorunludur."

**Demo:**

| Alan | Değer |
|------|-------|
| Ürün | Vitamin C Tablet |
| Lot No | LOT-2024-A001 |
| Üretim Tarihi | 2024-01-15 |
| Son Kullanma | 2025-01-15 |
| Miktar | 1000 adet |
| Durum | Onaylı (Approved) |

**Lot Durumları:**

| Durum | Açıklama |
|-------|----------|
| Pending | Kalite kontrolde |
| Approved | Satışa hazır |
| Quarantined | Karantinada |
| Expired | Süresi dolmuş |
| Recalled | Geri çağrıldı |

**Anlatım (devam):**
> "FEFO (First Expired, First Out) prensibiyle sistem otomatik olarak süresi en yakın lotu satışa yönlendirir. Bu sayede fire minimuma iner."

---

### 📍 SAHNE 6: Raf Ömrü Yönetimi (6:00 - 7:00)

**Ekranda:** `/inventory/shelf-life` sayfası

**Anlatım:**
> "Raf ömrü yönetimi, son kullanma tarihi olan ürünler için uyarı ve kontrol mekanizması sağlar."

**Demo - Raf Ömrü Kuralı:**

| Alan | Değer |
|------|-------|
| Ürün Kategorisi | Gıda |
| Uyarı Süresi | 30 gün önce |
| Kritik Süre | 7 gün önce |
| Otomatik Karantina | Evet |

**Anlatım (devam):**
> "Sistem, belirlediğiniz sürelerde otomatik uyarı verir. Kritik süreye ulaşan ürünler otomatik olarak karantinaya alınabilir - bu satış güvenliğini sağlar."

---

### 📍 SAHNE 7: Kapanış (7:00 - 8:00)

**Anlatım:**
> "💡 İleri özellikler ipuçları:
>
> 1. Varyantları sadece gerçekten farklı ürünler için kullanın
>
> 2. Seri takibini yalnızca değerli ürünlerde aktif edin - operasyonu yavaşlatır
>
> 3. Lot takibinde FEFO'yu zorunlu tutun
>
> 4. Raf ömrü uyarılarını günlük kontrol edin
>
> 5. Geri çağırma durumunda lot numarası ile hızlı aksiyon alın
>
> Son videomuzda Analiz ve Raporları öğreneceğiz. Görüşmek üzere!"

---

## 🎬 VİDEO 6: Analiz & Raporlar

**Toplam Süre:** 6 dakika
**Hedef Kitle:** Yöneticiler, analiz ekibi

---

### 📍 SAHNE 1: Giriş (0:00 - 0:20)

**Anlatım:**
> "Bu son videomuzda Stocker'ın analiz ve raporlama özelliklerini öğreneceksiniz. Doğru veriye dayalı kararlar almanızı sağlayacak araçları tanıyacaksınız."

---

### 📍 SAHNE 2: Envanter Dashboard (0:20 - 1:30)

**Ekranda:** `/inventory/analytics` veya Dashboard

**Anlatım:**
> "Envanter dashboard'u temel KPI'ları tek bakışta gösterir."

**Gösterilecek Widget'lar:**
- 📊 Toplam Stok Değeri
- 📉 Düşük Stok Uyarıları
- ⏰ Süresi Yaklaşan Ürünler
- 📈 Hareket Trendi (son 30 gün)
- 🏆 En Çok Hareket Gören Ürünler
- 📦 Depo Doluluk Oranları

**Aksiyon:**
1. Her widget'ı göster ve açıkla
2. Tarih aralığı değiştir
3. Widget'a tıklayıp detaya git

---

### 📍 SAHNE 3: ABC Analizi (1:30 - 2:30)

**Ekranda:** `/inventory/analysis` sayfası

**Anlatım:**
> "ABC analizi, ürünlerinizi değerine göre sınıflandırır:
> - A Sınıfı: Değerin %80'i, ürünlerin %20'si
> - B Sınıfı: Değerin %15'i, ürünlerin %30'u
> - C Sınıfı: Değerin %5'i, ürünlerin %50'si"

**Demo Gösterimi:**

| Sınıf | Ürün Sayısı | Stok Değeri | Yüzde |
|-------|-------------|-------------|-------|
| A | 50 | 800.000 ₺ | %80 |
| B | 150 | 150.000 ₺ | %15 |
| C | 300 | 50.000 ₺ | %5 |

**Anlatım (devam):**
> "A sınıfı ürünlere odaklanın - bunlar işinizin bel kemiği. Sayım önceliği, lokasyon yerleşimi ve tedarik planlamasında bu sınıflandırmayı kullanın."

---

### 📍 SAHNE 4: Stok Değerleme (2:30 - 3:30)

**Ekranda:** `/inventory/costing` sayfası

**Anlatım:**
> "Stok değerleme, envanterinizin mali değerini hesaplar. Stocker 3 yöntem destekler:"

| Yöntem | Açıklama |
|--------|----------|
| FIFO | İlk giren ilk çıkar |
| LIFO | Son giren ilk çıkar |
| WAC | Ağırlıklı ortalama maliyet |

**Demo - Değerleme Raporu:**

| Kategori | FIFO Değeri | WAC Değeri | Fark |
|----------|-------------|------------|------|
| Elektronik | 450.000 ₺ | 445.000 ₺ | 5.000 ₺ |
| Tekstil | 280.000 ₺ | 285.000 ₺ | -5.000 ₺ |

**Anlatım (devam):**
> "Muhasebe departmanınızla hangi yöntemi kullanacağınıza karar verin. Türkiye'de genellikle FIFO veya WAC tercih edilir."

---

### 📍 SAHNE 5: Tahminleme (Forecasting) (3:30 - 4:30)

**Ekranda:** `/inventory/forecasting` sayfası

**Anlatım:**
> "Talep tahminleme, geçmiş verilere dayanarak gelecek stok ihtiyacınızı öngörür."

**Tahminleme Yöntemleri:**

| Yöntem | Kullanım |
|--------|----------|
| Linear | Düzenli trend |
| Seasonal | Mevsimsel ürünler |
| Moving Average | Dalgalı talep |

**Anlatım (devam):**
> "Sistem geçmiş 12 aylık veriyi analiz ederek önümüzdeki 3 ay için tahmin üretir. Bu tahminleri sipariş planlamasında kullanabilirsiniz."

---

### 📍 SAHNE 6: Uyarılar ve Dışa Aktarma (4:30 - 5:30)

**Ekranda:** `/inventory/stock-alerts` sayfası

**Anlatım:**
> "Stok uyarıları dashboard'u kritik durumları özetler."

**Uyarı Türleri:**
- 🔴 Kritik: Stok sıfır veya negatif
- 🟠 Düşük: Minimum seviye altında
- 🟡 Dikkat: Yeniden sipariş noktasında
- 🔵 Bilgi: Fazla stok

**Dışa Aktarma:**

**Anlatım (devam):**
> "Tüm raporları Excel veya PDF formatında dışa aktarabilirsiniz. Üst yönetime sunmak veya arşivlemek için kullanın."

**Aksiyon:**
1. Rapor seç
2. "Dışa Aktar" butonuna tıkla
3. Format seç (Excel/PDF)
4. İndir

---

### 📍 SAHNE 7: Audit Trail (5:30 - 6:00)

**Ekranda:** `/inventory/audit-trail` sayfası

**Anlatım:**
> "Son olarak Audit Trail - denetim izi. Sistemde yapılan her işlemin kaydını tutar."

**Gösterilecek Bilgiler:**
- Tarih/Saat
- Kullanıcı
- İşlem Tipi
- Etkilenen Kayıt
- Önceki/Sonraki Değer
- IP Adresi

**Anlatım (devam):**
> "Bu kayıtlar değiştirilemez ve silinemez. Denetim, soruşturma veya hata analizi için vazgeçilmezdir.
>
> Bu, Stocker Envanter Modülü eğitim serimizin son videosuydu. Tüm videoları izlediğiniz için teşekkür ederiz. Sorularınız için destek ekibimize ulaşabilirsiniz.
>
> İyi çalışmalar!"

---

## 📋 ÖZET: Tüm Videolar

| # | Video | Süre | Ana Konular |
|---|-------|------|-------------|
| 1 | Temel Tanımlar | 8 dk | Birim, Marka, Kategori, Ürün |
| 2 | Depo Yönetimi | 6 dk | Depo, Bölge, Lokasyon |
| 3 | Stok İşlemleri | 10 dk | Hareket, Transfer, Düzeltme |
| 4 | Sayım & Rezervasyon | 7 dk | Fiziksel sayım, Rezerve |
| 5 | İleri Özellikler | 8 dk | Varyant, Seri No, Lot |
| 6 | Analiz & Raporlar | 6 dk | Dashboard, ABC, Tahmin |

**Toplam Süre:** ~45 dakika

---

## 🎯 Çekim Notları

### Genel Kurallar
1. Her sahne için ekran kaydı + ses kaydı ayrı yapılabilir
2. Mouse hareketleri yavaş ve belirgin olmalı
3. Form doldururken her alan için 2-3 saniye bekle
4. Hata mesajları gösterilecekse önceden planla
5. Başarı mesajlarını mutlaka göster

### Teknik Gereksinimler
- Ekran çözünürlüğü: 1920x1080
- Tarayıcı: Chrome (güncel)
- Demo verileri önceden hazırlanmalı
- Test ortamı kullanılmalı (production değil)

### Post-Prodüksiyon
- Zoom efektleri önemli alanlara uygulanabilir
- Alt yazı eklenebilir
- Bölüm geçişlerinde kısa animasyonlar
- Intro/Outro müziği (5 saniye)
