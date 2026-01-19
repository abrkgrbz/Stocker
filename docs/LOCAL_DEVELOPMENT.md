# Stocker - Local Development Guide (Without Docker)

Bu rehber, Stocker projesini Docker kullanmadan yerel ortamda çalıştırmak için gereken adımları açıklar.

## Gereksinimler

### Zorunlu
| Yazılım | Versiyon | İndirme |
|---------|----------|---------|
| PostgreSQL | 14+ | [postgresql.org](https://www.postgresql.org/download/windows/) |
| .NET SDK | 9.0 | [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/9.0) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |

### Opsiyonel (Performans için)
| Yazılım | Amaç | Not |
|---------|------|-----|
| Redis | Cache | Olmadan da çalışır (in-memory fallback) |
| RabbitMQ | Message Queue | Olmadan da çalışır |

## Hızlı Başlangıç

### 1. PostgreSQL Kurulumu

PostgreSQL'i indirip kurduktan sonra, veritabanlarını oluşturmak için:

```powershell
# PowerShell'de çalıştırın
.\scripts\setup-local-postgres.ps1
```

Varsayılan ayarlar:
- **Kullanıcı**: `stocker_user`
- **Şifre**: `stocker_pass`
- **Veritabanları**: `stocker_master`, `stocker_tenant`, `stocker_hangfire`

### 2. Frontend Ortam Değişkenleri

```powershell
# .env.local dosyasını oluşturun
cp stocker-nextjs\.env.example stocker-nextjs\.env.local
```

`.env.local` zaten doğru yerel ayarlarla yapılandırılmıştır:
- API: `http://localhost:5104`
- Frontend: `http://localhost:3000`

### 3. Uygulamayı Başlatın

**Otomatik Başlatma (Önerilen):**
```powershell
.\scripts\start-local.ps1
```

**Manuel Başlatma:**

Terminal 1 - Backend:
```powershell
cd src\API\Stocker.API
dotnet run --launch-profile http
```

Terminal 2 - Frontend:
```powershell
cd stocker-nextjs
npm install  # İlk seferde
npm run dev
```

## Multi-Tenant Subdomain Desteği

Stocker, multi-tenant bir uygulama olduğundan subdomain'ler üzerinden çalışır. Local development için `stocker.local` domain'ini kullanıyoruz.

### Hosts Dosyası Ayarı (Zorunlu)

1. Notepad'i **Admin olarak** açın
2. `C:\Windows\System32\drivers\etc\hosts` dosyasını açın
3. Şu satırları ekleyin:

```
# Stocker Local Development
127.0.0.1   stocker.local
127.0.0.1   auth.stocker.local
127.0.0.1   demo.stocker.local
127.0.0.1   test.stocker.local
```

4. Kaydedin

### URL'ler (Subdomain Desteği ile)

| Servis | URL |
|--------|-----|
| Root/Landing | http://stocker.local:3000 |
| Auth (Kayıt/Giriş) | http://auth.stocker.local:3000 |
| Demo Tenant | http://demo.stocker.local:3000 |
| Backend API | http://localhost:5104 |
| Swagger UI | http://localhost:5104/swagger |
| Hangfire Dashboard | http://localhost:5104/hangfire |

### Kayıt ve Giriş Akışı

1. **Kayıt**: http://auth.stocker.local:3000/register
   - Email, şifre ve takım adı girin
   - Takım adı subdomain olur (örn: "mycompany" → mycompany.stocker.local)

2. **Yeni Tenant için Hosts Güncelleme**:
   Yeni bir tenant oluşturduğunuzda, hosts dosyasına eklemeniz gerekir:
   ```
   127.0.0.1   mycompany.stocker.local
   ```

3. **Giriş**: http://auth.stocker.local:3000/login veya http://mycompany.stocker.local:3000/login

## Veritabanı Yapısı

```
PostgreSQL (localhost:5432)
├── stocker_master
│   ├── master (schema) - Tenant tanımları, sistem ayarları
│   └── cms (schema) - İçerik yönetimi
├── stocker_tenant
│   ├── tenant (schema) - Tenant verileri
│   └── crm (schema) - Müşteri ilişkileri
└── stocker_hangfire
    └── hangfire (schema) - Arka plan görevleri
```

## Sorun Giderme

### "psql not found" Hatası

PostgreSQL'in `bin` klasörünü PATH'e ekleyin:
```powershell
# Tipik Windows yolu
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
```

### Backend Başlamıyor

1. PostgreSQL servisinin çalıştığından emin olun:
```powershell
Get-Service postgresql*
```

2. Connection string'i kontrol edin (`src/API/Stocker.API/appsettings.Development.json`):
```json
{
  "ConnectionStrings": {
    "MasterConnection": "Host=localhost;Port=5432;Database=stocker_master;Username=stocker_user;Password=stocker_pass"
  }
}
```

### Frontend API'ye Bağlanamıyor

1. Backend'in çalıştığından emin olun: http://localhost:5104/swagger
2. `.env.local` dosyasındaki URL'leri kontrol edin:
```env
NEXT_PUBLIC_API_URL=http://localhost:5104
API_INTERNAL_URL=http://localhost:5104
```

### CORS Hataları

Backend zaten localhost için CORS'u aktif etmiştir. Eğer hala sorun yaşıyorsanız, `appsettings.Development.json` dosyasında CORS ayarlarını kontrol edin.

### Migration Hataları

Veritabanı migration'ları uygulama başlarken otomatik çalışır. İlk çalıştırmada birkaç dakika sürebilir.

## Geliştirme İpuçları

### Backend Hot Reload
```powershell
cd src\API\Stocker.API
dotnet watch run --launch-profile http
```

### Frontend Hot Reload
Next.js zaten hot reload ile gelir, `npm run dev` yeterli.

### Veritabanı Sıfırlama
```powershell
# Veritabanlarını silip yeniden oluşturmak için
psql -U postgres -c "DROP DATABASE IF EXISTS stocker_master;"
psql -U postgres -c "DROP DATABASE IF EXISTS stocker_tenant;"
psql -U postgres -c "DROP DATABASE IF EXISTS stocker_hangfire;"

# Sonra tekrar oluşturun
.\scripts\setup-local-postgres.ps1
```

## Dosya Yapısı

```
Stocker/
├── src/
│   └── API/
│       └── Stocker.API/           # Backend (ASP.NET Core)
│           ├── appsettings.Development.json
│           └── Properties/launchSettings.json
├── stocker-nextjs/                # Frontend (Next.js)
│   ├── .env.example
│   └── .env.local                 # Yerel ayarlar (git'e eklenmez)
├── scripts/
│   ├── setup-local-postgres.ps1  # DB kurulum scripti
│   └── start-local.ps1           # Başlatma scripti
└── docs/
    └── LOCAL_DEVELOPMENT.md      # Bu dosya
```
