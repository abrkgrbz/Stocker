# 🔐 Güvenlik Güncellemeleri Uygulama Kılavuzu

## ✅ Tamamlanan İşlemler

### 1. Environment Variables Yapısı Oluşturuldu
- ✅ `.env.example` dosyası oluşturuldu
- ✅ `.gitignore.security` dosyası eklendi
- ✅ `SecureSettings.cs` configuration manager oluşturuldu

### 2. Hangfire Security Düzeltildi
- ✅ Authorization filter güncellendi
- ✅ Production'da authentication zorunlu hale getirildi

### 3. Encryption Service Eklendi
- ✅ `EncryptionService.cs` oluşturuldu
- ✅ Password hashing ve data encryption desteği

## 📋 Yapılması Gereken Güncellemeler

### ADIM 1: .env Dosyası Oluştur
```bash
# 1. .env.example'ı kopyala
cp .env.example .env

# 2. .env dosyasını düzenle ve ŞİFRELERİ DEĞİŞTİR!
# ÖNEMLİ: Tüm "ChangeThis..." ile başlayan değerleri değiştir
```

### ADIM 2: Program.cs Güncellemesi

**Program.cs dosyasına eklenecek (üst kısma):**
```csharp
using Stocker.SharedKernel.Configuration;
using Stocker.Infrastructure.Services;

// Load environment variables
DotNetEnv.Env.Load(); // NuGet: DotNetEnv paketi ekle

var builder = WebApplication.CreateBuilder(args);

// Add secure settings
builder.Services.AddSecureSettings(builder.Configuration);

// Add encryption service
builder.Services.AddEncryptionService(builder.Configuration);
```

### ADIM 3: appsettings.json Temizliği

**appsettings.json'dan KALDIRILACAKLAR:**
```json
// Bu satırları SİL:
"DefaultAdminPassword": "Admin123!",
"Password=YourStrongPassword123!",
"SmtpPassword": "plaintext-password"
```

**Yerine eklenecek:**
```json
{
  "ConnectionStrings": {
    // Boş bırak, SecureSettings'den gelecek
  },
  "JwtSettings": {
    // Secret hariç diğer ayarlar kalabilir
    "Issuer": "https://api.stoocker.app",
    "Audience": "https://stoocker.app"
  }
}
```

### ADIM 4: Docker-compose Güncellemesi

**docker-compose.yml güncellemesi:**
```yaml
version: '3.8'

services:
  api:
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      # Diğer env variables...
    env_file:
      - .env  # .env dosyasından oku
```

### ADIM 5: Email Settings Controller Güncellemesi

**SettingsController.cs düzeltmesi:**
```csharp
// ESKİ KOD:
emailSettings["smtpPassword"] = request.SmtpPassword; // TODO: Encrypt

// YENİ KOD:
[HttpPost("email")]
public async Task<IActionResult> UpdateEmailSettings(UpdateEmailSettingsRequest request)
{
    // Encrypt password before saving
    var encryptedPassword = _encryptionService.Encrypt(request.SmtpPassword);
    
    var settings = new Dictionary<string, string>
    {
        ["smtpHost"] = request.SmtpHost,
        ["smtpPort"] = request.SmtpPort.ToString(),
        ["smtpUser"] = request.SmtpUser,
        ["smtpPassword"] = encryptedPassword, // Artık şifreli!
        ["smtpEnableSsl"] = request.EnableSsl.ToString()
    };
    
    await _settingsService.UpdateEmailSettings(settings);
    return Ok();
}
```

### ADIM 6: Startup Validation

**Program.cs'e ekle:**
```csharp
var app = builder.Build();

// Validate secure configuration on startup
using (var scope = app.Services.CreateScope())
{
    var secureSettings = scope.ServiceProvider.GetRequiredService<SecureSettings>();
    secureSettings.ValidateConfiguration();
    
    Console.WriteLine("✅ Security configuration validated successfully!");
}
```

## 🚨 ÖNEMLİ UYARILAR

### ⚠️ Production'a Geçmeden Önce YAPILMASI ZORUNLU:

1. **TÜM default şifreleri değiştir**
2. **.env dosyasını GİT'e ekleme!** (.gitignore'a ekle)
3. **Azure Key Vault veya benzeri bir secret management kullan**
4. **SSL/TLS sertifikası kur**
5. **CORS origins'i production URL'leri ile güncelle**

### 🔐 Güvenlik Kontrol Listesi:

- [ ] .env dosyası oluşturuldu ve şifreler değiştirildi
- [ ] appsettings.json'dan tüm şifreler kaldırıldı
- [ ] Hangfire authorization düzeltildi
- [ ] Email şifreleri artık encrypted
- [ ] Docker-compose env variables kullanıyor
- [ ] Program.cs güncellendi
- [ ] Git'e .env eklenmediğinden emin olundu

## 📦 Gerekli NuGet Paketleri

```xml
<PackageReference Include="DotNetEnv" Version="2.5.0" />
<PackageReference Include="Microsoft.AspNetCore.DataProtection" Version="8.0.0" />
```

## 🧪 Test Etme

### 1. Configuration Test:
```bash
# .env dosyasını oluşturduktan sonra
dotnet run

# Konsol çıktısında görmelisin:
# ✅ Security configuration validated successfully!
```

### 2. Hangfire Test:
```
1. https://localhost:5001/hangfire adresine git
2. Login ekranı gelmeli
3. Admin credentials ile giriş yap
```

### 3. Email Encryption Test:
```csharp
// Test controller'a ekle
[HttpGet("test-encryption")]
public IActionResult TestEncryption()
{
    var original = "MySecretPassword123!";
    var encrypted = _encryptionService.Encrypt(original);
    var decrypted = _encryptionService.Decrypt(encrypted);
    
    return Ok(new 
    {
        Original = original,
        Encrypted = encrypted,
        Decrypted = decrypted,
        Success = original == decrypted
    });
}
```

## 🎯 Sonraki Adımlar

1. **Azure Key Vault entegrasyonu** (Production için)
2. **SSL/TLS sertifikası kurulumu**
3. **Security headers ekleme** (HSTS, CSP, etc.)
4. **Rate limiting implementasyonu**
5. **Audit logging ekleme**

---

**NOT**: Bu güvenlik güncellemeleri HEMEN uygulanmalıdır. Production'a çıkmadan önce mutlaka tüm kontrol listesi tamamlanmalıdır!