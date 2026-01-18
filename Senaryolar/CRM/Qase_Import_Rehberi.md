# Qase.io Import Rehberi

## Dosya Bilgisi
**Dosya**: `CRM_Test_Qase_Final.csv`
**Toplam Test**: 104
**Format**: UTF-8, virgül ayrımlı

## Hızlı Import Adımları

### 1. Qase.io Giriş
1. https://app.qase.io adresine gidin
2. Projenizi seçin (veya yeni oluşturun: "Stocker CRM")

### 2. CSV Import
1. Sol menüden **"Test Cases"** seçin
2. Sağ üstte **"..."** (üç nokta) tıklayın
3. **"Import"** seçin
4. **"CSV"** seçin
5. **`CRM_Test_Qase_Final.csv`** dosyasını yükleyin

### 3. Kolon Eşleme
Import sırasında şu eşlemeyi yapın:

| CSV Kolonu | Qase.io Alanı |
|------------|---------------|
| Title | Title |
| Suite | Suite |
| Description | Description |
| Preconditions | Pre-conditions |
| Steps | Steps |
| Expected result | Expected result |
| Priority | Priority |

### 4. Import'u Tamamlama
- "Import" butonuna tıklayın
- "104 cases imported" mesajını görmelisiniz

## Suite Listesi (Otomatik Oluşacak)

Import sonrası bu suite'ler otomatik oluşacak:

1. Musteri Yonetimi (10 test)
2. Lead Yonetimi (7 test)
3. Firsat Yonetimi (7 test)
4. Kampanya Yonetimi (4 test)
5. Deal Yonetimi (5 test)
6. Pipeline Yonetimi (4 test)
7. Segment Yonetimi (4 test)
8. Rakip Yonetimi (4 test)
9. Toplanti Yonetimi (4 test)
10. Cagri Kaydi Yonetimi (4 test)
11. Satis Ekibi Yonetimi (4 test)
12. Bolge Yonetimi (4 test)
13. Referans Yonetimi (4 test)
14. Aktivite Yonetimi (4 test)
15. Workflow Yonetimi (4 test)
16. Dokuman Yonetimi (4 test)
17. Sadakat Programi Yonetimi (4 test)
18. Sadakat Uyelikleri (4 test)
19. Urun Ilgileri (4 test)
20. Sosyal Medya Profilleri (4 test)
21. Anket Yanitlari (4 test)
22. Hata Senaryolari (3 test)
23. UX Testleri (2 test)
24. Liste Sayfasi Ortak (4 test)

## Bilinen Buglar

Aşağıdaki testler başlıklarında bug ID içerir:

| Bug ID | Test | Sorun |
|--------|------|-------|
| BUG-001 | TC Kimlik validasyonu | Validasyon çalışmıyor |
| BUG-002 | KVKK checkbox kaydi | State kaybolyor |
| BUG-003 | Yeni lead olusturma | Puan 0 görünüyor |
| BUG-004 | Lead rating butonlari | Butonlar çalışmıyor |
| BUG-005 | Yeni firsat olusturma | Lead görünmüyor |
| BUG-006 | Yeni kampanya olusturma | Liste yenilenmiyor |
| BUG-007 | Kampanya gerceklesen degerler | Lead güncellenmedi |
| BUG-008 | Duplikasyon hatasi | İngilizce mesaj |
| BUG-009 | Yetkilendirme bypass | URL koruması yok |
| BUG-010 | Kaydedilmemis degisiklik | Uyarı yok |
| BUG-011 | Mobil responsive | Layout bozuk |
| BUG-012 | Tablet responsive | Layout bozuk |

## İstatistikler

- **Toplam Test**: 104
- **Critical**: 24
- **High**: 32
- **Medium**: 48

## Sorun Giderme

### Import 0 Kayıt Gösteriyorsa:
1. Dosyanın UTF-8 kodlamasında olduğundan emin olun
2. Excel yerine Notepad veya VS Code ile açın
3. İlk satırın kolon başlıkları olduğunu kontrol edin

### Suite Oluşmuyorsa:
1. Manuel olarak suite oluşturun
2. Test case'leri ilgili suite'e sürükleyin

### Türkçe Karakterler Bozuksa:
1. CSV'yi UTF-8 with BOM olarak kaydedin
2. Veya Türkçe karakterleri ASCII eşdeğerleriyle değiştirin
