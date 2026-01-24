# Satış Modülü Kaos Senaryoları - Seviye 8

Bu belge, ciddi performans darboğazlarına (bottlenecks), "katil sorgulara" (killer queries), sistemin genelini etkileyen zincirleme çöküşlere (cascading failures) ve karmaşık veri bütünlüğü sorunlarına odaklanır.

---

**Senaryo Başlığı:** Yıl Sonu Envanter Raporu ve Veritabanı Felci
**Zorluk:** 8/10
**Olay:** Bir yönetici, tüm depoların, tüm ürünlerin ve tüm lokasyonların bir yıllık stok hareketlerini içeren devasa bir envanter değerleme raporu çekmek ister. Bu rapor, milyonlarca satırlık `StokHareketleri` tablosunu, `Urunler`, `Depolar` gibi tablolarla `JOIN`'leyerek karmaşık hesaplamalar (örn: ağırlıklı ortalama maliyet) yapmaya çalışır.
**Beklenen Sorun:** "Katil sorgu" (killer query). Bu sorgu, veritabanı kaynaklarının (CPU, memory, I/O) büyük bir kısmını dakikalarca, hatta saatlerce tüketir. Canlı (production) veritabanı üzerinde çalıştırıldığı için, sistemdeki diğer tüm operasyonları (sipariş alma, stok güncelleme vb.) durma noktasına getirir. Sorgu, uzun süren kilitlere (locks) neden olarak deadlock riskini de artırır.
**Architect'e Soru:** Bu tür karmaşık ve uzun süren analitik sorgular için stratejimiz nedir? Bu raporları canlı veritabanı yerine, gecikmeli bir kopyası (read replica) veya özel olarak bu iş için tasarlanmış bir data warehouse/veri gölü (data lake) üzerinden mi çalıştırmalıyız? Raporlama sorgularının canlı sistemi etkilemesini önlemek için `WITH (NOLOCK)` gibi izolasyon seviyeleri veya PostgreSQL'in kaynak sınırlama (resource governance) mekanizmaları kullanıyor muyuz?

---

**Senaryo Başlığı:** Veritabanı Deadlock'u ile Stok Sıkışması
**Zorluk:** 8/10
**Olay:** İki ayrı toplu işlem aynı anda başlar. İşlem A, Ürün1'in stoğunu güncelleyip ardından Ürün2'nin stoğunu güncellemek için kilitler. Eş zamanlı olarak İşlem B, Ürün2'nin stoğunu güncelleyip ardından Ürün1'in stoğunu güncellemek için kilitler.
**Beklenen Sorun:** Klasik bir veritabanı deadlock'u. İşlem A, Ürün2'yi beklerken İşlem B, Ürün1'i bekler. PostgreSQL deadlock'u tespit edip işlemlerden birini sonlandırana kadar her iki işlem de süresiz olarak donar. Bu durum, API'de timeout hatalarına ve kullanıcıların işlemlerinin yarım kalmasına neden olur.
**Architect'e Soru:** Uygulama genelinde kaynak kilitleme sırasını (resource locking order) zorunlu kılan bir standardımız var mı (örn: her zaman ürün ID'sine göre artan sırada kilitle)? EF Core'un transaction yönetimi ve PostgreSQL'in deadlock tespiti bu durumu ne kadar sürede çözer? Kullanıcıya "İşleminiz deadlock kurbanı oldu, lütfen tekrar deneyin" gibi bir mesaj göstermek için altyapımız hazır mı?

---

**Senaryo Başlığı:** Satış Modülü ile Envanter Arasında Gecikmeli Tutarlılık (Eventual Consistency) Krizi
**Zorluk:** 8/10
**Olay:** Sistem, yüksek performans için olay tabanlı (event-driven) bir mimari kullanır. Satış modülü bir ürün sattığında, "UrunSatildi" olayını bir mesaj kuyruğuna (message queue) atar. Envanter modülü bu kuyruğu dinleyerek stoğu günceller. Ancak, mesaj kuyruğunda anlık bir yavaşlama veya kesinti olur ve stok güncelleme işlemi 5 dakika gecikir. Bu sırada, Envanter modülünün API'si hala eski stok bilgisini gösterir.
**Beklenen Sorun:** Overselling. İlk satışın stoğu düşmesi geciktiği için, bu 5 dakika içinde aynı ürün (eğer stok azsa) birden çok kez daha satılabilir. Müşterilere "stok var" bilgisi gösterilirken, aslında fiziksel stok çoktan tükenmiştir.
**Architect'e Soru:** Eventual consistency modelini benimsediğimiz senaryolarda, "tutarsızlık penceresi" (inconsistency window) olarak adlandırılan bu gecikme süresinin yaratacağı iş risklerini nasıl yönetiyoruz? Kritik stoklar için (son X adet ürün gibi) daha anlık bir kontrol mekanizması (örn: satış anında envanter API'sini doğrudan çağırmak) gibi bir hibrit yaklaşım düşünülmeli mi?

---

**Senaryo Başlığı:** Ağırlıklı Ortalama Maliyetin Anlık Olarak Yeniden Hesaplanması
**Zorluk:** 8/10
**Olay:** Sistem, stok maliyetini "Ağırlıklı Ortalama Maliyet" (Weighted Average Cost - WAC) metoduyla hesaplıyor. Yüksek hacimli bir ürün için, milisaniyeler içinde aynı anda bir satış işlemi (stok çıkışı) ve yeni, daha yüksek bir fiyattan bir satınalma işlemi (stok girişi) gerçekleşir.
**Beklenen Sorun:** Maliyet hesaplama yarış durumu (Race Condition). Satış işlemi, maliyeti kaydetmek için WAC'ı okuduğu anda, satınalma işlemi WAC'ı güncellerse, satışın maliyeti eski (düşük) fiyattan kaydedilir. Bu, satılan malın maliyetini (COGS) düşük, envanter değerini ise yapay olarak yüksek gösterir. Eğer bu işlemler atomik bir şekilde yönetilmezse, veritabanındaki son WAC değeri de hangi işlemin en son yazdığına bağlı olarak şans eseri belirlenir.
**Architect'e Soru:** Maliyetlendirme gibi finansal bütünlük gerektiren işlemler, envanter hareketleriyle aynı transaction içinde mi yönetiliyor? Ağırlıklı ortalama maliyetin her stok girişinde yeniden hesaplanması ve bu değerin bir sonraki çıkış işlemi için kilitlenmesini (locking) nasıl bir mekanizma ile sağlıyoruz? Bu, performansı nasıl etkiler?

---

**Senaryo Başlığı:** Çok Adımlı Transferde Aradaki Depoda Stok Unutulması
**Zorluk:** 8/10
**Olay:** Bir ürünün A deposundan C deposuna gitmesi gerekmektedir, ancak rota gereği önce B aktarma merkezine uğramalıdır (A -> B -> C). Transfer, A'dan B'ye başarıyla yapılır. Ürün B'de stoğa girer. Ancak, B'den C'ye olan ikinci transfer adımı bir hata nedeniyle (örn: C deposu o an alım kabul etmiyor) hiçbir zaman tetiklenmez veya başarısız olur.
**Beklenen Sorun:** Ürün, hedef deposu olan C yerine, ara depoda (B) kalır. Eğer raporlama ve uyarı mekanizmaları yetersizse, bu ürünün neden B deposunda olduğu ve asıl hedefinin neresi olduğu bilgisi kaybolur. Operasyonel olarak ürün "kayıptır".
**Architect'e Soru:** Çok adımlı (multi-leg) transferleri tek bir "Transfer Emri" konsepti altında mı yönetiyoruz? Bu emrin her bir adımının (leg) durumunu (Beklemede, Yolda, Tamamlandı) ayrı ayrı takip ediyor muyuz? Bir adımda oluşan bir hata veya gecikmenin, tüm transfer emrini nasıl etkilediğini ve ilgili kişilere nasıl uyarı gönderildiğini tanımlayan bir iş akışımız var mı?

---

**Senaryo Başlığı:** Ödeme Servisindeki Gecikmenin Zincirleme Etkisi
**Zorluk:** 8/10
**Olay:** Ödeme ağ geçidi (payment gateway), yoğunluk nedeniyle tüm işlemlere 30 saniye gecikmeyle yanıt vermeye başlar. Stocker.API, her ödeme isteği için 30 saniye boyunca bir thread'i veya process'i bekletir. Black Friday gibi bir günde, saniyede gelen onlarca ödeme isteği, kısa sürede tüm mevcut bağlantı havuzunu (connection pool) ve thread'leri tüketir.
**Beklenen Sorun:** Sistemin tamamen yanıt vermez hale gelmesi (unresponsiveness). Sadece ödeme yapmak isteyenler değil, siteye girmeye, ürün aramaya veya sayfaları gezmeye çalışan tüm kullanıcılar, dolu olan thread'ler/bağlantılar nedeniyle timeout hatası alır. Tek bir dış servisteki yavaşlama, tüm sistemi çökertir.
**Architect'e Soru:** Dış servislere yapılan tüm çağrılar için timeout değerleri (örn: 5 saniye) belirlenmiş mi? Bu timeout'lar, Polly gibi bir kütüphane ile asenkron olarak mı yönetiliyor? Bir servisin yavaşlaması durumunda, o servise giden istekleri bir süreliğine kesen (circuit breaker) ve sistemin geri kalanının çalışmaya devam etmesini sağlayan bir mekanizma var mı?

---

**Senaryo Başlığı:** Sayım Farklarının Otomatik Onaylanması ve Zincirleme Hata
**Zorluk:** 8/10
**Olay:** Sistem, sayım sonucunda ortaya çıkan +/- %1'e kadar olan farkları önemsiz kabul edip bir yöneticinin onayı olmadan otomatik olarak "yangın zayiatı" gibi bir nedenle stoktan düşecek veya artıracak şekilde yapılandırılmıştır. Ancak, bir depoda sistematik bir tartı hatası nedeniyle, kiloyla satılan 50 farklı ürün sürekli olarak %0.8 eksik ölçülmektedir.
**Beklenen Sorun:** Küçük ve önemsiz gibi görünen hataların birikerek büyük bir finansal kayba yol açması. Her sayımda, bu 50 ürünün stoğu otomatik olarak düzeltilir ve kimse sistematik sorunun farkına varmaz. Denetim kaydı ("audit trail") yetersizse, bu kaybın kaynağını bulmak aylar sürebilir.
**Architect'e Soru:** Otomatikleştirilmiş süreçlerin (auto-approval) yaratabileceği riskleri nasıl yönetiyoruz? Hangi seviyedeki bir farkın insan onayı gerektireceği dinamik olarak (ürün değeri, depo lokasyonu vb. göre) yapılandırılabiliyor mu? Otomatik yapılan tüm düzeltmeler, daha sonra analiz edilebilmek üzere ayrı ve dikkat çekici bir şekilde mi loglanıyor?

---

**Senaryo Başlığı:** Log Servisinin Çökmesiyle Hataların Gizli Kalması
**Zorluk:** 8/10
**Olay:** Uygulama, loglarını merkezi bir loglama servisine (örn: Sentry, Datadog, ELK Stack) gönderir. Ancak bu servis, ağ sorunları veya kendi içindeki bir problem nedeniyle ulaşılamaz hale gelir. Bu sırada, uygulamada bir dizi kritik hata (örn: ödeme hataları, stok tutarsızlıkları) oluşmaya başlar.
**Beklenen Sorun:** "Kör uçuş". Geliştiriciler ve operasyon ekibi, sistemde ciddi sorunlar yaşandığından haberdar olmaz, çünkü hata log'ları hiçbir yere ulaşmaz. Sorun, ancak müşterilerin şikayet etmeye başlamasıyla veya iş metriklerinde (örn: satışların aniden durması) büyük bir anomali fark edildiğinde anlaşılır. Bu da müdahale süresini ciddi şekilde uzatır.
**Architect'e Soru:** Loglama altyapımız ne kadar dayanıklı? Merkezi log servisine ulaşılamadığında ne olur? Log'ları geçici olarak yerel diske yazıp, servis geri geldiğinde tekrar göndermeye çalışan bir fallback mekanizmamız var mı? Kritik hatalar için loglama servisinden bağımsız çalışan bir alarm mekanizması (örn: Azure Monitor Alerts, Prometheus Alertmanager) kullanıyor muyuz?

---

**Senaryo Başlığı:** Stok Transferi Sırasında Kilitlenen Tablolar
**Zorluk:** 8/10
**Olay:** Gece yarısı çalışan bir batch işlem, A deposundaki binlerce ürünü B deposuna transfer etmeye başlar. İşlem, `Stoklar` tablosu üzerinde çalışır ve her bir ürün için satır bazında veya daha kötüsü sayfa/tablo bazında kilitler (locks) koyar. Bu sırada, e-ticaret sitesinden bu ürünlerden herhangi birine bir satış veya iade işlemi gelmeye çalışır.
**Beklenen Sorun:** Kilit beklemeye bağlı performans düşüşü (Lock contention). Canlı kullanıcı işlemleri, toplu transfer işlemi bitene kadar askıda kalır. Bu durum, kullanıcı tarafında "donan" ekranlara ve timeout hatalarına yol açar. Eğer işlem uzun sürerse, gün içindeki operasyonları ciddi şekilde etkileyebilir.
**Architect'e Soru:** Uzun süren toplu işlemleri (batch jobs) canlı kullanıcı trafiğinden nasıl izole ediyoruz? Bu işlemleri daha düşük öncelikte veya veritabanının daha az meşgul olduğu saatlerde mi çalıştırıyoruz? Kullandığımız kilitleme seviyesi (row-level vs. table-level) nedir? İyimser kilitleme (optimistic locking) ve kısa transaction'lar kullanarak bu tür kilitlenme sürelerini en aza indirmeyi hedefliyor muyuz?

---

**Senaryo Başlığı:** Cache Zehirlenmesi (Cache Poisoning)
**Zorluk:** 8/10
**Olay:** Bir API endpoint'i `/api/products?category_id=123` şeklinde ürünleri listeler ve sonucu Redis'te cache'ler. Ancak cache anahtarı (cache key) oluşturulurken, `tenant_id` gibi bir parametre unutulur.
1.  Kiracı A, kategori 123'ü listeler. Sonuç (A'nın ürünleri) Redis'e `products:category:123` anahtarıyla kaydedilir.
2.  Kiracı B, aynı kategori 123'ü listelemek ister. Sistem, Redis'te bu anahtarı bulur ve Kiracı B'ye, Kiracı A'nın ürünlerini gösterir.
**Beklenen Sorun:** Kiracılar arası veri sızıntısı. Cache katmanındaki bir mantık hatası, veritabanı seviyesindeki tüm izolasyon önlemlerini bypass eder. Bu durum, yanlış bilgi gösteriminden ticari sırların ifşasına kadar gidebilir.
**Architect'e Soru:** Cache anahtarlarını oluşturmak için standart ve test edilmiş bir metodolojimiz var mı? Anahtarın, bir veriyi benzersiz kılan TÜM parametreleri (tenant_id, user_id, dil, para birimi vb.) içerdiğinden nasıl emin oluyoruz? Multi-tenant sistemlerde cache stratejimiz nedir? Her kiracı için ayrı bir cache veritabanı/ön ek mi kullanıyoruz?
