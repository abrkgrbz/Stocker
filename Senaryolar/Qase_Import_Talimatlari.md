# Qase.io Import Talimatlari

## Qase.io Nedir?

Qase.io modern, ucretsiz test yonetim platformudur:
- **Ucretsiz plan**: 3 kullanici, sinirsiz test case
- **Modern UI**: Kullanici dostu arayuz
- **API destegi**: Otomasyon entegrasyonu
- **Raporlama**: Detayli test raporlari

## Hesap Olusturma

1. https://qase.io adresine gidin
2. "Start for free" tiklayin
3. GitHub/Google ile kayit olun veya e-posta ile kayit olun
4. Yeni proje olusturun: "Stocker CRM"

## CSV Import Adimlari

### Adim 1: Proje Olusturun
1. Dashboard'da "Create Project" tiklayin
2. Proje adi: `Stocker CRM`
3. Proje kodu: `CRM`
4. "Create" tiklayin

### Adim 2: Test Suitelari Olusturun (Otomatik yapilacak)
Import sirasinda Suite kolonu otomatik olarak suitelari olusturacak:
- Musteri Yonetimi
- Lead Yonetimi
- Firsat Yonetimi
- Kampanya Yonetimi
- Deal Yonetimi
- Pipeline Yonetimi
- Segment Yonetimi
- Rakip Yonetimi
- Toplanti Yonetimi
- Cagri Kaydi Yonetimi
- Satis Ekibi Yonetimi
- Bolge Yonetimi
- Referans Yonetimi
- Aktivite Yonetimi
- Workflow Yonetimi
- Dokuman Yonetimi
- Sadakat Programi Yonetimi
- Sadakat Uyelikleri
- Urun Ilgileri
- Sosyal Medya Profilleri
- Anket Yanitlari
- Hata Senaryolari
- UX Testleri
- Liste Sayfasi Ortak

### Adim 3: CSV Import
1. Sol menuden "Test Cases" tiklayin
2. Sag ust kosede "..." (more options) tiklayin
3. "Import" secin
4. "CSV" secin
5. `CRM_Test_Qase_Import.csv` dosyasini yukleyin
6. Alan eslemesini kontrol edin:
   - Title → Title
   - Description → Description
   - Pre-conditions → Pre-conditions
   - Steps → Steps
   - Expected result → Expected result
   - Priority → Priority
   - Type → Type
   - Suite → Suite
7. "Import" tiklayin

## CSV Dosyasi Formati

| Kolon | Aciklama | Ornek |
|-------|----------|-------|
| Title | Test case basligi | Yeni kurumsal musteri olusturma |
| Description | Detayli aciklama | Kurumsal musteri kaydinin basariyla olusturulmasini test eder |
| Pre-conditions | On kosullar | CRM modulune erisim yetkisi olan kullanici |
| Steps | Test adimlari (satir satir) | 1. Yeni Musteri tikla\n2. Form doldur |
| Expected result | Beklenen sonuc | Musteri basariyla olusturulur |
| Priority | Oncelik | Critical / High / Medium / Low |
| Type | Test tipi | Functional / Regression / Security |
| Layer | Test katmani | E2E / API / Unit |
| Is flaky | Tutarsiz test mi | Yes / No |
| Behavior | Test davranisi | Positive / Negative / Boundary |
| Automation status | Otomasyon durumu | Not automated / Automated |
| Suite | Test suite adi | Musteri Yonetimi |

## Import Sonrasi

### Test Run Olusturma
1. "Test Runs" menusune gidin
2. "Start new test run" tiklayin
3. Calistirmak istediginiz test casesleri secin
4. Test eden kisiyi atayin
5. Testleri calistirin ve sonuclari girin

### Bug Raporlama
Qase.io ile Jira, GitHub Issues entegrasyonu yapabilirsiniz:
1. Settings > Integrations
2. Jira veya GitHub secin
3. Baglanti kurun
4. Test sirasinda bug bulunca otomatik issue olusturun

## Mevcut Buglar

Import sonrasi asagidaki testler "Is flaky: Yes" olarak isaretlenmistir (bilinen buglar):

| Test | Bug ID | Sorun |
|------|--------|-------|
| TC Kimlik validasyonu | BUG-001 | Validasyon calismiyor |
| KVKK checkbox kaydi | BUG-002 | Checkbox state kaybolyor |
| Yeni lead olusturma | BUG-003 | Puan kaydedilmiyor |
| Lead rating butonlari | BUG-004 | Butonlar calismiyor |
| Yeni firsat olusturma | BUG-005 | Lead iliskisi gorunmuyor |
| Yeni kampanya olusturma | BUG-006 | Liste yenilenmiyor |
| Kampanya gerceklesen degerler | BUG-007 | Lead guncellenmedi |
| Duplikasyon hatasi | BUG-008 | Ingilizce mesaj |
| Yetkilendirme bypass | BUG-009 | URL korumasi yok |
| Kaydedilmemis degisiklik | BUG-010 | Uyari yok |
| Mobil responsive | BUG-011 | Layout bozuk |
| Tablet responsive | BUG-012 | Layout bozuk |

## Istatistikler

- **Toplam Test Case**: 104
- **Critical**: 24
- **High**: 32
- **Medium**: 40
- **Low**: 8
- **Functional**: 85
- **Regression**: 12
- **Security**: 1
- **Non-functional**: 6

## Faydali Linkler

- Qase.io Dokumantasyon: https://help.qase.io
- CSV Import Guide: https://help.qase.io/en/articles/5563700-import-test-cases
- API Dokumantasyon: https://developers.qase.io
