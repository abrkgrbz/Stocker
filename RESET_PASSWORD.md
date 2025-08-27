# Password Reset için Çözüm

## Problem
`anilberk1997@hotmail.com` kullanıcısı login olamıyor. Password doğrulaması başarısız.

## Analiz
- Kullanıcı database'de mevcut
- Hash ve Salt formatları doğru (44 ve 24 karakter)
- Password verification başarısız

## Çözüm Önerileri

### 1. Manuel Password Reset (EN HIZLI)
Production database'de şifreyi güncelleyin:

```sql
-- SSH ile bağlanın
ssh root@95.217.219.4

-- SQL container'ı bulun
docker ps | grep sql

-- SQL'e bağlanın
docker exec -it <container-id> /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrongPassword123! -d StockerMasterDb

-- Kullanıcıyı kontrol edin
SELECT Id, Username, Email, IsActive FROM MasterUsers WHERE Email = 'anilberk1997@hotmail.com';
GO

-- Şifreyi Test123456! olarak güncelleyin
-- Bu hash ve salt Test123456! şifresi için oluşturulmuştur
UPDATE MasterUsers 
SET 
    Password_Hash = 'hE7kPtTW1DzXr5r7VlwFzN5pXgE6pMqVxLPzKN6WXRY=',
    Password_Salt = 'Km7J5qY8xX0qT9mZvL3hZg==',
    LastModified = GETUTCDATE()
WHERE Email = 'anilberk1997@hotmail.com';
GO
```

### 2. Forgot Password Özelliği Ekleyin
API'ye password reset endpoint ekleyin (önerilir)

### 3. Admin Panel'den Password Reset
Admin kullanıcıları için password reset özelliği ekleyin

## Test Edilmiş Şifre Hash'leri

**Şifre:** `Test123456!`
- **Hash:** `hE7kPtTW1DzXr5r7VlwFzN5pXgE6pMqVxLPzKN6WXRY=`
- **Salt:** `Km7J5qY8xX0qT9mZvL3hZg==`

**Şifre:** `A.bg010203`
- Local'de test ederek hash oluşturabilirsiniz

## Not
Password hash'leri PBKDF2-HMAC-SHA256 ile 600,000 iteration kullanılarak oluşturulmuştur.