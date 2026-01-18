# Qase.io API Import Rehberi

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `CRM_Test_Qase_Import.json` | 104 test case (24 suite) |
| `qase_import.js` | Node.js import script |

## Adım Adım Kurulum

### 1. API Token Al

1. https://app.qase.io/user/api/token adresine git
2. **"Create new API token"** tıkla
3. Token adı: `Import Script`
4. Token'ı kopyala (bir kez gösterilir!)

### 2. Proje Oluştur (Yoksa)

1. https://app.qase.io/projects
2. **"Create Project"** tıkla
3. Name: `Stocker CRM`
4. Code: `CRM`
5. **"Create"** tıkla

### 3. Script'i Düzenle

`qase_import.js` dosyasını aç ve şu satırları düzenle:

```javascript
const API_TOKEN = 'YOUR_API_TOKEN_HERE';  // <-- Token'ı buraya yapıştır
const PROJECT_CODE = 'CRM';                // <-- Proje kodun
```

### 4. Script'i Çalıştır

```bash
cd C:\Users\PC\source\repos\Stocker\Senaryolar
node qase_import.js
```

### 5. Sonuç

Başarılı çıktı:
```
🚀 Qase.io Import Başlıyor...

📁 Proje: CRM
📊 Toplam Suite: 24
📋 Toplam Test Case: 104

✅ Suite oluşturuldu: Musteri Yonetimi (ID: 1)
  ✅ Test Case: Yeni kurumsal musteri olusturma
  ✅ Test Case: Bos form validasyonu
  ...

═══════════════════════════════════════
✅ Import Tamamlandı!
📁 Suite: 24/24
📋 Test Case: 104/104
═══════════════════════════════════════
```

## Sorun Giderme

### "Unauthorized" Hatası
- API Token yanlış veya süresi dolmuş
- Yeni token oluştur

### "Project not found" Hatası
- PROJECT_CODE yanlış
- Qase.io'da proje kodunu kontrol et

### "Rate limit" Hatası
- Script çok hızlı çalışıyor
- Bekleme süresini artır: `setTimeout(resolve, 500)`

## İstatistikler

### Suite'ler (24 adet)
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

### Bilinen Buglar (12 adet)
| Bug ID | Test | Sorun |
|--------|------|-------|
| BUG-001 | TC Kimlik validasyonu | Validasyon çalışmıyor |
| BUG-002 | KVKK checkbox kaydi | State kaybolyor |
| BUG-003 | Yeni lead olusturma | Puan 0 görünüyor |
| BUG-004 | Lead rating butonlari | Butonlar çalışmıyor |
| BUG-005 | Yeni firsat olusturma | Lead görünmüyor |
| BUG-006 | Yeni kampanya olusturma | Liste yenilenmiyor |
| BUG-007 | Kampanya gerceklesen | Lead güncellenmedi |
| BUG-008 | Duplikasyon hatasi | İngilizce mesaj |
| BUG-009 | Yetkilendirme bypass | URL koruması yok |
| BUG-010 | Kaydedilmemis degisiklik | Uyarı yok |
| BUG-011 | Mobil responsive | Layout bozuk |
| BUG-012 | Tablet responsive | Layout bozuk |

### Öncelik Dağılımı
- **Critical**: 24 test
- **High**: 32 test
- **Medium**: 48 test
