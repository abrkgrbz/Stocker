# Satış Modülü Kaos Senaryoları - Seviye 6

Bu belge, veri bütünlüğünün bozulduğu, "yetim" kayıtların (orphan records) oluştuğu ve iş süreçlerinin yarıda kalmasıyla tutarsız durumlara yol açan daha ciddi senaryolara odaklanır.

---

**Senaryo Başlığı:** Kategori Silinmesiyle Ürünlerin Yetim Kalması
**Zorluk:** 6/10
**Olay:** Bir yönetici, içinde hala ürünler bulunan bir ürün kategorisini (örn: "Kışlık Ayakkabılar") siler. Veritabanı seviyesinde `ON DELETE RESTRICT` gibi bir kısıtlama olmadığı için sistem bu işleme izin verir.
**Beklenen Sorun:** "Yetim" ürünler. Bu ürünler, artık bir kategoriye sahip olmadıkları için site haritasında, menülerde veya "kategoriye göre listele" sayfalarında görünmez hale gelir. Doğrudan arama veya link ile erişilebilseler de, site navigasyonundan kaybolurlar. Raporlama ve filtreleme özellikleri de bu ürünler için bozulabilir.
**Architect'e Soru:** Veritabanı şemamızda, bu tür ilişkisel bütünlüğü korumak için Foreign Key kısıtlamalarını (örn: `ON DELETE RESTRICT` veya `ON DELETE SET NULL`) aktif olarak kullanıyor muyuz? Yoksa bu mantık sadece uygulama katmanında mı? Bir kategori silinmeden önce, içinde ürün olup olmadığını kontrol eden bir iş kuralı (business rule) var mı? "Soft delete" (sadece `is_deleted` flag'ini işaretleme) yaklaşımını standart olarak benimsiyor muyuz?

---

**Senaryo Başlığı:** Kullanıcı Adresini Değiştirince Eski Siparişlerin Adresinin de Değişmesi
**Zorluk:** 6/10
**Olay:** Bir müşteri, "Ev Adresi" olarak A adresini kaydeder ve bir sipariş verir. Sipariş bu A adresine gönderilir. Bir ay sonra, müşteri taşınır ve "Ev Adresi"ni B adresi olarak günceller. Ancak siparişler, teslimat adresini kendi üzerine kopyalamak (denormalization) yerine, kullanıcının adres tablosuna bir referans (foreign key) ile bağlıdır.
**Beklenen Sorun:** Geçmişe dönük veri bütünlüğü kaybı. Müşteri, eski siparişinin detaylarına baktığında, sanki o sipariş yeni B adresine gönderilmiş gibi görür. Bu, iade veya fatura işlemleri için yanlış adres bilgisine yol açar ve kafa karışıklığı yaratır.
**Architect'e Soru:** Sipariş oluşturulurken, teslimat adresi ve fatura adresi gibi bilgiler o anki değerleriyle birlikte `Siparisler` tablosuna veya ayrı bir `SiparisAdresleri` tablosuna kopyalanıyor mu? Değişebilecek verilere referans vermek yerine, "sipariş anındaki anlık görüntüsünü" (snapshot) saklama prensibini uyguluyor muyuz?

---

**Senaryo Başlığı:** Başarısız Toplu Ürün İçe Aktarma ve Artık Veriler
**Zorluk:** 6/10
**Olay:** Bir Excel dosyasından 500 ürün sisteme toplu olarak aktarılır. İşlem, her ürün için önce ana ürün kaydını, sonra fiyat bilgisini, sonra da stok bilgisini ayrı tablolara yazar. 300. ürünü işlerken, stok bilgisi formatı hatalı olduğu için işlem çöker.
**Beklenen Sorun:** Kısmen oluşturulmuş, tutarsız ürün verileri. İlk 299 ürün başarıyla oluşturulur. 300. ürünün ise ana kaydı ve fiyatı oluşturulmuş, ancak stok kaydı yoktur. Bu ürün, stoksuz olduğu için satılamaz veya envanter raporlarında anlamsız görünür. Geri kalan 200 ürün ise hiç işlenmemiştir.
**Architect'e Soru:** Toplu veri import işlemleri transaction içerisinde mi çalışıyor? "Hepsi ya da hiçbiri" (all or nothing) prensibini nasıl sağlıyoruz? Uzun süren bir transaction, veritabanında kilitlenmelere neden oluyorsa, işlemi daha küçük parçalara bölüp her bir parçayı kendi transaction'ı içinde işleyen bir "batching" stratejisi mi izlemeliyiz?

---

**Senaryo Başlığı:** Rezerve Edilmiş Ürünün Başkasına Satılması
**Zorluk:** 6/10
**Olay:** Bir müşteri, web sitesi üzerinden bir ürünü "sepete ekler". Sistem, bu ürünü 15 dakikalığına müşteri için "rezerve eder" ve satılabilir stok miktarını bir azaltır. Bu 15 dakika dolmadan, bir mağaza çalışanı, sistemdeki bir bug veya gecikme nedeniyle bu "rezerve" durumunu görmez ve fiziksel olarak rafta duran son ürünü başka bir müşteriye satar.
**Beklenen Sorun:** Overselling. Web müşterisinin sepetindeki ürün için ödeme yapmaya çalıştığında "stok tükendi" hatası alması. Bu durum, müşteri memnuniyetsizliğine ve güven kaybına yol açar. Stok rezervasyon mantığının atomik veya yeterince hızlı çalışmadığını gösterir.
**Architect'e Soru:** Stok rezervasyon mekanizmamız nasıl bir tutarlılık modeline sahip? Güçlü tutarlılık mı (strong consistency) sağlıyor, yoksa nihai tutarlılık (eventual consistency) mı? Rezervasyonlar ayrı bir tabloda mı tutuluyor, yoksa ana stok tablosunda "rezerve_miktar" gibi bir kolonla mı yönetiliyor? Bu iki yaklaşımın performans ve veri bütünlüğü açısından avantaj/dezavantajları nelerdir?

---

**Senaryo Başlığı:** İptal Edilen Siparişin İlişkili Kayıtlarının Silinmemesi
**Zorluk:** 6/10
**Olay:** Bir müşteri siparişini iptal eder. `Siparisler` tablosundaki ilgili kaydın durumu "İptal Edildi" olarak güncellenir. Ancak bu sipariş için `OdemeGirisimleri` veya `StokRezervasyonlari` tablolarında oluşturulmuş olan ilişkili kayıtlar silinmez veya güncellenmez.
**Beklenen Sorun:** Veritabanında "çöp" veri birikmesi. Bu artık kayıtlar, zamanla veritabanını şişirir ve raporlama sorgularında (örn: "başarısız ödeme denemeleri" raporu) iptal edilen siparişlerin de listelenmesine neden olarak yanlış sonuçlar üretebilir.
**Architect'e Soru:** Bir siparişin iptali gibi işlemler, bir Aggregate (DDD) kökü üzerinden mi yönetiliyor? Sipariş Aggregate'ı, iptal edildiğinde kendi altındaki tüm ilişkili varlıkların (Value Objects veya Child Entities) durumunu tutarlı bir şekilde yönetmekten sorumlu mu? Bu tür temizlik işlemleri için bir transaction veya Saga pattern'i kullanılıyor mu?

---

**Senaryo Başlığı:** Kullanıcı Silindiğinde Anonimleşmeyen Yorumlar
**Zorluk:** 6/10
**Olay:** Bir kullanıcı, GDPR veya benzeri bir hakla hesabının silinmesini talep eder. Kullanıcının kaydı (`Kullanicilar` tablosu) silinir. Ancak, bu kullanıcının daha önce ürünlere yaptığı yorumlar (`UrunYorumlari` tablosu), `kullanici_id` alanı yüzünden yetim kalır ve yorumu yapanın adı hala görünür durumdadır.
**Beklenen Sorun:** Veri anonimleştirme hatası ve yasal uyumsuzluk. Kullanıcının kişisel verileri (bu durumda adı), talebine rağmen sistemden tamamen kaldırılmamış olur. Yetim kalan `kullanici_id`, veri bütünlüğünü de bozar.
**Architect'e Soru:** Kullanıcı silme süreci nasıl işliyor? Bu süreç, kullanıcıyla ilişkili tüm içeriği (yorumlar, siparişler, adresler vb.) gezip bunları ya silen ya da anonimleştiren (örn: kullanıcı adını "Eski Kullanıcı" olarak güncelleyen) bir orkestrasyon içeriyor mu? Bu tür dağıtık bir silme işlemi için bir background job mu kullanılıyor?

---

**Senaryo Başlığı:** Varyant Stoğunun Ana Ürün Stoğu ile Tutarsızlığı
**Zorluk:** 6/10
**Olay:** Bir "T-Shirt" ürünü, "Kırmızı-M", "Kırmızı-L" gibi varyantlara sahiptir. Her varyantın kendi stoğu vardır. Ancak, sistemde ayrıca bir "ana ürün" olan T-Shirt için de bir stok alanı bulunmaktadır ve bu alan yanlışlıkla güncellenmeye açıktır. Bir entegrasyon, varyant stoklarını güncellemek yerine yanlışlıkla ana ürün stoğunu 500 olarak ayarlar.
**Beklenen Sorun:** Raporlamada ve arayüzde kafa karışıklığı. Satış ekranı varyant stoklarını mı, yoksa ana ürün stoğunu mu göstermeli? Toplam stok raporu, varyantların toplamını mı, yoksa ana ürün stoğunu mu baz almalı? Varyantı olan bir ürünün kendi başına stoğu olması mantıksal bir hatadır.
**Architect'e Soru:** Varyantlı ürünlerin mimarisi nasıl olmalı? Varyantı olan bir ürünün (parent product) kendi stoğu olmamalı, stoğu sadece satılabilir nihai varyantlarda (child product/SKU) tutulmalı. Bu kuralı kod ve veritabanı şemasıyla nasıl zorunlu hale getirebiliriz? (örn: trigger, check constraint veya domain logic)

---

**Senaryo Başlığı:** "En Çok Satanlar" Listesinin Güncellenmemesi
**Zorluk:** 6/10
**Olay:** "En Çok Satanlar" listesi, performansı artırmak için her gece çalışan bir batch job tarafından hesaplanıp ayrı bir tabloya veya cache'e yazılmaktadır. Ancak bu job, bir haftadır sessizce başarısız olmaktadır. Satışlar devam etse de, ana sayfada gösterilen "En Çok Satanlar" listesi bir haftadır aynıdır.
**Beklenen Sorun:** Pazarlama ve satış stratejilerinin yanlış veriye dayanması. Yeni ve popüler olan ürünler bu listede yer almazken, eski popülerliğini yitirmiş ürünler hala "en çok satan" olarak görünür. Bu, dinamik bir site yerine statik ve güncel olmayan bir site imajı çizer.
**Architect'e Soru:** Periyodik olarak çalışan ve ön hesaplama (pre-computation) yapan tüm batch job'ların sağlık durumunu, son başarılı çalışma zamanını ve ürettiği verinin güncelliğini nasıl izliyoruz? Eğer bir job başarısız olursa, bu durumu ilgili ekiplere bildiren bir alarm (alerting) sistemimiz var mı?

---

**Senaryo Başlığı:** Hatalı Para Birimiyle Kaydedilen Sipariş
**Zorluk:** 6/10
**Olay:** Frontend'deki bir bug nedeniyle, kullanıcının sepeti USD olarak hesaplanır (örn: 100 USD), ancak backend'e gönderilen `SiparisOlustur` komutunda para birimi alanı `null` veya varsayılan olarak "TL" gider. Backend, bu tutarsızlığı fark etmez ve `Tutar: 100`, `ParaBirimi: "TL"` olarak bir sipariş kaydeder.
**Beklenen Sorun:** Ciddi finansal tutarsızlık. Müşteriden 100 USD (yaklaşık 3000 TL) çekilirken, sisteme 100 TL'lik bir sipariş olarak kaydedilir. Bu, faturalandırma, muhasebe ve raporlama süreçlerinde büyük bir kaosa yol açar.
**Architect'e Soru:** Sepet toplamı gibi kritik finansal veriler, backend'e sadece bir sayı olarak mı, yoksa tutar ve para birimini birlikte içeren bir "Money" value object'i olarak mı iletiliyor? Backend, bir siparişi kaydetmeden önce, ödeme ağ geçidinden çekilen tutar ve para birimi ile siparişin kendi içindeki tutar ve para biriminin eşleştiğini doğruluyor mu?

---

**Senaryo Başlığı:** Faturası Kesilmiş Siparişin Değiştirilebilmesi
**Zorluk:** 6/10
**Olay:** Bir siparişin faturası kesilmiş ve resmi olarak muhasebe sistemine kaydedilmiştir. Siparişin durumu "Tamamlandı"dır. Ancak, müşteri hizmetleri arayüzündeki bir yetki veya mantık hatası nedeniyle, bir çalışan bu tamamlanmış siparişin içine girip bir ürünü siler veya miktarını değiştirir.
**Beklenen Sorun:** Muhasebe ve envanter arasında geri döndürülemez bir tutarsızlık. Resmi olarak kesilmiş bir faturanın içeriği ile sistemdeki siparişin içeriği artık farklıdır. Bu, vergi denetimlerinde veya ay sonu mutabakatlarında ciddi sorunlara yol açar.
**Architect'e Soru:** Siparişin yaşam döngüsünde (lifecycle), "faturalandırıldı" veya "tamamlandı" gibi belirli durumlara ulaştıktan sonra siparişin değiştirilemez (immutable) hale gelmesini nasıl sağlıyoruz? Bu kural, sadece arayüzde butonları gizleyerek mi, yoksa Domain katmanında, sipariş nesnesinin kendisi tarafından mı zorunlu kılınıyor? (örn: `siparis.UrunEkle()` metodu, durum "Tamamlandı" ise exception fırlatır).
