# 🧪 Postman Testing Guide - CRM Pipelines

Bu guide, CRM Pipeline endpoints'lerini Postman ile test etmek için hazırlanmıştır.

## 📥 Collection'ı İçe Aktarma

1. Postman'i aç
2. **Import** butonuna tıkla
3. `Stocker_CRM_Pipelines.postman_collection.json` dosyasını seç
4. Collection başarıyla içe aktarıldı!

## 🔧 Collection Variables

Collection otomatik olarak şu değişkenleri kullanır:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | `https://api.stoocker.app` | Production API URL |
| `tenant_code` | `abg-tech` | Tenant subdomain code |
| `access_token` | (empty) | JWT token (login sonrası otomatik dolar) |
| `pipeline_id` | (empty) | Test için pipeline ID (otomatik dolar) |
| `stage_id` | (empty) | Test için stage ID (otomatik dolar) |

### Local Test için Variables'ı Değiştirme

Eğer local backend'i test etmek istersen:

1. Collection'a sağ tıkla → **Edit**
2. **Variables** tab'ine git
3. `base_url` değerini değiştir:
   - Production: `https://api.stoocker.app`
   - Local: `http://localhost:5000`

## 🚀 Test Adımları (Sırasıyla)

### 1️⃣ Authentication

**Request**: `0. Authentication → Login (Get Token)`

- Bu endpoint'i çalıştır
- Access token otomatik olarak `{{access_token}}` variable'ına kaydedilir
- ✅ Test script sayesinde token'ı manuel olarak kopyalaman gerekmez

**Default Credentials**:
```json
{
  "email": "admin@stoocker.app",
  "password": "Admin123!"
}
```

**Response Example**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": 3600,
  "user": {
    "id": "...",
    "email": "admin@stoocker.app",
    "fullName": "System Administrator"
  }
}
```

### 2️⃣ Pipeline CRUD İşlemleri

#### GET All Pipelines
**Request**: `1. Pipelines - CRUD → Get All Pipelines`

- Tüm pipeline'ları listeler
- İlk pipeline'ın ID'si otomatik olarak `{{pipeline_id}}` variable'ına kaydedilir

#### GET Pipeline by ID
**Request**: `1. Pipelines - CRUD → Get Pipeline by ID`

- Belirli bir pipeline'ı getirir
- `{{pipeline_id}}` variable'ını kullanır

#### POST Create Pipeline
**Request**: `1. Pipelines - CRUD → Create Pipeline`

**Body Example** (Frontend'den gelen payload):
```json
{
  "name": "Test Sales Pipeline",
  "description": "Testing pipeline creation via Postman",
  "type": "Deal",
  "isActive": true,
  "isDefault": false,
  "stages": [
    {
      "name": "Yeni Fırsat",
      "description": "Yeni gelen fırsatlar",
      "order": 1,
      "probability": 10,
      "color": "#1890ff",
      "isWon": false,
      "isLost": false
    },
    {
      "name": "Teklif Hazırlama",
      "order": 2,
      "probability": 30,
      "color": "#52c41a",
      "isWon": false,
      "isLost": false
    },
    {
      "name": "Müzakere",
      "order": 3,
      "probability": 60,
      "color": "#faad14",
      "isWon": false,
      "isLost": false
    },
    {
      "name": "Kazanıldı",
      "order": 4,
      "probability": 100,
      "color": "#52c41a",
      "isWon": true,
      "isLost": false
    }
  ]
}
```

**Pipeline Type Values**:
- `Deal` - Fırsat süreci
- `Sales` - Satış süreci
- `Lead` - Potansiyel müşteri süreci
- `Custom` - Özel süreç

**Response**: 201 Created
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Test Sales Pipeline",
  "description": "Testing pipeline creation via Postman",
  "type": "Deal",
  "isActive": true,
  "isDefault": false,
  "stages": [
    {
      "id": "stage-guid-1",
      "name": "Yeni Fırsat",
      "order": 1,
      "probability": 10,
      "color": "#1890ff",
      "isWon": false,
      "isLost": false
    }
  ],
  "createdAt": "2025-10-27T00:00:00Z"
}
```

#### PUT Update Pipeline
**Request**: `1. Pipelines - CRUD → Update Pipeline`

- Pipeline bilgilerini günceller
- `{{pipeline_id}}` variable'ını kullanır

#### DELETE Pipeline
**Request**: `1. Pipelines - CRUD → Delete Pipeline`

- Pipeline'ı siler
- Response: 204 No Content (başarılı)

### 3️⃣ Stage Management

#### GET Pipeline Stages
**Request**: `2. Pipeline Stages → Get Pipeline Stages`

- Bir pipeline'ın tüm stage'lerini listeler

#### POST Add Stage
**Request**: `2. Pipeline Stages → Add Pipeline Stage`

- Mevcut pipeline'a yeni stage ekler

#### PUT Update Stage
**Request**: `2. Pipeline Stages → Update Pipeline Stage`

- Stage bilgilerini günceller

#### DELETE Stage
**Request**: `2. Pipeline Stages → Delete Pipeline Stage`

- Stage'i siler

#### POST Reorder Stages
**Request**: `2. Pipeline Stages → Reorder Pipeline Stages`

- Stage'lerin sırasını değiştirir

### 4️⃣ Pipeline Status

#### POST Activate
**Request**: `3. Pipeline Status → Activate Pipeline`

- Pipeline'ı aktif hale getirir

#### POST Deactivate
**Request**: `3. Pipeline Status → Deactivate Pipeline`

- Pipeline'ı pasif hale getirir

### 5️⃣ Statistics

#### GET Statistics
**Request**: `4. Pipeline Statistics → Get Pipeline Statistics`

- Pipeline istatistiklerini getirir (deal count, win rate, vb.)

## 🔍 Debugging Tips

### Token Expired Hatası
```json
{
  "status": 401,
  "detail": "Invalid credentials"
}
```

**Çözüm**: Login endpoint'ini tekrar çalıştır

### 400 Bad Request
Body'deki zorunlu alanları kontrol et:
- `name` (max 200 karakter)
- `type` (Deal, Sales, Lead, Custom)
- `stages` (en az 1 stage gerekli)
- Her stage için: `name`, `order`, `probability` (0-100)

### 404 Not Found
`{{pipeline_id}}` veya `{{stage_id}}` variable'larının dolu olduğundan emin ol

### Headers Eksik
Her request için şu header'lar otomatik eklenir:
- `Authorization: Bearer {{access_token}}`
- `X-Tenant-Code: {{tenant_code}}`
- `Content-Type: application/json`

## 📊 Test Scenarios

### Scenario 1: Tam Bir Pipeline Oluştur
1. ✅ Login (Get Token)
2. ✅ Create Pipeline (4 stage ile)
3. ✅ Get Pipeline by ID (doğrula)
4. ✅ Get Pipeline Statistics

### Scenario 2: Stage Ekle ve Düzenle
1. ✅ Login
2. ✅ Get All Pipelines (ID al)
3. ✅ Add Pipeline Stage (yeni stage)
4. ✅ Get Pipeline Stages (kontrol et)
5. ✅ Update Pipeline Stage
6. ✅ Reorder Stages

### Scenario 3: Pipeline Activate/Deactivate
1. ✅ Login
2. ✅ Get All Pipelines
3. ✅ Deactivate Pipeline
4. ✅ Get Pipeline by ID (isActive: false kontrol)
5. ✅ Activate Pipeline
6. ✅ Get Pipeline by ID (isActive: true kontrol)

## 🐛 Known Issues

### Frontend Modal Issue
Frontend'deki modal form validation'ı geçiyor ama backend'e istek gitmiyor. Bu Postman collection ile backend'in doğru çalıştığını test edebilirsin.

**Test Sonucu**:
- ✅ Backend pipeline creation çalışıyor → Frontend issue
- ❌ Backend pipeline creation çalışmıyor → Backend issue

## 📝 Notes

- **TenantId**: Backend otomatik olarak `X-Tenant-Code` header'ından tenant ID'yi resolve eder
- **Authorization**: Collection-level Bearer auth kullanır, her request'te token otomatik eklenir
- **Test Scripts**: Login ve pipeline creation'dan sonra ID'ler otomatik olarak variable'lara kaydedilir

## 🔗 Related Endpoints

Bu collection sadece Pipeline endpoints'lerini içerir. Diğer CRM modülleri:
- **Opportunities** (Fırsatlar)
- **Leads** (Potansiyel Müşteriler)
- **Activities** (Aktiviteler)
- **Campaigns** (Kampanyalar)

İhtiyaç olursa bu modüller için de ayrı collection'lar oluşturabiliriz.

## 🆘 Support

Sorun yaşarsan:
1. Postman Console'u aç (View → Show Postman Console)
2. Request/Response detaylarını kontrol et
3. Backend logs'u kontrol et (local development için)
4. Frontend console logs ile karşılaştır
