# Coolify Environment Variables Setup

Bu dosya Coolify UI'da tanımlanması gereken environment variable'ları içerir.

## ⚠️ ÖNEMLİ: Kaldırılması Gerekenler

Aşağıdaki değişkenleri Coolify'dan **KALDIR**:
- `DB_SERVER`
- `SA_PASSWORD`

Bu değişkenler Docker Compose ile uyumlu değil ve "variable cycle" hatasına neden oluyor.

## ✅ Eklenecek/Güncellenecek Environment Variables

### Database Connection Strings
**Connection string'leri tam olarak aşağıdaki formatta ekleyin:**

```bash
ConnectionStrings__MasterConnection=Server=coolify.stoocker.app;Database=StockerMasterDb;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=true;MultipleActiveResultSets=true

ConnectionStrings__TenantConnection=Server=coolify.stoocker.app;Database=StockerTenantDb;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=true;MultipleActiveResultSets=true

ConnectionStrings__DefaultConnection=Server=coolify.stoocker.app;Database=StockerTenantDb;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=true;MultipleActiveResultSets=true

ConnectionStrings__HangfireConnection=Server=coolify.stoocker.app;Database=StockerHangfireDb;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=true;MultipleActiveResultSets=true
```

**NOT:** `YourStrongPassword123!` yerine gerçek SQL Server şifrenizi kullanın.

### JWT Settings
```bash
JWT_SECRET=80a6b8dd9b2030989e031e6c45efb9fe75b24e91fa145a402d54d7cfcf30fc8c!
JWT_ISSUER=Stocker
JWT_AUDIENCE=Stocker
```

### Email Settings (SMTP)
```bash
SMTP_USERNAME=info@stoocker.app
SMTP_PASSWORD=A.bg010203
```

### Logging (Seq)
```bash
Logging__Seq__ServerUrl=http://seq:5341
Logging__Seq__ApiKey=1kCTahfs94uqcHLWZ5vl
Logging__Seq__MinimumLevel=Information
SEQ_API_KEY=1kCTahfs94uqcHLWZ5vl
```

### Storage (MinIO)
```bash
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=MinioPassword123!
```

### Redis
```bash
REDIS_PASSWORD=RedisPassword123!
```

### Service URLs
```bash
SERVICE_FQDN_API=api.stoocker.app
SERVICE_URL_API=https://api.stoocker.app
```

## 🔧 Adım Adım Kurulum

1. **Coolify UI'da Application'ınıza gidin**
2. **Environment Variables sekmesine tıklayın**
3. **Şu değişkenleri KALDIR:**
   - `DB_SERVER`
   - `SA_PASSWORD`
4. **Yukarıdaki tüm değişkenleri ekleyin/güncelleyin**
5. **Sensitive değişkenleri "Secret" olarak işaretleyin:**
   - Connection strings (tüm `ConnectionStrings__*`)
   - `JWT_SECRET`
   - `SMTP_PASSWORD`
   - `SA_PASSWORD` içeren tüm değerler
   - `MINIO_ROOT_PASSWORD`
   - `REDIS_PASSWORD`
   - `SEQ_API_KEY`
6. **Save & Redeploy**

## ✅ Doğrulama

Deploy sonrası kontrol edin:
- Build hatası almadığınızdan emin olun
- API'nin `/health` endpoint'ine istek atın: `https://api.stoocker.app/health`
- Logs'ta database connection hatası olmadığını kontrol edin

## 🐛 Sorun Giderme

### "variable cycle not allowed" hatası alıyorsanız:
- `DB_SERVER` ve `SA_PASSWORD` değişkenlerini kaldırdığınızdan emin olun
- Connection string'leri `${...}` syntax'ı kullanmadan, tam olarak yazdığınızdan emin olun

### Database connection hatası alıyorsanız:
- Connection string'lerdeki server adresini kontrol edin (`coolify.stoocker.app` doğru mu?)
- SQL Server şifresinin doğru olduğunu kontrol edin
- SQL Server container'ının çalıştığını kontrol edin
