# Backend Authentication Implementation Guide

## ✅ İmplement Edilenler

### 1. CheckEmail Query ✅
**Dosyalar**:
- `CheckEmailQuery.cs` - Query definition
- `CheckEmailQueryHandler.cs` - Handler with HMAC signature

**Özellikler**:
- Email existence kontrolü
- Tenant bilgisi döndürme
- HMAC signature generation (tenant verification için)
- Master database'den user + tenant lookup

## ⏳ İmplement Edilecekler

### 2. Password Recovery Commands (3 adet)

#### A. ForgotPasswordCommand
```csharp
// Dosya: Features/Identity/Commands/ForgotPassword/ForgotPasswordCommand.cs
public record ForgotPasswordCommand : IRequest<Result<ForgotPasswordResponse>>
{
    public string Email { get; init; } = string.Empty;
}

public class ForgotPasswordResponse
{
    public bool EmailSent { get; set; }
    public string Message { get; set; } = string.Empty;
}
```

**Handler Görevleri**:
- Email kontrolü (user var mı?)
- Token generation (GeneratePasswordResetTokenAsync - zaten var)
- Email gönderimi (IEmailService kullan)
- Rate limiting (1 saat içinde max 3 istek)

#### B. ValidateResetTokenQuery
```csharp
// Dosya: Features/Identity/Queries/ValidateResetToken/ValidateResetTokenQuery.cs
public record ValidateResetTokenQuery : IRequest<Result<ValidateResetTokenResponse>>
{
    public string Token { get; init; } = string.Empty;
}

public class ValidateResetTokenResponse
{
    public bool Valid { get; set; }
    public DateTime ExpiresAt { get; set; }
}
```

**Handler Görevleri**:
- Token validation (ValidateTokenAsync - zaten var)
- Expiry check
- Return validation result

#### C. ResetPasswordCommand
```csharp
// Dosya: Features/Identity/Commands/ResetPassword/ResetPasswordCommand.cs
public record ResetPasswordCommand : IRequest<Result<ResetPasswordResponse>>
{
    public string Token { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
}

public class ResetPasswordResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
```

**Handler Görevleri**:
- Token validation
- Password strength check (8+ chars, complexity)
- ResetPasswordAsync çağrısı (zaten var)
- Token invalidation (tek kullanımlık)
- Success response

### 3. 2FA Commands (4 adet)

#### A. Setup2FACommand
```csharp
// Dosya: Features/Identity/Commands/Setup2FA/Setup2FACommand.cs
public record Setup2FACommand : IRequest<Result<Setup2FAResponse>>
{
    public string UserId { get; init; } = string.Empty;
}

public class Setup2FAResponse
{
    public string Secret { get; set; } = string.Empty;
    public string QrCodeUrl { get; set; } = string.Empty;
    public string ManualEntryKey { get; set; } = string.Empty;
    public List<string> BackupCodes { get; set; } = new();
}
```

**Handler Görevleri**:
- User lookup
- Generate TOTP secret (Base32)
- Generate QR code URL (otpauth://totp/...)
- Generate 10 backup codes (8 chars each)
- Store secret (encrypted) in user table
- Return setup data

**NuGet Package**: `OtpNet` veya `GoogleAuthenticator`

#### B. Enable2FACommand
```csharp
public record Enable2FACommand : IRequest<Result<Enable2FAResponse>>
{
    public string UserId { get; init; } = string.Empty;
    public string VerificationCode { get; init; } = string.Empty;
}

public class Enable2FAResponse
{
    public bool Enabled { get; set; }
    public string Message { get; set; } = string.Empty;
}
```

**Handler Görevleri**:
- Verify TOTP code
- Update User.TwoFactorEnabled = true
- Save to database
- Return success

#### C. Verify2FACommand
```csharp
public record Verify2FACommand : IRequest<Result<AuthResponse>>
{
    public string Email { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public bool IsBackupCode { get; init; }
}
```

**Handler Görevleri**:
- User lookup
- If backup code → verify & mark as used
- If TOTP code → verify with OtpNet
- Generate JWT tokens
- Return AuthResponse

#### D. Disable2FACommand
```csharp
public record Disable2FACommand : IRequest<Result>
{
    public string UserId { get; init; } = string.Empty;
    public string VerificationCode { get; init; } = string.Empty;
}
```

**Handler Görevleri**:
- Verify current 2FA code (security)
- Update User.TwoFactorEnabled = false
- Clear TwoFactorSecret
- Return success

## 📦 Gerekli NuGet Packages

```bash
# 2FA için
dotnet add package OtpNet --version 1.9.2

# QR Code generation (opsiyonel, frontend yapabilir)
dotnet add package QRCoder --version 1.4.3

# Email gönderimi (varsa kullan)
# FluentEmail, MailKit, veya SendGrid
```

## 🗄️ Database Schema Changes

### User Entity'ye Eklenecekler

```csharp
public class User
{
    // Mevcut fieldlar...

    // 2FA Fields
    public bool TwoFactorEnabled { get; set; }
    public string? TwoFactorSecret { get; set; }  // Encrypted TOTP secret
    public List<BackupCode>? BackupCodes { get; set; }  // JSON or separate table

    // Password Reset
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpires { get; set; }
}

public class BackupCode
{
    public string Code { get; set; } = string.Empty;
    public bool Used { get; set; }
    public DateTime? UsedAt { get; set; }
}
```

### Migration

```bash
dotnet ef migrations add Add2FAAndPasswordResetFields -p Infrastructure -s API
dotnet ef database update -p Infrastructure -s API
```

## 🔐 Security Best Practices

### TOTP Secret Storage
```csharp
// Encrypt secret before storing
public string EncryptTOTPSecret(string secret)
{
    // Use Data Protection API or similar
    var protector = _dataProtectionProvider.CreateProtector("TOTPSecrets");
    return protector.Protect(secret);
}

public string DecryptTOTPSecret(string encryptedSecret)
{
    var protector = _dataProtectionProvider.CreateProtector("TOTPSecrets");
    return protector.Unprotect(encryptedSecret);
}
```

### Password Reset Token
```csharp
// Token should be:
// - Cryptographically random (32 bytes)
// - URL-safe (Base64Url)
// - Single-use
// - Expire after 1 hour

public string GeneratePasswordResetToken()
{
    var tokenBytes = RandomNumberGenerator.GetBytes(32);
    return Convert.ToBase64String(tokenBytes)
        .Replace('+', '-')
        .Replace('/', '_')
        .TrimEnd('=');
}
```

## 🚀 Implementation Order (Öncelik Sırası)

### Aşama 1: Password Recovery (En Basit) ✅
1. ✅ CheckEmailQuery - Tamamlandı
2. ⏳ ForgotPasswordCommand
3. ⏳ ValidateResetTokenQuery
4. ⏳ ResetPasswordCommand

**Sebep**: Mevcut servisler zaten var (GeneratePasswordResetTokenAsync, ResetPasswordAsync), sadece CQRS wrapper'ları lazım.

### Aşama 2: 2FA (Orta Zorluk)
1. Setup2FACommand - TOTP secret + QR generation
2. Enable2FACommand - Verification + DB update
3. Verify2FACommand - Login sırasında 2FA check
4. Disable2FACommand - 2FA kapatma

**Sebep**: Yeni NuGet package ve database fieldları gerekiyor.

## 📝 AuthController'a Eklenecek Endpoint'ler

```csharp
// CheckEmail - TAMAMLANDI ✅
[HttpPost("check-email")]
[AllowAnonymous]
public async Task<IActionResult> CheckEmail([FromBody] CheckEmailQuery query)
{
    var result = await _mediator.Send(query);
    return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
}

// Password Recovery
[HttpPost("forgot-password")]
[AllowAnonymous]
public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command) { }

[HttpGet("validate-reset-token")]
[AllowAnonymous]
public async Task<IActionResult> ValidateResetToken([FromQuery] string token) { }

[HttpPost("reset-password")]
[AllowAnonymous]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command) { }

// 2FA
[HttpPost("setup-2fa")]
[Authorize]
public async Task<IActionResult> Setup2FA() { }

[HttpPost("enable-2fa")]
[Authorize]
public async Task<IActionResult> Enable2FA([FromBody] Enable2FACommand command) { }

[HttpPost("verify-2fa")]
[AllowAnonymous]  // Login sırasında çağrılacak
public async Task<IActionResult> Verify2FA([FromBody] Verify2FACommand command) { }

[HttpPost("disable-2fa")]
[Authorize]
public async Task<IActionResult> Disable2FA([FromBody] Disable2FACommand command) { }
```

## ✅ Test Senaryoları

### CheckEmail Test ✅
```bash
curl -X POST http://localhost:5104/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Response:
{
  "exists": true,
  "tenant": {
    "code": "abc123",
    "name": "ABC Company",
    "signature": "base64-hmac-signature",
    "timestamp": 1234567890
  }
}
```

### Password Reset Flow
```bash
# 1. Request reset
POST /api/auth/forgot-password
{ "email": "user@example.com" }

# 2. Validate token
GET /api/auth/validate-reset-token?token=xyz

# 3. Reset password
POST /api/auth/reset-password
{ "token": "xyz", "newPassword": "NewPass123!" }
```

### 2FA Flow
```bash
# 1. Setup
POST /api/auth/setup-2fa
Authorization: Bearer {token}

# 2. Enable (with verification)
POST /api/auth/enable-2fa
{ "userId": "...", "verificationCode": "123456" }

# 3. Login with 2FA
POST /api/auth/login → requires2FA: true
POST /api/auth/verify-2fa
{ "email": "...", "code": "123456" }
```

## 🎯 Sonuç

✅ **Tamamlanan**: CheckEmail Query + Handler
⏳ **Kalan**: 7 Command/Query (3 password + 4 2FA)

**Tahmini Süre**:
- Password Recovery: 2-3 saat
- 2FA Implementation: 4-5 saat
- Testing & Bug Fixes: 2-3 saat

**Toplam**: ~8-11 saat geliştirme süresi
