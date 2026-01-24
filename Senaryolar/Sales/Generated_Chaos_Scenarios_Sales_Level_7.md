# Satış Modülü Kaos Senaryoları - Seviye 7

Bu belge, karmaşık iş mantığı hataları, daha ciddi güvenlik açıkları ve modüller arası entegrasyonların başarısızlığından kaynaklanan zincirleme reaksiyonlara odaklanır.

---

**Senaryo Başlığı:** İstiflenebilir Kuponların Yarattığı Mantık Bombası
**Zorluk:** 7/10
**Olay:** Sistemde iki farklı promosyon tanımlıdır: 1) "BAHAR50" kuponu ile 50 TL indirim. 2) 200 TL üzeri alışverişlerde kargonun otomatik olarak bedava olması. Bir kullanıcı, sepeti 210 TL iken "BAHAR50" kuponunu uygular ve sepet tutarı 160 TL'ye düşer. Ancak sistem, kargo bedava özelliğini kupon indirimi *uygulanmadan önceki* tutara göre hesapladığı için kargoyu hala bedava tutar.
**Beklenen Sorun:** İstenmeyen ve kârlılığı eriten promosyon kombinasyonları. İş kuralları arasındaki etkileşim doğru yönetilmediği için şirket para kaybeder. Promosyonların uygulanma sırası (order of application) belirsizdir ve beklenmedik sonuçlara yol açar.
**Architect'e Soru:** Promosyon ve indirim motorumuz, kuralların uygulanma sırasını ve birbirleriyle olan etkileşimini (örn: "bu kupon başka indirimle birleşmez") net bir şekilde tanımlayabiliyor mu? Bir "promosyon hesaplama pipeline'ı" var mı? Bu tür karmaşık senaryoları test eden birim (unit) ve entegrasyon (integration) testlerimiz ne kadar kapsamlı?

---

**Senaryo Başlığı:** Başka Bir Kiracının (Tenant) Stok Verisini Görme
**Zorluk:** 7/10 (Not: Seviye 10'daki felaket senaryosunun daha hafif bir versiyonu)
**Olay:** Sistem çok-kiracılıdır (multi-tenant). Bir API endpoint'i, `/api/products/{id}/stock` şeklinde bir ürünün stok bilgisini döner. Normalde bu endpoint, kullanıcının kendi kiracısının (tenant) ürününe bakmasını sağlamalıdır. Ancak yetkilendirme katmanındaki bir zafiyet, başka bir kiracıya ait geçerli bir ürün ID'si verildiğinde, o ürünün stok miktarını (sadece sayı olarak, diğer detaylar olmadan) döndürür.
**Beklenen Sorun:** Veri sızıntısı. Bir rakip, ürün ID'lerini tahmin ederek veya bir yerlerden bularak, diğer şirketin stok seviyelerini izleyebilir. Bu, ticari sırların ifşasıdır ve rekabet avantajı sağlamak için kullanılabilir.
**Architect'e Soru:** Multi-tenancy veri izolasyonunu nasıl sağlıyoruz? Sadece EF Core'un Global Query Filters mekanizmasına mı güveniyoruz? Bir kaynağa (ürün, sipariş vb.) erişim istendiğinde, "bu kullanıcının bu kaynağa erişim yetkisi var mı?" (resource-based authorization) kontrolünü her katmanda yapıyor muyuz?

---

**Senaryo Başlığı:** Ürün Biriminin Değiştirilmesinin Zincirleme Etkisi
**Zorluk:** 7/10
**Olay:** Bir ürün ("Kablo"), başlangıçta "Metre" birimiyle satılmaktadır ve stoğu 1000 metredir. Daha sonra, iş kararıyla bu ürünün artık "Makara" (1 makara = 100 metre) birimiyle satılmasına karar verilir. Bir yönetici, ürün tanımındaki birimi "Metre"den "Makara"ya çevirir.
**Beklenen Sorun:** Mevcut 1000 metrelik stok, sistemde aniden 1000 "Makara" olarak görünmeye başlar, bu da 100 katlık bir envanter şişmesine yol açar. Geçmiş satış raporları, maliyet hesaplamaları ve sipariş geçmişi anlamsız hale gelir. Örneğin, önceden "5 metre" satılan bir sipariş artık "5 makara" olarak yorumlanabilir.
**Architect'e Soru:** Temel ürün özelliklerinde (birim, çarpan vb.) yapılacak bir değişikliğin geçmiş verileri bozmasını nasıl engelleriz? Ürün tanımının versiyonlanması mı gerekir? Bu tür değişiklikler için birim dönüştürme ve stok miktarını otomatik güncelleyecek bir "geçiş" (migration) süreci mi tasarlanmalı? Bu değişiklikler yapıldığında hangi modüllerin (Satış, Finans) etkilenip uyarılması gerekir?

---

**Senaryo Başlığı:** Stok Transfer Emri Üzerinde Oynama (Parameter Tampering)
**Zorluk:** 7/10
**Olay:** Bir kullanıcı, A deposundan B deposuna 10 adet ürün transfer etmek için arayüzden işlemi başlatır. Bu sırada, araya giren bir proxy aracı (örn: Burp Suite) ile giden API isteğini yakalar. İstekteki `destinationWarehouseId` parametresini, normalde yetkisi olmayan Z deposu olarak değiştirir ve isteği sunucuya gönderir.
**Beklenen Sorun:** Yetki aşımı (Privilege Escalation). Backend, kullanıcının Z deposuna transfer yapma yetkisi olup olmadığını kontrol etmiyorsa, ürünler yetkisiz bir şekilde istenilen herhangi bir depoya gönderilebilir. Bu, hırsızlık veya sabotaj için kullanılabilir.
**Architect'e Soru:** Yetkilendirme kontrollerimiz sadece "bu endpoint'i çağırabilir" seviyesinde mi, yoksa "bu endpoint'i *bu parametrelerle* çağırabilir" (resource-based authorization) seviyesinde mi? Örneğin, bir kullanıcının sadece kendi bölgesindeki depolar arasında transfer yapabilmesini nasıl sağlıyoruz? Bu tür iş kuralları ve yetkiler, Domain katmanında mı, yoksa Application katmanında mı doğrulanıyor?

---

**Senaryo Başlığı:** Üretim Emri İçin Hammadde Ayırma (Allocation) Hatası
**Zorluk:** 7/10
**Olay:** Bir "Masa" üretmek için 4 adet "Masa Ayağı" ve 1 adet "Masa Tablası" gerekmektedir. Üretim modülü, bir üretim emri başlattığında Envanter modülünden bu hammaddeleri rezerve etmesini (allocate) ister. Envanter, 4 adet ayak rezerve eder, ancak tabla stoğunun yetersiz olduğunu fark eder. İşlem yarım kalır.
**Beklenen Sorun:** Kısmi rezervasyon (partial allocation). 4 adet masa ayağı, başarısız bir üretim emri için süresiz olarak kilitli kalabilir. Bu ayaklar başka üretim emirleri veya satışlar için kullanılamaz. Eğer bu durum fark edilmezse, "hayalet" hammadde sıkıntısı yaşanır.
**Architect'e Soru:** Üretim için hammadde rezervasyonu (allocation) işlemi, tüm bileşenlerin (Bill of Materials - BOM) stoğu kontrol edildikten sonra tek bir atomik transaction içinde mi yapılıyor? Bir bileşenin bile stoğu yetersizse, tüm rezervasyon işlemi geri alınmalı (rollback). Bu "hepsi ya da hiçbiri" mantığını nasıl sağlıyoruz? Saga pattern mi, yoksa tek bir transaction içinde mi çözülmeli?

---

**Senaryo Başlığı:** Mobil Cihazda Offline Sayım ve Senkronizasyon Çakışması
**Zorluk:** 7/10
**Olay:** Depo görevlisi, internetin çekmediği bir alanda mobil uygulama üzerinden sayım yapar. Sayım verileri cihazda yerel olarak saklanır. Görevli, internet olan bir alana döndüğünde verileri senkronize etmeye çalışır. Ancak tam bu sırada, başka bir kullanıcı (veya bir otomatik süreç) aynı ürünlerden birinin stok miktarını merkez veritabanında değiştirmiştir (örn: bir satış nedeniyle).
**Beklenen Sorun:** Veri çakışması (conflict). Senkronizasyon işlemi hangi veriyi doğru kabul etmeli? Cihazdaki sayım sonucunu mu, yoksa merkezdeki yeni miktarı mı? Yanlış bir birleştirme (merge) stratejisi, sayımın tamamen boşa gitmesine veya stokların yine hatalı olmasına neden olabilir.
**Architect'e Soru:** Offline çalışma ve veri senkronizasyonu için mimari bir stratejimiz var mı? Bu tür çakışmaları nasıl ele alacağız? "En son yazan kazanır" (Last-write-wins) basit bir strateji mi, yoksa kullanıcıya çakışmayı gösterip manuel olarak çözmesini isteyecek bir arayüz mü sunmalıyız? Birleştirme/uzlaştırma (Merging/Reconciliation) mantığı nerede işlemeli (client vs. server)?

---

**Senaryo Başlığı:** API Rate Limiting ile Engellenen Stok Güncellemeleri
**Zorluk:** 7/10
**Olay:** Black Friday gibi yoğun bir günde, bir dış sistem (örn: pazar yeri entegrasyonu), yapılan her satış için Stocker API'sine stok düşürme isteği gönderiyor. Dakikada binlerce istek gelince, API Gateway'deki rate limiting (istek sınırı) kuralları devreye girer ve isteklerin bir kısmını (HTTP 429 Too Many Requests) reddetmeye başlar.
**Beklenen Sorun:** Stok verisinin güncel kalmaması. Pazar yerinde satılan ürünlerin stokları sistemde düşülemez ve aynı ürünlerin tekrar satılması (overselling) riski doğar. Bu, müşteri memnuniyetsizliğine ve operasyonel kaosa yol açar.
**Architect'e Soru:** Kritik işlemler (stok güncelleme gibi) için daha yüksek limitlere sahip ayrı bir rate limiting profili var mı? API'nin bu tür reddetme durumlarında, istemciye (client) "ne kadar süre sonra tekrar denemesi gerektiğini" bildiren (örn: `Retry-After` header) bir mekanizma sunuyor muyuz? Reddedilen istekleri daha sonra işlemek üzere bir "message queue" (örn: RabbitMQ, Azure Service Bus) üzerinde biriktirmeli miyiz?

---

**Senaryo Başlığı:** İade Edilen Ürünün Maliyetinin Belirlenememesi
**Zorluk:** 7/10
**Olay:** Bir müşteri, 2 ay önce aldığı bir ürünü iade eder. Sistem FIFO (İlk Giren İlk Çıkar) maliyetlendirme metodunu kullanmaktadır. İade anında, sistem bu ürünün hangi maliyet partisine ait olduğunu belirleyemez veya bu bilgi orijinal satış kaydında tutulmamıştır. Sistem, ürünü stoğa alırken hangi maliyetle almalıdır? Güncel maliyetle mi? Orijinal satış anındaki ortalama maliyetle mi?
**Beklenen Sorun:** Envanter değerinin ve karlılığın yanlış hesaplanması. Eğer ürün, orijinal maliyetinden daha yüksek bir maliyetle stoğa geri alınırsa, envanter değeri şişer ve iade işlemi karlı gibi görünebilir. Tersi durumda ise envanter değeri haksız yere düşer.
**Architect'e Soru:** Satış işlemleri sırasında, satılan her bir ürünün maliyetini (ve eğer FIFO/LIFO kullanılıyorsa ait olduğu maliyet partisini) `SatisKalemleri` tablosunda saklıyor muyuz? İade sürecimiz, bu orijinal maliyet bilgisine erişip iade girişini bu değer üzerinden yapacak şekilde mi tasarlandı?

---

**Senaryo Başlığı:** Aktif Olarak Kullanılan Bir Deponun Silinmesi
**Zorluk:** 7/10
**Olay:** Bir yönetici, yanlışlıkla veya sistemdeki bir bug nedeniyle, içinde hala stok bulunan veya aktif transfer emirleri olan bir depoyu "silmeye" veya "arşivlemeye" çalışır. Arayüz bu işleme izin verir.
**Beklenen Sorun:** "Yetim" stok kayıtları. Stoklar sistemde varlığını sürdürür ancak fiziksel bir depoyla ilişkisi kalmaz. Bu ürünler satılamaz, transfer edilemez, sayılamaz hale gelir. İlişkili olduğu tüm açık siparişler veya transferler hataya düşer. Veritabanı seviyesinde `FOREIGN KEY` kısıtlaması yoksa (`ON DELETE RESTRICT`), bu işlem başarılı olabilir ve veri bütünlüğü bozulur.
**Architect'e Soru:** Kritik ana verilerin (depo, lokasyon, ürün) silinmesine karşı nasıl bir koruma mekanizmamız var? Sadece "soft delete" mi kullanıyoruz? Bir depoyu silebilmek/arşivleyebilmek için karşılanması gereken ön koşulları (içinde stok olmaması, açık sipariş bulunmaması vb.) Domain katmanında katı bir şekilde kontrol ediyor muyuz?

---

**Senaryo Başlığı:** Stok Maliyet Bilgisinin Yetkisiz Erişime Açılması
**Zorluk:** 7/10 (Seviye 6'nın daha ciddi bir versiyonu)
**Olay:** Düşük yetkili bir depo çalışanı, normalde sadece ürün adı ve miktarını görmesi gereken bir API endpoint'ini (örn: `/api/products/{id}`) çağırır. Ancak, backend'deki DTO (Data Transfer Object) veya serialization ayarları hatalı yapılandırıldığı için, API yanıtı ürünün maliyet (`costPrice`) ve tedarikçi (`supplier`) bilgilerini de içerir.
**Beklenen Sorun:** Hassas veri sızıntısı (Sensitive Data Exposure). Şirketin kar marjları, tedarikçi anlaşmaları gibi ticari sır niteliğindeki bilgilere yetkisiz kişiler tarafından erişilmesi. Bu bilgi, rakip firmalara sızdırılabilir veya çalışanlar arasında huzursuzluğa neden olabilir.
**Architect'e Soru:** API endpoint'lerimiz, farklı kullanıcı rollerine göre farklı veri setleri (DTO'lar) dönecek şekilde tasarlanmış mı? Bir "AdminProductDto" ile "PublicProductDto" arasında net bir ayrım var mı? Backend'de, hangi kullanıcının hangi veri alanlarına erişebileceğini tanımlayan ve zorunlu kılan bir yetkilendirme mekanizması (örn: claim-based authorization on properties) kullanılıyor mu?
