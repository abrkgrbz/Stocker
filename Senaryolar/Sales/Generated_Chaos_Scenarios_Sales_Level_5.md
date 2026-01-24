# Satış Modülü Kaos Senaryoları - Seviye 5

Bu belge, dış servis entegrasyonlarındaki hatalar, ağ sorunları ve daha karmaşık veri bütünlüğü sorunlarına odaklanır. Bu senaryolar, sistemin tek bir parçasının değil, birden fazla bileşenin etkileşimindeki zayıflıkları hedefler.

---

**Senaryo Başlığı:** Kargo Fiyat Hesaplama Servisinin Çökmesi
**Zorluk:** 5/10
**Olay:** Müşteri, ödeme adımında adresini girer ve kargo seçeneklerini bekler. Ancak, kargo fiyatlarını hesaplayan dış API (örn: Yurtiçi Kargo API'si) o anda yanıt vermez veya bir `500 Internal Server Error` döndürür.
**Beklenen Sorun:** Müşterinin ödemeyi tamamlayamaması. Kargo ücreti hesaplanamadığı için toplam sepet tutarı belirlenemez ve sipariş süreci kilitlenir. Kullanıcıya "Kargo seçenekleri yüklenemedi, lütfen daha sonra tekrar deneyin" gibi bir hata gösterilir.
**Architect'e Soru:** Dış API'lere olan bağımlılıklarımızı nasıl yönetiyoruz? Bu tür servisler için bir "circuit breaker" (devre kesici) pattern'i (örn: Polly kütüphanesi ile) kullanıyor muyuz? Servis çöktüğünde, müşteriye "ücretsiz kargo" veya "standart sabit fiyat" gibi bir fallback (yedek) seçenek sunarak süreci devam ettirme imkanımız var mı?

---

**Senaryo Başlığı:** Para Birimi Çevrim Kurunun Güncellenmemesi
**Zorluk:** 5/10
**Olay:** Sistem, USD, EUR gibi para birimlerinin TL karşılığını her saat başı bir dış servisten (örn: Merkez Bankası) çeker. Ancak bu servis iki gün boyunca erişilemez olur. Sistem, en son çektiği eski kurlarla fiyatları göstermeye devam eder. Bu sırada EUR/TL kurunda %10'luk bir artış yaşanır.
**Beklenen Sorun:** Finansal kayıp. Şirket, yabancı para birimiyle yapılan satışlarda, güncel kurdan daha düşük bir fiyata ürün satmış olur. Örneğin, 100 EUR'luk bir ürünü 3000 TL yerine 2700 TL'ye satar.
**Architect'e Soru:** Dış servislerden gelen kritik verilerin (döviz kuru, stok durumu vb.) "eskime" (staleness) durumunu izliyor muyuz? Veri, belirli bir süreden daha eskiyse (örn: 2 saat), alarm üreten veya ilgili özelliği (örn: EUR ile satışı) geçici olarak durduran bir mekanizmamız var mı?

---

**Senaryo Başlığı:** E-posta Gönderim Servisinin Hata Vermesi
**Zorluk:** 5/10
**Olay:** Kullanıcı siparişini başarıyla tamamlar. Sistem, sipariş onayı e-postasını göndermek için bir dış servise (örn: SendGrid, Mailgun) isteği gönderir. Ancak bu servisin API'si o an limit aşımı nedeniyle "429 Too Many Requests" hatası döner.
**Beklenen Sorun:** Müşterinin siparişinin alınıp alınmadığına dair bir teyit alamaması. Bu, müşterinin endişelenmesine ve müşteri hizmetlerini meşgul etmesine neden olur.
**Architect'e Soru:** E-posta gönderimi gibi "kritik ama anlık olması gerekmeyen" işlemleri nasıl ele alıyoruz? API isteği başarısız olduğunda, bu isteği daha sonra tekrar deneyecek bir "retry" mekanizması ve "background job" kuyruğu (örn: Hangfire, RabbitMQ) kullanıyor muyuz? Birkaç denemeden sonra hala başarısız olursa ne olur?

---

**Senaryo Başlığı:** Tedarikçiden Gelen Stok Bilgisinin Kısmen İşlenmesi
**Zorluk:** 5/10
**Olay:** Bir dış tedarikçinin sisteminden, 1000 ürünün yeni stok miktarlarını içeren bir XML/JSON dosyası periyodik olarak okunur. Dosya işlenirken, 500. satırdaki bir ürünün ID'si Stocker sisteminde bulunamaz veya veri formatı bozuktur. İşlem, bir hata fırlatır ve durur.
**Beklenen Sorun:** Kısmi veri güncellemesi. İlk 499 ürünün stoğu güncellenirken, geri kalan 501 ürünün stoğu eski kalır. Bu, envanterde büyük bir tutarsızlığa yol açar.
**Architect'e Soru:** Bu tür toplu (batch) import işlemlerini nasıl daha dayanıklı hale getirebiliriz? Tüm dosyayı tek bir transaction içinde mi işlemeliyiz (bu, uzun süreli kilitlere neden olabilir)? Yoksa her satırı ayrı bir işlem olarak ele alıp, hatalı olanları atlayıp bir "hatalı kayıtlar" raporu mu oluşturmalıyız? Saga pattern burada bir çözüm olabilir mi?

---

**Senaryo Başlığı:** Adres Otomatik Tamamlama Servisinin Yanlış Veri Dönmesi
**Zorluk:** 5/10
**Olay:** Kullanıcı, adresini yazarken Google Maps veya benzeri bir otomatik tamamlama servisi kullanılır. Servis, anlık bir hata nedeniyle, "İstanbul, Kadıköy" araması için "Ankara, Çankaya"ya ait bir posta kodu döner. Kullanıcı fark etmez ve adresi bu şekilde kaydeder.
**Beklenen Sorun:** Yanlış adrese teslimat. Kargo, yanlış bir şehre veya ilçeye yönlendirilir. Bu durum, hem müşteri memnuniyetsizliğine hem de operasyonel maliyete (kargonun geri dönmesi, tekrar gönderilmesi) neden olur.
**Architect'e Soru:** Dış servislerden gelen verilere ne kadar güveniyoruz? Adres gibi kritik verileri, birden fazla kaynaktan (örn: kullanıcının mahalle seçimi, posta kodu doğrulaması) teyit eden bir mekanizma var mı? Kullanıcıya, "Önerilen adres bu, doğru mu?" diye son bir onay adımı sunuyor muyuz?

---

**Senaryo Başlığı:** İptal Edilen Satın Alma Siparişinin Stok Bilgisini Güncellememesi
**Zorluk:** 5/10
**Olay:** Satın alma departmanı, 2 hafta sonra teslim edilmesi beklenen 100 adetlik bir sipariş oluşturur. Bu bilgi, Envanter modülüne yansır ve ürünün sayfasında "2 hafta içinde stokta" ibaresi belirir. Ancak daha sonra bu satın alma siparişi iptal edilir, fakat bu iptal bilgisi Satış veya Envanter modülüne iletilmez.
**Beklenen Sorun:** "Hayalet" stok beklentisi. Müşteriler ve satış ekibi, aslında hiç gelmeyecek olan ürünlerin yolda olduğunu düşünerek plan yaparlar. Bu, yanıltıcı bilgilendirmeye ve tutulamayacak sözler verilmesine neden olur.
**Architect'e Soru:** Farklı modüller (Satın Alma, Envanter, Satış) arasındaki veri tutarlılığını nasıl sağlıyoruz? Olay tabanlı bir mimari (event-driven architecture) mi kullanılıyor? "SatınAlmaİptalEdildi" gibi bir olay, diğer modüllerdeki ilgili verileri (örn: beklenen stok miktarı) güncelleyen işlemleri tetikliyor mu?

---

**Senaryo Başlığı:** Ürüne Ait Dökümanın (PDF) Yüklenememesi
**Zorluk:** 5/10
**Olay:** Bir ürünün (örn: elektronik bir cihaz) detay sayfasında, ürünün kullanım kılavuzunu içeren bir PDF dosyasına link verilir. Bu PDF, ayrı bir storage hesabında (örn: Azure Blob Storage, Minio) tutulmaktadır. Ancak bu storage hesabının erişim anahtarı (access key) değiştiği için link çalışmaz.
**Beklenen Sorun:** Kullanıcının önemli bir bilgiye erişememesi. Bu, özellikle teknik ürünler veya kurulum gerektiren ürünler için satın alma kararını etkileyebilir.
**Architect'e Soru:** Dış storage sistemleriyle olan bağlantı bilgilerini (connection strings, access keys) nasıl yönetiyoruz? Bu bilgileri .NET'in `appsettings.json` dosyasında mı, yoksa Azure Key Vault gibi güvenli bir sır yönetim (secret management) sisteminde mi tutuyoruz? Bu anahtarlar değiştiğinde, uygulamanın yeniden başlatılması gerekiyor mu?

---

**Senaryo Başlığı:** Kampanya Bitiş Saatinin Yanlış Yorumlanması (Timezone Hatası)
**Zorluk:** 5/10
**Olay:** "Gece Yarısı İndirimi" adlı bir kampanya, "24 Ocak 23:59"da bitecek şekilde ayarlanmıştır. Sunucu UTC (Coordinated Universal Time) zaman dilimindedir, ancak kampanya yönetim arayüzü bu tarihi yerel saat (UTC+3) olarak yorumlar. Sonuç olarak, kampanya Türkiye saatiyle gece yarısı yerine sabah 02:59'da biter (veya tam tersi, 3 saat erken biter).
**Beklenen Sorun:** Müşterilerin kampanyadan beklenenden daha uzun (veya daha kısa) süre yararlanması. Bu durum, ya şirketin zararına olur ya da müşterilerde "kampanya erken bitti" şikayetine yol açar.
**Architect'e Soru:** Zaman dilimi (timezone) yönetimi için şirket genelinde bir standartımız var mı? Tüm tarih/saat verilerini veritabanında UTC olarak mı saklıyoruz? Kullanıcıya gösterirken veya iş kurallarını uygularken bu UTC veriyi kullanıcının yerel saatine veya işin gerektirdiği saate (örn: Türkiye saati) nasıl doğru bir şekilde çeviriyoruz?

---

**Senaryo Başlığı:** Kısmi Stok Verisi Yüzünden Sayfanın Çökmesi
**Zorluk:** 5/10
**Olay:** Bir ürünün stoğu, 3 farklı depoda (Ankara, İstanbul, İzmir) tutulmaktadır. Depolardan birinin (İzmir) envanter bilgisini getiren iç servis, anlık bir ağ sorunu nedeniyle yanıt vermez. Ürün detay sayfasını oluşturan API, bu ürünün toplam stoğunu hesaplarken "null" bir değerle karşılaşır ve çöker.
**Beklenen Sorun:** Tek bir deponun verisinin eksik olması, tüm ürün sayfasının görüntülenememesine (500 hata) neden olur. Hatanın kısmi ve tolere edilebilir olması gerekirken, tüm sistemi etkiler.
**Architect'e Soru:** Mikroservis mimarisinde, bir servisin çökmesinin diğer servisleri etkilemesini (cascading failure) nasıl önleriz? API, İzmir deposundan veri alamadığında, toplam stoğu "sadece mevcut verilerle" (Ankara+İstanbul) gösterip yanında bir uyarı ("Bazı depo bilgileri alınamadı") mı göstermeli? Bu tür "graceful degradation" (zarif düşüş) senaryoları için bir stratejimiz var mı?

---

**Senaryo Başlığı:** Sosyal Medya Paylaşım Butonlarının Sayfayı Yavaşlatması
**Zorluk:** 5/10
**Olay:** Ürün detay sayfasında bulunan Facebook, Twitter, Pinterest için "Paylaş" butonları, kendi script'lerini yüklemek için bu sitelere istek gönderir. Ancak o anda Twitter'ın script sunucuları yavaştır. Tarayıcı, bu script'in yüklenmesini beklediği için sayfanın geri kalanının yüklenmesini (rendering) block'lar.
**Beklenen Sorun:** Üçüncü parti bir script yüzünden tüm sayfanın yüklenmesinin yavaşlaması. Bu, hem kullanıcı deneyimini (UX) hem de SEO metriklerini (Google PageSpeed) olumsuz etkiler.
**Architect'e Soru:** Üçüncü parti JavaScript'leri nasıl yönetiyoruz? Bu script'leri `async` veya `defer` attribute'ları ile yükleyerek sayfanın render'ını block'lamalarını önlüyor muyuz? Google Tag Manager gibi bir araç kullanarak bu script'lerin yönetimini merkezileştiriyor muyuz?
