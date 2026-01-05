# HR Manual Test Verileri ve Senaryolari

Bu dokuman, Insan Kaynaklari (HR) modullerini manuel olarak test etmek icin hazirlanmis kapsamli test verilerini icerir. Her modul icin **Standart (Yaygin)**, **Minimum (Hizli)** ve **Validasyon (Sinir)** senaryolari tanimlanmistir.

---

## 1. Departmanlar (Departments)
**Sayfa:** `/hr/departments/new`
**Zorunlu Alanlar:** Departman Adi.

### 1. Standart Departman (Yaygin Senaryo)
Tipik bir sirket departmanini simule eder.

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Departman Adi** | Bilgi Teknolojileri | Zorunlu (Max 200) |
| **Aciklama** | Sirket genelinde IT altyapi ve yazilim gelistirme operasyonlari | |
| **Ust Departman** | (Bos veya mevcut departman) | Alt departman icin |
| **Departman Muduru** | (Listeden secin) | |
| **Maliyet Merkezi** | CC-IT-001 | |
| **Konum** | Istanbul Merkez Ofis | |
| **Durum** | Aktif | (Switch acik) |

### 2. Minimum Veri (Hizli Test)
Sadece zorunlu alanlarin validasyonunu gecmek icin.

| Alan | Deger |
| :--- | :--- |
| **Departman Adi** | Test Departmani |

### 3. Alt Departman (Hiyerarsik Yapi)

| Alan | Deger |
| :--- | :--- |
| **Departman Adi** | Yazilim Gelistirme |
| **Aciklama** | Backend ve frontend gelistirme ekipleri |
| **Ust Departman** | Bilgi Teknolojileri |
| **Maliyet Merkezi** | CC-IT-DEV |

### 4. Validasyon Sinir Testi
- **Karakter Siniri**: Departman Adi alanina 201 karakterlik veri girin. *"En fazla 200 karakter olabilir"* uyarisini gorun.
- **Bos Birakma**: Departman Adi girmeden kaydetmeyi deneyin.

---

## 2. Pozisyonlar (Positions)
**Sayfa:** `/hr/positions/new`
**Zorunlu Alanlar:** Pozisyon Adi.

### 1. Standart Pozisyon (Yaygin Senaryo)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Pozisyon Adi** | Kidemli Yazilim Muhendisi | Zorunlu (Max 100) |
| **Aciklama** | .NET ve React teknolojilerinde uzman yazilim gelistirici | |
| **Departman** | Bilgi Teknolojileri | |
| **Seviye** | Senior | |
| **Min. Maas** | 80.000 | |
| **Max. Maas** | 120.000 | |
| **Durum** | Aktif | |

### 2. Minimum Veri

| Alan | Deger |
| :--- | :--- |
| **Pozisyon Adi** | Junior Developer |

### 3. Yonetici Pozisyonu

| Alan | Deger |
| :--- | :--- |
| **Pozisyon Adi** | IT Direktoru |
| **Aciklama** | Tum IT operasyonlarindan sorumlu ust duzey yonetici |
| **Departman** | Bilgi Teknolojileri |
| **Seviye** | Director |
| **Min. Maas** | 200.000 |
| **Max. Maas** | 350.000 |

### 4. Validasyon Sinir Testi
- **Karakter Siniri**: Pozisyon Adi alanina 101 karakterlik veri girin.
- **Negatif Maas**: Min. Maas alanina negatif deger girin.

---

## 3. Calisanlar (Employees)
**Sayfa:** `/hr/employees/new`
**Zorunlu Alanlar:** Ad, Soyad.

### 1. Standart Calisan (Yaygin Senaryo)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Ad** | Ahmet | Zorunlu |
| **Soyad** | Yilmaz | Zorunlu |
| **TC Kimlik No** | 12345678901 | 11 karakter |
| **Cinsiyet** | Erkek | |
| **Dogum Tarihi** | 15/03/1990 | |
| **E-posta** | ahmet.yilmaz@sirket.com | |
| **Telefon** | 0532 111 22 33 | |
| **Adres** | Kadikoy, Istanbul | |
| **Ise Giris Tarihi** | 01/01/2023 | |
| **Departman** | Bilgi Teknolojileri | |
| **Pozisyon** | Kidemli Yazilim Muhendisi | |
| **Vardiya** | Sabah Vardiyasi | |
| **Calisma Lokasyonu** | Istanbul Merkez | |
| **Yonetici** | (Listeden secin) | |
| **Calisma Tipi** | Tam Zamanli (FullTime) | |
| **Durum** | Aktif | |

### 2. Minimum Veri (Hizli Test)

| Alan | Deger |
| :--- | :--- |
| **Ad** | Test |
| **Soyad** | Kullanici |

### 3. Part-Time Calisan

| Alan | Deger |
| :--- | :--- |
| **Ad** | Zeynep |
| **Soyad** | Demir |
| **E-posta** | zeynep.demir@sirket.com |
| **Calisma Tipi** | Yari Zamanli (PartTime) |
| **Departman** | Pazarlama |

### 4. Stajyer

| Alan | Deger |
| :--- | :--- |
| **Ad** | Can |
| **Soyad** | Ozturk |
| **Dogum Tarihi** | 05/08/2002 |
| **E-posta** | can.ozturk@sirket.com |
| **Calisma Tipi** | Stajyer (Intern) |
| **Departman** | Bilgi Teknolojileri |

### 4. Validasyon Sinir Testi
- **TC Kimlik**: 10 veya 12 karakter girin (11 olmali).
- **Email Formati**: Gecersiz email adresi girin.

---

## 4. Vardiyalar (Shifts)
**Sayfa:** `/hr/shifts/new`
**Zorunlu Alanlar:** Vardiya Adi.

### 1. Standart Sabah Vardiyasi

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Vardiya Adi** | Sabah Vardiyasi | Zorunlu (Max 200) |
| **Aciklama** | Standart mesai saatleri | |
| **Baslangic Saati** | 09:00 | |
| **Bitis Saati** | 18:00 | |
| **Mola Suresi (dk)** | 60 | Oglen molasi |
| **Durum** | Aktif | |

### 2. Gece Vardiyasi

| Alan | Deger |
| :--- | :--- |
| **Vardiya Adi** | Gece Vardiyasi |
| **Aciklama** | Gece calisma programi |
| **Baslangic Saati** | 22:00 |
| **Bitis Saati** | 06:00 |
| **Mola Suresi (dk)** | 45 |

### 3. Esnek Calisma

| Alan | Deger |
| :--- | :--- |
| **Vardiya Adi** | Esnek Mesai |
| **Aciklama** | Esnek calisma saatleri |
| **Baslangic Saati** | 08:00 |
| **Bitis Saati** | 17:00 |
| **Mola Suresi (dk)** | 60 |

---

## 5. Izin Turleri (Leave Types)
**Sayfa:** `/hr/leave-types/new`
**Zorunlu Alanlar:** Izin Adi.

### 1. Yillik Izin

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Izin Adi** | Yillik Izin | Zorunlu |
| **Aciklama** | Yillik ucretli izin hakki | |
| **Varsayilan Gun** | 14 | Yillik izin gun sayisi |
| **Ucretli mi?** | Evet | |
| **Onay Gerekli mi?** | Evet | |
| **Renk** | #4CAF50 | Yesil |

### 2. Hastalik Izni

| Alan | Deger |
| :--- | :--- |
| **Izin Adi** | Hastalik Izni |
| **Aciklama** | Rapor ile alinan hastalik izni |
| **Varsayilan Gun** | 0 |
| **Ucretli mi?** | Evet |
| **Belge Gerekli mi?** | Evet |
| **Renk** | #F44336 |

### 3. Ucretsiz Izin

| Alan | Deger |
| :--- | :--- |
| **Izin Adi** | Ucretsiz Izin |
| **Aciklama** | Ucret kesilecek izin |
| **Varsayilan Gun** | 0 |
| **Ucretli mi?** | Hayir |
| **Onay Gerekli mi?** | Evet |
| **Renk** | #9E9E9E |

---

## 6. Izin Talepleri (Leaves)
**Sayfa:** `/hr/leaves/new`
**Zorunlu Alanlar:** Calisan, Izin Turu, Tarih Araligi.

### 1. Standart Yillik Izin Talebi

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Calisan** | (Listeden secin) | Zorunlu |
| **Izin Turu** | Yillik Izin | Zorunlu |
| **Baslangic Tarihi** | (Gelecek hafta Pazartesi) | Zorunlu |
| **Bitis Tarihi** | (Gelecek hafta Cuma) | Zorunlu |
| **Aciklama** | Aile ziyareti icin izin | |

### 2. Tek Gunluk Izin

| Alan | Deger |
| :--- | :--- |
| **Calisan** | (Listeden secin) |
| **Izin Turu** | Yillik Izin |
| **Baslangic Tarihi** | (Yarin) |
| **Bitis Tarihi** | (Yarin) |

### 3. Hastalik Izni

| Alan | Deger |
| :--- | :--- |
| **Calisan** | (Listeden secin) |
| **Izin Turu** | Hastalik Izni |
| **Baslangic/Bitis** | (Bugun - 3 gun sonra) |
| **Aciklama** | Grip nedeniyle istirahat |

### 4. Validasyon Sinir Testi
- **Tarih Sirasi**: Bitis tarihini baslangictan once secin.
- **Calisan Secmeden**: Calisan secmeden kaydetmeyi deneyin.

---

## 7. Calisma Lokasyonlari (Work Locations)
**Sayfa:** `/hr/work-locations/new`
**Zorunlu Alanlar:** Lokasyon Adi.

### 1. Merkez Ofis

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Lokasyon Adi** | Istanbul Merkez Ofis | Zorunlu |
| **Adres** | Levent Mah. Buyukdere Cad. No:123, Besiktas/Istanbul | |
| **Sehir** | Istanbul | |
| **Ulke** | Turkiye | |
| **Posta Kodu** | 34330 | |
| **Telefon** | 0212 555 00 00 | |
| **Kapasite** | 200 | Kisi kapasitesi |
| **Durum** | Aktif | |

### 2. Sube Ofis

| Alan | Deger |
| :--- | :--- |
| **Lokasyon Adi** | Ankara Sube |
| **Adres** | Cankaya, Ankara |
| **Sehir** | Ankara |
| **Kapasite** | 50 |

### 3. Uzaktan Calisma

| Alan | Deger |
| :--- | :--- |
| **Lokasyon Adi** | Remote - Uzaktan |
| **Aciklama** | Uzaktan calisma icin sanal lokasyon |

---

## 8. Is Ilanlari (Job Postings)
**Sayfa:** `/hr/job-postings/new`
**Zorunlu Alanlar:** Ilan Basligi, Departman, Pozisyon.

### 1. Standart Is Ilani

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Ilan Basligi** | Kidemli .NET Yazilim Muhendisi | Zorunlu |
| **Departman** | Bilgi Teknolojileri | Zorunlu |
| **Pozisyon** | Kidemli Yazilim Muhendisi | Zorunlu |
| **Calisma Tipi** | Tam Zamanli | |
| **Deneyim Seviyesi** | Senior (5+ Yil) | |
| **Uzaktan Calisma** | Hibrit | |
| **Lokasyon** | Istanbul Merkez | |
| **Min. Maas** | 80.000 | |
| **Max. Maas** | 120.000 | |
| **Maas Periyodu** | Aylik | |
| **Acik Pozisyon Sayisi** | 2 | |
| **Basvuru Son Tarihi** | (1 ay sonra) | |
| **Beklenen Baslangic** | (2 ay sonra) | |
| **Is Tanimi** | .NET Core, React, Azure teknolojilerinde deneyimli yazilimci ariyoruz. | |
| **Gereksinimler** | 5+ yil .NET deneyimi, Ingilizce, Takim calismasina yatkin | |
| **Ic Ilan mi?** | Hayir | |
| **One Cikarilin** | Evet | |
| **Acil** | Hayir | |

### 2. Stajyer Ilani

| Alan | Deger |
| :--- | :--- |
| **Ilan Basligi** | Yazilim Gelistirme Stajyeri |
| **Departman** | Bilgi Teknolojileri |
| **Calisma Tipi** | Stajyer |
| **Deneyim Seviyesi** | Giris Seviyesi |
| **Uzaktan Calisma** | Ofiste |
| **Acik Pozisyon Sayisi** | 5 |
| **Maas Goster** | Hayir |

### 3. Ic Ilan (Sirket Ici)

| Alan | Deger |
| :--- | :--- |
| **Ilan Basligi** | IT Takim Lideri |
| **Departman** | Bilgi Teknolojileri |
| **Calisma Tipi** | Tam Zamanli |
| **Deneyim Seviyesi** | Lead |
| **Ic Ilan mi?** | Evet |
| **Acil** | Evet |

---

## 9. Egitimler (Trainings)
**Sayfa:** `/hr/trainings/new`
**Zorunlu Alanlar:** Egitim Basligi.

### 1. Teknik Egitim (Yuz Yuze)

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Egitim Basligi** | .NET 9 Yeni Ozellikler | Zorunlu (Max 200) |
| **Aciklama** | .NET 9 ile gelen yeni ozelliklerin tanitimi | |
| **Egitim Saglayicisi** | Microsoft Turkiye | |
| **Egitmen** | Mehmet Ozkaya | |
| **Tarih Araligi** | (Gelecek hafta Pzt-Cum) | |
| **Sure (Saat)** | 40 | |
| **Maliyet** | 15.000 | |
| **Lokasyon** | Istanbul Merkez Ofis | |
| **Online mi?** | Hayir | |
| **Max Katilimci** | 20 | |

### 2. Online Egitim

| Alan | Deger |
| :--- | :--- |
| **Egitim Basligi** | Agile & Scrum Temelleri |
| **Aciklama** | Ceviklik metodolojileri egitimi |
| **Egitim Saglayicisi** | Udemy |
| **Online mi?** | Evet |
| **Online URL** | https://udemy.com/agile-scrum |
| **Sure (Saat)** | 12 |
| **Maliyet** | 500 |

### 3. Zorunlu Egitim

| Alan | Deger |
| :--- | :--- |
| **Egitim Basligi** | Is Sagligi ve Guvenligi |
| **Aciklama** | Yasal zorunlu ISG egitimi |
| **Sure (Saat)** | 8 |
| **Maliyet** | 0 |
| **Online mi?** | Hayir |

---

## 10. Performans Degerlendirme (Performance Reviews)
**Sayfa:** `/hr/performance/new`
**Zorunlu Alanlar:** Calisan, Degerlendirme Donemi, Degerlendirenler.

### 1. Ceyreklik Degerlendirme

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Degerlendirme Donemi** | 2026 Q1 | Zorunlu |
| **Calisan** | (Listeden secin) | Zorunlu |
| **Degerlendiren** | (Yonetici secin) | Zorunlu |
| **Degerlendirme Tarihi** | (Bu ay sonu) | |
| **Genel Puan** | 8 | 1-10 arasi |
| **Guclu Yanlar** | Teknik beceriler, takim uyumu, problem cozme | |
| **Gelisim Alanlari** | Iletisim, sunum becerileri | |
| **Hedefler** | Q2'de 2 proje tamamlamak | |
| **Yorumlar** | Basarili bir ceyrek gecirdi | |

### 2. Yillik Degerlendirme

| Alan | Deger |
| :--- | :--- |
| **Degerlendirme Donemi** | Yillik 2025 |
| **Calisan** | (Listeden secin) |
| **Degerlendiren** | (Yonetici secin) |
| **Genel Puan** | 9 |
| **Guclu Yanlar** | Liderlik, teknik uzmanlik |
| **Terfi Onerisi** | Evet |

---

## 11. Harcamalar (Expenses)
**Sayfa:** `/hr/expenses/new`
**Zorunlu Alanlar:** Aciklama, Calisan, Harcama Tipi, Tutar, Tarih.

### 1. Ulasim Harcamasi

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Aciklama** | Musteri ziyareti taksi ucreti | Zorunlu (Max 200) |
| **Ek Notlar** | ABC Sirket toplantisi donusu | |
| **Calisan** | (Listeden secin) | Zorunlu |
| **Harcama Tipi** | Ulasim | Zorunlu |
| **Tutar** | 250 | Zorunlu |
| **Para Birimi** | TRY | |
| **Tarih** | (Bugun) | Zorunlu |
| **Iade Edilebilir** | Evet | |

### 2. Yemek Harcamasi

| Alan | Deger |
| :--- | :--- |
| **Aciklama** | Musteri ile is yemegi |
| **Calisan** | (Listeden secin) |
| **Harcama Tipi** | Yemek |
| **Tutar** | 850 |
| **Tarih** | (Dun) |
| **Iade Edilebilir** | Evet |

### 3. Egitim Harcamasi

| Alan | Deger |
| :--- | :--- |
| **Aciklama** | Online kurs ucreti |
| **Calisan** | (Listeden secin) |
| **Harcama Tipi** | Egitim |
| **Tutar** | 500 |
| **Iade Edilebilir** | Evet |

### 4. Validasyon Sinir Testi
- **Negatif Tutar**: Tutar alanina negatif deger girin.
- **Gelecek Tarih**: Harcama tarihi olarak gelecek bir tarih secin.

---

## 12. Mesai (Overtimes)
**Sayfa:** `/hr/overtimes/new`
**Zorunlu Alanlar:** Calisan, Tarih, Sure.

### 1. Hafta Ici Mesai

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Calisan** | (Listeden secin) | Zorunlu |
| **Tarih** | (Dun) | Zorunlu |
| **Baslangic Saati** | 18:00 | |
| **Bitis Saati** | 21:00 | |
| **Sure (Saat)** | 3 | Zorunlu |
| **Aciklama** | Proje teslimi icin fazla mesai | |
| **Onaylandi mi?** | Beklemede | |

### 2. Hafta Sonu Mesai

| Alan | Deger |
| :--- | :--- |
| **Calisan** | (Listeden secin) |
| **Tarih** | (Gecen Cumartesi) |
| **Sure (Saat)** | 8 |
| **Aciklama** | Acil sistem bakimi |

---

## 13. Tatil Gunleri (Holidays)
**Sayfa:** `/hr/holidays/new`
**Zorunlu Alanlar:** Tatil Adi, Tarih.

### 1. Resmi Tatil

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Tatil Adi** | Cumhuriyet Bayrami | Zorunlu |
| **Tarih** | 29/10/2026 | Zorunlu |
| **Aciklama** | Resmi tatil gunu | |
| **Tekrarlayan mi?** | Evet | Her yil |

### 2. Dini Bayram

| Alan | Deger |
| :--- | :--- |
| **Tatil Adi** | Ramazan Bayrami 1. Gun |
| **Tarih** | (Ilgili tarih) |
| **Aciklama** | Dini bayram |
| **Tekrarlayan mi?** | Hayir |

### 3. Sirket Ozel Tatil

| Alan | Deger |
| :--- | :--- |
| **Tatil Adi** | Sirket Kurulis Yildonumu |
| **Tarih** | 15/05/2026 |
| **Aciklama** | Sirketin kurulus yildonumu |
| **Tekrarlayan mi?** | Evet |

---

## 14. Duyurular (Announcements)
**Sayfa:** `/hr/announcements/new`
**Zorunlu Alanlar:** Baslik, Icerik.

### 1. Genel Duyuru

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Baslik** | 2026 Yili Performans Degerlendirme Sureci | Zorunlu |
| **Icerik** | Degerli calisanlarimiz, 2026 yili performans degerlendirme sureci baslamistir... | Zorunlu |
| **Oncelik** | Normal | |
| **Yayin Tarihi** | (Bugun) | |
| **Bitis Tarihi** | (1 ay sonra) | |
| **Hedef Kitle** | Tum Calisanlar | |

### 2. Acil Duyuru

| Alan | Deger |
| :--- | :--- |
| **Baslik** | Sistem Bakimi Bildirimi |
| **Icerik** | Yarin 22:00-02:00 arasi sistem bakimi yapilacaktir. |
| **Oncelik** | Yuksek |
| **Hedef Kitle** | IT Departmani |

### 3. Kutlama Duyurusu

| Alan | Deger |
| :--- | :--- |
| **Baslik** | Yeni Yil Kutlamasi |
| **Icerik** | Tum calisanlarimizin yeni yilini kutlariz! |
| **Oncelik** | Dusuk |

---

## 15. Hedefler (Goals)
**Sayfa:** `/hr/goals/new`
**Zorunlu Alanlar:** Hedef Adi, Calisan.

### 1. Bireysel Hedef

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Hedef Adi** | Q1 Satis Hedefi | Zorunlu |
| **Aciklama** | Ilk ceyrekte 500.000 TL satis yapmak | |
| **Calisan** | (Listeden secin) | Zorunlu |
| **Hedef Tipi** | Bireysel | |
| **Baslangic Tarihi** | 01/01/2026 | |
| **Bitis Tarihi** | 31/03/2026 | |
| **Olcum Birimi** | TL | |
| **Hedef Deger** | 500.000 | |
| **Agirlik (%)** | 30 | |

### 2. Takim Hedefi

| Alan | Deger |
| :--- | :--- |
| **Hedef Adi** | Musteri Memnuniyeti |
| **Aciklama** | Musteri memnuniyet skorunu %90'a cikarmak |
| **Hedef Tipi** | Takim |
| **Olcum Birimi** | Yuzde |
| **Hedef Deger** | 90 |

---

## 16. Belgeler (Documents)
**Sayfa:** `/hr/documents/new`
**Zorunlu Alanlar:** Belge Adi, Calisan.

### 1. Ozgecmis

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Belge Adi** | CV - Ahmet Yilmaz | Zorunlu |
| **Belge Tipi** | Ozgecmis | |
| **Calisan** | Ahmet Yilmaz | Zorunlu |
| **Aciklama** | Guncel ozgecmis | |
| **Dosya** | (PDF yukle) | |

### 2. Sozlesme

| Alan | Deger |
| :--- | :--- |
| **Belge Adi** | Is Sozlesmesi |
| **Belge Tipi** | Sozlesme |
| **Calisan** | (Listeden secin) |
| **Aciklama** | Imzali is sozlesmesi |

### 3. Sertifika

| Alan | Deger |
| :--- | :--- |
| **Belge Adi** | Azure Sertifikasi |
| **Belge Tipi** | Sertifika |
| **Calisan** | (Listeden secin) |
| **Gecerlilik Tarihi** | 31/12/2026 |

---

## 17. Calisma Programlari (Work Schedules)
**Sayfa:** `/hr/work-schedules/new`
**Zorunlu Alanlar:** Program Adi.

### 1. Standart Haftalik Program

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Program Adi** | Standart Haftalik | Zorunlu |
| **Aciklama** | Pazartesi-Cuma standart calisma | |
| **Pazartesi** | 09:00 - 18:00 | |
| **Sali** | 09:00 - 18:00 | |
| **Carsamba** | 09:00 - 18:00 | |
| **Persembe** | 09:00 - 18:00 | |
| **Cuma** | 09:00 - 18:00 | |
| **Cumartesi** | Tatil | |
| **Pazar** | Tatil | |

### 2. Vardiyali Program

| Alan | Deger |
| :--- | :--- |
| **Program Adi** | Vardiyali Calisma |
| **Aciklama** | Uretin vardiyali calisma programi |
| **Pazartesi** | Vardiya A / Vardiya B |

---

## 18. Sertifikalar (Certifications)
**Sayfa:** `/hr/certifications/new`
**Zorunlu Alanlar:** Sertifika Adi, Calisan.

### 1. Teknik Sertifika

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Sertifika Adi** | Microsoft Azure Solutions Architect | Zorunlu |
| **Calisan** | (Listeden secin) | Zorunlu |
| **Veren Kurum** | Microsoft | |
| **Sertifika No** | AZ-305-2026-001 | |
| **Alinma Tarihi** | 15/01/2026 | |
| **Gecerlilik Tarihi** | 15/01/2028 | |
| **Durum** | Aktif | |

### 2. Dil Sertifikasi

| Alan | Deger |
| :--- | :--- |
| **Sertifika Adi** | TOEFL iBT |
| **Calisan** | (Listeden secin) |
| **Veren Kurum** | ETS |
| **Puan** | 95 |
| **Alinma Tarihi** | 01/06/2025 |

---

## 19. Is Basvurulari (Job Applications)
**Sayfa:** `/hr/job-applications/new`
**Zorunlu Alanlar:** Aday Adi, Is Ilani, Basvuru Tarihi.

### 1. Standart Basvuru

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Aday Adi** | Elif Kaya | Zorunlu |
| **E-posta** | elif.kaya@email.com | |
| **Telefon** | 0533 999 88 77 | |
| **Is Ilani** | Kidemli .NET Yazilim Muhendisi | Zorunlu |
| **Basvuru Tarihi** | (Bugun) | Zorunlu |
| **Kaynak** | LinkedIn | |
| **Durum** | Yeni | |
| **CV** | (Dosya yukle) | |
| **Notlar** | 7 yil deneyimli, referansli | |

### 2. Ic Basvuru

| Alan | Deger |
| :--- | :--- |
| **Aday Adi** | Mevcut Calisan |
| **Is Ilani** | IT Takim Lideri |
| **Kaynak** | Ic Basvuru |
| **Durum** | Degerlendirmede |

---

## 20. Mulakat (Interviews)
**Sayfa:** `/hr/interviews/new`
**Zorunlu Alanlar:** Aday, Mulakat Tarihi, Gorusmeci.

### 1. Teknik Mulakat

| Alan | Deger | Not |
| :--- | :--- | :--- |
| **Basvuru/Aday** | Elif Kaya | Zorunlu |
| **Mulakat Tipi** | Teknik | |
| **Mulakat Tarihi** | (Gelecek hafta) | Zorunlu |
| **Saat** | 14:00 | |
| **Sure (dk)** | 60 | |
| **Gorusmeci** | (Listeden secin) | Zorunlu |
| **Lokasyon** | Online - Zoom | |
| **Durum** | Planlanmis | |

### 2. IK Gorusmesi

| Alan | Deger |
| :--- | :--- |
| **Basvuru/Aday** | Elif Kaya |
| **Mulakat Tipi** | IK |
| **Mulakat Tarihi** | (Teknik mulakatten sonra) |
| **Gorusmeci** | IK Muduru |
| **Lokasyon** | Istanbul Merkez Ofis |

---

## Hizli Referans - Test Siralama Onerisi

Modulleri test ederken asagidaki sirayi takip etmenizi oneririz (bagimliliklar nedeniyle):

1. **Departmanlar** - Temel yapi
2. **Pozisyonlar** - Departmana bagli
3. **Vardiyalar** - Calisanlar icin gerekli
4. **Calisma Lokasyonlari** - Calisanlar icin gerekli
5. **Izin Turleri** - Izin talepleri icin gerekli
6. **Tatil Gunleri** - Izin hesaplamalari icin
7. **Calisanlar** - Tum modullerin temel verisi
8. **Is Ilanlari** - Ise alim sureci
9. **Is Basvurulari** - Ilana bagli
10. **Mulakatlar** - Basvuruya bagli
11. **Egitimler** - Calisan gelistirme
12. **Izin Talepleri** - Calisan ve izin turune bagli
13. **Harcamalar** - Calisana bagli
14. **Mesai** - Calisana bagli
15. **Performans** - Calisana bagli
16. **Hedefler** - Calisana bagli
17. **Duyurular** - Bagimsiz

---

*Son Guncelleme: Ocak 2026*
