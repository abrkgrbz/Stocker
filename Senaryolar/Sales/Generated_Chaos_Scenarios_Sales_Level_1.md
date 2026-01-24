# Satış Modülü Kaos Senaryoları - Seviye 1

Bu belge, Satış modülünde kullanıcı deneyimini olumsuz etkileyen ancak sistemsel bir çöküşe veya veri kaybına neden olmayan düşük seviyeli (görsel veya temel işlevsellik) sorunları içerir.

---

**Senaryo Başlığı:** Yanlış Para Birimi Sembolü
**Zorluk:** 1/10
**Olay:** Kullanıcı, site dilini Türkçe'den İngilizce'ye çevirir. Fiyatlar doğru bir şekilde Dolar'a çevrilir (örn: 3000 TL -> 100 USD), ancak fiyatların yanında hala "TL" sembolü görünür.
**Beklenen Sorun:** Kullanıcıda kafa karışıklığı. Müşteri, fiyatın 100 TL mi yoksa 100 USD mi olduğundan emin olamaz, bu da sepeti terk etme olasılığını artırır. Finansal bir hata oluşmaz, sadece görsel bir tutarsızlıktır.
**Architect'e Soru:** Frontend (Next.js) ve backend (.NET) arasında lokalizasyon ve para birimi formatlama sorumlulukları nasıl ayrılmıştır? Para birimi sembolü, sayısal değerden ayrı bir alan olarak mı geliyor, yoksa backend'in sunduğu formatlanmış string'e mi güveniyoruz?

---

**Senaryo Başlığı:** Hatalı Hizalanmış "İndirim" Rozeti
**Zorluk:** 1/10
**Olay:** İndirime giren bir ürünün ürün kartında gösterilen "%20 İndirim" rozeti, CSS hatası nedeniyle ürün görselinin üzerine kayar ve ürünün görünmesini engeller.
**Beklenen Sorun:** Kötü kullanıcı deneyimi (UX). Kullanıcılar ürünü net göremez ve profesyonel olmayan bir imaj oluşur. Satışları doğrudan engellemese de site kalitesine olan güveni azaltır.
**Architect'e Soru:** Component bazlı testlerimizde görsel regresyon (visual regression) testleri yapıyor muyuz? Tasarım sistemimiz (design system), bu tür basit CSS hatalarını bileşen seviyesinde engelleyecek kadar katı kurallara sahip mi?

---

**Senaryo Başlığı:** "Sepete Ekle" Butonunda Gecikme
**Zorluk:** 1/10
**Olay:** Kullanıcı "Sepete Ekle" butonuna tıklar. Butonun "Eklendi" durumuna geçmesi veya sepet ikonundaki ürün sayısının artması 3-4 saniye sürer. Herhangi bir hata oluşmaz, sadece bir gecikme yaşanır.
**Beklenen Sorun:** Kullanıcının sabırsızlanıp butona tekrar tekrar basması (bu durum daha üst seviye sorunlara yol açabilir). Kullanıcı, işlemin başarılı olup olmadığını anlayamaz.
**Architect'e Soru:** Frontend'de "optimistic UI updates" (sunucudan yanıt beklemeden arayüzü güncelleme) stratejisi kullanıyor muyuz? Sepete ekleme gibi işlemler için bu yaklaşım uygun mudur?

---

**Senaryo Başlığı:** Ürün Görseli Yüklenemiyor
**Zorluk:** 1/10
**Olay:** Bir ürünün görsel dosyası, CDN'den silinmiş veya yolu yanlış yazılmıştır. Ürün sayfasında görselin yerinde bozuk bir resim ikonu (broken image icon) çıkar.
**Beklenen Sorun:** Müşteri ürünü göremediği için satın alma olasılığı düşer. Özellikle görselin önemli olduğu (kıyafet, mobilya vb.) ürünlerde satış kaybına neden olabilir.
**Architect'e Soru:** Varlık (asset) yönetimi sürecimiz nasıl işliyor? Sistemde kaydı olan bir ürünün görselinin gerçekten var olduğunu doğrulayan periyodik bir denetim (health check) var mı? Yüklenemeyen görseller için varsayılan bir "görsel yok" (placeholder) resmi gösteriyor muyuz?

---

**Senaryo Başlığı:** Fiyata Göre Sıralama Yanlış Çalışıyor
**Zorluk:** 1/10
**Olay:** Ürün listeleme sayfasında kullanıcı "Fiyata Göre: Yüksekten Düşüğe" sıralama seçeneğini seçer. Liste kabaca sıralanır ancak bazı ürünler yanlış yerdedir (örn: 100 TL'lik ürün 500 TL'lik üründen önce gelir).
**Beklenen Sorun:** Kullanıcının istediği ürünleri bulamaması ve arama/sıralama özelliğine olan güvenin kaybolması.
**Architect'e Soru:** Sıralama mantığı API tarafında mı, yoksa frontend'de mi yapılıyor? Farklı para birimleri veya indirimli fiyatlar üzerinden sıralama yaparken yaşanan bir mantık hatası olabilir mi? Sorgularımız `IQueryable` üzerinden dinamik olarak mı oluşturuluyor?

---

**Senaryo Başlığı:** Arama Çubuğu Özel Karakterleri Yoksayıyor
**Zorluk:** 1/10
**Olay:** Kullanıcı, adı "T-Shirt & Pantolon" olan bir ürünü aramak için arama çubuğuna "&" karakterini yazar. Arama sonuçları alakasızdır veya hiç sonuç çıkmaz.
**Beklenen Sorun:** Kullanıcı aradığı ürünü bulamaz. Özellikle model numaraları veya özel karakterler içeren ürün adlarında (örn: "Model X-123/B") bu durum büyük bir soruna yol açar.
**Architect'e Soru:** Arama altyapımızda (PostgreSQL full-text search, Elasticsearch vb.) karakter normalizasyonu ve "sanitization" nasıl yapılıyor? Hangi karakterlerin aranabilir, hangilerinin yoksayılabilir olduğuna dair net bir kural setimiz var mı?

---

**Senaryo Başlığı:** "Kullanım Koşulları" Linki Kırık
**Zorluk:** 1/10
**Olay:** Ödeme sayfasındaki "Kullanım koşullarını okudum ve kabul ediyorum" metnindeki link, 404 Not Found sayfasına yönlenir.
**Beklenen Sorun:** Yasal olarak zorunlu olan bir metne erişilememesi. Bazı dikkatli kullanıcılar, koşulları okuyamadan ilerlemek istemeyebilir. Şirket için küçük bir yasal risk oluşturur.
**Architect'e Soru:** Statik sayfaların ve linklerin (hakkımızda, gizlilik politikası vb.) geçerliliğini kontrol eden E2E (end-to-end) testlerimiz var mı? Bu linkler CMS'den mi geliyor, yoksa kod içinde mi sabit (hardcoded)?

---

**Senaryo Başlığı:** Miktar Alanı Negatif Değer Kabul Ediyor
**Zorluk:** 1/10
**Olay:** Kullanıcı, sepetindeki bir ürünün miktarını manuel olarak "-5" yapabilir. "Siparişi Tamamla" butonuna basıldığında ise backend, "Miktar negatif olamaz" şeklinde bir hata döner.
**Beklenen Sorun:** Kafa karıştırıcı ve zayıf bir kullanıcı deneyimi. Frontend, en başından bu geçersiz girişe izin vermemelidir.
**Architect'e Soru:** Frontend ve backend arasında validasyon kuralları nasıl paylaşılıyor? Backend'deki validasyon kurallarını (örn: FluentValidation)
otomatik olarak frontend'e (örn: Zod, Yup) taşıyan bir mekanizmamız var mı?

---

**Senaryo Başlığı:** Tarayıcı Sekme Başlığı Güncellenmiyor
**Zorluk:** 1/10
**Olay:** Kullanıcı, Next.js (Single Page Application) üzerinde ana sayfadan bir ürün detay sayfasına, oradan da başka bir kategoriye geçer. Ancak tarayıcı sekmesinde hala sitenin ana başlığı ("Stocker") yazar, sayfanın içeriğine göre (örn: "X Ürünü | Stocker") güncellenmez.
**Beklenen Sorun:** SEO için küçük bir negatif etki. Kullanıcının tarayıcı geçmişinde veya birden çok sekme açıkken aradığı sayfayı bulmasını zorlaştırır.
**Architect'e Soru:** Sayfa başlık yönetimi için standart bir kütüphane (örn: `next/head`, `react-helmet`) kullanıyor muyuz? Bu sorumluluk hangi component'e ait?

---

**Senaryo Başlığı:** Tahmini Teslimat Tarihi Geçmişi Gösteriyor
**Zorluk:** 1/10
**Olay:** Ürün detay sayfasında, "Tahmini teslimat: 26 Ocak 2026" yazması gerekirken, bir bug nedeniyle "Tahmini teslimat: 23 Ocak 2026" (dün) yazar.
**Beklenen Sorun:** Müşteride güvensizlik ve kafa karışıklığı. Sistemin güncel olmadığı veya hatalı çalıştığı izlenimi verir.
**Architect'e Soru:** Tarih ve saat işlemleri için standart bir kütüphane (örn: `date-fns`, `day.js`) ve zaman dilimi (timezone) yönetimi stratejimiz var mı? Bu hesaplama, kullanıcının yerel saatine göre mi, yoksa sunucu saatine göre mi yapılıyor? Bu bir cache problemi olabilir mi?
