# Satış Modülü Kaos Senaryoları - Seviye 9

Bu belge, anlaşılması ve tespit edilmesi çok zor olan, dağıtık sistemlerin doğasından kaynaklanan "sessiz" veri bozulmaları, ağ bölünmeleri (network partition) ve mimarinin temel varsayımlarını yıkan senaryolara odaklanır.

---

**Senaryo Başlığı:** Depolar Arası Transfer Sırasında Ağ Bölünmesi (Network Partition)
**Zorluk:** 9/10
**Olay:** İstanbul deposundan Ankara deposuna bir ürün transferi başlatılır. İşlem, İstanbul deposundan stoğu düşürür (çıkış kaydı oluşturur) ve Ankara deposuna bir giriş beklentisi oluşturur. Tam bu sırada, iki depo arasındaki ağ bağlantısı veya merkezi sistemi koordine eden message broker çöker. İstanbul işlemi "başarılı" sanır, ama Ankara'nın işlemden haberi olmaz.
**Beklenen Sorun:** "Arafta kalmış" (in-transit) stok. Ürün, İstanbul'un envanterinden çıkmıştır ama Ankara'nın envanterine hiç girmemiştir. Toplam şirket envanteri doğru görünse de, depolara göre envanter raporları yanlıştır ve ürün fiziksel olarak yolda olmasına rağmen sistemde kayıp görünür.
**Architect'e Soru:** Depolar arası transfer gibi dağıtık işlemler (distributed transactions) için hangi pattern'i kullanıyoruz? Two-Phase Commit (2PC) mi -ki bu genelde modern mimarilerde kaçınılan bir yöntemdir- yoksa Saga Pattern mi? Ağ bölünmesi veya hedef sistemin yanıt vermemesi durumunda süreci nasıl telafi ediyoruz (compensation)? Transferin durumunu ("Yolda", "Tamamlandı", "İptal Edildi") güvenilir bir şekilde takip eden bir mekanizma var mı?

---

**Senaryo Başlığı:** Black Friday: Saniyede Binlerce Stok Kontrolü ve Veritabanı Darboğazı
**Zorluk:** 9/10
**Olay:** Büyük bir kampanya anında (Black Friday), on binlerce kullanıcı aynı anda popüler bir ürünün sayfasına girer. Next.js frontend'i, her sayfa ziyareti veya "sepete ekle" denemesi için backend'e stok durumu kontrolü isteği gönderir. Bu durum, saniyede binlerce `SELECT` sorgusunun veritabanına gitmesine neden olur.
**Beklenen Sorun:** Veritabanı okuma (read) darboğazı. Stok tablosu üzerindeki yoğun okuma baskısı, diğer tüm işlemleri (satış kaydı, stok güncelleme, sayım vb.) yavaşlatır. Veritabanı CPU'su %100'e ulaşır, bağlantı havuzu (connection pool) dolar ve sistem genelinde timeout'lar yaşanır.
**Architect'e Soru:** Yüksek okuma trafiğiyle başa çıkmak için mimarimizde ne gibi önlemler var? Stok seviyelerini belirli bir süre (örn: 5-10 saniye) için Redis gibi bir in-memory cache'de tutuyor muyuz? Bu cache'i nasıl ve ne zaman geçersiz kılıyoruz (cache invalidation)? Okuma ve yazma işlemleri için CQRS (Command Query Responsibility Segregation) pattern'ini kullanarak farklı veritabanları (read/write replicas) kullanıyor muyuz? Bu çözümün getirdiği "eventual consistency" riskini nasıl yönetiyoruz?

---

**Senaryo Başlığı:** Tarihsel Satınalma Faturasının Fiyatını Değiştirme ve Maliyetlerin Çöküşü
**Zorluk:** 9/10
**Olay:** Bir muhasebe çalışanı, 3 ay önce girilmiş bir satınalma faturasındaki birim maliyetin yanlış olduğunu fark eder ve düzeltir (örn: 10 TL yerine 12 TL). Bu faturayla stoğa giren ürünlerin bir kısmı çoktan satılmış, bir kısmı depoda, bir kısmı ise başka bir depoya transfer edilmiştir.
**Beklenen Sorun:** Zincirleme maliyet bozulması (Cascading cost corruption). Sadece geçmişteki bu alıma ait maliyetin güncellenmesi yeterli değildir. Bu alımdan sonra yapılan tüm satışların maliyetlerinin (COGS), tüm stok çıkışlarının ve mevcut envanterin değerinin geriye dönük olarak (retroactively) yeniden hesaplanması gerekir. Eğer sistem buna göre tasarlanmadıysa, envanterin değeri ve geçmiş karlılık raporları tamamen yanlış kalır.
**Architect'e Soru:** Mimarimiz, geriye dönük maliyet düzeltmelerini (retroactive cost adjustments) destekliyor mu? Bu tür bir değişiklik tetiklendiğinde, ilgili tüm stok hareketlerini ve finansal kayıtları yeniden hesaplayacak bir "Maliyet Yeniden Hesaplama Motoru" (Cost Recalculation Engine) var mı? Bu süreç ne kadar sürer ve çalışırken canlı sistemi kilitler mi? Bu hesaplamayı ayrı bir "offline" süreç olarak mı tasarlamalıyız?

---

**Senaryo Başlığı:** "Sessiz Veri Bozulması" (Silent Data Corruption) ile Stok Miktarlarının Değişmesi
**Zorluk:** 9/10
**Olay:** Veritabanı veya disk altsistemindeki sinsi bir bug (silent data corruption) nedeniyle, `Stoklar` tablosundaki bazı satırlardaki `Miktar` alanları rastgele değişir. Örneğin, 100 olan bir stok miktarı, bir bit-flip sonucu 108 olur. Bu hata, uygulama veya veritabanı tarafından fark edilmez, çünkü işlem kurallara uygundur ve bir hata log'u üretmez.
**Beklenen Sorun:** Anlaşılamayan stok farkları. Sayımlar sürekli olarak yanlış çıkar, ancak nedeni bulunamaz. Stok hareket kayıtları (`StokHareketleri` tablosundaki giriş/çıkışların toplamı) ile `Stoklar` tablosundaki mevcut miktar arasında tutarsızlıklar oluşur. Veriye olan tüm güven kaybolur.
**Architect'e Soru:** Veri bütünlüğünü sadece uygulama katmanında mı sağlıyoruz? PostgreSQL'in sunduğu `data checksums` gibi özellikleri veri sayfalarının bütünlüğünü disk seviyesinde doğrulamak için kullanıyor muyuz? Stok miktarı gibi kritik bir verinin, ilgili stok hareketlerinin toplamından periyodik olarak yeniden hesaplanıp doğrulandığı bir denetim (audit) ve kendi kendini iyileştirme (self-healing) süreci var mı?

---

**Senaryo Başlığı:** Mesaj Kuyruğu (Message Queue) Zehirlenmesi
**Zorluk:** 9/10
**Olay:** "UrunSatildi" olayını işleyen Envanter servisinin yeni bir versiyonunda bir bug vardır. Bu bug, belirli bir ürün türü (örn: seri numaralı ürün) satıldığında, olayı işlerken bir `NullReferenceException` fırlatmasına neden olur. Mesaj kuyruğu (RabbitMQ, Kafka), bu "zehirli" mesajı işleyemediği için tekrar tekrar denemeye başlar.
**Beklenen Sorun:** İlgili ürün türü için tüm stok güncellemeleri durur. Daha da kötüsü, "zehirli" mesaj, kuyruğun başını bloke ettiği için, arkasındaki geçerli olan diğer tüm "UrunSatildi" olaylarının da işlenmesini engeller. Kısa sürede, tüm sistemdeki stok bilgisi güncelliğini yitirir.
**Architect'e Soru:** Mesajlaşma mimarimizde "zehirli mesajları" (poison messages) nasıl ele alıyoruz? Belirli sayıda başarısız denemeden sonra mesajı otomatik olarak bir "dead-letter queue" (işlenemeyen mesajlar kuyruğu) içine taşıyan bir mekanizmamız var mı? Bu kuyruklar için bir alarm ve izleme sistemi mevcut mu ki, geliştiriciler anında haberdar olabilsin?

---

**Senaryo Başlığı:** Başka Bir Kiracının Stok Verisini Cache'leme (Cache Poisoning)
**Zorluk:** 9/10 (Seviye 8'in daha sinsi bir versiyonu)
**Olay:** Çok-kiracılı (multi-tenant) sistemde, bir ürünün stok bilgisini getiren `/api/products/{id}/stock` endpoint'i, sonucu Redis'te cache'ler. Cache anahtarı, `stock:{product_id}` olarak belirlenmiştir.
1.  Kiracı A, kendi ürünü olan "123"ün stoğunu sorgular. Sonuç ("50 adet") Redis'e `stock:123` anahtarıyla yazılır.
2.  Kiracı B, kendi ürünü olan "456"yı sorgular. Sonuç ("20 adet") Redis'e `stock:456` anahtarıyla yazılır.
3.  Kiracı B, URL'i değiştirerek `/api/products/123/stock` adresini sorgular. Normalde yetkilendirme katmanı bunu engellemelidir. Ancak bir bug nedeniyle bu kontrol atlanır. API, Redis'e gider, `stock:123` anahtarını bulur ve Kiracı B'ye, Kiracı A'nın stok bilgisi olan "50 adet" sonucunu döner.
**Beklenen Sorun:** Çok ciddi veri sızıntısı. Cache katmanındaki hatalı anahtarlama ve yetkilendirme zafiyetinin birleşimi, bir kiracının diğerinin verisini görmesine neden olur. Bu, sadece bir UI hatası değil, temel bir güvenlik ihlalidir.
**Architect'e Soru:** Cache stratejimiz multi-tenancy'yi en başından dikkate alıyor mu? Tüm cache anahtarlarının otomatik olarak `tenant_id` içermesini sağlayan bir altyapı var mı (`stock:{tenant_id}:{product_id}`)? Yetkilendirme kontrolleri, cache katmanından *önce* mi, yoksa cache'de veri bulunamazsa *sonra* mı çalışıyor? İdeal sıra ne olmalı?

---

**Senaryo Başlığı:** Read Replica Gecikmesi Sırasında Kritik Karar Alma
**Zorluk:** 9/10
**Olay:** Sistem, okuma yükünü dağıtmak için bir ana veritabanı (primary) ve bir okuma kopyası (read replica) kullanır. Replikasyon anlık bir ağ sorunu nedeniyle 60 saniye gecikir (replication lag). Bu sırada:
1.  Ana veritabanında bir müşterinin kredibilitesi "kötü" olarak işaretlenir.
2.  Satış departmanı, bu müşteriye "vadeli satış" onayı vermek için bir rapor çalıştırır. Rapor, sorguyu read replica'ya gönderdiği için, müşterinin kredisini hala "iyi" olarak görür ve onayı verir.
**Beklenen Sorun:** Yanlış ve eski veriye dayanarak kritik bir iş kararı verilmesi. Bu, ciddi finansal kayıplara yol açabilir. Replikasyon gecikmesi, sadece bir performans sorunu değil, aynı zamanda bir veri tutarlılığı ve iş riski sorunudur.
**Architect'e Soru:** Read replica kullanan sistemlerde replikasyon gecikmesinin (replication lag) yaratacağı risklere karşı bir stratejimiz var mı? Kritik iş kararlarını destekleyen raporların veya API'lerin sorgularını *her zaman* ana veritabanına yönlendiren bir mekanizmamız var mı? Uygulama, mevcut replikasyon gecikmesini izleyip, gecikme belirli bir eşiği aşarsa read replica'yı kullanmayı geçici olarak durduracak kadar akıllı mı?

---

**Senaryo Başlığı:** Dağıtık Sayaç (Distributed Counter) Tutarsızlığı
**Zorluk:** 9/10
**Olay:** Yüksek trafiğe sahip bir ürünün "kaç kişi tarafından görüntülendiği" bilgisi, performansı artırmak için veritabanı yerine Redis gibi bir dağıtık sayaç ile tutulur. Ancak Redis cluster'ında yaşanan bir "split-brain" senaryosu veya hatalı bir istemci kütüphanesi nedeniyle, sayaç güncellemelerinin bir kısmı kaybolur veya yanlış node'a yazılır.
**Beklenen Sorun:** Önemli bir metrik olan "görüntülenme sayısı"nın yanlış olması. Bu veri, popülerlik sıralamaları, analitik raporlar veya "Şu an X kişi bu ürüne bakıyor" gibi özellikler için kullanılıyorsa, bu özelliklerin hepsi yanlış çalışır. Verinin %100 doğru olması gerekmese de, büyük sapmalar yanıltıcı olur.
**Architect'e Soru:** Dağıtık sayaçlar gibi "yaklaşık" ama yüksek performanslı olması gereken sistemler için hangi çözümleri kullanıyoruz? Bunların tutarlılık garantileri (veya garantisizlikleri) nelerdir? Veritabanındaki gerçek veri ile bu sayaçlar arasındaki farkı periyodik olarak kontrol edip düzelten (reconciliation) bir süreç var mı?

---

**Senaryo Başlığı:** Uygulama Hatası Nedeniyle Kısmi Güncelleme ve Denetim Kaydı Kaybı
**Zorluk:** 9/10
**Olay:** Bir ürünün stoğu güncellenirken, işlemin bir parçası olarak hem `Stoklar` tablosundaki anlık miktarın, hem de `StokHareketleri` tablosuna bir işlem kaydının atılması gerekmektedir. Ancak uygulamadaki bir bug nedeniyle, `Stoklar` tablosu güncellenir ama `StokHareketleri`'ne kayıt atılırken bir `NullReferenceException` fırlatılır. İşlem, tek bir veritabanı transaction'ı içinde değildir.
**Beklenen Sorun:** Denetim kaydı (audit trail) kaybı. Stoğun mevcut durumu değişir, ancak bu değişikliğin "neden", "ne zaman" ve "kim tarafından" yapıldığına dair hiçbir kanıt olmaz. Bu durum, stok farklarının kaynağını bulmayı imkansız hale getirir ve suistimale kapı aralar.
**Architect'e Soru:** Birbirine bağlı veri değişikliklerinin (stok miktarı ve hareket kaydı gibi) her zaman tek bir atomik transaction içinde yapılmasını nasıl garanti ediyoruz? Domain-Driven Design (DDD) prensiplerini kullanarak, bu tür operasyonları tek bir Aggregate kökü üzerinden yönetip, tutarlılığı Aggregate sınırları içinde zorunlu hale getiriyor muyuz? Farklı veritabanları veya servisler arasında bu tutarlılığı sağlamak için "Transactional Outbox" pattern'ini kullanıyor muyuz?

---

**Senaryo Başlığı:** Yanlış Yapılandırılmış Feature Flag ile Felaket
**Zorluk:** 9/10
**Olay:** Geliştirme ekibi, "yeni ödeme altyapısı" özelliğini bir feature flag (özellik bayrağı) arkasında geliştirir. Flag, normalde sadece test kullanıcıları için aktif olmalıdır. Ancak, feature flag yönetim sistemindeki bir yanlış yapılandırma veya bir bug nedeniyle, bu özellik production'da tüm kullanıcılar için bir anda aktif hale gelir. Yeni ödeme altyapısı ise henüz tam olarak test edilmemiştir.
**Beklenen Sorun:** Tamamlanmamış ve test edilmemiş bir özelliğin tüm kullanıcılara açılması. Bu, ödemelerin başarısız olmasına, paranın yanlış hesaplara gitmesine veya hiç alınamamasına neden olabilir. Müşteriler ödeme yapamaz, satışlar durur.
**Architect'e Soru:** Feature flag stratejimiz ne kadar güvenli? Flag'lerin kimler için aktif olacağını belirleyen kurallar (kullanıcı ID'si, e-posta, yüzde vb.) nerede ve nasıl yönetiliyor? Bir flag'in yanlışlıkla globale açılmasını önleyen "çift kontrol" veya "onay" mekanizmaları var mı? Production'da bir feature flag'in durumunu değiştirmeden önce ne gibi test ve doğrulama adımları izliyoruz?
