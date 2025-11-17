# Stocker Deployment Checklist

## Production Deployment için Gerekli Ortam Değişkenleri

### Coolify'da Tanımlanması Gereken Environment Variables:

#### Database (ZORUNLU)
```bash
SA_PASSWORD=YourStrongSQLPassword123!
DB_SERVER=mssql  # veya SQL Server container/service adı
```

#### JWT Authentication (ZORUNLU)
```bash
JwtSettings__Secret=YourVeryLongSecretKeyHere-Min32Characters!
```

#### Email Settings
```bash
EmailSettings__SmtpHost=smtp.gmail.com
EmailSettings__SmtpPort=465
EmailSettings__SmtpUsername=your-email@gmail.com
EmailSettings__SmtpPassword=your-app-password
EmailSettings__FromEmail=noreply@stoocker.app
EmailSettings__EnableEmail=true
```

#### Serilog & Seq
```bash
Serilog__WriteTo__0__Args__apiKey=your-seq-api-key
```

#### Azure Key Vault (Opsiyonel)
```bash
AZURE_KEY_VAULT_URI=https://your-keyvault.vault.azure.net/
```

## Deployment Sonrası Kontrol Listesi

### 1. Database Migration Kontrolü
Container loglarında şunları kontrol edin:
```
✅ "Running Master database migrations..."
✅ "Master migration succeeded" veya "Database already up to date"
✅ "Running Tenant database migrations..."
✅ "Tenant migration succeeded" veya "Database already up to date"
```

Eğer bu loglar görünmüyorsa:
- SA_PASSWORD ve DB_SERVER environment variables kontrol edin
- SQL Server container'ın çalıştığından emin olun
- Network bağlantısını kontrol edin

### 2. Application Startup Kontrolü
```
✅ "Stocker API started successfully"
✅ "Hangfire SQL objects installed"
✅ "CORS policy configured"
```

### 3. Health Check
```bash
curl http://your-app:5000/health
# Beklenen: 200 OK
```

### 4. Database Kontrol (SQL Server'a bağlanarak)
```sql
-- Master database kontrolü
SELECT name FROM sys.databases WHERE name LIKE 'Stocker%'
-- Beklenen: StockerMasterDb, StockerTenantDb, StockerHangfireDb

-- Master DB tabloları
USE StockerMasterDb;
SELECT name FROM sys.tables;
-- Beklenen: Tenants, MasterUsers, Packages, vb.

-- Tenant DB tabloları
USE StockerTenantDb;
SELECT name FROM sys.tables;
-- Beklenen: SetupWizards, SetupWizardSteps, Companies, vb.
```

## Troubleshooting

### Problem: Veritabanları oluşturulmuyor
**Çözüm 1**: Environment variables kontrol
```bash
# Coolify'da kontrol edin:
SA_PASSWORD=?
DB_SERVER=?
```

**Çözüm 2**: Container loglarına bakın
```bash
docker logs <container-name> | grep -i "migration"
docker logs <container-name> | grep -i "error"
```

**Çözüm 3**: SQL Server bağlantısını test edin
```bash
# Container içinden SQL Server'a bağlanmayı deneyin
docker exec -it <container-name> bash
curl -v telnet://mssql:1433
```

### Problem: Migration başarısız oluyor
**Muhtemel Sebepler**:
1. SQL Server henüz hazır değil (başlatma süresi)
2. SA_PASSWORD yanlış
3. Network bağlantısı yok
4. Port 1433 kapalı

**Çözüm**: Restart policy ekleyin
```yaml
restart: unless-stopped
depends_on:
  mssql:
    condition: service_healthy
```

### Problem: Uygulama çalışıyor ama database boş
**Sebep**: Migration başarısız ama uygulama yine de başladı (startup.sh satır 107, 122)

**Çözüm**: Logları kontrol edin ve migration'ı manuel çalıştırın:
```bash
docker exec -it <container-name> bash
./efbundle-master --connection "Server=mssql;Database=StockerMasterDb;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
./efbundle-tenant --connection "Server=mssql;Database=StockerTenantDb;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
```

## Quick Fix: Connection String Doğrudan Ekleme (Test için)

**⚠️ GÜVENLİ DEĞİL - Sadece test için!**

`appsettings.Production.json` dosyasında:
```json
{
  "ConnectionStrings": {
    "MasterConnection": "Server=mssql;Database=StockerMasterDb;User Id=sa;Password=YourPassword;TrustServerCertificate=true",
    "TenantConnection": "Server=mssql;Database=StockerTenantDb;User Id=sa;Password=YourPassword;TrustServerCertificate=true",
    "DefaultConnection": "Server=mssql;Database=StockerTenantDb;User Id=sa;Password=YourPassword;TrustServerCertificate=true",
    "HangfireConnection": "Server=mssql;Database=StockerHangfireDb;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
  }
}
```

**Production için doğru yöntem**: Azure Key Vault veya Coolify Environment Variables kullanın!
