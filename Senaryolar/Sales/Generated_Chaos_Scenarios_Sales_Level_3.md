# Satış Modülü Kaos Senaryoları - Seviye 3

Bu belge, kullanıcıların geçersiz veya beklenmedik girdileriyle tetiklenen, çift kayıt (idempotency) sorunlarına ve temel güvenlik zafiyetlerine yol açabilen senaryoları içerir.

---

**Senaryo Başlığı:** "Siparişi Onayla" Butonuna Çift Tıklama ile Mükerrer Sipariş
**Zorluk:** 3/10
**Olay:** Kullanıcı, ödeme sayfasında "Siparişi Onayla" butonuna ağ gecikmesi nedeniyle iki veya üç kez üst üste tıklar. Buton, ilk tıklamadan sonra "disabled" (pasif) duruma geçmez.
**Beklenen Sorun:** Aynı sepet içeriği için birden fazla siparişin oluşturulması ve müşterinin kredi kartından birden fazla çekim yapılması. Bu durum, hem müşteri için büyük bir sorun yaratır hem de operasyonel olarak (sipariş iptalleri, iadeler) yük oluşturur.
**Architect'e Soru:** Frontend'de, form gönderim butonlarını ilk tıklamadan sonra hemen pasif hale getiren bir standartımız var mı? Backend'de, bu tür mükerrer istekleri önlemek için idempotency key (tekillik anahtarı) mekanizması kullanıyor muyuz? Bu anahtar, sepet ID'si veya frontend'de oluşturulan bir GUID olabilir mi?

---

**Senaryo Başlığı:** Adres Satırına SQL Injection Denemesi Yazma
**Zorluk:** 3/10
**Olay:** Bir kullanıcı, adresini girerken adres satırına `' OR 1=1; --` gibi basit bir SQL injection metni yazar. Sistem, siparişi kabul etmez ve "Beklenmedik bir hata oluştu" gibi genel bir hata mesajı gösterir.
**Beklenen Sorun:** Zayıf girdi temizleme (input sanitization) pratiği. Sistem, SQL injection'a karşı savunmasız olmasa bile (EF Core'un parametreli sorguları sayesinde), bu tür girdileri en başta reddetmeli ve kullanıcıya daha anlamlı bir hata ("Adres geçersiz karakterler içeremez") göstermelidir. Genel hata mesajı, potansiyel bir zafiyetin ipucunu verebilir.
**Architect'e Soru:** Tüm kullanıcı girdilerini, Application Service katmanında veya bir middleware'de potansiyel olarak tehlikeli karakterlere karşı kontrol eden merkezi bir mekanizmamız var mı? Hangi karakter setine izin verip vermediğimizi tanımlayan bir whitelist/blacklist yaklaşımımız mevcut mu?

---

**Senaryo Başlığı:** Miktar Alanına Çok Büyük Bir Sayı Girme
**Zorluk:** 3/10
**Olay:** Kullanıcı, sepetindeki bir ürünün miktarını `99999999999999999` gibi, programlama dilinin integer tipinin (örn: `Int32`) alabileceğinden daha büyük bir sayı olarak girer.
**Beklenen Sorun:** Backend'de bir `OverflowException` veya benzeri bir "unhandled exception" (işlenmemiş istisna) oluşması. Bu durum, kullanıcıya 500 Internal Server Error sayfası göstermekle sonuçlanır ve sistemin çökebileceği izlenimi verir.
**Architect'e Soru:** DTO (Data Transfer Object) modellerimizde validasyon için sadece iş kurallarını mı (örn: "Miktar 0'dan büyük olmalı") kontrol ediyoruz, yoksa veri tiplerinin sınır değerlerini (min/max value) de kontrol ediyor muyuz? FluentValidation gibi kütüphanelerle bu tür aralık kontrollerini kolayca yapabilir miyiz?

---

**Senaryo Başlığı:** İndirim Kuponu Alanına Aşırı Uzun Metin Yapıştırma
**Zorluk:** 3/10
**Olay:** Kullanıcı, kupon kodu alanına 10.000 karakterlik anlamsız bir metin yapıştırır ve "Uygula" butonuna basar.
**Beklenen Sorun:** Eğer backend'de bu alanın maksimum uzunluğu kontrol edilmiyorsa, veritabanına yazmaya çalışırken bir `DbUpdateException` (veri çok uzun) hatası alınabilir. Daha kötüsü, bu uzun metin log'lara yazılırsa, log yönetim sisteminde (örn: Elastic, Splunk) sorunlara neden olabilir veya log dosyasını şişirebilir.
**Architect'e Soru:** Veritabanı şemasındaki `string` alanlarının uzunluk kısıtlamaları (`MaxLength`), DTO'larımızda ve validasyon kurallarımızda tutarlı bir şekilde yansıtılıyor mu? Bu tutarlılığı otomatik olarak sağlayacak bir mekanizmamız var mı?

---

**Senaryo Başlığı:** Tarayıcı Geri Butonu ile Sipariş Durumunu Bozma
**Zorluk:** 3/10
**Olay:** Kullanıcı ödemeyi başarıyla tamamlar ve "Siparişiniz Alındı" sayfasını görür. Daha sonra tarayıcının geri butonuna basarak ödeme formunun olduğu sayfaya geri döner. Sayfa, sanki hiç ödeme yapılmamış gibi yeniden yüklenir. Kullanıcı tekrar "Ödemeyi Tamamla"ya basabilir.
**Beklenen Sorun:** Kullanıcıda kafa karışıklığı. Zaten tamamlanmış bir siparişi tekrar oluşturmaya çalışabilir. Bu durum, idempotency mekanizması varsa engellenir, ancak yoksa mükerrer siparişe yol açabilir.
**Architect'e Soru:** Kritik iş akışlarında (sipariş, ödeme vb.) "tarayıcı geri butonu" davranışını nasıl yönetiyoruz? Ödeme tamamlandıktan sonra, ödeme sayfasına tekrar erişimi engelleyen veya "Siparişiniz zaten tamamlandı" mesajı gösteren bir sunucu tarafı kontrolü var mı?

---

**Senaryo Başlığı:** URL Üzerinden Geçersiz Sayfa Numarası Verme
**Zorluk:** 3/10
**Olay:** Kullanıcı, ürün listeleme sayfasının URL'ini manuel olarak değiştirerek `?page=-5` veya `?page=abc` gibi geçersiz sayfa numaraları girer.
**Beklenen Sorun:** Uygulamanın 500 Internal Server Error ile çökmesi. Backend, sayfa numarasını bir integer'a çevirmeye çalışırken `FormatException` veya `ArgumentOutOfRangeException` gibi bir hata fırlatabilir.
**Architect'e Soru:** API endpoint'lerimizin aldığı tüm parametreler (query string, route, header) için katı tür ve aralık kontrolü yapıyor muyuz? .NET'in model binding mekanizması bu tür hataları varsayılan olarak nasıl ele alıyor ve biz bu davranışları nasıl özelleştirebiliriz?

---

**Senaryo Başlığı:** Kullanıcı Adı Olarak HTML Kodu Girmek
**Zorluk:** 3/10
**Olay:** Kullanıcı, kayıt olurken adını `<b>Admin</b>` olarak girer. Daha sonra, "Hoş geldiniz, <b>Admin</b>" gibi bir karşılama mesajının olduğu bir sayfaya gittiğinde, adı kalın (bold) olarak görünür.
**Beklenen Sorun:** Temel bir Cross-Site Scripting (XSS) zafiyeti. Bu örnek zararsız olsa da, `<script>alert('XSS')</script>` gibi bir kodun çalıştırılmasına zemin hazırlar. Bu, kullanıcı oturum bilgilerinin çalınmasına kadar gidebilir.
**Architect'e Soru:** Kullanıcıdan gelen ve UI'da gösterilen tüm verileri encode (HTML encoding) eden standart bir mekanizmamız var mı? React gibi modern frontend framework'leri varsayılan olarak bu korumayı sağlasa da (`dangerouslySetInnerHTML` hariç), bu korumanın hiçbir yerde atlatılmadığından nasıl emin olabiliriz?

---

**Senaryo Başlığı:** Gizli Bir Ürünü URL Tahminiyle Görüntüleme
**Zorluk:** 3/10
**Olay:** Yönetici panelinden "yayında değil" olarak işaretlenmiş veya gelecekteki bir tarihte yayınlanacak olan bir ürünün ID'si "123"tür. Bir kullanıcı, URL'i tahmin ederek `/products/123` adresine doğrudan gider.
**Beklenen Sorun:** Yetkisiz bilgi erişimi. Kullanıcı, normalde görmemesi gereken (belki de lansmanı yapılmamış) bir ürünün detaylarını, fiyatını ve görsellerini görebilir.
**Architect'e Soru:** API'miz, bir ürünün detayını döndürürken sadece ID'ye göre mi sorgulama yapıyor, yoksa `WHERE id = @id AND yayin_durumu = 'Yayinda'` gibi ek güvenlik koşullarını her zaman içeriyor mu? Bu tür iş kuralları, EF Core'un Global Query Filters mekanizması ile merkezi olarak uygulanabilir mi?

---

**Senaryo Başlığı:** E-posta Alanına Geçersiz Formatlı Adres Yazma
**Zorluk:** 3/10
**Olay:** Kullanıcı, e-posta adresini `kullanici@site` ('.com' eksik) veya `kullanici@.com` (domain adı eksik) gibi geçersiz bir formatla yazar. Frontend validasyonu bunu atlarsa veya yoksa, backend'in bunu kabul edip etmediği test edilir.
**Beklenen Sorun:** İletişim kurulamayan kullanıcı hesapları. Kullanıcıya "sipariş onayı" veya "şifre sıfırlama" gibi önemli e-postalar asla ulaşmaz. Veritabanında bozuk veri birikir.
**Architect'e Soru:** E-posta adresi validasyonu için sadece basit bir regex mi kullanıyoruz, yoksa daha kapsamlı ve standartlara uygun bir kütüphane mi? Bu validasyon hem frontend (kullanıcıya anlık geri bildirim için) hem de backend'de (güvenlik için) tutarlı bir şekilde uygulanıyor mu?

---

**Senaryo Başlığı:** İki Farklı İndirim Kuponunu Aynı Anda Uygulamaya Çalışma
**Zorluk:** 3/10
**Olay:** Sistem normalde tek kupona izin verir. Kullanıcı bir kupon uygular. Sonra, tarayıcının geliştirici araçlarını kullanarak ikinci bir kupon uygulama isteğini manuel olarak gönderir.
**Beklenen Sorun:** Sistemin nasıl tepki vereceği belirsizdir. Son girilen kupon, ilkinin yerine mi geçer? Her ikisini de uygulayıp indirimi birleştirir mi? Yoksa bir hata mı verir? Belirsiz davranış, istenmeyen indirimlere yol açabilir.
**Architect'e Soru:** Sepet ve promosyonlarla ilgili iş mantığı, state'ini (durumunu) nasıl yönetiyor? Bir sepete "kupon uygulandı" durumu eklendiğinde, yeni bir kupon uygulama işlemini en baştan reddeden bir kural (guard clause) var mı?
