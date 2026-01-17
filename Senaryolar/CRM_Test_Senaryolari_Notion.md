# CRM Test Senaryolari - Notion Import

Bu dosyayi Notion'a kopyala-yapistir ile aktarabilirsiniz.
Her tablo ayri bir Notion database olarak import edilebilir.

---

## Nasil Import Edilir?

1. Asagidaki tablolari secin (Ctrl+A ile tum tabloyu sec)
2. Notion'da yeni sayfa olusturun
3. Yapistirun (Ctrl+V)
4. Notion otomatik olarak tablo olusturacak
5. Tabloyu database'e donusturmek icin "Turn into database" secin

---

## 1. MUSTERI YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-1.1.1 | Olusturma | Musteriler | Kritik | Basarili | Yeni kurumsal musteri olusturma | 1. Yeni Musteri butonuna tikla 2. Kurumsal secili oldugunu dogrula 3. Gerekli alanlari doldur (Firma: ABC Teknoloji, E-posta: info@abc.com, Telefon: +90 212 555 0001) 4. Kaydet | Musteri basariyla olusturulur ve listede gorunur | Basariyla Gerceklesti | - |
| TEST-1.1.2 | Validasyon | Musteriler | Yuksek | Basarili | Bos form validasyonu | 1. Yeni musteri formunu ac 2. Hicbir alan doldurmadan Kaydet tikla | Zorunlu alan uyarilari gorunur, form submit edilmez | Basariyla Gerceklesti | - |
| TEST-1.1.3 | Validasyon | Musteriler | Yuksek | Basarili | E-posta format validasyonu | 1. Yeni musteri formu ac 2. Gecersiz e-posta gir: "abctest" veya "abc@" veya "abc@test" 3. Kaydet | Gecerli bir e-posta adresi girin uyarisi gorunur | Basariyla Gerceklesti | - |
| TEST-1.1.4 | Validasyon | Musteriler | Orta | Basarili | Vergi numarasi validasyonu | 1. Kurumsal musteri formu ac 2. Gecersiz vergi no gir: "12345" veya "123456789012" veya "ABCDEFGHIJ" | 10-11 haneli vergi numarasi uyarisi gorunur | Basariyla Gerceklesti | - |
| TEST-1.1.5 | Validasyon | Musteriler | Orta | Basarili | MERSIS numarasi validasyonu | 1. Kurumsal musteri formu ac 2. MERSIS alanina 16 haneden farkli deger gir | MERSIS No 16 haneli olmalidir uyarisi gorunur | Basariyla Gerceklesti | - |
| TEST-1.2.1 | Validasyon | Musteriler | Yuksek | Kismi | TC Kimlik validasyonu | 1. Bireysel musteri sec 2. TC Kimlik alanina gecersiz degerler gir: "0123456789" veya "1234567890" | TC Kimlik 11 haneli ve 0 ile baslamaz uyarisi | 12312321313 girildi ama gecersiz demedi | BUG-001 |
| TEST-1.3.1 | Duzenleme | Musteriler | Kritik | Basarili | Musteri bilgilerini guncelleme | 1. Listeden musteri sec 2. Duzenle tikla 3. Firma adini ve e-postayi degistir 4. Kaydet | Degisiklikler kaydedilir ve guncelleme mesaji gorunur | Basariyla Gerceklesti | - |
| TEST-1.4.1 | KVKK | Musteriler | Yuksek | Kismi | KVKK checkbox kaydi | 1. Yeni musteri formu ac 2. KVKK bolumunde 3 checkboxi isaretle 3. Kaydet 4. Musteriyi tekrar ac | Checkboxlar isaretli gozukmeli | Checkboxlar isaretli gozukmuyor | BUG-002 |
| TEST-1.5.1 | Detay | Musteriler | Orta | Bekliyor | Musteri detay sayfasi | 1. Listeden bir musteriye tikla 2. Detay sayfasini incele | Tum bilgiler dogru goruntulenir | - | - |
| TEST-1.5.2 | Silme | Musteriler | Yuksek | Bekliyor | Musteri silme islemi | 1. Musteri detayinda Sil tikla 2. Onay ver | Musteri silinir ve listeden kalkar | - | - |

---

## 2. LEAD YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-2.1.1 | Olusturma | Leadler | Kritik | Basarili | Yeni lead olusturma | 1. Yeni Lead tikla 2. Ad: Ahmet, Soyad: Yilmaz, E-posta: ahmet@test.com, Kaynak: Web, Puan: 60 gir 3. Kaydet | Lead olusturulur ve listede gorunur | Puan 0 gozukmekte | BUG-003 |
| TEST-2.1.2 | Validasyon | Leadler | Yuksek | Basarili | Zorunlu alan validasyonu | 1. Sadece Ad gir 2. Kaydet | Soyad ve e-posta zorunludur uyarisi | E-posta zorunludur verdi | - |
| TEST-2.1.3 | Rating | Leadler | Orta | Kismi | Rating butonlari testi | 1. Lead formunda Soguk/Ilik/Sicak butonlarini test et | Aktif buton beyaz arka plan alir | Degisiklik olmadi | BUG-004 |
| TEST-2.1.4 | Validasyon | Leadler | Orta | Basarili | Puan araligi validasyonu | 1. Puan alanina -10, 0, 50, 100, 150 gir | 0-100 arasi kabul, digerleri red | -10 ve 150 reddedildi | - |
| TEST-2.2.1 | Lokasyon | Leadler | Orta | Basarili | Kademeli lokasyon secimi | 1. Ulke: Turkiye sec 2. Sehir: Istanbul sec 3. Ilce: Kadikoy sec | Her secimde alt liste yuklenir | Basariyla Gerceklesti | - |
| TEST-2.3.1 | Detay | Leadler | Orta | Bekliyor | Lead detay sayfasi | 1. Listeden leade tikla 2. Detay incele | Tum bilgiler gorunur | - | - |
| TEST-2.3.2 | Donusturme | Leadler | Yuksek | Bekliyor | Lead-Musteri donusumu | 1. Lead detayda Musteriye Donustur tikla 2. Formu doldur 3. Kaydet | Musteri olusur, lead durumu guncellenir | - | - |

---

## 3. FIRSAT YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-3.1.1 | Olusturma | Firsatlar | Kritik | Kismi | Yeni firsat olusturma | 1. Yeni Firsat tikla 2. Baslik: ERP Projesi, Musteri: ABC, Tutar: 150000, Olasilik: %70 gir 3. Kaydet | Firsat olusturulur | Tabloda Lead gozukmuyor | BUG-005 |
| TEST-3.1.2 | Validasyon | Firsatlar | Yuksek | Basarisiz | Musteri zorunlulugu | 1. Musteri secmeden form doldur 2. Kaydet | Musteri secimi zorunludur uyarisi | Test edilmedi | - |
| TEST-3.1.3 | Validasyon | Firsatlar | Yuksek | Basarisiz | Tarih validasyonu | 1. Tahmini kapanis olarak gecmis tarih sec | Gecmis tarihler secilemez | Test edilmedi | - |
| TEST-3.1.4 | Pipeline | Firsatlar | Yuksek | Basarisiz | Pipeline-Asama iliskisi | 1. Pipeline secmeden asama secmeye calis 2. Pipeline sec 3. Farkli pipeline sec | Pipeline secilmeden asama secilemez | Test edilmedi | - |
| TEST-3.1.5 | Durum | Firsatlar | Orta | Bekliyor | Kayip durumu | 1. Durumu Kaybedildi yap 2. Kayip nedeni alanini kontrol et | Kayip Nedeni alani aktif olur | - | - |
| TEST-3.2.1 | Finansal | Firsatlar | Orta | Bekliyor | Tutar formatlama | 1. Tutar: 1000000 gir 2. Alandan cik | 1.000.000 seklinde formatlanir | - | - |
| TEST-3.2.2 | Validasyon | Firsatlar | Orta | Bekliyor | Olasilik araligi | 1. Olasilik alanina -5, 0, 50, 100, 120 gir | 0-100 arasi kabul edilir | - | - |

---

## 4. KAMPANYA YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-4.1.1 | Olusturma | Kampanyalar | Kritik | Basarili | Yeni kampanya olusturma | 1. Kampanya Adi: Yaz Kampanyasi 2025, Tip: E-posta, Butce: 50000, Gelir: 150000, Hedef: 500 gir 2. Kaydet | Kampanya olusur, ROI: %200, Lead/Maliyet: 100 TL | Liste yenileme sorunu | BUG-006 |
| TEST-4.1.2 | Metrik | Kampanyalar | Orta | Basarili | Zarar hesaplama | 1. Butce: 100000, Gelir: 80000, Hedef: 200 gir | Kar: -20000 (kirmizi), ROI: %-20 | Basariyla Gerceklesti | - |
| TEST-4.1.3 | Gerceklesen | Kampanyalar | Orta | Atlandi | Gerceklesen degerler | 1. Durumu Devam Ediyor yap 2. Gerceklesen degerleri gir | Gerceklesen kar ve donusum orani hesaplanir | Lead guncellenmedi | BUG-007 |
| TEST-4.1.4 | Validasyon | Kampanyalar | Orta | Basarili | Tarih araligi validasyonu | 1. Bitis tarihini baslangictan once sec | Bitis tarihi baslangictan once olamaz uyarisi | Basariyla Gerceklesti | - |

---

## 5. DEAL YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-5.1.1 | Olusturma | Deallar | Kritik | Bekliyor | Yeni deal olusturma | 1. Baslik: Yazilim Satisi, Musteri: ABC, Tutar: 50000, Pipeline: Satis gir 2. Kaydet | Deal olusturulur | - | - |
| TEST-5.1.2 | Validasyon | Deallar | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Baslik ve musteri zorunludur uyarisi | - | - |
| TEST-5.1.3 | Asama | Deallar | Yuksek | Bekliyor | Asama degisimi | 1. Deal detayda asama degistir 2. Kaydet | Asama degisir, gecmis kaydedilir | - | - |
| TEST-5.2.1 | Detay | Deallar | Orta | Bekliyor | Deal detay sayfasi | 1. Deale tikla 2. Detay incele | Tum bilgiler ve timeline gorunur | - | - |
| TEST-5.2.2 | Sonuc | Deallar | Yuksek | Bekliyor | Kazanma/Kaybetme | 1. Kazanildi/Kaybedildi tikla 2. Bilgileri gir 3. Kaydet | Durum guncellenir, istatistikler degisir | - | - |

---

## 6. PIPELINE YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-6.1.1 | Olusturma | Pipelinelar | Kritik | Bekliyor | Yeni pipeline olusturma | 1. Pipeline Adi: Satis Pipeline, Asamalar: Ilk Gorusme/Teklif/Muzakere/Kapanis gir 2. Kaydet | Pipeline olusturulur | - | - |
| TEST-6.1.2 | Validasyon | Pipelinelar | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Ad ve asama zorunludur uyarisi | - | - |
| TEST-6.1.3 | Siralama | Pipelinelar | Orta | Bekliyor | Asama siralama | 1. Duzenleme ac 2. Asamalari drag-drop ile sirala 3. Kaydet | Yeni siralama kaydedilir | - | - |
| TEST-6.2.1 | Detay | Pipelinelar | Orta | Bekliyor | Pipeline detay | 1. Pipelinea tikla 2. Detay incele | Asamalar ve firsatlar gorunur | - | - |

---

## 7. SEGMENT YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-7.1.1 | Olusturma | Segmentler | Kritik | Bekliyor | Yeni segment olusturma | 1. Segment Adi: VIP Musteriler, Kriterler: Ciro>100000, Sektor=Teknoloji, Durum=Aktif gir 2. Kaydet | Segment olusur, eslesen musteri sayisi gosterilir | - | - |
| TEST-7.1.2 | Validasyon | Segmentler | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Ad ve kriter zorunludur uyarisi | - | - |
| TEST-7.1.3 | Dinamik | Segmentler | Orta | Bekliyor | Dinamik guncelleme | 1. Kriterlere uyan yeni musteri ekle 2. Segment sayfasini yenile | Yeni musteri segmentte gorunur | - | - |
| TEST-7.2.1 | Detay | Segmentler | Orta | Bekliyor | Segment detay | 1. Segmente tikla 2. Detay incele | Kriterler ve eslesen musteriler gorunur | - | - |

---

## 8. RAKIP YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-8.1.1 | Olusturma | Rakipler | Kritik | Bekliyor | Yeni rakip olusturma | 1. Rakip Adi: XYZ Yazilim, Web: www.xyz.com, Sektor: Teknoloji, Guc: Fiyat, Zayiflik: Destek gir 2. Kaydet | Rakip olusturulur | - | - |
| TEST-8.1.2 | Validasyon | Rakipler | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Rakip adi zorunludur uyarisi | - | - |
| TEST-8.1.3 | SWOT | Rakipler | Orta | Bekliyor | SWOT analizi | 1. Rakip detayda SWOT bolumunu incele | Guc, zayiflik, firsat, tehdit gorunur | - | - |
| TEST-8.2.1 | Detay | Rakipler | Orta | Bekliyor | Rakip detay | 1. Rakibe tikla 2. Detay incele | Tum bilgiler ve firsatlar gorunur | - | - |

---

## 9. TOPLANTI YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-9.1.1 | Olusturma | Toplantilar | Kritik | Bekliyor | Yeni toplanti olusturma | 1. Baslik: Proje Toplantisi, Tarih: 15/02/2025 14:00, Sure: 1 saat, Konum: Zoom gir 2. Kaydet | Toplanti olusur ve takvimde gorunur | - | - |
| TEST-9.1.2 | Validasyon | Toplantilar | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Baslik ve tarih zorunludur uyarisi | - | - |
| TEST-9.1.3 | Hatirlatici | Toplantilar | Orta | Bekliyor | Hatirlatici ekleme | 1. Duzenleme ac 2. 15 dk once hatirlatici ekle 3. Kaydet | Hatirlatici aktif olur | - | - |
| TEST-9.2.1 | Detay | Toplantilar | Orta | Bekliyor | Toplanti detay | 1. Toplantiya tikla 2. Detay incele | Katilimcilar ve notlar gorunur | - | - |
| TEST-9.2.2 | Notlar | Toplantilar | Orta | Bekliyor | Not ekleme | 1. Detayda Not Ekle tikla 2. Notlari gir 3. Kaydet | Notlar kaydedilir ve tarih damgasi eklenir | - | - |

---

## 10. CAGRI KAYDI YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-10.1.1 | Olusturma | Cagri Kayitlari | Kritik | Bekliyor | Yeni cagri kaydi | 1. Ilgili: Ahmet Yilmaz, Telefon: +90 532 555 1234, Yon: Giden, Sure: 15 dk gir 2. Kaydet | Kayit olusturulur | - | - |
| TEST-10.1.2 | Validasyon | Cagri Kayitlari | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Ilgili kisi ve yon zorunludur uyarisi | - | - |
| TEST-10.2.1 | Detay | Cagri Kayitlari | Orta | Bekliyor | Kayit detay | 1. Kayda tikla 2. Detay incele | Tum bilgiler ve notlar gorunur | - | - |

---

## 11. SATIS EKIBI YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-11.1.1 | Olusturma | Satis Ekipleri | Kritik | Bekliyor | Yeni ekip olusturma | 1. Ekip Adi: Istanbul Satis, Lider: Ahmet, Uyeler: Mehmet ve Ayse, Bolge: Istanbul gir 2. Kaydet | Ekip olusturulur | - | - |
| TEST-11.1.2 | Validasyon | Satis Ekipleri | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Ekip adi zorunludur uyarisi | - | - |
| TEST-11.2.1 | Detay | Satis Ekipleri | Orta | Bekliyor | Ekip detay | 1. Ekibe tikla 2. Detay incele | Uyeler ve performans gorunur | - | - |

---

## 12. BOLGE YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-12.1.1 | Olusturma | Bolgeler | Kritik | Bekliyor | Yeni bolge olusturma | 1. Bolge Adi: Marmara, Ulke: Turkiye, Sehirler: Istanbul-Kocaeli-Bursa gir 2. Kaydet | Bolge olusturulur | - | - |
| TEST-12.1.2 | Validasyon | Bolgeler | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Bolge adi zorunludur uyarisi | - | - |
| TEST-12.2.1 | Detay | Bolgeler | Orta | Bekliyor | Bolge detay | 1. Bolgeye tikla 2. Detay incele | Sehirler ve sorumlu ekip gorunur | - | - |

---

## 13. REFERANS YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-13.1.1 | Olusturma | Referanslar | Kritik | Bekliyor | Yeni referans olusturma | 1. Veren: ABC, Alinan: XYZ, Ilgili: Mehmet, Odul: 1000 TL gir 2. Kaydet | Referans olusturulur | - | - |
| TEST-13.1.2 | Validasyon | Referanslar | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Referans veren zorunludur uyarisi | - | - |
| TEST-13.2.1 | Detay | Referanslar | Orta | Bekliyor | Referans detay | 1. Referansa tikla 2. Detay incele | Odul ve durum gecmisi gorunur | - | - |

---

## 14. AKTIVITE YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-14.1.1 | Olusturma | Aktiviteler | Kritik | Bekliyor | Yeni aktivite olusturma | 1. Tip: Gorev, Baslik: Teklif Hazirla, Ilgili: ABC, Tarih: 20/02/2025, Oncelik: Yuksek gir 2. Kaydet | Aktivite olusturulur | - | - |
| TEST-14.1.2 | Validasyon | Aktiviteler | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Tip ve baslik zorunludur uyarisi | - | - |
| TEST-14.1.3 | Tamamlama | Aktiviteler | Orta | Bekliyor | Aktivite tamamlama | 1. Detayda Tamamla tikla 2. Notlari gir 3. Kaydet | Durum Tamamlandi olur | - | - |
| TEST-14.2.1 | Detay | Aktiviteler | Orta | Bekliyor | Aktivite detay | 1. Aktiviteye tikla 2. Detay incele | Ilgili kayit ve yorumlar gorunur | - | - |

---

## 15. WORKFLOW YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-15.1.1 | Olusturma | Workflowlar | Kritik | Bekliyor | Yeni workflow olusturma | 1. Adi: Lead Donusum, Trigger: Yeni Lead, Adimlar: E-posta/Gorev, Kosul: Puan>50 gir 2. Kaydet | Workflow olusturulur | - | - |
| TEST-15.1.2 | Validasyon | Workflowlar | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Ad ve adim zorunludur uyarisi | - | - |
| TEST-15.1.3 | Toggle | Workflowlar | Orta | Bekliyor | Aktif/Pasif degistirme | 1. Detayda toggle tikla 2. Kaydet | Durum degisir, pasif olunca calismaz | - | - |
| TEST-15.2.1 | Detay | Workflowlar | Orta | Bekliyor | Workflow detay | 1. Workflowa tikla 2. Detay incele | Adimlar ve calistirma gecmisi gorunur | - | - |

---

## 16. DOKUMAN YONETIMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-16.1.1 | Liste | Dokumanlar | Orta | Bekliyor | Dokuman listesi | 1. Dokuman sayfasini ac 2. Listeyi incele | Dokumanlar tip ikonu ile listelenir | - | - |
| TEST-16.1.2 | Yukleme | Dokumanlar | Yuksek | Bekliyor | Dosya yukleme | 1. Yukle tikla 2. PDF sec (<10MB) 3. Yukle | Dosya yuklenir ve listede gorunur | - | - |
| TEST-16.1.3 | Silme | Dokumanlar | Yuksek | Bekliyor | Dokuman silme | 1. Dokuman sec 2. Sil tikla 3. Onayla | Dokuman silinir ve listeden kalkar | - | - |

---

## 17. SADAKAT PROGRAMI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-17.1.1 | Olusturma | Sadakat Programlari | Kritik | Bekliyor | Yeni program olusturma | 1. Adi: Altin Program, Puan/TL: 10, Seviyeler: Bronz/Gumus/Altin gir 2. Kaydet | Program olusturulur | - | - |
| TEST-17.1.2 | Validasyon | Sadakat Programlari | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Ad ve puan orani zorunludur uyarisi | - | - |
| TEST-17.2.1 | Detay | Sadakat Programlari | Orta | Bekliyor | Program detay | 1. Programa tikla 2. Detay incele | Seviyeler ve uye sayisi gorunur | - | - |

---

## 18. SADAKAT UYELIKLERI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-18.1.1 | Olusturma | Sadakat Uyelikleri | Kritik | Bekliyor | Yeni uyelik olusturma | 1. Musteri: ABC, Program: Altin, Seviye: Altin, Puan: 1000 gir 2. Kaydet | Uyelik olusturulur | - | - |
| TEST-18.1.2 | Validasyon | Sadakat Uyelikleri | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Musteri ve program zorunludur uyarisi | - | - |
| TEST-18.1.3 | Puan | Sadakat Uyelikleri | Orta | Bekliyor | Puan validasyonu | 1. Puan: -100, 0, 5000 gir | Negatif red, 0 ve pozitif kabul | - | - |
| TEST-18.2.1 | Detay | Sadakat Uyelikleri | Orta | Bekliyor | Uyelik detay | 1. Uyelige tikla 2. Detay incele | Musteri, program, seviye, puan gorunur | - | - |

---

## 19. URUN ILGILERI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-19.1.1 | Olusturma | Urun Ilgileri | Kritik | Bekliyor | Yeni urun ilgisi olusturma | 1. Urun: ERP Paketi, Ilgi: Yuksek, Kaynak: Web, Musteri: ABC gir 2. Kaydet | Urun ilgisi olusturulur | - | - |
| TEST-19.1.2 | Validasyon | Urun Ilgileri | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Urun adi ve ilgi seviyesi zorunludur | - | - |
| TEST-19.1.3 | Secenekler | Urun Ilgileri | Orta | Bekliyor | Ilgi seviyesi dropdown | 1. Dropdown ac 2. Secenekleri kontrol et | Dusuk, Orta, Yuksek, Cok Yuksek mevcut | - | - |
| TEST-19.2.1 | Detay | Urun Ilgileri | Orta | Bekliyor | Urun ilgisi detay | 1. Kayda tikla 2. Detay incele | Urun, ilgi, musteri, miktar gorunur | - | - |

---

## 20. SOSYAL MEDYA PROFILLERI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-20.1.1 | Olusturma | Sosyal Medya | Kritik | Bekliyor | Yeni profil olusturma | 1. Platform: Instagram, Kullanici: abc_teknoloji, URL: instagram.com/abc, Takipci: 15000 gir 2. Kaydet | Profil olusturulur | - | - |
| TEST-20.1.2 | Secenekler | Sosyal Medya | Orta | Bekliyor | Platform dropdown | 1. Dropdown ac 2. Secenekleri kontrol et | Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok vb. mevcut | - | - |
| TEST-20.1.3 | Validasyon | Sosyal Medya | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Platform ve kullanici adi zorunludur | - | - |
| TEST-20.2.1 | Detay | Sosyal Medya | Orta | Bekliyor | Profil detay | 1. Profile tikla 2. Detay incele | Platform ikonu, kullanici, takipci gorunur | - | - |

---

## 21. ANKET YANITLARI TEST SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-21.1.1 | Olusturma | Anket Yanitlari | Kritik | Bekliyor | Yeni yanit olusturma | 1. Tip: NPS, Adi: 2025 Q1 Memnuniyet, Durum: Tamamlandi, Puan: 8.5, NPS: 9 gir 2. Kaydet | Yanit olusturulur | - | - |
| TEST-21.1.2 | Secenekler | Anket Yanitlari | Orta | Bekliyor | Anket tipi dropdown | 1. Dropdown ac 2. Secenekleri kontrol et | NPS, CSAT, CES, Urun, Hizmet, Genel, Ozel mevcut | - | - |
| TEST-21.1.3 | Validasyon | Anket Yanitlari | Yuksek | Bekliyor | Zorunlu alan validasyonu | 1. Bos form ile Kaydet | Tip, ad ve durum zorunludur uyarisi | - | - |
| TEST-21.1.4 | Puan | Anket Yanitlari | Yuksek | Bekliyor | Puan validasyonu | 1. Genel Puan: 0-10, NPS: 0-10, CSAT: 1-5 test et | Aralik disindakiler reddedilir | - | - |
| TEST-21.2.1 | NPS | Anket Yanitlari | Orta | Bekliyor | NPS kategorisi | 1. NPS 9-10, 7-8, 0-6 olan yanitlari incele | Promoter (yesil), Passive (sari), Detractor (kirmizi) | - | - |
| TEST-21.3.1 | Filtreleme | Anket Yanitlari | Orta | Bekliyor | Filtre testi | 1. Tip ile filtrele 2. Durum ile filtrele | Sadece eslesen sonuclar listelenir | - | - |

---

## 22. HATA SENARYOLARI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-22.1.1 | Ag Hatasi | Genel | Yuksek | Atlandi | Internet kesintisi | 1. Form doldur 2. Interneti kes 3. Kaydet | Kullanici dostu hata mesaji, veriler kaybolmaz | - | - |
| TEST-22.2.1 | Duplikasyon | Musteriler | Yuksek | Atlandi | Tekrar e-posta | 1. Mevcut e-posta ile yeni musteri olustur | Bu e-posta kullaniliyor uyarisi | Ingilizce mesaj | BUG-008 |
| TEST-22.3.1 | Yetkilendirme | Genel | Kritik | Kismi | URL ile erisim | 1. Yetkisiz kullanici ile giris 2. /crm/customers/new adresine git | Erisim engellenir | Sayfa acildi | BUG-009 |

---

## 23. UX TESTLERI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-23.1.1 | Degisiklik | Genel | Yuksek | Kismi | Kaydedilmemis cikis | 1. Form doldur 2. Kaydetmeden sayfadan cik | Kaydedilmemis degisiklikler uyarisi | Uyari vermedi | BUG-010 |
| TEST-23.2.1 | Responsive | Genel | Orta | Kismi | Mobil gorunum | 1. Pencereyi daralt (<768px) 2. Formlari kontrol et | Elemanlari duzgun stack olur | Ic ice gecmis gorunum | BUG-011 |
| TEST-23.2.2 | Responsive | Genel | Orta | Kismi | Tablet gorunum | 1. Pencereyi tablet boyutuna getir 2. Layout kontrol et | Grid duzgun calisir | Ic ice gecmis gorunum | BUG-012 |

---

## 24. LISTE SAYFASI ORTAK TESTLERI

| Test ID | Kategori | Sayfa | Oncelik | Durum | Senaryo | Adimlar | Beklenen Sonuc | Gerceklesen | Bug ID |
|---------|----------|-------|---------|-------|---------|---------|----------------|-------------|--------|
| TEST-24.1.1 | Sayfalama | Tum Listeler | Orta | Bekliyor | Sayfa navigasyonu | 1. 10dan fazla kayit ile 2. Sayfa numaralarini tikla 3. Sonraki/Onceki test et | Sayfalama calisir, URL guncellenir | - | - |
| TEST-24.1.2 | Boyut | Tum Listeler | Dusuk | Bekliyor | Sayfa boyutu | 1. Boyut seciciden 10, 25, 50, 100 sec | Secilen sayida kayit listelenir | - | - |
| TEST-24.2.1 | Arama | Tum Listeler | Orta | Bekliyor | Arama islevi | 1. Arama kutusuna yaz 2. Enter | Eslesen sonuclar anlik listelenir | - | - |
| TEST-24.2.2 | Temizleme | Tum Listeler | Dusuk | Bekliyor | Filtre temizleme | 1. Filtre uygula 2. Temizle tikla | Tum filtreler sifirlanir | - | - |

---

## TESPIT EDILEN BUGLAR OZETI

| Bug ID | Kategori | Aciklama | Oncelik | Oneri |
|--------|----------|----------|---------|-------|
| BUG-001 | Musteri | TC Kimlik validasyonu calismiyor | Yuksek | TC Kimlik algoritma kontrolu eklenmeli |
| BUG-002 | Musteri | KVKK checkbox degerleri kaybolyor | Yuksek | State yonetimi duzeltilmeli |
| BUG-003 | Lead | Puan alani kaydedilmiyor | Yuksek | Form submit verisi kontrol edilmeli |
| BUG-004 | Lead | Rating butonlari calismiyor | Orta | onClick eventleri kontrol edilmeli |
| BUG-005 | Firsat | Lead iliskilendirme sorunu | Orta | Foreign key iliskisi kontrol edilmeli |
| BUG-006 | Kampanya | Liste yenileme sorunu | Orta | Cache invalidation eklenmeli |
| BUG-007 | Kampanya | Gerceklesen lead guncellenmedi | Orta | Update mekanizmasi kontrol edilmeli |
| BUG-008 | Hata | Ingilizce hata mesaji | Dusuk | i18n uygulanmali |
| BUG-009 | Guvenlik | Frontend route korumasi eksik | Kritik | Auth guard eklenmeli |
| BUG-010 | UX | Unsaved changes uyarisi yok | Yuksek | beforeunload eventi eklenmeli |
| BUG-011 | UX | Mobil responsive bozuk | Orta | Tailwind responsive duzeltilmeli |
| BUG-012 | UX | Tablet responsive bozuk | Orta | Grid breakpointleri ayarlanmali |

---

## ISTATISTIKLER

- **Toplam Test:** 104
- **Basarili:** 18
- **Kismi Basarili:** 9
- **Basarisiz:** 4
- **Atlanan:** 3
- **Bekleyen:** 70
- **Tespit Edilen Bug:** 12
- **Test Edilen Sayfa:** 23

---

*Bu dokuman Notion'a kopyala-yapistir ile aktarilabilir.*
*Her bolum ayri bir database olarak olusturulabilir.*
*Tarih: 2025*
