# Satış Modülü Kaos Senaryoları - Seviye 4

Bu belge, basit eşzamanlılık (concurrency) sorunları, durum yönetimi (state management) tutarsızlıkları ve hafif veri bütünlüğü problemlerine odaklanan senaryoları içerir.

---

**Senaryo Başlığı:** İki Sekmede Açık Sepetin Senkronizasyon Sorunu
**Zorluk:** 4/10
**Olay:** Kullanıcı, aynı tarayıcıda iki farklı sekmede aynı Stocker hesabıyla oturum açar. Birinci sekmede sepetine A ürününü ekler. İkinci sekmede ise B ürününü ekler. Ancak ikinci sekmedeki sepet, A ürününü göstermez; sadece B'yi gösterir. Sayfayı yenilediğinde ise her iki ürün de görünür.
**Beklenen Sorun:** Tutarsız sepet durumu. Kullanıcı, sepetinin içeriği hakkında yanlış bir fikre sahip olur. Bu durum, client-side state'in (React state) sunucu tarafındaki gerçek durumla senkronize olmamasından kaynaklanır.
**Architect'e Soru:** Farklı sekmeler veya cihazlar arasında state senkronizasyonu için bir stratejimiz var mı? Sunucudan gelen güncellemeleri dinlemek için WebSocket veya server-sent events (SSE) kullanıyor muyuz? Veya client-side'da `BroadcastChannel` API'si ile sekmeler arası iletişim kurmayı düşündük mü?

---

**Senaryo Başlığı:** Stok Güncelleme Yarışı (Race Condition)
**Zorluk:** 4/10
**Olay:** Bir üründen son 1 adet kalmıştır. İki farklı müşteri, ürünü milisaniyeler farkıyla sepetine ekleyip ödeme sayfasına gider. Her ikisi de stok kontrolünden geçer çünkü kontrol anında stok "1"dir. Her ikisi de "Siparişi Onayla" butonuna basar.
**Beklenen Sorun:** Overselling (stok fazlası satış). İki siparişten biri başarılı olurken diğeri "Stok yetersiz" hatası almalıdır. Ancak, stok düşürme işlemi atomik değilse (oku, azalt, yaz), her iki işlemin de stoğun "1" olduğunu okuyup, stoğu "0"a ve ardından "-1"e düşürmesi mümkündür.
**Architect'e Soru:** Envanter tablosunda, bu tür race condition'ları önlemek için EF Core'un hangi concurrency kontrol mekanizmasını kullanıyoruz? İyimser kilitleme (Optimistic Locking) ve bir `RowVersion` kolonu yeterli mi? Bu durumda, ikinci gelen kullanıcıya "Stok az önce tükendi, lütfen sepetinizi kontrol edin" gibi anlamlı bir hata gösterebiliyor muyuz?

---

**Senaryo Başlığı:** Yönetici ve Kullanıcının Aynı Anda Ürün Bilgisi Güncellemesi
**Zorluk:** 4/10
**Olay:** Bir yönetici, "Ürün A"nın açıklamasını yönetici panelinden güncellerken, aynı anda bir müşteri bu ürün için bir "yorum" veya "değerlendirme" gönderir. Her iki işlem de aynı ürün tablosundaki farklı kolonları günceller.
**Beklenen Sorun:** Eğer tüm güncelleme işlemi, nesnenin tamamını alıp geri yazmak (full object update) şeklinde yapılıyorsa, "son yazan kazanır" (last-write-wins) durumu oluşur. Yöneticinin yaptığı açıklama değişikliği, müşteri yorumunu kaydeden işlem tarafından ezilebilir (veya tam tersi).
**Architect'e Soru:** Güncelleme (UPDATE) işlemlerimiz için `HTTP PATCH` ve kısmi güncelleme (partial update) mi, yoksa `HTTP PUT` ve tam güncelleme mi kullanıyoruz? Kısmi güncellemeleri EF Core ile güvenli bir şekilde nasıl uyguluyoruz? Bu, DTO'lar ve AutoMapper gibi araçlarla nasıl yönetiliyor?

---

**Senaryo Başlığı:** Süresi Dolan İade Hakkı ve İş Mantığı Gecikmesi
**Zorluk:** 4/10
**Olay:** Bir ürünün iade süresi 30 gündür. Müşteri, siparişinin üzerinden 30 gün 1 saat geçtikten sonra "İade Talebi Oluştur" butonuna basar. Frontend, butonu hala aktif gösterdiği için istek gönderilir. Backend, isteği aldığında iade süresini kontrol eder ve talebi reddeder.
**Beklenen Sorun:** Kullanıcıya boşuna umut verme. Arayüz, iş kurallarını (iade süresinin dolması gibi) sunucuyla tam senkronize bir şekilde yansıtmaz. Kullanıcı, butona basabildiği için iade edebileceğini düşünür ama reddedilir.
**Architect'e Soru:** Zaman veya duruma bağlı iş kuralları (butonun aktif/pasif olması gibi) sadece backend'de mi kontrol ediliyor? Frontend'in bu kurallardan haberdar olup UI'ı proaktif olarak güncellemesini sağlayan bir mekanizma var mı? (örn: API'den gelen veride `iadeEdilebilir: false` gibi bir flag)

---

**Senaryo Başlığı:** Kısmi Teslimat Sonrası Sipariş Durumu Tutarsızlığı
**Zorluk:** 4/10
**Olay:** Müşteri 10 adet ürün sipariş eder. Depoda sadece 7 adet vardır. Depo görevlisi, 7 adet ürünü kargolar ve sisteme "kısmi teslimat yapıldı" olarak işler. Ancak, müşterinin "Siparişlerim" sayfasında siparişin durumu hala "Hazırlanıyor" olarak görünür.
**Beklenen Sorun:** Müşteriye yanlış bilgi verilmesi. Müşteri, ürünlerinin bir kısmının yola çıktığından haberdar olmaz. Siparişin "Kısmen Kargolandı" gibi daha detaylı bir duruma geçmesi gerekir.
**Architect'e Soru:** Sipariş durumlarını (Order Status) ne kadar detaylı yönetiyoruz? `Siparis` ve `SiparisKalemi` seviyelerinde ayrı durumlar (statüler) tutuyor muyuz? Bir siparişin birden fazla sevkiyatı olabileceği senaryosu mimaride destekleniyor mu?

---

**Senaryo Başlığı:** Stok Transferi Sırasında Envanterin "Arafta" Kalması
**Zorluk:** 4/10
**Olay:** 5 adet ürün, A deposundan B deposuna transfer edilir. İşlem başlar, ürünler A deposunun "satılabilir" stoğundan düşülür ve "transferde" olarak işaretlenir. Bu süreçte (birkaç saat veya gün sürebilir), bu 5 ürün hiçbir deponun satılabilir stoğunda görünmez.
**Beklenen Sorun:** Raporlama tutarsızlığı. Şirketin toplam envanter değeri doğru olsa da, depo bazında envanter raporları eksik görünür. Birisi bu ürünleri ararsa, sistemde var ama "kayıp" gibi görünürler.
**Architect'e Soru:** "Transferdeki stok", "kalite kontroldeki stok" gibi farklı envanter statülerini mimaride nasıl modelliyoruz? Bu farklı statüler, raporlama ve stok yönetimi arayüzlerinde net bir şekilde ayırt edilebiliyor mu?

---

**Senaryo Başlığı:** Abone Olunan Stok Bildirimi Gönderilmiyor
**Zorluk:** 4/10
**Olay:** Stoğu tükenmiş bir ürün için bir müşteri "Stoğa gelince haber ver" butonuna tıklar ve aboneliğini oluşturur. Bir hafta sonra, ürüne 10 adet stok girişi yapılır. Ancak müşteriye hiçbir e-posta veya bildirim gitmez.
**Beklenen Sorun:** Kaçırılan satış fırsatı ve kötü müşteri deneyimi. Müşteri, sistemin çalışmadığını düşünür ve markaya olan güveni azalır.
**Architect'e Soru:** Stok güncelleme işlemi ile bildirim gönderme işlemi arasındaki bağlantı nasıl kuruluyor? Stok girişi tamamlandığında "UrunStogaGirdi" gibi bir domain event mi fırlatılıyor? Bu olayı dinleyip bildirimleri gönderen ayrı bir servis (background service) mi var? Bu servisin loglarını ve hata durumlarını izliyor muyuz?

---

**Senaryo Başlığı:** Para Birimi Değişikliği Sonrası Filtrelerin Bozulması
**Zorluk:** 4/10
**Olay:** Kullanıcı, para birimini TL'den EUR'ya çevirir. Ürün listesi doğru fiyatlarla (EUR) güncellenir. Ancak, sol taraftaki "Fiyat Aralığı" filtresi hala TL'ye göre (örn: 0-100 TL, 100-500 TL) kalır ve kullanılamaz hale gelir.
**Beklenen Sorun:** Filtreleme özelliğinin bozulması. Kullanıcı, yeni para birimine göre fiyat aralığı seçemez.
**Architect'e Soru:** Para birimi gibi global state'ler değiştiğinde, bu değişikliğe bağlı olan tüm component'lerin (ürün listesi, filtreler, sepet vb.) yeniden render edilmesini ve güncel veriyi çekmesini nasıl sağlıyoruz? Bu, React Context veya benzeri bir state management aracıyla mı yönetiliyor?

---

**Senaryo Başlığı:** Başarısız Resim Yükleme ve Varsayılan Resmin Gösterilmemesi
**Zorluk:** 4/10
**Olay:** Bir yönetici yeni bir ürün eklerken, ürün resmini yüklemeyi unutur veya yükleme sırasında bir hata oluşur. API, bu ürün için `resim_url` alanını `null` veya boş string olarak kaydeder.
**Beklenen Sorun:** Frontend'de bu ürün listelendiğinde, `img` etiketinin `src` attribute'u boş kalır ve bozuk resim ikonu gösterilir. Normalde, bu durumda bir "varsayılan ürün resmi" gösterilmesi beklenir.
**Architect'e Soru:** Frontend component'leri, `null` veya boş `src` gibi beklenen "boş" durumlara karşı ne kadar dayanıklı? `resim_url` null ise varsayılan bir resim gösterme mantığı, her component'in kendi içinde mi tekrarlanıyor, yoksa bu mantığı merkezi olarak uygulayan bir `ProductImage` component'imiz mi var?

---

**Senaryo Başlığı:** Veritabanı Gecikmesi Nedeniyle Görünen Eski Veri
**Zorluk:** 4/10
**Olay:** Bir yönetici, bir ürünün adını "Eski Ad"dan "Yeni Ad"a günceller. Değişikliği kaydeder. Hemen ardından ürün listeleme sayfasına gider ancak orada hala "Eski Ad" yazar. Birkaç saniye sonra sayfayı yenilediğinde "Yeni Ad" görünür.
**Beklenen Sorun:** Cache veya veritabanı replikasyon gecikmesi nedeniyle anlık veri tutarsızlığı. Kullanıcı, yaptığı değişikliğin kaydedilmediğini düşünebilir.
**Architect'e Soru:** Veri güncelleme işlemlerinden sonra ilgili cache'leri nasıl geçersiz kılıyoruz (cache invalidation)? `POST`, `PUT`, `DELETE` isteklerinden sonra, ilgili veriyi listeleyen `GET` isteklerinin cache'ini otomatik olarak temizleyen bir mekanizmamız var mı? Bu, API Gateway seviyesinde mi (örn: Varnish, Nginx), yoksa uygulama içinde mi (örn: Redis cache'ini manuel silme) yapılıyor?
