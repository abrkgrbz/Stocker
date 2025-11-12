# Güvenli Şifre Yönetimi Rehberi

## 🔐 Ücretsiz Çözümler (Önerilen)

### 1. Docker Secrets + .env.example Pattern (ÜCRETSİZ)
**En basit ve güvenli yöntem**

```bash
# .env.example (Git'e commit edilir)
DB_PASSWORD=your_password_here
SMTP_PASSWORD=your_smtp_password_here
JWT_SECRET=your_jwt_secret_here

# .env.local (Git'e commit EDİLMEZ)
DB_PASSWORD=RealPassword123!
SMTP_PASSWORD=RealSmtpPass456!
JWT_SECRET=RealJwtSecret789!
```

**Docker Compose ile kullanım:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
    env_file:
      - .env.local  # Production'da .env.production
```

### 2. GitHub Secrets (ÜCRETSİZ)
**GitHub Actions ile deployment için ideal**

```yaml
# .github/workflows/deploy.yml
env:
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

**Nasıl eklenir:**
1. GitHub repo → Settings → Secrets
2. "New repository secret" → İsim ve değer gir
3. CI/CD'de otomatik kullanılır

### 3. .NET User Secrets (Development için ÜCRETSİZ)
**Sadece development ortamı için**

```bash
# User Secrets başlat
dotnet user-secrets init

# Secret ekle
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=...;Password=RealPass"
dotnet user-secrets set "Jwt:Secret" "RealJwtSecret"
dotnet user-secrets set "Smtp:Password" "RealSmtpPassword"

# Secrets nerede saklanır?
# Windows: %APPDATA%\Microsoft\UserSecrets\<guid>\secrets.json
# Linux/Mac: ~/.microsoft/usersecrets/<guid>/secrets.json
```

```csharp
// Program.cs
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}
```

## 💰 Ücretli Çözümler (Kurumsal)

### Azure Key Vault (~$1/ay)
```csharp
// Program.cs
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());

// appsettings.json
"ConnectionString": "@Microsoft.KeyVault(SecretUri=https://yourvault.vault.azure.net/secrets/DbConnection/)"
```

### AWS Secrets Manager ($0.40/secret/ay)
```csharp
// NuGet: AWSSDK.SecretsManager
var client = new AmazonSecretsManagerClient(RegionEndpoint.USEast1);
var secret = await client.GetSecretValueAsync(new GetSecretValueRequest
{
    SecretId = "prod/db/password"
});
```

## 🚀 Önerilen Strateji (Sizin İçin)

### AŞAMA 1: Hemen (Ücretsiz)
```bash
# 1. Backend için (.NET)
cd src/API/Stocker.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Data Source=...;Password=YeniŞifre123!"
dotnet user-secrets set "Jwt:Secret" "YeniJwtSecret456!"
dotnet user-secrets set "Smtp:Password" "YeniSmtpPassword789!"

# 2. Frontend için (Next.js)
# .env.local dosyası zaten var, sadece .gitignore'a eklendiğinden emin ol
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# 3. Docker için
# .env.docker dosyası oluştur (Git'e ekleme!)
cp deployment/compose/services/api/.env deployment/compose/services/api/.env.example
# .env.example'da şifreleri placeholder yap
# .env'yi .gitignore'a ekle
```

### AŞAMA 2: Production'a Geçerken
```bash
# GitHub Secrets ekle
# Repository → Settings → Secrets → New secret

# Secrets:
DB_PASSWORD=ProductionDbPass123!
JWT_SECRET=ProductionJwtSecret456!
SMTP_PASSWORD=ProductionSmtpPass789!
SENTRY_DSN=https://...@sentry.io/...
```

### AŞAMA 3: İleride (Kurumsal)
- Azure Key Vault ($1/ay) veya
- HashiCorp Vault (self-hosted, ücretsiz)

## ⚠️ Güvenlik Kontrol Listesi

### YAPILACAKLAR:
- [x] .env.local dosyası .gitignore'da
- [ ] Tüm şifreler değiştirildi
- [ ] User Secrets kuruldu (backend)
- [ ] GitHub Secrets eklendi
- [ ] Docker secrets yapılandırıldı
- [ ] Production deployment testi

### YAPMAYACAKLAR:
- ❌ Şifreleri appsettings.json'a yazma
- ❌ .env dosyalarını commit etme
- ❌ Şifreleri loglama
- ❌ Şifreleri frontend koduna yazma

## 📝 Hızlı Kurulum Scripti

```bash
#!/bin/bash
# setup-secrets.sh

echo "🔐 Setting up secret management..."

# 1. Backend User Secrets
cd src/API/Stocker.API
dotnet user-secrets init

# 2. Prompt for passwords
read -sp "Enter DB Password: " DB_PASS
echo
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=StockerDb;User=sa;Password=$DB_PASS"

read -sp "Enter JWT Secret: " JWT_SECRET
echo
dotnet user-secrets set "Jwt:Secret" "$JWT_SECRET"

read -sp "Enter SMTP Password: " SMTP_PASS
echo
dotnet user-secrets set "Smtp:Password" "$SMTP_PASS"

# 3. Create .env.example files
echo "Creating example files..."
find . -name ".env" -exec cp {} {}.example \;
find . -name ".env.example" -exec sed -i 's/=.*/=YOUR_VALUE_HERE/g' {} \;

# 4. Update .gitignore
echo "Updating .gitignore..."
echo "*.env" >> .gitignore
echo ".env.*" >> .gitignore
echo "!.env.example" >> .gitignore
echo "!.env.*.example" >> .gitignore

echo "✅ Secret management setup complete!"
```

## 🎯 Sonuç

**Başlangıç için önerim:**
1. **.NET User Secrets** (Backend - Development)
2. **.env.local** (Frontend - Development)
3. **GitHub Secrets** (CI/CD - Production)
4. **Docker env files** (Deployment)

**Maliyet: $0** ✅

İleride büyürseniz Azure Key Vault'a geçebilirsiniz ($1/ay).