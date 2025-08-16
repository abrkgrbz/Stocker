# Stocker API Dokümantasyonu

## 🚀 Swagger UI Erişim

API dokümantasyonuna aşağıdaki adreslerden erişebilirsiniz:

### Development Ortamı
- **Swagger UI**: http://localhost:5165/api-docs
- **JSON Spec**: http://localhost:5165/swagger/v1/swagger.json

### Swagger Endpoints
1. **General API (v1)**: Genel API endpoint'leri
2. **Master API**: Sistem yönetici API'leri (SystemAdmin rolü gerektirir)
3. **Admin API**: Tenant yönetici API'leri (TenantAdmin rolü gerektirir)

## 🔐 Authentication

API, JWT Bearer token authentication kullanır. Swagger UI üzerinden test etmek için:

1. `/api/auth/login` endpoint'ini kullanarak giriş yapın
2. Dönen `accessToken`'ı kopyalayın
3. Swagger UI'da "Authorize" butonuna tıklayın
4. `Bearer {token}` formatında token'ı girin
   - Örnek: `Bearer eyJhbGciOiJIUzI1NiIs...`

### Test Kullanıcıları

```json
// Admin Kullanıcı
{
  "email": "admin@stocker.com",
  "password": "Admin123!"
}

// Normal Kullanıcı
{
  "email": "user@tenant.com",
  "password": "User123!"
}
```

## 📚 API Grupları

### 1. Authentication API (`/api/auth`)
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/refresh-token` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### 2. Master API (`/api/master`)
- `GET /api/master/tenants` - Tüm tenant'ları listele
- `POST /api/master/tenants` - Yeni tenant oluştur
- `GET /api/master/tenants/{id}` - Tenant detayı
- `PUT /api/master/tenants/{id}` - Tenant güncelle

### 3. Admin API (`/api/admin`)
- `POST /api/admin/tenant-modules/{tenantId}/crm/enable` - CRM modülünü etkinleştir
- `POST /api/admin/tenant-modules/{tenantId}/crm/disable` - CRM modülünü devre dışı bırak
- `GET /api/admin/tenant-modules/{tenantId}/crm/status` - CRM durumunu kontrol et

### 4. CRM API (`/api/crm`)
- `GET /api/crm/customers` - Müşteri listesi
- `POST /api/crm/customers` - Yeni müşteri oluştur
- `GET /api/crm/leads` - Lead listesi
- `POST /api/crm/leads` - Yeni lead oluştur
- `POST /api/crm/leads/{id}/convert` - Lead'i müşteriye dönüştür

## 🛠️ Geliştirici Notları

### XML Dokümantasyon
Tüm controller'lar ve action'lar XML dokümantasyon içerir. Bu dokümantasyon Swagger UI'da otomatik olarak görüntülenir.

### Response Types
Her endpoint için beklenen response type'lar tanımlanmıştır:
- `200 OK` - Başarılı işlem
- `400 Bad Request` - Geçersiz istek
- `401 Unauthorized` - Yetkilendirme hatası
- `403 Forbidden` - Yetkisiz erişim
- `500 Internal Server Error` - Sunucu hatası

### Rate Limiting
API'de rate limiting uygulanmaktadır:
- Dakikada maksimum 60 istek
- Saatte maksimum 1000 istek

### CORS Policy
Development ortamında tüm origin'lere izin verilir. Production'da belirli domain'ler tanımlanmalıdır.

## 📝 Örnek İstekler

### Login İsteği
```bash
curl -X POST "http://localhost:5165/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stocker.com","password":"Admin123!"}'
```

### CRM Modülü Etkinleştirme
```bash
curl -X POST "http://localhost:5165/api/admin/tenant-modules/{tenantId}/crm/enable" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Müşteri Listesi Çekme
```bash
curl -X GET "http://localhost:5165/api/crm/customers" \
  -H "Authorization: Bearer {token}" \
  -H "X-Tenant-Id: {tenantId}"
```

## 🔧 Yapılandırma

### appsettings.json
```json
{
  "SwaggerSettings": {
    "Enabled": true,
    "RoutePrefix": "api-docs",
    "Title": "Stocker API",
    "Version": "v1"
  }
}
```

## 📊 API Versioning

API versioning henüz tam olarak uygulanmamıştır. Gelecekte aşağıdaki yapı kullanılacaktır:
- URL Path versioning: `/api/v1/`, `/api/v2/`
- Header versioning: `X-API-Version: 1.0`

## 🚨 Güvenlik Notları

1. Production'da Swagger UI'yı kapatmayı veya güvenli hale getirmeyi unutmayın
2. CORS policy'yi production domain'lerinize göre ayarlayın
3. JWT secret key'i güvenli bir şekilde saklayın
4. Rate limiting değerlerini ihtiyaçlarınıza göre ayarlayın
5. HTTPS kullanmayı unutmayın

## 📞 Destek

Sorularınız için: support@stocker.com