# Satış Modülü Kaos Senaryoları - Seviye 10

Bu belge, Stocker projesinin Satış modülünün ve bu modülün Envanter, Fiyatlandırma ve Müşteri yönetimi gibi diğer alanlarla olan kritik etkileşimlerinin sınırlarını test etmek, mimari zafiyetleri ortaya çıkarmak ve en kötü durum senaryolarına karşı dayanıklılığını sorgulamak amacıyla oluşturulmuş en üst düzey kaos mühendisliği senaryolarını içerir.

---

**Senaryo Başlığı:** Promosyon Motoru Kıyameti ve Durdurulamayan Kanama
**Zorluk:** 10/10
**Olay:** Bir pazarlama çalışanı, "Sepette %10 indirim" tanımlayacakken yanlışlıkla "Sepet tutarını %10'a düşür" (%90 indirim) gibi bir kural tanımlar. Kural, kupon koduna bağlı değildir ve tüm müşterilere açıktır. Kural aktif olur olmaz, Redis gibi bir cache mekanizması tarafından tüm edge sunucularına dağıtılır ve binlerce müşteri saniyeler içinde bu indirimle alışveriş yapmaya başlar. Yönetim paneli üzerinden promosyonu "pasif" yapma komutu, cache TTL (Time-to-Live) süreleri veya replikasyon gecikmeleri nedeniyle anında etki etmez.
**Beklenen Sorun:** Kontrolsüz ve kitlesel finansal zarar. Şirket, ürünlerini maliyetinin çok altında satmaya başlar. Promosyonu durdurma girişimlerinin gecikmesi, zararın katlanarak artmasına neden olur. Stoklar hızla tükenir (overselling) ve müşteri siparişleri karşılanamaz duruma gelir, bu da itibar kaybına yol açar.
**Architect'e Soru:** Kritik iş kurallarını (promosyonlar, fiyatlandırma) anında ve global olarak devre dışı bırakacak bir "acil durum anahtarı" (kill switch) mekanizmamız var mı? Bu mekanizma, cache katmanlarını nasıl bypass edebilir? .NET tarafında `IConfiguration` veya feature flag servisleri, bu tür anlık değişiklikleri ne kadar sürede tüm pod'lara/sunuculara yayabilir? Bu tür bir kural motorunun "yanlışlıkla" felakete yol açmasını önlemek için ne gibi güvenlik (örn: 4 göz prensibi onayı) ve simülasyon mekanizmaları kurmalıyız?

---

**Senaryo Başlığı:** Ödeme Ağ Geçidi Geri Dönüşü ve "Zombi" Siparişler
**Zorluk:** 10/10
**Olay:** Bir müşteri siparişi verilir, ödeme ağ geçidinden (payment gateway) "onaylandı" yanıtı alınır. Sipariş, Lojistik modülüne iletilir, ürünün faturası kesilir, envanterden düşülür ve kargoya verilir. Üç gün sonra, ödeme ağ geçidi, işlemin aslında sahte (fraudulent) olduğunu tespit eder ve bir "reversal" işlemi tetikler. Bu bilgi, sistemimize bir webhook çağrısı ile asenkron olarak ulaşır.
**Beklenen Sorun:** İş mantığı çıkmazı ve telafi edilemeyen durum. Ürün fiziksel olarak gitmiştir. Stok geri alınamaz. Ancak ödeme artık yoktur. Sistem, bu "zombi" siparişi ne yapacağını bilemez. Finansal kayıtlar, envanter durumu ve satış raporları arasında devasa bir tutarsızlık oluşur. Siparişin durumu ne olmalı? "İptal" mi, "Ödemesi Geri Çekilmiş Sevkiyat" mı?
**Architect'e Soru:** Ödeme gibi "kesin" kabul ettiğimiz işlemlerin bile asenkron olarak geri alınabildiği durumlar için mimarimiz hazır mı? Bu tür telafi edici (compensating) işlemleri yönetmek için Saga pattern'i yeterli mi? Bir Saga'nın günler sonra gelen bir telafi adımını işlemesi nasıl modellenir? Finans, Envanter ve Satış modülleri arasında bu tür karmaşık, uzun soluklu ve istisnai durumları yönetecek bir korelasyon (correlation ID) ve durum makinesi (state machine) altyapısı mevcut mu?

---

**Senaryo Başlığı:** Çok Kanallı Satış ve Stok Replikasyon Gecikmesi Tsunamisi
**Zorluk:** 10/10
**Olay:** Çok popüler bir ürün için (örn: iPhone yeni modeli), Next.js web sitesi, mobil uygulama ve 3 farklı pazar yeri (Amazon, Hepsiburada vb.) entegrasyonu üzerinden aynı anda flash sale (ani indirim) başlatılır. Stok 100 adettir. Satışlar başlar başlamaz, tüm kanallardan gelen saniyedeki yüzlerce "stok kontrol" ve "satın al" isteği, merkezi PostgreSQL veritabanına hücum eder. Okuma yükünü azaltmak için kullanılan read replica'lar, yoğun yazma trafiği nedeniyle ana veritabanından 30 saniye kadar geriye düşer (replication lag).
**Beklenen Sorun:** Kitlesel overselling ve sistem çökmesi. Read replica'lar eski veriyi gösterdiği için tüm kanallar "stok var" mesajı gösterir ve yüzlerce sipariş alır. Yazma işlemleri ana veritabanında birikir, `Stoklar` tablosu üzerinde yoğun kilit çekişmesi (lock contention) ve deadlock'lar yaşanır. Bağlantı havuzu (connection pool) tükenir. Sonuç olarak 100 adetlik ürün için 500 adet geçerli sipariş alınır ve sistem genelinde timeout'lar başlar.
**Architect'e Soru:** Bu ölçekte bir okuma/yazma trafiğini yönetmek için merkezi bir ilişkisel veritabanı doğru bir seçim mi? CQRS'in ötesine geçerek, stok gibi kritik ve çekişmeli bir kaynak için "event sourcing" veya CRDT tabanlı bir yaklaşımla "stok düşüm isteği" kuyruğu oluşturmak daha mı mantıklı olurdu? Replikasyon gecikmesini aktif olarak izleyip, gecikme belli bir eşiği aşınca read replica'ları otomatik olarak devreden çıkarıp tüm trafiği ana veritabanına yönlendiren bir altyapımız var mı?

---

**Senaryo Başlığı:** Geleceğe Dönüş: Saat Senkronizasyon Hatası ve Görünmez Siparişler
**Zorluk:** 10/10
**Olay:** Kubernetes cluster'ındaki node'lardan birinin saati, NTP senkronizasyon hatası nedeniyle 2 gün ileri gider. O node üzerinde çalışan bir Stocker.API pod'una gelen bir sipariş, veritabanına 2 gün sonraki bir tarihle kaydedilir. Bu sipariş, normal `WHERE olusturma_tarihi <= NOW()` sorgularıyla listelenemez, raporlarda görünmez. Ancak, bu siparişin ayırdığı stok (stock reservation) veritabanında mevcuttur ve "hayalet" bir şekilde stoğu eksiltir.
**Beklenen Sorun:** Anlaşılması imkansız veri tutarsızlığı ve "zaman yolculuğu" bug'ları. Stok sayımları sürekli eksik çıkar çünkü "görünmez" bir sipariş tarafından rezerve edilmiştir. İki gün sonra, zamanı geldiğinde bu sipariş aniden "yeni sipariş" listelerine düşerek kaosa neden olur. Eğer gelecekteki bir tarihe kurulan bir promosyon varsa, bu sipariş o promosyondan yanlışlıkla yararlanabilir.
**Architect'e Soru:** Dağıtık bir sistemde zamanın tutarlılığını nasıl sağlıyoruz? Node saatlerine güvenmek yerine, tüm cluster için referans alınacak tek bir "zaman sunucusu" (time service) veya veritabanının kendi `NOW()` fonksiyonunu kullanmayı zorunlu kılan bir mimari prensibimiz var mı? Bu tür "gelecekten gelmiş" verileri tespit edip alarm üretecek bir denetim (audit) ve izleme (monitoring) mekanizması nasıl kurulabilir? Bu bozuk veriyi düzeltme süreci nasıl işler?

---

**Senaryo Başlığı:** Kiracı Veri İzolasyonunun Çöküşü (Multi-Tenant Krizi)
**Zorluk:** 10/10
**Olay:** Sistem, yüzlerce şirkete hizmet veren çok-kiracılı (multi-tenant) bir yapıdadır. Performansı artırmak için yazılan yeni bir satış raporu sorgusunda, bir geliştirici EF Core'un Global Query Filter'ını atlayarak (örn: `IgnoreQueryFilters()` kullanarak) veya native bir SQL sorgusu yazarak `tenant_id` filtresini eklemeyi unutur. Bu rapor, "A" şirketinin yöneticisi tarafından çalıştırıldığında, sistemdeki "tüm" şirketlerin satış verilerini toplayıp "A" şirketine sunar.
**Beklenen Sorun:** Felaket düzeyinde veri sızıntısı. Bir kiracı, diğer tüm kiracıların müşteri listelerini, satış rakamlarını, ciro ve karlılık bilgilerini, en çok satan ürünlerini, yani tüm ticari sırlarını görür. Bu durum, yasal davalara, milyonlarca dolarlık cezalara ve şirketin iflasına yol açabilecek bir güvenlik felaketidir.
**Architect'e Soru:** Multi-tenant veri izolasyonunu %100 garanti altına alan mekanizmamız nedir? Sadece EF Core Global Query Filters'a güvenmek yeterli mi? Geliştiricilerin bunu atlatmasını engelleyecek ek katmanlar (örneğin, PostgreSQL'in Row-Level Security - RLS'i) kullanıyor muyuz? Her release öncesi, veri izolasyonunu kıran bir sızıntı olmadığını doğrulayan otomatik penetrasyon testlerimiz veya özel denetim sorgularımız var mı?

---

**Senaryo Başlığı:** Sipariş İptali ve Asenkron Transferin Yarattığı Kara Delik
**Zorluk:** 10/10
**Olay:** Web sitesinden bir müşteri son 1 adet kalan "X" ürününü sipariş eder. Sipariş Onay süreci başlar.
1.  Satış modülü, Envanter modülüne "StokRezerveEt" olayını gönderir.
2.  Envanter modülü, ürünü "Satılabilir"den "Rezerve" durumuna alır.
3.  Lojistik modülü, bu sipariş için ürünü "Merkez Depo"dan "Sevkiyat Noktası"na transfer işlemini başlatır. Transfer emri oluşur ve ürün "Rezerve(Transferde)" durumuna geçer.
4.  Tam bu sırada müşteri siparişi iptal eder.
5.  Satış modülü "SiparişİptalEdildi" olayını yayınlar. Envanter modülü bu olayı duyar ve rezervasyonu iptal edip stoğu "Satılabilir"e döndürmeye çalışır. Ancak ürünün durumu "Rezerve(Transferde)" olduğu için işlemi gerçekleştiremez veya yanlış bir mantıkla sadece rezervasyonu kaldırır.
6.  Transfer işlemi ise devam eder ve ürün fiziksel olarak "Sevkiyat Noktası"na ulaşır. Orada bekleyen bir sipariş olmadığı için "kayıp eşya" durumuna düşer.
**Beklenen Sorun:** Stok, mantıksal bir kara deliğe düşer. Ürün satılabilir stokta değildir, hiçbir siparişe bağlı değildir ve yanlış bir lokasyonda kilitli kalmıştır. Ürünün varlığı sistemde bilinir ama hiçbir iş sürecine dahil edilemez. Bu durum, olay tabanlı mimarideki (event-driven architecture) süreç koordinasyonunun ne kadar karmaşık ve kırılgan olabileceğini gösterir.
**Architect'e Soru:** Bu tür modüller arası, uzun soluklu ve çok adımlı süreçleri yönetmek için hangi orkestrasyon veya koreografi (Saga) pattern'ini kullanıyoruz? Bir sürecin ortasında gelen bir iptal komutu, devam eden diğer süreçleri (transfer gibi) nasıl güvenilir bir şekilde durdurur veya geri alır? Her varlığın (stok kalemi gibi) kendi detaylı durum makinesine (state machine) sahip olması ve sadece belirli durumlarda belirli geçişlere izin vermesi bu sorunu çözer mi?

---

**Senaryo Başlığı:** İade Edilen Ürünün Yanlış Maliyetle Stoğa Girmesi ve Geriye Dönük Finansal Bozulma
**Zorluk:** 10/10
**Olay:** Sistem, envanter maliyetlemesi için FIFO (İlk Giren, İlk Çıkar) metodunu kullanıyor.
1.  Ocak ayında "A" ürünü 10 TL maliyetle alınır.
2.  Şubat ayında aynı "A" ürünü 15 TL maliyetle alınır.
3.  Mart ayında bir müşteri bu ürünü satın alır. Sistem, FIFO gereği 10 TL'lik maliyet partisini stoktan düşer ve Satılan Malın Maliyeti'ne (COGS) 10 TL yazar.
4.  Nisan ayında müşteri ürünü iade eder. Ancak iade sürecindeki bir bug veya mantık hatası nedeniyle, sistem iade edilen ürünü stoğa alırken orijinal maliyeti bulmak yerine, "o anki en son alım maliyetini" yani 15 TL'yi baz alır.
**Beklenen Sorun:** Envanter değerlemesinin ve karlılık raporlarının sessizce ve geriye dönük olarak bozulması. Şirket, 10 TL'ye sattığı bir ürünü 15 TL'ye geri almış olur, bu da 5 TL'lik bir zarardır. Ancak bu zarar, bir gider olarak değil, envanter değerindeki bir artış olarak görünür. Bu hata tekrarlandıkça, şirketin envanter değeri şişerken, gerçek karlılığı düşer. Sorunun kaynağını bulmak için aylar süren denetimler gerekebilir.
**Architect'e Soru:** Bir satış iade edildiğinde, iade edilen ürünün "orijinal satış anındaki maliyetini" %100 güvenilirlikle nasıl tespit ediyoruz? Bu bilgi, `SatisKalemleri` tablosunda saklanıyor mu? FIFO/LIFO gibi katmanlı maliyetlendirme yöntemleri kullanıldığında, iadenin hangi maliyet partisine geri ekleneceğini belirleyen mantık nerede ve ne kadar sağlam bir şekilde çalışıyor? Geriye dönük maliyet düzeltmelerini yapabilecek bir altyapımız var mı?

---

**Senaryo Başlığı:** Özyineli Paket (Recursive Kit) Siparişi ile Sistemin Çökertilmesi
**Zorluk:** 10/10
**Olay:** Satış ekibi, bir kampanya için esnek bir "kendi paketini yap" özelliği sunar. Bir kullanıcı (veya kötü niyetli bir aktör), sistemdeki bir mantık boşluğunu kullanarak özyineli bir paket oluşturur: "Teknoloji Paketi", içeriğinde bir "Aksesuar Paketi" barındırır. "Aksesuar Paketi" ise içeriğinde bir "Teknoloji Paketi" barındırır. Kullanıcı bu paketi sepete ekleyip sipariş verir.
**Beklenen Sorun:** Denial-of-Service (DoS). Sipariş işleme mantığı (Order Processing), paketin içeriğindeki ürünleri stoktan düşmek veya listelemek için özyineli (recursive) bir fonksiyona girer. Bu fonksiyon, A->B->A->B... döngüsü nedeniyle asla sonlanmaz, stack overflow hatasına veya sonsuz döngüye girerek CPU ve belleği tüketir. Sonuçta, siparişi işleyen servis veya tüm API çöker.
**Architect'e Soru:** Ürün, kategori veya paket gibi hiyerarşik ve ilişkisel veri modellerinde döngüsel bağımlılıkları (cyclical dependencies) nasıl engelliyoruz? Bu kontrol, veri girişi sırasında (örn: Next.js arayüzü veya API) mı yapılmalı, yoksa veritabanı seviyesinde (örn: PostgreSQL'de recursive CTE ile bir `CHECK` constraint'i) mi zorunlu kılınmalı? Mevcut veritabanında bu tür bozuk verilerin olup olmadığını tespit eden bir denetim sürecimiz var mı?

---

**Senaryo Başlığı:** Fiyat Değişikliği ve Ödeme Anı Arasındaki Milisaniyelik Yarış
**Zorluk:** 10/10
**Olay:** Bir ürünün fiyatı 1000 TL'dir ve müşteri bu fiyattan ürünü sepetine ekler. Müşteri, ödeme sayfasına gider ve "Ödemeyi Tamamla" butonuna basar. Tam o milisaniyede, bir yönetici aynı ürünün fiyatını 1500 TL olarak günceller. İki işlem de veritabanına aynı anda ulaşır.
1.  **Ödeme İsteği:** `SiparisOlustur` işlemi, sepetin toplam tutarını hesaplamak için ürün fiyatını okur (1000 TL).
2.  **Fiyat Güncelleme:** `UrunFiyatGuncelle` işlemi, fiyatı 1500 TL olarak yazar ve commit eder.
3.  **Ödeme İsteği Devamı:** `SiparisOlustur` işlemi, siparişi ve sipariş kalemlerini veritabanına 1000 TL'lik fiyatla yazar ve müşteriden 1000 TL çeker.
**Beklenen Sorun:** Fiyatlandırma ve finansal tutarlılıkta yarış durumu (race condition). Müşteri 1000 TL öderken, sistemdeki ürünün "güncel" fiyatı 1500 TL'dir. Raporlar, bu satışın hangi fiyattan yapıldığını nasıl yorumlayacak? Eğer `SiparisOlustur` işlemi, fiyatı okuduktan sonra ama yazmadan önce diğeri araya girerse, "sepet tutarı" ile "sipariş kalemleri tutarı" arasında fark oluşabilir mi? Bu durum, faturalama ve muhasebe entegrasyonlarında kaosa neden olur.
**Architect'e Soru:** Bir sipariş için "geçerli fiyat" nedir? Sepete eklendiği andaki fiyat mı, ödeme anındaki fiyat mı? Bu iş kuralını mimaride nasıl netleştirip zorunlu kılıyoruz? Sepete eklenen her ürünün fiyatını o anki değeriyle birlikte `SepetKalemleri` tablosuna mı yazmalıyız? EF Core'un iyimser kilitleme (optimistic locking) mekanizması (örn: RowVersion/xmin) bu tür bir iş mantığı yarışını yakalamak için yeterli midir, yoksa `SELECT FOR UPDATE` gibi daha karamsar bir kilitleme mi gerekir?

---

**Senaryo Başlığı:** Veritabanı Geçiş (Migration) Hatasının Geri Alınması ve Uygulama-Veri Uyumsuzluğu
**Zorluk:** 10/10
**Olay:** Yeni bir satış özelliği için veritabanı şemasına yeni tablolar ve kolonlar ekleyen bir Entity Framework Core migration script'i hazırlanır. Release gecesi, bu script CI/CD pipeline'ı tarafından production veritabanında çalıştırılır. Script, 10 adımdan 9'unu başarıyla tamamlar, ancak son adımda beklenmedik bir data-locking veya permission sorunu nedeniyle hata verir. EF Core'un transaction mekanizması, tüm değişikliği otomatik olarak geri alır (rollback). Ancak, CI/CD pipeline'ı bu hatayı fark etmez (veya yanlış yapılandırılmıştır) ve yeni uygulama kodunu (bu yeni kolonlara/tablolara erişmeye çalışan) sunuculara deploy eder.
**Beklenen Sorun:** Tam sistem kesintisi. Yeni uygulama kodu, veritabanında var olmayan kolonlara veya tablolara erişmeye çalıştığı için her istekte `DbException` veya benzeri hatalar fırlatır. Sistem, hiçbir isteği doğru şekilde işleyemez hale gelir. Sorunun kaynağının "başarısız bir migration'ın geri alınması" olduğu hemen anlaşılamayabilir, bu da kriz anında teşhis süresini uzatır.
**Architect'e Soru:** Veritabanı migration stratejimiz ne kadar dayanıklı? Migration'ların atomik olması bir avantaj gibi görünse de, bu tür bir "all or nothing" yaklaşımı tam kesintiye yol açabilir. Bunun yerine, migration'ları küçük, bağımsız ve geriye dönük uyumlu (backward-compatible) adımlar halinde mi tasarlamalıyız? Uygulamanın eski ve yeni versiyonlarının, veritabanının eski ve yeni şemasıyla bir süre birlikte çalışabilmesini (zero-downtime deployment) sağlayacak bir stratejimiz var mı (örn: feature flag'lerle yeni şemayı kullanan kodları gizlemek)? CI/CD pipeline'ı, migration başarısını nasıl doğruluyor ve başarısızlık durumunda deployment'ı otomatik olarak durduruyor mu?
