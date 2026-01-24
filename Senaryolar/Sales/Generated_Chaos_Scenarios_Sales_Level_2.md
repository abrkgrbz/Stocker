# Satış Modülü Kaos Senaryoları - Seviye 2

Bu belge, küçük çaplı iş mantığı hatalarını, veri tutarsızlıklarını ve kullanıcı deneyimini hafifçe bozan ancak sisteme veya verilere kalıcı hasar vermeyen senaryoları içerir.

---

**Senaryo Başlığı:** "Yeni Ürün" Rozeti Hiç Kaybolmuyor
**Zorluk:** 2/10
**Olay:** Sisteme yeni eklenen ürünlere, 30 gün boyunca gösterilmesi gereken bir "YENİ" rozeti eklenir. Ancak bir zamanlanmış görev (scheduled job) hatası nedeniyle, 30 gün geçmesine rağmen bu rozetler ürünlerin üzerinden kalkmaz.
**Beklenen Sorun:** Müşteriler için yanıltıcı bilgi. Aylardır sistemde olan bir ürün "yeni" olarak etiketlenir ve bu özelliğin değeri kaybolur.
**Architect'e Soru:** Zamanlanmış görevlerin (cron jobs) sağlık durumunu (başarılı/başarısız çalışma, son çalışma zamanı) izleyen bir dashboard'umuz var mı? Bu tür basit durum güncellemeleri için zamanlanmış görev mi, yoksa sorgu anında `eklenme_tarihi` üzerinden anlık hesaplama yapmak mı daha doğru bir yaklaşımdır?

---

**Senaryo Başlığı:** Kupon Kodu Büyük/Küçük Harf Duyarlı
**Zorluk:** 2/10
**Olay:** Pazarlama departmanı, "BAHAR20" adında bir kupon kodu oluşturur. Müşteriler, bu kodu "bahar20" olarak yazdıklarında sistem "Geçersiz kupon kodu" hatası verir.
**Beklenen Sorun:** Müşteri memnuniyetsizliği ve satış kaybı. Çoğu kullanıcı, kupon kodlarının büyük/küçük harf duyarlı olmasını beklemez ve kuponun çalışmadığını düşünerek alışverişi terk edebilir.
**Architect'e Soru:** Veri giriş noktalarında (kupon kodu, kullanıcı adı, e-posta vb.) `ToUpper()` veya `ToLower()` gibi normalizasyon adımları uyguluyor muyuz? Bu, API Gateway seviyesinde mi, yoksa Application Service katmanında mı yapılmalı?

---

**Senaryo Başlığı:** Sepet İkonundaki Ürün Sayısı Yanlış
**Zorluk:** 2/10
**Olay:** Kullanıcı, sepetine 3 farklı üründen birer adet ekler. Sepet sayfasında 3 ürün doğru bir şekilde görünür. Ancak, sitenin header'ındaki sepet ikonunda "2" yazar.
**Beklenen Sorun:** Kullanıcıda kafa karışıklığı ve güvensizlik. Kullanıcı, sepetine eklediği bir ürünün kaybolduğunu düşünebilir.
**Architect'e Soru:** Sepet içeriği ve sepet özeti (toplam tutar, ürün sayısı) gibi bilgiler için state management (durum yönetimi) nasıl yapılıyor? Next.js'te React Context, Redux veya Zustand gibi bir kütüphane mi kullanılıyor? Bu durumun farklı component'ler arasında senkronizasyonunu nasıl sağlıyoruz?

---

**Senaryo Başlığı:** İndirimli Fiyatın Üzeri Çizilmemiş
**Zorluk:** 2/10
**Olay:** 100 TL'lik bir ürün %20 indirime girerek 80 TL'ye düşer. Ürün sayfasında fiyat doğru bir şekilde 80 TL olarak görünür, ancak eski fiyat olan 100 TL'nin üzeri çizili bir şekilde gösterilmez.
**Beklenen Sorun:** Pazarlama etkisinin azalması. Müşteri, ürünün indirimde olduğunu fark etmeyebilir. Bu, indirimin getireceği "fırsat algısını" ortadan kaldırır.
**Architect'e Soru:** Ürün fiyatı API'den tek bir değer olarak mı (`fiyat: 80`), yoksa bir obje olarak mı (`fiyat: { eski: 100, yeni: 80 }`) geliyor? Fiyatlandırma ve indirim bilgilerini modelleyen DTO'larımız bu tür UI ihtiyaçlarını ne kadar destekliyor?

---

**Senaryo Başlığı:** Misafir Kullanıcının Sepeti Cihazda Kalıyor
**Zorluk:** 2/10
**Olay:** Sisteme üye girişi yapmamış bir misafir kullanıcı, bilgisayarından sepetine birkaç ürün ekler. Daha sonra aynı ağdaki telefonundan siteye girdiğinde sepetinin boş olduğunu görür.
**Beklenen Sorun:** Kötü ve kesintili bir çoklu cihaz deneyimi. Misafir kullanıcı, sepetini sadece oluşturduğu cihazda görebilir, bu da satış hunisinde bir engel oluşturur.
**Architect'e Soru:** Misafir sepetlerini nasıl yönetiyoruz? Sadece client-side (örn: localStorage) mı tutuluyor? Misafir sepetlerini sunucu tarafında (örn: Redis) geçici bir ID ile tutup bu ID'yi cookie'de saklayarak cihazlar arası bir deneyim sunabilir miydik? Bunun gizlilik (privacy) ve GDPR açısından etkileri nelerdir?

---

**Senaryo Başlığı:** Filtre Uygulandıktan Sonra Sayfa Sayısı Sıfırlanmıyor
**Zorluk:** 2/10
**Olay:** Kullanıcı, 10 sayfa sonuç içeren bir kategori listesinde 5. sayfadadır. Daha sonra, sadece 1 sayfa sonuç döndürecek bir renk filtresi (örn: "Kırmızı") uygular. Sistem, filtrelenmiş sonuçları getirir ancak kullanıcı hala 5. sayfada olduğu için "Bu sayfada ürün bulunamadı" mesajı gösterir.
**Beklenen Sorun:** Kullanıcının filtrelemenin çalışmadığını veya hiç kırmızı ürün olmadığını düşünmesi. Kullanıcının manuel olarak 1. sayfaya geri dönmesi gerekir.
**Architect'e Soru:** Frontend'de, filtreleme veya arama kriterleri değiştiğinde sayfalama (pagination) durumunun (mevcut sayfa numarası gibi) sıfırlanmasını zorunlu kılan bir kural var mı? Bu tür state'ler arasındaki bağımlılıkları nasıl yönetiyoruz?

---

**Senaryo Başlığı:** Başarısız Ödeme Sonrası Sepet Boşalıyor
**Zorluk:** 2/10
**Olay:** Kullanıcı, dolu bir sepetle ödeme sayfasına gider ve kredi kartı bilgilerini yanlış girer. Ödeme başarısız olur ve kullanıcı bir önceki sayfaya yönlendirilir. Ancak bu sırada sepeti tamamen boşalmıştır.
**Beklenen Sorun:** Aşırı derecede can sıkıcı bir kullanıcı deneyimi. Müşterinin, tüm ürünleri sepetine tekrar eklemesi gerekir, bu da büyük olasılıkla siteyi terk etmesine neden olur.
**Architect'e Soru:** Ödeme işlemi başlatıldığında sipariş hangi aşamada oluşturuluyor? Başarısız bir ödeme denemesi, "sipariş" objesini veya ilişkili "sepet" objesini veritabanından siliyor mu? Sipariş yaşam döngüsü (order lifecycle) nasıl bir state machine ile yönetiliyor?

---

**Senaryo Başlığı:** "Favorilere Ekle" Durumu Sayfa Yenilenince Kayboluyor
**Zorluk:** 2/10
**Olay:** Kullanıcı bir ürünü "favorilerine" ekler ve ürün kartındaki kalp ikonu dolar. Ancak, sayfayı yenilediğinde kalp ikonunun tekrar boş olduğunu görür. Favorilerim sayfasına gittiğinde ise ürünün orada olduğunu fark eder.
**Beklenen Sorun:** Tutarsız UI durumu. Kullanıcı, işlemin başarılı olmadığını düşünerek tekrar tekrar butona basabilir. Arayüz, veritabanındaki gerçek durumu yansıtmıyor.
**Architect'e Soru:** Ürün listesi gibi veriler sunucudan (SSR/ISR) gelirken, favori durumu gibi kullanıcıya özel veriler client-side mı alınıyor? Bu iki farklı veri kaynağının birleşimi (hydration) sırasında mı bir tutarsızlık yaşanıyor?

---

**Senaryo Başlığı:** İlgisiz "Benzer Ürünler" Önerisi
**Zorluk:** 2/10
**Olay:** Kullanıcı, bir "cep telefonu" ürününün detay sayfasını incelerken, sayfanın altındaki "Benzer Ürünler" bölümünde "bebek bezi" ve "bahçe hortumu" gibi alakasız ürünler görür.
**Beklenen Sorun:** Özelliğin tamamen anlamsızlaşması ve potansiyel ek satış (cross-sell/up-sell) fırsatının kaçırılması. Sistemin "akıllı" olmadığı izlenimi verir.
**Architect'e Soru:** Ürün öneri algoritması nasıl çalışıyor? Aynı kategorideki ürünleri mi gösteriyor, yoksa daha karmaşık bir mantık (makine öğrenmesi, iş kuralları) mı var? Bu algoritmanın başarısız olduğu (örn: yeterli veri bulamadığı) durumlarda ne tür bir geri dönüş (fallback) mekanizması var?

---

**Senaryo Başlığı:** E-posta Abonelik Formu Her Sayfada Açılıyor
**Zorluk:** 2/10
**Olay:** Kullanıcı siteye ilk girdiğinde, e-posta bültenine abone olması için bir pop-up çıkar. Kullanıcı bu pop-up'ı kapatır. Ancak, sitede gezdiği her yeni sayfada (veya her sayfa yenilemede) aynı pop-up tekrar tekrar çıkar.
**Beklenen Sorun:** Kullanıcı için son derece rahatsız edici bir deneyim. Kullanıcının siteyi terk etmesine neden olabilir.
**Architect'e Soru:** Kullanıcının bu pop-up ile olan etkileşimini (kapattı, abone oldu vb.) nerede saklıyoruz? `localStorage` veya bir cookie içinde bu durumu işaretleyen bir flag var mı? Bu kontrol neden düzgün çalışmıyor olabilir? (örn: SSR nedeniyle `localStorage`'a erişememe)
