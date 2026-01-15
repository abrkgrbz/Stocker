# Logo ERP Veri Aktarımı Kılavuzu

Bu kılavuz, Logo Tiger/Go/Wings ERP sistemlerinden Stocker'a veri aktarımını açıklar.

## Desteklenen Veri Tipleri

### 1. Ürünler (Products)
Logo'dan Stocker'a aktarılabilir.

| Logo Alanı | Stocker Alanı | Zorunlu |
|------------|---------------|---------|
| StokKodu | Code | ✅ |
| StokAdi | Name | ✅ |
| Aciklama | Description | ❌ |
| Barkod | Barcode | ❌ |
| BirimKodu | Unit | ❌ |
| KdvOrani | VatRate | ❌ |
| SatisFiyati | SalePrice | ❌ |
| AlisFiyati | PurchasePrice | ❌ |
| ParaBirimi | Currency | ❌ (varsayılan: TRY) |

### 2. Müşteriler (Customers)
Logo'dan Stocker'a aktarılabilir.

| Logo Alanı | Stocker Alanı | Zorunlu |
|------------|---------------|---------|
| CariUnvani / MusteriAdi | Name | ✅ |
| Telefon / Tel | Phone | ❌ |
| Eposta / Mail | Email | ❌ |
| Adres | Address | ❌ |
| Sehir / Il | City | ❌ |
| Ilce | District | ❌ |
| PostaKodu | PostalCode | ❌ |
| Ulke | Country | ❌ (varsayılan: Türkiye) |
| VergiNo / VKN | TaxNumber | ❌ |
| VergiDairesi | TaxOffice | ❌ |

### 3. Kategoriler, Markalar, Birimler, Depolar, Tedarikçiler
Bu veriler **Inventory modülü** üzerinden yönetilir. Data Migration ile aktarılamazlar.

## API Kullanımı

### Adım 1: Migration Session Oluşturma

```bash
POST /api/tenant/data-migration/sessions
Content-Type: application/json
Authorization: Bearer {token}

{
  "sourceType": "Logo",
  "sourceName": "Logo Tiger 3",
  "entities": ["Product", "Customer"]
}
```

**Yanıt:**
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Created"
  }
}
```

### Adım 2: Veri Yükleme (Chunk'lar halinde)

```bash
POST /api/tenant/data-migration/sessions/{sessionId}/upload
Content-Type: application/json
Authorization: Bearer {token}

{
  "entityType": "Product",
  "chunkIndex": 0,
  "totalChunks": 1,
  "data": [
    {
      "StokKodu": "STK001",
      "StokAdi": "Laptop Dell Inspiron 15",
      "Barkod": "8690123456789",
      "BirimKodu": "ADET",
      "KdvOrani": 20,
      "SatisFiyati": 45000.00,
      "AlisFiyati": 38000.00,
      "ParaBirimi": "TRY"
    }
  ]
}
```

### Adım 3: Upload Tamamlama

```bash
POST /api/tenant/data-migration/sessions/{sessionId}/upload/complete
Authorization: Bearer {token}
```

### Adım 4: Mapping Yapılandırma (Opsiyonel)

Logo alan adları otomatik olarak tanınır. Özel mapping gerekiyorsa:

```bash
POST /api/tenant/data-migration/sessions/{sessionId}/mapping
Content-Type: application/json
Authorization: Bearer {token}

{
  "mappingConfig": {
    "Code": "StokKodu",
    "Name": "StokAdi",
    "Description": "Aciklama",
    "SalePrice": "SatisFiyati",
    "PurchasePrice": "AlisFiyati"
  }
}
```

### Adım 5: Validasyon

```bash
POST /api/tenant/data-migration/sessions/{sessionId}/validate
Authorization: Bearer {token}
```

### Adım 6: Validasyon Sonuçlarını Görüntüleme

```bash
GET /api/tenant/data-migration/sessions/{sessionId}/preview?pageSize=50
Authorization: Bearer {token}
```

**Yanıt:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 10,
    "validCount": 8,
    "warningCount": 1,
    "errorCount": 1,
    "records": [
      {
        "id": "...",
        "rowNumber": 1,
        "entityType": "Product",
        "status": "Valid",
        "originalData": {...}
      }
    ]
  }
}
```

### Adım 7: Import İşlemini Başlatma

```bash
POST /api/tenant/data-migration/sessions/{sessionId}/commit
Authorization: Bearer {token}
```

### Adım 8: İlerleme Takibi

```bash
GET /api/tenant/data-migration/sessions/{sessionId}/progress
Authorization: Bearer {token}
```

## Örnek Veri Dosyaları

- [logo-products.json](./logo-products.json) - 10 örnek ürün
- [logo-customers.json](./logo-customers.json) - 10 örnek müşteri

## Notlar

1. **Duplicate Kontrolü**:
   - Ürünler `Code` alanına göre kontrol edilir
   - Müşteriler `Name` alanına göre kontrol edilir
   - Zaten var olan kayıtlar atlanır

2. **Email Validasyonu**: Geçersiz email formatları hata verir

3. **Telefon Formatı**: Türkiye telefon formatları desteklenir

4. **Para Birimi**: Varsayılan TRY, USD ve EUR de desteklenir

## Hata Çözümleri

| Hata | Çözüm |
|------|-------|
| "Product code and name are required" | StokKodu ve StokAdi alanlarının dolu olduğundan emin olun |
| "Customer name is required" | CariUnvani veya MusteriAdi alanının dolu olduğundan emin olun |
| "Invalid email" | Email formatını kontrol edin (örn: info@firma.com) |
| "Invalid phone number" | Telefon numarasını kontrol edin |
