# Envanter Modülü Kaos Mühendisliği Senaryoları

Bu belge, Stocker projesinin Envanter modülünün sınırlarını test etmek, zayıf noktalarını ortaya çıkarmak ve mimari kararları sorgulamak amacıyla oluşturulmuş kaos mühendisliği senaryolarını içerir.

---

### Kategori: Stok Giriş/Çıkış İşlemleri

**Senaryo Başlığı:** Anlık Stok Güncelleme Yarışı (Race Condition)
**Zorluk:** 4/10
**Olay:** İki farklı kullanıcı (örneğin, bir kasiyer ve bir depo görevlisi), aynı ürünün son kalan 1 adedi için milisaniyeler içerisinde satış (stok çıkışı) ve iade (stok girişi) işlemi gerçekleştirir. Next.js arayüzünden tetiklenen iki API isteği, aynı anda sunucuya ulaşır.
**Beklenen Sorun:** İyimser kilitleme (optimistic locking) mekanizması yoksa veya yanlış uygulanmışsa, işlemlerden biri diğerinin yaptığı değişikliği ezebilir. Sonuçta stok miktarı hatalı olabilir (örneğin, 0 olması gerekirken 1 veya -1 kalabilir). Veritabanında `StokMiktari = StokMiktari - 1` gibi bir kod atomik değilse bu sorun kaçınılmazdır.
**Architect'e Soru:** Bu tür race condition'ları önlemek için EF Core ve PostgreSQL üzerinde hangi concurrency kontrol mekanizmasını (Optimistic vs. Pessimistic Locking) kullanmalıyız? RowVersion/xmin gibi bir mekanizma yeterli mi, yoksa `SELECT FOR UPDATE` gibi daha katı kilitlemeler mi düşünülmeli?

**Senaryo Başlığı:** Negatif Stok Durumuna Düşme Senaryosu
**Zorluk:** 2/10
**Olay:** Bir ürünün stoğu 5 adettir. Bir müşteri web sitesinden 3 adet sipariş verirken, aynı anda başka bir müşteri de mağazadan 3 adet satın alır. İki işlem de stok kontrolünü geçer çünkü kontrol anında stok yeterlidir.
**Beklenen Sorun:** Stok miktarının -1 gibi negatif bir değere düşmesi. Bu durum, fiziksel envanter ile sistem verisi arasında tutarsızlığa yol açar ve maliyetlendirme gibi sonraki adımları bozar.
**Architect'e Soru:** Stok kontrolü ve stok düşme işlemleri tek bir atomik veritabanı işlemi (transaction) içinde mi gerçekleşiyor? Bu kontrolü uygulama katmanında yapmak yerine, doğrudan veritabanı seviyesinde bir `CHECK` constraint'i (`stok_miktari >= 0`) ile garanti altına almalı mıyız? Bunun performans etkileri ne olur?

**Senaryo Başlığı:** Hatalı Toplu Stok Girişi ve Geri Alma (Rollback)
**Zorluk:** 5/10
**Olay:** Bir depo görevlisi, 1000 farklı kalemi içeren bir irsaliyenin stok girişini yapıyor. İşlem sırasında, 500. kalemde sistemin beklemediği bir veri (örn: geçersiz birim türü) ile karşılaşılıyor veya ağ bağlantısı kopuyor.
**Beklenen Sorun:** İşlemin yarım kalması. Eğer tüm operasyon tek bir transaction içinde değilse, ilk 499 kalemin stoğu artırılmış olurken geri kalanı eklenmez. Bu, kısmi ve tutarsız bir veri durumuna yol açar. İrsaliyenin durumu "İşleniyor" gibi bir arafta kalabilir.
**Architect'e Soru:** Bu tür toplu ve uzun süren işlemleri nasıl yönetmeliyiz? Tümünü tek bir devasa transaction içine almak veritabanında uzun süreli kilitlere ve performans sorunlarına yol açabilir mi? Alternatif olarak Saga pattern gibi bir distributed transaction yönetimi mi düşünmeliyiz? Hatanın ortasından devam etme (resume) mekanizması olmalı mı?

**Senaryo Başlığı:** Ağ Gecikmesi Nedeniyle Çift Kayıt
**Zorluk:** 3/10
**Olay:** Kullanıcı, Next.js arayüzündeki "Kaydet" butonuna tıklar. Yüksek ağ gecikmesi (latency) nedeniyle sunucudan hemen yanıt alamaz ve butona tekrar tekrar tıklar. Bu durum, aynı stok hareketinin (örn: 10 adet ürün girişi) birden çok kez API'ye gönderilmesine neden olur.
**Beklenen Sorun:** Aynı işlemin birden çok kez veritabanına kaydedilmesi ve stok miktarının beklenenden fazla artırılması.
**Architect'e Soru:** Bu tür çift kayıtları önlemek için standart yaklaşımımız ne olmalı? Her API isteğine benzersiz bir "Idempotency Key" ekleyip sunucu tarafında bu anahtarı kontrol ederek mükerrer istekleri engellemek mi? Bu anahtarın yönetimini nasıl bir altyapı (örn: Redis, MemoryCache) ile sağlamalıyız?

---

### Kategori: Stok Sayım ve Denetim

**Senaryo Başlığı:** Canlı Sistemde Stok Sayımı Tutarsızlığı
**Zorluk:** 6/10
**Olay:** Depo personeli, gün sonunda fiziksel sayım yapıp sonuçları sisteme giriyor. Sayım işlemi devam ederken (örneğin, A rafı sayılmış, B rafına geçilmişken), e-ticaret sitesinden A rafındaki bir üründen sipariş geliyor ve stoğu sistemde düşürülüyor. Sayım tamamlandığında, personelin girdiği "fiziksel" miktar ile sistemin "o anki" miktarı arasında fark oluşuyor ve sistem gereksiz bir stok düzeltme kaydı oluşturuyor.
**Beklenen Sorun:** Sayım anındaki anlık görüntü (snapshot) alınmadığı için, sayım sırasındaki satış/iadeler sayım sonucunu geçersiz kılar. Bu, sürekli olarak yanlış çıkan sayım sonuçlarına ve envanter verisine olan güvenin kaybolmasına neden olur.
**Architect'e Soru:** Canlı satışlar devam ederken güvenilir stok sayımı nasıl yapılabilir? Sayım başlangıcında ilgili depo/lokasyonların stoklarını "dondurmalı" mıyız? Yoksa sayım başlangıcında tüm ürünlerin stok miktarlarının bir anlık görüntüsünü (snapshot table) alıp, sayım sonucunu bu görüntüyle mi karşılaştırmalıyız?

**Senaryo Başlığı:** Stok Düzeltme Yetkisi Suiistimali
**Zorluk:** 3/10
**Olay:** Düşük yetkili bir çalışanın, normalde erişimi olmaması gereken "Stok Miktarını Manuel Düzelt" ekranına bir şekilde (örn: URL tahmini ile) eriştiğini varsayalım. Çalışan, pahalı bir ürünün stoğunu 1 adet artırır ve fiziksel olarak ürünü çalar.
**Beklenen Sorun:** Hem finansal kayıp hem de envanter açığı. Daha da önemlisi, bu işlemin kim tarafından, ne zaman ve neden yapıldığının kaydının (audit log) tutulmaması veya yetersiz tutulması.
**Architect'e Soru:** Stok gibi kritik verileri değiştiren tüm işlemler için detaylı bir audit trail (iz kaydı) mekanizması tasarladık mı? Bu kayıtlar, işlemin yapıldığı IP, kullanıcı, eski değer, yeni değer gibi bilgileri içermeli mi? Yetkilendirme sadece API endpoint seviyesinde mi, yoksa iş mantığı katmanı içinde de ek kontrollerle mi yapılıyor?

---

### Kategori: Ürün ve Varyant Yönetimi

**Senaryo Başlığı:** Ürün Biriminin Değiştirilmesinin Zincirleme Etkisi
**Zorluk:** 7/10
**Olay:** Bir ürün ("Kablo"), başlangıçta "Metre" birimiyle satılmaktadır ve stoğu 1000 metredir. Daha sonra, iş kararıyla bu ürünün artık "Makara" (1 makara = 100 metre) birimiyle satılmasına karar verilir. Geliştirici, ürün tanımındaki birimi "Metre"den "Makara"ya çevirir.
**Beklenen Sorun:** Mevcut 1000 metrelik stok, sistemde aniden 1000 "Makara" olarak görünmeye başlar, bu da 100 katlık bir envanter şişmesine yol açar. Geçmiş satış raporları, maliyet hesaplamaları ve sipariş geçmişi anlamsız hale gelir. Örneğin, önceden "5 metre" satılan bir sipariş artık "5 makara" olarak yorumlanabilir.
**Architect'e Soru:** Temel ürün özelliklerinde (birim, çarpan vb.) yapılacak bir değişikliğin geçmiş verileri bozmasını nasıl engelleriz? Ürün tanımının versiyonlanması mı gerekir? Bu tür değişiklikler için birim dönüştürme ve stok miktarını otomatik güncelleyecek bir "geçiş" (migration) süreci mi tasarlanmalı? Bu değişiklikler yapıldığında hangi modüllerin (Satış, Finans) etkilenip uyarılması gerekir?

**Senaryo Başlığı:** Varyant Stoğunun Ana Ürün Stoğu ile İlişkisi
**Zorluk:** 5/10
**Olay:** Bir "T-Shirt" ürünü, "Kırmızı-M", "Kırmızı-L", "Mavi-M", "Mavi-L" gibi varyantlara sahiptir. Her varyantın kendi stoğu vardır. Ancak, sistemde ayrıca bir "ana ürün" olan T-Shirt için de bir stok alanı bulunmaktadır ve bu alan yanlışlıkla güncellenmeye açıktır. Bir entegrasyon, varyant stoklarını güncellemek yerine yanlışlıkla ana ürün stoğunu 500 olarak ayarlar.
**Beklenen Sorun:** Raporlamada ve arayüzde kafa karışıklığı. Satış ekranı varyant stoklarını mı, yoksa ana ürün stoğunu mu göstermeli? Toplam stok raporu, varyantların toplamını mı, yoksa ana ürün stoğunu mu baz almalı? Varyantı olan bir ürünün kendi başına stoğu olması mantıksal bir hatadır.
**Architect'e Soru:** Varyantlı ürünlerin mimarisi nasıl olmalı? Varyantı olan bir ürünün (parent product) kendi stoğu olmamalı, stoğu sadece satılabilir nihai varyantlarda (child product/SKU) tutulmalı. Bu kuralı kod ve veritabanı şemasıyla nasıl zorunlu hale getirebiliriz?

---

### Kategori: Stok Giriş/Çıkış İşlemleri (Devamı)

**Senaryo Başlığı:** Veritabanı Deadlock'u ile Stok Sıkışması
**Zorluk:** 8/10
**Olay:** İki ayrı toplu işlem aynı anda başlar. İşlem A, Ürün1'in stoğunu güncelleyip ardından Ürün2'nin stoğunu güncellemek için kilitler. Eş zamanlı olarak İşlem B, Ürün2'nin stoğunu güncelleyip ardından Ürün1'in stoğunu güncellemek için kilitler.
**Beklenen Sorun:** Klasik bir veritabanı deadlock'u. İşlem A, Ürün2'yi beklerken İşlem B, Ürün1'i bekler. PostgreSQL deadlock'u tespit edip işlemlerden birini sonlandırana kadar her iki işlem de süresiz olarak donar. Bu durum, API'de timeout hatalarına ve kullanıcıların işlemlerinin yarım kalmasına neden olur.
**Architect'e Soru:** Uygulama genelinde kaynak kilitleme sırasını (resource locking order) zorunlu kılan bir standardımız var mı (örn: her zaman ürün ID'sine göre artan sırada kilitle)? EF Core'un transaction yönetimi ve PostgreSQL'in deadlock tespiti bu durumu ne kadar sürede çözer? Kullanıcıya "İşleminiz deadlock kurbanı oldu, lütfen tekrar deneyin" gibi bir mesaj göstermek için altyapımız hazır mı?

**Senaryo Başlığı:** Süresi Dolan İade ve Stok Tutarsızlığı
**Zorluk:** 4/10
**Olay:** Müşteri, 30 gün iade süresi olan bir ürünü 45. günde iade etmek ister. Kasiyer, arayüzdeki bir anlık dalgınlık veya arayüzdeki bir bug nedeniyle iadeyi sisteme kabul eder. Ürün stoğa geri eklenir.
**Beklenen Sorun:** İş mantığı kurallarının (business rule) atlatılması. Fiziksel olarak iade alınan ama aslında alınmaması gereken bir ürün stoğa girer. Bu durum, finansal raporlarda (iade oranları, zarar kalemleri) sapmalara yol açar.
**Architect'e Soru:** İş kuralları sadece frontend'de mi kontrol ediliyor, yoksa backend'deki application ve domain katmanlarında da bu kurallar katı bir şekilde uygulanıyor mu? Bir kuralın (örn: iade süresi) esnetilmesi gerektiğinde, bunu kod değişikliği yapmadan yönetebileceğimiz bir "business rule engine" veya konfigürasyon mekanizması mevcut mu?

**Senaryo Başlığı:** Kısmi Teslimat Sonrası Stok Düşümü
**Zorluk:** 5/10
**Olay:** Müşteri 10 adet ürün sipariş eder. Depoda sadece 7 adet bulunur. Sipariş "Kısmi Teslim Edilebilir" olarak işaretlenir ve 7 adet ürün müşteriye gönderilir. Ancak stok düşüm işlemi, siparişin tamamı (10 adet) üzerinden yapılır.
**Beklenen Sorun:** "Hayalet stok" oluşumu. Sistemde -3 adet ürün görünür veya stok 0'a çekilir, ancak fiziksel olarak depoda olmayan 3 ürün varmış gibi davranılır. Bu, bir sonraki stok sayımında büyük bir fark olarak ortaya çıkar.
**Architect'e Soru:** Sipariş ve envanter modülleri arasındaki iletişim nasıl sağlanıyor? "Teslim Edilen Miktar" ve "Sipariş Edilen Miktar" ayrı kavramlar olarak mı yönetiliyor? Stok düşümü, sipariş oluşturulduğunda mı, yoksa ürünler fiziksel olarak depodan çıktığında (irsaliye kesildiğinde) mı yapılmalı? Bu tür süreçler için "eventual consistency" mi yoksa anlık tutarlılık (strong consistency) mı hedefleniyor?

**Senaryo Başlığı:** Tedarikçi İade Sürecinde Kaybolan Stok
**Zorluk:** 6/10
**Olay:** Bozuk olduğu tespit edilen bir ürün, tedarikçiye iade edilmek üzere "Tedarikçi İade Deposu" gibi sanal bir depoya transfer edilir. Ancak ürünün fiziksel olarak kargoya verilmesi ve tedarikçiden onayın gelmesi haftalar sürer. Bu sırada ürün sistemde var gibi görünür ama aslında satılabilir envanterde değildir.
**Beklenen Sorun:** Envanter değerleme raporlarının şişmesi. "Yolda" veya "İade Sürecinde" olan stokların, satılabilir stoklardan ayrı yönetilmemesi, şirketin varlıklarının yanlış hesaplanmasına neden olur.
**Architect'e Soru:** Fiziksel olarak işletmede olmayan ama hala şirketin mülkü olan stoklar (yoldaki transferler, tedarikçi iadeleri, gümrükteki ürünler) için mimaride ayrı durumlar veya sanal depolar tanımlanmış mı? Raporlama altyapısı bu farklı stok statülerini ayırt edebiliyor mu?

**Senaryo Başlığı:** API Rate Limiting ile Engellenen Stok Güncellemeleri
**Zorluk:** 7/10
**Olay:** Black Friday gibi yoğun bir günde, bir dış sistem (örn: pazar yeri entegrasyonu), yapılan her satış için Stocker API'sine stok düşürme isteği gönderiyor. Dakikada binlerce istek gelince, API Gateway'deki rate limiting (istek sınırı) kuralları devreye girer ve isteklerin bir kısmını (HTTP 429 Too Many Requests) reddetmeye başlar.
**Beklenen Sorun:** Stok verisinin güncel kalmaması. Pazar yerinde satılan ürünlerin stokları sistemde düşülemez ve aynı ürünlerin tekrar satılması (overselling) riski doğar. Bu, müşteri memnuniyetsizliğine ve operasyonel kaosa yol açar.
**Architect'e Soru:** Kritik işlemler (stok güncelleme gibi) için daha yüksek limitlere sahip ayrı bir rate limiting profili var mı? API'nin bu tür reddetme durumlarında, istemciye (client) "ne kadar süre sonra tekrar denemesi gerektiğini" bildiren (örn: `Retry-After` header) bir mekanizma sunuyor muyuz? Reddedilen istekleri daha sonra işlemek üzere bir "message queue" (örn: RabbitMQ, Azure Service Bus) üzerinde biriktirmeli miyiz?

---

### Kategori: Stok Sayım ve Denetim (Devamı)

**Senaryo Başlığı:** Yüksek Değerli Ürünlerde Periyodik Sayım Gecikmesi
**Zorluk:** 5/10
**Olay:** Şirket politikası gereği, değeri 10.000 TL'nin üzerindeki ürünlerin her hafta sayılması gerekmektedir. Ancak, sayım sorumlusu bir hafta bu işlemi atlar veya sistemdeki otomatik hatırlatma/görev atama mekanizması çalışmaz. O hafta içerisinde yüksek değerli bir ürün kaybolur.
**Beklenen Sorun:** Finansal kayıp ve güvenlik açığının geç fark edilmesi. Kaybın tam olarak ne zaman gerçekleştiğini tespit etmek zorlaşır. Periyodik denetim süreçlerinin işletilememesi, suistimale açık bir ortam yaratır.
**Architect'e Soru:** Kritik iş süreçlerini (zorunlu periyodik sayımlar gibi) takip eden, gecikme durumunda ilgili yöneticilere uyarı (eskalasyon) gönderen bir "İş Süreçleri Motoru" (Business Process Engine - BPE) veya en azından zamanlanmış görev (scheduled job/cron) altyapımız var mı? Bu kurallar ne kadar esnek ve kimler tarafından yönetilebilir?

**Senaryo Başlığı:** Mobil Cihazda Offline Sayım ve Senkronizasyon Çakışması
**Zorluk:** 7/10
**Olay:** Depo görevlisi, internetin çekmediği bir alanda mobil uygulama üzerinden sayım yapar. Sayım verileri cihazda yerel olarak saklanır. Görevli, internet olan bir alana döndüğünde verileri senkronize etmeye çalışır. Ancak tam bu sırada, başka bir kullanıcı (veya bir otomatik süreç) aynı ürünlerden birinin stok miktarını merkez veritabanında değiştirmiştir (örn: bir transfer işlemi nedeniyle).
**Beklenen Sorun:** Veri çakışması (conflict). Senkronizasyon işlemi hangi veriyi doğru kabul etmeli? Cihazdaki sayım sonucunu mu, yoksa merkezdeki yeni miktarı mı? Yanlış bir birleştirme (merge) stratejisi, sayımın tamamen boşa gitmesine veya stokların yine hatalı olmasına neden olabilir.
**Architect'e Soru:** Offline çalışma ve veri senkronizasyonu için mimari bir stratejimiz var mı? Bu tür çakışmaları nasıl ele alacağız? "En son yazan kazanır" (Last-write-wins) basit bir strateji mi, yoksa kullanıcıya çakışmayı gösterip manuel olarak çözmesini isteyecek bir arayüz mü sunmalıyız? Merging/Reconciliation mantığı nerede işlemeli (client vs. server)?

**Senaryo Başlığı:** Seri Numaralı Ürün Sayımında Eksik/Fazla Tespiti
**Zorluk:** 6/10
**Olay:** Bir depoda, aynı ürüne (örn: "iPhone 15 Pro") ait 100 adet seri numaralı cihaz bulunmaktadır. Sayım sonucunda 100 adet cihaz sayılır, yani toplam miktar doğrudur. Ancak, sistemdeki A, B, C seri numaralı cihazlar yerine, A, B ve D seri numaralı cihazlar bulunur. Yani C kayıp, D ise sistemde olmaması gereken bir fazlalıktır.
**Beklenen Sorun:** Toplam stok miktarı doğru görünse de, hangi seri numaralı ürünün nerede olduğu bilgisi yanlıştır. Bu durum, garantili bir ürünün takibini, çalıntı bir cihazın tespitini veya belirli bir partiye ait ürünlerin geri çağrılmasını (recall) imkansız hale getirir.
**Architect'e Soru:** Mimarimiz, "miktarsal" envanter takibi ile "seri/lot numaralı" envanter takibini ayrı modeller olarak mı ele alıyor? Sayım araçlarımız, sadece miktarı değil, aynı zamanda taranan seri numaralarını da listeleyip sistemdeki beklenen liste ile karşılaştırarak eksik/fazla raporu üretebiliyor mu? Bu, ne kadar performanslı çalışır?

**Senaryo Başlığı:** Sayım Farklarının Otomatik Onaylanması ve Zincirleme Hata
**Zorluk:** 8/10
**Olay:** Sistem, sayım sonucunda ortaya çıkan +/- %1'e kadar olan farkları önemsiz kabul edip bir yöneticinin onayı olmadan otomatik olarak "yangın zayiatı" gibi bir nedenle stoktan düşecek veya artıracak şekilde yapılandırılmıştır. Ancak, bir depoda sistematik bir tartı hatası nedeniyle, kiloyla satılan 50 farklı ürün sürekli olarak %0.8 eksik ölçülmektedir.
**Beklenen Sorun:** Küçük ve önemsiz gibi görünen hataların birikerek büyük bir finansal kayba yol açması. Her sayımda, bu 50 ürünün stoğu otomatik olarak düzeltilir ve kimse sistematik sorunun farkına varmaz. Denetim kaydı ("audit trail") yetersizse, bu kaybın kaynağını bulmak aylar sürebilir.
**Architect'e Soru:** Otomatikleştirilmiş süreçlerin (auto-approval) yaratabileceği riskleri nasıl yönetiyoruz? Hangi seviyedeki bir farkın insan onayı gerektireceği dinamik olarak (ürün değeri, depo lokasyonu vb. göre) yapılandırılabiliyor mu? Otomatik yapılan tüm düzeltmeler, daha sonra analiz edilebilmek üzere ayrı ve dikkat çekici bir şekilde mi loglanıyor?

---

### Kategori: Depo ve Lokasyon Yönetimi

**Senaryo Başlığı:** Aktif Olarak Kullanılan Bir Deponun Silinmesi
**Zorluk:** 7/10
**Olay:** Bir yönetici, yanlışlıkla veya sistemdeki bir bug nedeniyle, içinde hala stok bulunan veya aktif transfer emirleri olan bir depoyu "silmeye" veya "arşivlemeye" çalışır. Arayüz bu işleme izin verir.
**Beklenen Sorun:** "Yetim" stok kayıtları. Stoklar sistemde varlığını sürdürür ancak fiziksel bir depoyla ilişkisi kalmaz. Bu ürünler satılamaz, transfer edilemez, sayılamaz hale gelir. İlişkili olduğu tüm açık siparişler veya transferler hataya düşer. Veritabanı seviyesinde `FOREIGN KEY` kısıtlaması yoksa (`ON DELETE RESTRICT`), bu işlem başarılı olabilir ve veri bütünlüğü bozulur.
**Architect'e Soru:** Kritik ana verilerin (depo, lokasyon, ürün) silinmesine karşı nasıl bir koruma mekanizmamız var? Sadece "soft delete" mi kullanıyoruz? Bir depoyu silebilmek/arşivleyebilmek için karşılanması gereken ön koşulları (içinde stok olmaması, açık sipariş bulunmaması vb.) Domain katmanında katı bir şekilde kontrol ediyor muyuz?

**Senaryo Başlığı:** Lokasyon Kapasitesinin Aşılması
**Zorluk:** 4/10
**Olay:** Bir depo lokasyonu (örn: Raf A-01-B), maksimum 10 koli alacak şekilde tanımlanmıştır. Ancak, iki farklı depo görevlisi, farklı irsaliyelerden gelen ürünleri neredeyse aynı anda bu lokasyona yerleştirmeye çalışır. Sistem, ikisinin de işlemini kabul eder ve lokasyonda 10'dan fazla koli görünmesine neden olur.
**Beklenen Sorun:** Fiziksel gerçeklikle sistem verisinin uyuşmaması. Depo operasyonlarında karmaşa yaşanır. Bir sonraki yerleştirme işlemi için bu lokasyon dolu olmasına rağmen sistemde boş görünebilir.
**Architect'e Soru:** Lokasyon kapasitesi (hacim, ağırlık, adet) gibi kısıtlamaları sistemde yönetiyor muyuz? Bu kontroller, stok yerleştirme işlemleri sırasında atomik bir şekilde yapılıyor mu? Kapasite aşıldığında kullanıcıya net bir hata mesajı dönüyor muyuz?

**Senaryo Başlığı:** Ürüne Yanlış Depo Adresi Atanması (Hatalı Adresleme)
**Zorluk:** 5/10
**Olay:** Dondurulmuş gıda ürünleri -20°C'de saklanması gereken özel bir depoda (SOGUK_HAVA) tutulmalıdır. Ancak bir veri giriş hatasıyla, yeni gelen bir parti dondurulmuş ürünün varsayılan adresi olarak normal ortam sıcaklığındaki ana depo (ANA_DEPO) seçilir. Toplama listesi oluşturan sistem, çalışanı ürünü almak için yanlış depoya yönlendirir.
**Beklenen Sorun:** Ürünlerin bulunamaması, siparişlerin gecikmesi ve en kötü durumda ürünlerin bozulması (soğuk zincirin kırılması). Depo içi süreçlerin verimsizleşmesi.
**Architect'e Soru:** Ürünlerin belirli depo tiplerine veya lokasyon özelliklerine (örn: "soğutuculu", "yanıcı madde bölgesi") göre kısıtlanmasını sağlayan bir kural setimiz var mı? Bir ürünü yanlış tipte bir lokasyona yerleştirmeye çalışırken sistem hata vermeli mi? Bu ilişkiyi ürün-lokasyon-depo arasında nasıl modelliyoruz?

**Senaryo Başlığı:** Depolar Arası Transfer Sırasında Ağ Bölünmesi (Network Partition)
**Zorluk:** 9/10
**Olay:** İstanbul deposundan Ankara deposuna bir ürün transferi başlatılır. İşlem, İstanbul deposundan stoğu düşürür (çıkış kaydı oluşturur) ve Ankara deposuna bir giriş beklentisi oluşturur. Tam bu sırada, iki depo arasındaki ağ bağlantısı veya merkezi sistemi koordine eden message broker çöker. İstanbul işlemi "başarılı" sanır, ama Ankara'nın işlemden haberi olmaz.
**Beklenen Sorun:** "Arafta kalmış" (in-transit) stok. Ürün, İstanbul'un envanterinden çıkmıştır ama Ankara'nın envanterine hiç girmemiştir. Toplam şirket envanteri doğru görünse de, depolara göre envanter raporları yanlıştır ve ürün fiziksel olarak yolda olmasına rağmen sistemde kayıp görünür.
**Architect'e Soru:** Depolar arası transfer gibi dağıtık işlemler (distributed transactions) için hangi pattern'i kullanıyoruz? Two-Phase Commit (2PC) mi, yoksa Saga Pattern mi? Ağ bölünmesi veya hedef sistemin yanıt vermemesi durumunda süreci nasıl telafi ediyoruz (compensation)? Transferin durumunu ("Yolda", "Tamamlandı", "İptal Edildi") güvenilir bir şekilde takip eden bir mekanizma var mı?

---

### Kategori: Stok Transfer ve Rezervasyon

**Senaryo Başlığı:** Rezerve Edilmiş Ürünün Başkasına Satılması
**Zorluk:** 6/10
**Olay:** Bir müşteri, web sitesi üzerinden bir ürünü "sepete ekler". Sistem, bu ürünü 15 dakikalığına müşteri için "rezerve eder" ve satılabilir stok miktarını bir azaltır. Bu 15 dakika dolmadan, bir mağaza çalışanı, sistemdeki bir bug veya gecikme nedeniyle bu "rezerve" durumunu görmez ve fiziksel olarak rafta duran son ürünü başka bir müşteriye satar.
**Beklenen Sorun:** Overselling. Web müşterisinin sepetindeki ürün için ödeme yapmaya çalıştığında "stok tükendi" hatası alması. Bu durum, müşteri memnuniyetsizliğine ve güven kaybına yol açar. Stok rezervasyon mantığının atomik veya yeterince hızlı çalışmadığını gösterir.
**Architect'e Soru:** Stok rezervasyon mekanizmamız nasıl bir tutarlılık modeline sahip? Güçlü tutarlılık mı (strong consistency) sağlıyor, yoksa nihai tutarlılık (eventual consistency) mı? Rezervasyonlar ayrı bir tabloda mı tutuluyor, yoksa ana stok tablosunda "rezerve miktar" gibi bir kolonla mı yönetiliyor? Bu iki yaklaşımın performans ve veri bütünlüğü açısından avantaj/dezavantajları nelerdir?

**Senaryo Başlığı:** Transferdeki Ürünün İptal Edilen Siparişe Geri Dönmemesi
**Zorluk:** 7/10
**Olay:** Bir ürün, X müşterisinin siparişi için A deposundan B (sevkiyat) deposuna transfer edilir. Transfer yoldayken, müşteri X siparişini iptal eder. İptal işlemi, siparişi başarıyla iptal eder ancak transferin durumundan haberdar olmadığı için ürünü tekrar A deposunun satılabilir stoğuna eklemez. Ürün, B deposuna ulaştığında ise ortada bir sipariş olmadığı için "kayıp" durumuna düşer.
**Beklenen Sorun:** Stok kaybı. Ürün ne A ne de B deposunun satılabilir stoğunda görünür. Fiziksel olarak B deposundadır ancak herhangi bir iş süreciyle ilişkili değildir. Bu tür "unutulmuş" stoklar zamanla birikerek envanter açığına neden olur.
**Architect'e Soru:** Sipariş, Envanter ve Lojistik modülleri arasındaki süreçler olay tabanlı (event-driven) bir mimari ile mi yönetiliyor? "SiparişİptalEdildi" gibi bir olay yayınlandığında, ilgili transfer sürecini dinleyip "transferi geri çağır" veya "ürünü geldiği depoda stoğa ekle" gibi bir telafi (compensation) işlemini tetikleyen bir mekanizma var mı? Bu tür modüller arası karmaşık etkileşimler için Saga pattern'i kullanıyor muyuz?

**Senaryo Başlığı:** Süresiz Stok Rezervasyonu
**Zorluk:** 4/10
**Olay:** Bir entegrasyon veya API istemcisi, bir stok rezervasyonu başlatır ancak rezervasyonun süresini (expiration) belirtmez veya sistem varsayılan bir süre atamaz. Veya rezervasyonu yapan süreç çöker ve rezervasyonu iptal etme (release) komutunu hiçbir zaman gönderemez.
**Beklenen Sorun:** Stokların süresiz olarak kilitli kalması. Rezerve edilen ürünler satılamaz, transfer edilemez ve stokta var görünmelerine rağmen kimse tarafından kullanılamaz. Bu durum, "ölü stok" yaratır.
**Architect'e Soru:** Tüm stok rezervasyonlarının zorunlu bir yaşam süresi (Time-to-Live, TTL) var mı? Süresi dolan rezervasyonları otomatik olarak temizleyen bir "garbage collector" veya zamanlanmış bir iş (scheduled job) mevcut mu? Bu temizlik süreci, veritabanı üzerinde ne kadar yük oluşturur?

**Senaryo Başlığı:** Çok Adımlı Transferde Aradaki Depoda Stok Unutulması
**Zorluk:** 8/10
**Olay:** Bir ürünün A deposundan C deposuna gitmesi gerekmektedir, ancak rota gereği önce B aktarma merkezine uğramalıdır (A -> B -> C). Transfer, A'dan B'ye başarıyla yapılır. Ürün B'de stoğa girer. Ancak, B'den C'ye olan ikinci transfer adımı bir hata nedeniyle (örn: C deposu o an alım kabul etmiyor) hiçbir zaman tetiklenmez veya başarısız olur.
**Beklenen Sorun:** Ürün, hedef deposu olan C yerine, ara depoda (B) kalır. Eğer raporlama ve uyarı mekanizmaları yetersizse, bu ürünün neden B deposunda olduğu ve asıl hedefinin neresi olduğu bilgisi kaybolur. Operasyonel olarak ürün "kayıptır".
**Architect'e Soru:** Çok adımlı (multi-leg) transferleri tek bir "Transfer Emri" konsepti altında mı yönetiyoruz? Bu emrin her bir adımının (leg) durumunu (Beklemede, Yolda, Tamamlandı) ayrı ayrı takip ediyor muyuz? Bir adımda oluşan bir hata veya gecikmenin, tüm transfer emrini nasıl etkilediğini ve ilgili kişilere nasıl uyarı gönderildiğini tanımlayan bir iş akışımız var mı?

---

### Kategori: Entegrasyon (Satış, Satın Alma, Üretim)

**Senaryo Başlığı:** Satış Modülü İle Envanter Arasında Gecikmeli Tutarlılık (Eventual Consistency) Krizi
**Zorluk:** 8/10
**Olay:** Sistem, yüksek performans için olay tabanlı (event-driven) bir mimari kullanır. Satış modülü bir ürün sattığında, "UrunSatildi" olayını bir mesaj kuyruğuna (message queue) atar. Envanter modülü bu kuyruğu dinleyerek stoğu günceller. Ancak, mesaj kuyruğunda anlık bir yavaşlama veya kesinti olur ve stok güncelleme işlemi 5 dakika gecikir. Bu sırada, Envanter modülünün API'si hala eski stok bilgisini gösterir.
**Beklenen Sorun:** Overselling. İlk satışın stoğu düşmesi geciktiği için, bu 5 dakika içinde aynı ürün (eğer stok azsa) birden çok kez daha satılabilir. Müşterilere "stok var" bilgisi gösterilirken, aslında fiziksel stok çoktan tükenmiştir.
**Architect'e Soru:** Eventual consistency modelini benimsediğimiz senaryolarda, "tutarsızlık penceresi" (inconsistency window) olarak adlandırılan bu gecikme süresinin yaratacağı iş risklerini nasıl yönetiyoruz? Kritik stoklar için (son X adet ürün gibi) daha anlık bir kontrol mekanizması (örn: satış anında envanter API'sini doğrudan çağırmak) gibi bir hibrit yaklaşım düşünülmeli mi? Kullanıcı arayüzünde "Stok bilgisi yaklaşık 5 dakika içerisinde güncellenmektedir" gibi bir uyarı göstermeli miyiz?

**Senaryo Başlığı:** Üretim Emri İçin Hammadde Ayırma (Allocation) Hatası
**Zorluk:** 7/10
**Olay:** Bir "Masa" üretmek için 4 adet "Masa Ayağı" ve 1 adet "Masa Tablası" gerekmektedir. Üretim modülü, bir üretim emri başlattığında Envanter modülünden bu hammaddeleri rezerve etmesini (allocate) ister. Envanter, 4 adet ayak rezerve eder, ancak tabla stoğunun yetersiz olduğunu fark eder. İşlem yarım kalır.
**Beklenen Sorun:** Kısmi rezervasyon (partial allocation). 4 adet masa ayağı, başarısız bir üretim emri için süresiz olarak kilitli kalabilir. Bu ayaklar başka üretim emirleri veya satışlar için kullanılamaz. Eğer bu durum fark edilmezse, "hayalet" hammadde sıkıntısı yaşanır.
**Architect'e Soru:** Üretim için hammadde rezervasyonu (allocation) işlemi, tüm bileşenlerin (Bill of Materials - BOM) stoğu kontrol edildikten sonra tek bir atomik transaction içinde mi yapılıyor? Bir bileşenin bile stoğu yetersizse, tüm rezervasyon işlemi geri alınmalı (rollback). Bu "hepsi ya da hiçbiri" mantığını nasıl sağlıyoruz? Saga pattern mi, yoksa tek bir transaction içinde mi çözülmeli?

**Senaryo Başlığı:** Satın Alma Siparişi Geldiğinde Beklenen Stok Bilgisinin Güncellenmemesi
**Zorluk:** 5/10
**Olay:** Satın alma modülü, bir tedarikçiden 100 adet ürün sipariş eder ve teslimat tarihi olarak 2 hafta sonrasını belirler. Bu bilgi, Envanter modülüne iletilir. Envanter modülü bu bilgiyi kullanarak "beklenen stok" veya "yoldaki stok" miktarını güncellemelidir ki satış departmanı gelecekteki mevcidiyet hakkında bilgi sahibi olsun. Ancak, entegrasyondaki bir hata nedeniyle bu güncelleme yapılmaz.
**Beklenen Sorun:** Yanlış planlama ve satış vaatleri. Satış ekibi, yolda olan ürünlerden habersiz olduğu için müşterilere uzun teslimat süreleri verir veya o ürünü satmaktan kaçınır. Nakit akışı ve satış hedefleri olumsuz etkilenir.
**Architect'e Soru:** Farklı stok türlerini (satılabilir, rezerve, kalite kontrolde, yolda, vb.) mimaride nasıl modelliyoruz? Bu farklı statülerin toplamı, bir ürünün "toplam fiziksel miktarını" mı vermeli? Satın alma, üretim gibi diğer modüllerden gelen olayların bu stok statülerini güvenilir bir şekilde güncellemesini nasıl garanti altına alıyoruz?

**Senaryo Başlığı:** İptal Edilen Satın Alma Siparişinin "Yoldaki Stok"tan Düşülmemesi
**Zorluk:** 6/10
**Olay:** Bir önceki senaryonun devamı olarak, 100 adet yolda olan ürün bilgisi Envanter modülüne işlenmiştir. Ancak tedarikçiyle yaşanan bir sorun nedeniyle Satın Alma modülü bu siparişi iptal eder. İptal bilgisi, Envanter modülüne ulaşmaz veya entegrasyon bu durumu işleyemez.
**Beklenen Sorun:** "Hayalet" beklenen stok. Sistem, aslında hiç gelmeyecek olan 100 adet ürünün hala yolda olduğunu varsayar. Satış ve planlama departmanları bu yanlış bilgiye göre hareket eder, olmayan ürünü satar ve teslimat zamanı geldiğinde büyük bir kriz yaşanır.
**Architect'e Soru:** Modüller arası işlemlerde "telafi edici işlemler" (compensating transactions) konseptini nasıl uyguluyoruz? "SatınAlmaSiparişiİptalEdildi" olayı, "YoldakiStokMiktariniAzalt" gibi bir işlemi tetiklemeli. Bu tür kritik entegrasyon noktalarında, işlemlerin başarıyla tamamlandığını (veya hata aldığını) takip eden bir denetim ve uyarı mekanizması (monitoring/alerting) var mı?

---

### Kategori: Performans, Yüksek Yük ve Ölçeklenebilirlik

**Senaryo Başlığı:** Black Friday: Saniyede Binlerce Stok Kontrolü
**Zorluk:** 9/10
**Olay:** Büyük bir kampanya anında (Black Friday, Sezon İndirimi), on binlerce kullanıcı aynı anda popüler bir ürünün sayfasına girer. Next.js frontend'i, her sayfa ziyareti veya "sepete ekle" denemesi için backend'e stok durumu kontrolü isteği gönderir. Bu durum, saniyede binlerce `SELECT` sorgusunun veritabanına gitmesine neden olur.
**Beklenen Sorun:** Veritabanı okuma (read) darboğazı. Stok tablosu üzerindeki yoğun okuma baskısı, diğer tüm işlemleri (satış kaydı, stok güncelleme, sayım vb.) yavaşlatır. Veritabanı CPU'su %100'e ulaşır, bağlantı havuzu (connection pool) dolar ve sistem genelinde timeout'lar yaşanır.
**Architect'e Soru:** Yüksek okuma trafiğiyle başa çıkmak için mimarimizde ne gibi önlemler var? Stok seviyelerini belirli bir süre (örn: 15-30 saniye) için Redis gibi bir in-memory cache'de tutuyor muyuz? Bu cache'i nasıl ve ne zaman geçersiz kılıyoruz (cache invalidation)? Okuma ve yazma işlemleri için CQRS (Command Query Responsibility Segregation) pattern'ini kullanarak farklı veritabanları (read/write replicas) kullanmayı düşündük mü?

**Senaryo Başlığı:** Yıl Sonu Envanter Raporu ve Veritabanı Felci
**Zorluk:** 8/10
**Olay:** Bir yönetici, tüm depoların, tüm ürünlerin ve tüm lokasyonların bir yıllık stok hareketlerini içeren devasa bir envanter değerleme raporu çekmek ister. Bu rapor, milyonlarca satırlık `StokHareketleri` tablosunu, `Urunler`, `Depolar`, `Lokasyonlar` gibi tablolarla `JOIN`'leyerek karmaşık hesaplamalar (örn: ağırlıklı ortalama maliyet) yapmaya çalışır.
**Beklenen Sorun:** "Katil sorgu" (killer query). Bu sorgu, veritabanı kaynaklarının (CPU, memory, I/O) büyük bir kısmını dakikalarca, hatta saatlerce tüketir. Canlı (production) veritlabanı üzerinde çalıştırıldığı için, sistemdeki diğer tüm operasyonları durma noktasına getirir. Sorgu, uzun süren kilitlere (locks) neden olarak deadlock riskini de artırır.
**Architect'e Soru:** Bu tür karmaşık ve uzun süren analitik sorgular için stratejimiz nedir? Bu raporları canlı veritabanı yerine, gecikmeli bir kopyası (read replica) veya özel olarak bu iş için tasarlanmış bir data warehouse/veri gölü (data lake) üzerinden mi çalıştırmalıyız? Raporlama sorgularının canlı sistemi etkilemesini önlemek için ` NOLOCK` gibi izolasyon seviyeleri veya kaynak sınırlama (resource governance) mekanizmaları kullanıyor muyuz?

**Senaryo Başlığı:** Binlerce Depo ve Lokasyonla Artan Sorgu Süreleri
**Zorluk:** 7/10
**Olay:** Sistem ilk tasarlandığında 10-20 depo için optimize edilmiştir. Ancak şirket büyür ve franchise modeliyle 5000 küçük depo/satış noktası sisteme eklenir. Bir ürünün "tüm depolardaki toplam stoğunu" gösteren basit bir sorgu bile, artık binlerce satırı taramak ve toplamak zorunda kalır.
**Beklenen Sorun:** Ölçeklenemeyen sorgular. Başlangıçta hızlı çalışan sorgular, veri hacmi arttıkça katlanarak yavaşlar. Özellikle indekslenmemiş alanlar üzerinde yapılan filtrelemeler veya `JOIN`'ler sistemi işlemez hale getirir.
**Architect'e Soru:** Veritabanı şemamız ve sorgularımız, büyük veri hacimlerini (large scale) göz önünde bulundurularak mı tasarlandı? İleride darboğaz olabilecek noktaları (örn: `GROUP BY depo_id`) tespit etmek için düzenli olarak sorgu performansı analizi (query plan analysis) yapıyor muyuz? Veriyi bölümleme (partitioning) veya materyalize edilmiş görünümler (materialized views) gibi PostgreSQL özelliklerini kullanarak bu tür toplama sorgularını önceden hesaplamayı (pre-computation) değerlendiriyor muyuz?

**Senaryo Başlığı:** Stok Transferi Sırasında Kilitlenen Tablolar
**Zorluk:** 8/10
**Olay:** Gece yarısı çalışan bir batch işlem, A deposundaki binlerce ürünü B deposuna transfer etmeye başlar. İşlem, `Stoklar` tablosu üzerinde çalışır ve her bir ürün için satır bazında veya daha kötüsü sayfa/tablo bazında kilitler (locks) koyar. Bu sırada, e-ticaret sitesinden bu ürünlerden herhangi birine bir satış veya iade işlemi gelmeye çalışır.
**Beklenen Sorun:** Kilit beklemeye bağlı performans düşüşü (Lock contention). Canlı kullanıcı işlemleri, toplu transfer işlemi bitene kadar askıda kalır. Bu durum, kullanıcı tarafında "donan" ekranlara ve timeout hatalarına yol açar. Eğer işlem uzun sürerse, gün içindeki operasyonları ciddi şekilde etkileyebilir.
**Architect'e Soru:** Uzun süren toplu işlemleri (batch jobs) canlı kullanıcı trafiğinden nasıl izole ediyoruz? Bu işlemleri daha düşük öncelikte veya veritabanının daha az meşgul olduğu saatlerde mi çalıştırıyoruz? Kullandığımız kilitleme seviyesi (row-level vs. table-level) nedir? İyimser kilitleme (optimistic locking) ve kısa transaction'lar kullanarak bu tür kilitlenme sürelerini en aza indirmeyi hedefliyor muyuz?

---

### Kategori: Veri Bütünlüğü ve Felaket Kurtarma

**Senaryo Başlığı:** Veritabanı Yedeğinden Geri Dönerken Veri Kaybı
**Zorluk:** 10/10
**Olay:** Gece 03:00'te ana veritabanı sunucusu tamamen çöküyor (disk arızası). En son tam yedek (full backup) gece 00:00'da alınmış. Saat 00:00 ile 03:00 arasında yapılan tüm satışlar, stok girişleri ve transferler kaybolur. Sistem, gece 00:00'daki duruma geri döndürülür.
**Beklenen Sorun:** 3 saatlik veri kaybı (Data Loss). Bu, finansal kayıp, müşteri memnuniyetsizliği ve operasyonel kaos demektir. Fiziksel olarak satılan ürünler sistemde hala stokta görünür, yapılan ödemelerin kaydı olmaz. Gerçek dünya ile sistem arasında tam bir kopukluk yaşanır.
**Architect'e Soru:** Felaket kurtarma (Disaster Recovery) planımız nedir? Kurtarma Noktası Hedefimiz (RPO - Recovery Point Objective) ne kadar? Sadece gecelik tam yedekler mi alıyoruz, yoksa PostgreSQL'in Point-in-Time Recovery (PITR) özelliğini kullanarak ve işlem loglarını (WAL - Write-Ahead Logging) sürekli yedekleyerek RPO'yu saniyelere/dakikalara indirebilir miyiz? Bu altyapı kurulu ve düzenli olarak test ediliyor mu?

**Senaryo Başlığı:** "Silent Data Corruption" ile Stok Miktarlarının Bozulması
**Zorluk:** 9/10
**Olay:** Veritabanı veya disk altsistemindeki sinsi bir bug (silent data corruption) nedeniyle, `Stoklar` tablosundaki bazı satırlardaki `Miktar` alanları rastgele değişir. Örneğin, 100 olan bir stok miktarı, bit-flip sonucu 108 olur. Bu hata, uygulama veya veritabanı tarafından fark edilmez, çünkü işlem kurallara uygundur.
**Beklenen Sorun:** Anlaşılamayan stok farkları. Sayımlar sürekli olarak yanlış çıkar, ancak nedeni bulunamaz. Stok hareket kayıtları ile mevcut stok durumu arasında tutarsızlıklar oluşur. Veriye olan tüm güven kaybolur.
**Architect'e Soru:** Veri bütünlüğünü sadece uygulama katmanında mı sağlıyoruz? PostgreSQL'in sunduğu `checksums` gibi özellikleri veri sayfalarının bütünlüğünü doğrulamak için kullanıyor muyuz? Stok miktarı gibi kritik bir verinin, ilgili stok hareketlerinin toplamından periyodik olarak yeniden hesaplanıp doğrulandığı bir denetim (audit) süreci var mı? Bu tür "silent corruption" olaylarını tespit etmek için ne gibi mekanizmalarımız var?

**Senaryo Başlığı:** Uygulama Hatası Nedeniyle Kısmi Güncelleme
**Zorluk:** 7/10
**Olay:** Bir ürünün stoğu güncellenirken, işlemin bir parçası olarak hem `Stoklar` tablosundaki anlık miktarın, hem de `StokHareketleri` tablosuna bir işlem kaydının atılması gerekmektedir. Ancak uygulamadaki bir bug nedeniyle, `Stoklar` tablosu güncellenir ama `StokHareketleri`'ne kayıt atılırken bir `NullReferenceException` fırlatılır. İşlem bir transaction içinde değildir.
**Beklenen Sorun:** Denetim kaydı (audit trail) kaybı. Stoğun mevcut durumu değişir, ancak bu değişikliğin "neden", "ne zaman" ve "kim tarafından" yapıldığına dair hiçbir kanıt olmaz. Bu durum, stok farklarının kaynağını bulmayı imkansız hale getirir ve suistimale kapı aralar.
**Architect'e Soru:** Birbirine bağlı veri değişikliklerinin (stok miktarı ve hareket kaydı gibi) her zaman tek bir atomik transaction içinde yapılmasını nasıl garanti ediyoruz? Domain-Driven Design (DDD) prensiplerini kullanarak, bu tür operasyonları tek bir Aggregate kökü üzerinden yönetip, tutarlılığı Aggregate sınırları içinde zorunlu hale getiriyor muyuz?

**Senaryo Başlığı:** Read Replica Gecikmesi Nedeniyle Yanlış Stok Gösterimi
**Zorluk:** 6/10
**Olay:** Sistem, okuma yükünü dağıtmak için bir ana veritabanı (primary) ve bir okuma kopyası (read replica) kullanır. Web sitesindeki ürün detay sayfası gibi okuma yoğun işlemler, sorguları read replica'ya gönderir. Ancak, replikasyon anlık bir ağ sorunu nedeniyle 30 saniye gecikir (replication lag). Bu sırada ana veritabanında bir ürünün son adedi satılır ve stoğu sıfırlanır.
**Beklenen Sorun:** Web sitesi, 30 saniye boyunca read replica'dan okuduğu eski veriyi göstererek ürünün hala stokta olduğunu belirtir. Müşteri ürünü satın almaya çalıştığında, yazma işlemi ana veritabanına gideceği için "stok tükendi" hatası alır.
**Architect'e Soru:** Read replica kullanan sistemlerde replikasyon gecikmesinin (replication lag) yaratacağı risklere karşı bir stratejimiz var mı? Kritik işlemlerde (örn: "sepete ekle" veya ödeme sayfası) sorguları doğrudan ana veritabanına yönlendiriyor muyuz? Uygulama, mevcut replikasyon gecikmesini izleyip, gecikme belirli bir eşiği aşarsa read replica'yı kullanmayı geçici olarak durduracak kadar akıllı mı?

---

### Kategori: Güvenlik ve Yetkilendirme

**Senaryo Başlığı:** Stok Maliyet Bilgisinin Yetkisiz Erişime Açılması
**Zorluk:** 6/10
**Olay:** Düşük yetkili bir depo çalışanı, normalde sadece ürün adı ve miktarını görmesi gereken bir API endpoint'ini (örn: `/api/products/{id}`) çağırır. Ancak, backend'deki DTO (Data Transfer Object) veya serialization ayarları hatalı yapılandırıldığı için, API yanıtı ürünün maliyet (`costPrice`) ve tedarikçi (`supplier`) bilgilerini de içerir.
**Beklenen Sorun:** Hassas veri sızıntısı (Sensitive Data Exposure). Şirketin kar marjları, tedarikçi anlaşmaları gibi ticari sır niteliğindeki bilgilere yetkisiz kişiler tarafından erişilmesi. Bu bilgi, rakip firmalara sızdırılabilir veya çalışanlar arasında huzursuzluğa neden olabilir.
**Architect'e Soru:** API endpoint'lerimiz, farklı kullanıcı rollerine göre farklı veri setleri (DTO'lar) dönecek şekilde tasarlanmış mı? Bir "AdminProductDto" ile "PublicProductDto" arasında net bir ayrım var mı? Backend'de, hangi kullanıcının hangi veri alanlarına erişebileceğini tanımlayan ve zorunlu kılan bir yetkilendirme mekanizması (örn: claim-based authorization on properties) kullanılıyor mu?

**Senaryo Başlığı:** Başka Bir Kiracının (Tenant) Stok Verisini Görme
**Zorluk:** 9/10
**Olay:** Sistem, çok-kiracılı (multi-tenant) bir mimariye sahiptir ve her şirket kendi verisini izole bir şekilde görmelidir. Ancak, bir yönetici kendi envanter raporunu çekerken, sorgudaki `WHERE tenant_id = @currentUserTenantId` koşulunun unutulduğu veya yanlış yazıldığı bir API endpoint'ini tetikler.
**Beklenen Sorun:** Veri izolasyonunun delinmesi. A şirketindeki bir kullanıcı, B şirketinin stoklarını, maliyetlerini ve satış verilerini görür. Bu, çok büyük bir güvenlik açığı, yasal bir felaket ve müşteri güveninin tamamen kaybolması demektir.
**Architect'e Soru:** Multi-tenancy stratejimiz nedir ve veri izolasyonunu nasıl garanti altına alıyoruz? Her sorguya manuel olarak `tenant_id` filtresi eklemek yerine, bu filtrelemeyi EF Core'un Global Query Filters gibi bir mekanizmayla otomatik ve zorunlu hale getiriyor muyuz? Bu kuralın atlatılamayacağından emin olmak için ne gibi testler (otomatik veya manuel) yapıyoruz?

**Senaryo Başlığı:** Stok Transfer Emri Üzerinde Oynama (Parameter Tampering)
**Zorluk:** 5/10
**Olay:** Bir kullanıcı, A deposundan B deposuna 10 adet ürün transfer etmek için arayüzden işlemi başlatır. Bu sırada, araya giren bir proxy aracı (örn: Burp Suite) ile giden API isteğini yakalar. İstekteki `destinationWarehouseId` parametresini, normalde yetkisi olmayan Z deposu olarak değiştirir ve isteği sunucuya gönderir.
**Beklenen Sorun:** Yetki aşımı (Privilege Escalation). Backend, kullanıcının Z deposuna transfer yapma yetkisi olup olmadığını kontrol etmiyorsa, ürünler yetkisiz bir şekilde istenilen herhangi bir depoya gönderilebilir. Bu, hırsızlık veya sabotaj için kullanılabilir.
**Architect'e Soru:** Yetkilendirme kontrollerimiz sadece "bu endpoint'i çağırabilir" seviyesinde mi, yoksa "bu endpoint'i *bu parametrelerle* çağırabilir" (resource-based authorization) seviyesinde mi? Örneğin, bir kullanıcının sadece kendi bölgesindeki depolar arasında transfer yapabilmesini nasıl sağlıyoruz? Bu tür iş kuralları ve yetkiler, Domain katmanında mı, yoksa Application katmanında mı doğrulanıyor?

**Senaryo Başlığı:** Stok Sayım Sonuçlarını Değiştirme (CSRF Saldırısı)
**Zorluk:** 7/10
**Olay:** Bir depo yöneticisi, Stocker web uygulamasında oturum açmıştır. Bu sırada, başka bir sekmede kötü niyetli bir web sitesini ziyaret eder. Bu site, yöneticinin haberi olmadan, Stocker uygulamasına yönelik bir `POST` isteği gönderir. Bu istek, yöneticinin tarayıcısındaki authentication cookie'lerini kullanarak, tamamlanmış bir stok sayımının sonuçlarını (örn: 100 adetlik farkı 0 olarak gösterme) değiştiren bir formu gizlice gönderir.
**Beklenen Sorun:** Cross-Site Request Forgery (CSRF). Yetkili bir kullanıcının oturumunu kullanarak, onun haberi ve isteği dışında sistemde değişiklik yapılması. Bu, stok farklarının üstünün örtülmesine veya sahte verilerin sisteme girilmesine yol açabilir.
**Architect'e Soru:** CSRF saldırılarına karşı standart koruma mekanizmalarını (.NET'in anti-forgery token'ları gibi) tüm state-changing (veri değiştiren) `POST`, `PUT`, `DELETE` isteklerinde kullanıyor ve sunucu tarafında doğruluyor muyuz? API'lerimiz, tarayıcı dışı istemciler (mobil uygulama gibi) ile tarayıcı tabanlı istemcileri ayırt edip buna göre farklı güvenlik politikaları uyguluyor mu?

---

### Kategori: Maliyetlendirme ve Envanter Değerleme

**Senaryo Başlığı:** Ağırlıklı Ortalama Maliyetin Anlık Olarak Yeniden Hesaplanması
**Zorluk:** 8/10
**Olay:** Sistem, stok maliyetini "Ağırlıklı Ortalama Maliyet" (Weighted Average Cost - WAC) metoduyla hesaplıyor. Yüksek hacimli bir ürün için, milisaniyeler içinde aynı anda bir satış işlemi (stok çıkışı) ve yeni, daha yüksek bir fiyattan bir satınalma işlemi (stok girişi) gerçekleşir.
**Beklenen Sorun:** Maliyet hesaplama yarış durumu (Race Condition). Satış işlemi, maliyeti kaydetmek için WAC'ı okuduğu anda, satınalma işlemi WAC'ı güncellerse, satışın maliyeti eski (düşük) fiyattan kaydedilir. Bu, satılan malın maliyetini (COGS) düşük, envanter değerini ise yapay olarak yüksek gösterir. Eğer bu işlemler atomik bir şekilde yönetilmezse, veritabanındaki son WAC değeri de hangi işlemin en son yazdığına bağlı olarak şans eseri belirlenir.
**Architect'e Soru:** Maliyetlendirme gibi finansal bütünlük gerektiren işlemler, envanter hareketleriyle aynı transaction içinde mi yönetiliyor? Ağırlıklı ortalama maliyetin her stok girişinde yeniden hesaplanması ve bu değerin bir sonraki çıkış işlemi için kilitlenmesini (locking) nasıl bir mekanizma ile sağlıyoruz? Bu, performansı nasıl etkiler?

**Senaryo Başlığı:** Tarihsel Satınalma Faturasının Fiyatını Değiştirme
**Zorluk:** 9/10
**Olay:** Bir muhasebe çalışanı, 3 ay önce girilmiş bir satınalma faturasındaki birim maliyetin yanlış olduğunu fark eder ve düzeltir (örn: 10 TL yerine 12 TL). Bu faturayla stoğa giren ürünlerin bir kısmı çoktan satılmış, bir kısmı depoda, bir kısmı ise başka bir depoya transfer edilmiştir.
**Beklenen Sorun:** Zincirleme maliyet bozulması (Cascading cost corruption). Sadece geçmişteki bu alıma ait maliyetin güncellenmesi yeterli değildir. Bu alımdan sonra yapılan tüm satışların maliyetlerinin (COGS), tüm stok çıkışlarının ve mevcut envanterin değerinin geriye dönük olarak (retroactively) yeniden hesaplanması gerekir. Eğer sistem buna göre tasarlanmadıysa, envanterin değeri ve geçmiş karlılık raporları tamamen yanlış kalır.
**Architect'e Soru:** Mimarimiz, geriye dönük maliyet düzeltmelerini (retroactive cost adjustments) destekliyor mu? Bu tür bir değişiklik tetiklendiğinde, ilgili tüm stok hareketlerini ve finansal kayıtları yeniden hesaplayacak bir "Maliyet Yeniden Hesaplama Motoru" (Cost Recalculation Engine) var mı? Bu süreç ne kadar sürer ve çalışırken sistemi kilitler mi?

**Senaryo Başlığı:** İade Edilen Ürünün Maliyetinin Belirlenememesi
**Zorluk:** 7/10
**Olay:** Bir müşteri, 2 ay önce aldığı bir ürünü iade eder. Sistem FIFO (İlk Giren İlk Çıkar) maliyetlendirme metodunu kullanmaktadır. İade anında, sistem bu ürünün hangi maliyet partisine ait olduğunu belirleyemez veya bu bilgi orijinal satış kaydında tutulmamıştır. Sistem, ürünü stoğa alırken hangi maliyetle almalıdır? Güncel maliyetle mi? Orijinal satış anındaki ortalama maliyetle mi?
**Beklenen Sorun:** Envanter değerinin ve karlılığın yanlış hesaplanması. Eğer ürün, orijinal maliyetinden daha yüksek bir maliyetle stoğa geri alınırsa, envanter değeri şişer ve iade işlemi karlı gibi görünebilir. Tersi durumda ise envanter değeri haksız yere düşer.
**Architect'e Soru:** Satış işlemleri sırasında, satılan her bir ürünün maliyetini (ve eğer FIFO/LIFO kullanılıyorsa ait olduğu maliyet partisini) `SatisKalemleri` tablosunda saklıyor muyuz? İade sürecimiz, bu orijinal maliyet bilgisine erişip iade girişini bu değer üzerinden yapacak şekilde mi tasarlandı?

**Senaryo Başlığı:** Fire ve İmha İşlemlerinin Maliyete Etkisi
**Zorluk:** 5/10
**Olay:** Depoda bulunan bir ürün (örn: son kullanma tarihi geçmiş süt) imha edilir ve sistemden "fire" olarak çıkışı yapılır. Bu stok çıkışının, "Satılan Malın Maliyeti" (COGS) gibi bir hesaba değil, "Bozulma/Fire Giderleri" gibi farklı bir muhasebe hesabına işlenmesi gerekir.
**Beklenen Sorun:** Yanlış finansal raporlama. Eğer fire işlemi, normal bir satış gibi COGS'u artırırsa, şirketin satış karlılığı (gross margin) olduğundan düşük görünür. Giderler doğru sınıflandırılamadığı için, ne kadar ürünün bozulma/kayıp nedeniyle kaybedildiği anlaşılamaz.
**Architect'e Soru:** Her stok hareket tipinin (Satış, İade, Transfer, Sayım Farkı, Fire) farklı muhasebe kodları ve maliyet etkileri yaratmasını sağlayacak bir altyapımız var mı? Bu eşleştirmeler (mapping) esnek bir şekilde yapılandırılabiliyor mu? Envanter modülü, bu hareketleri Finans/Muhasebe modülüne gönderirken bu farklı bağlamları iletiyor mu?