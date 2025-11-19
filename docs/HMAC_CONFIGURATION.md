# HMAC Secret Configuration Guide

## Overview

HMAC (Hash-based Message Authentication Code) kullanarak veri bütünlüğü ve güvenli imzalama işlemleri gerçekleştirilir.

## Secret Key

**HMAC Secret Key**: `YojxNKH6zKpCREDa2nniWFCDfpqW1UMqipRi+MsH+kc=`

⚠️ **ÖNEMLİ**: Bu key production'da mutlaka Azure Key Vault'ta saklanmalıdır!

## Azure Key Vault'a Secret Ekleme

### Yöntem 1: PowerShell Script (Önerilen)

```powershell
# Script'i çalıştır
.\scripts\add-hmac-secret-to-keyvault.ps1 -KeyVaultName "your-keyvault-name"

# Farklı bir secret value ile
.\scripts\add-hmac-secret-to-keyvault.ps1 `
    -KeyVaultName "your-keyvault-name" `
    -SecretValue "YourBase64EncodedSecret"
```

### Yöntem 2: Azure CLI

```bash
# Key Vault'a secret ekle
az keyvault secret set \
    --vault-name your-keyvault-name \
    --name hmac-secret-key \
    --value "YojxNKH6zKpCREDa2nniWFCDfpqW1UMqipRi+MsH+kc="

# Secret'ı doğrula
az keyvault secret show \
    --vault-name your-keyvault-name \
    --name hmac-secret-key \
    --query "value"
```

### Yöntem 3: Azure Portal

1. Azure Portal'da Key Vault'unuza gidin
2. **Secrets** → **Generate/Import** tıklayın
3. Ayarlar:
   - **Name**: `hmac-secret-key`
   - **Value**: `YojxNKH6zKpCREDa2nniWFCDfpqW1UMqipRi+MsH+kc=`
   - **Content Type**: Leave empty or `application/octet-stream`
4. **Create** tıklayın

## Uygulama Yapılandırması

### Environment Variables

Key Vault'u kullanmak için şu environment variable'lar gerekli:

```bash
# Key Vault URI
AZURE_KEY_VAULT_URI=https://your-keyvault-name.vault.azure.net/

# Service Principal Credentials (Production)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
```

### Coolify/Docker Configuration

Coolify'da environment variables:

```env
AZURE_KEY_VAULT_URI=https://stocker-keyvault.vault.azure.net/
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=your-client-secret
```

### Local Development (appsettings.Development.json)

```json
{
  "Security": {
    "HmacSecretKey": "YojxNKH6zKpCREDa2nniWFCDfpqW1UMqipRi+MsH+kc="
  }
}
```

## Kullanım

### 1. Basit İmzalama

```csharp
public class MyService
{
    private readonly IHmacService _hmacService;

    public MyService(IHmacService hmacService)
    {
        _hmacService = hmacService;
    }

    public string SignData(string data)
    {
        // İmza oluştur
        string signature = _hmacService.GenerateSignature(data);
        return signature;
    }

    public bool VerifyData(string data, string signature)
    {
        // İmzayı doğrula
        return _hmacService.VerifySignature(data, signature);
    }
}
```

### 2. Zamanlı İmzalama (Expiration ile)

```csharp
public class TenantService
{
    private readonly IHmacService _hmacService;

    public TenantService(IHmacService hmacService)
    {
        _hmacService = hmacService;
    }

    public (string signature, long timestamp) GenerateTenantSignature(string tenantCode)
    {
        long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        string signature = _hmacService.GenerateTimestampedSignature(tenantCode, timestamp);

        return (signature, timestamp);
    }

    public bool VerifyTenantSignature(string tenantCode, long timestamp, string signature)
    {
        // 5 dakika geçerlilik süresi ile doğrula
        return _hmacService.VerifyTimestampedSignature(
            tenantCode,
            timestamp,
            signature,
            validityMinutes: 5
        );
    }
}
```

### 3. API Request İmzalama

```csharp
[HttpPost("secure-endpoint")]
public async Task<IActionResult> SecureEndpoint(
    [FromBody] SecureRequest request,
    [FromHeader(Name = "X-Signature")] string signature,
    [FromHeader(Name = "X-Timestamp")] long timestamp)
{
    // Request body'yi JSON'a çevir
    var requestData = JsonSerializer.Serialize(request);

    // İmzayı doğrula
    if (!_hmacService.VerifyTimestampedSignature(requestData, timestamp, signature))
    {
        return Unauthorized(new { error = "Invalid signature" });
    }

    // İşlemi gerçekleştir
    return Ok();
}
```

## Key Vault Configuration

### Naming Convention

Key Vault'ta secret ismi: `hmac-secret-key` (kebab-case)
Uygulama configuration: `Security:HmacSecretKey` (PascalCase:Nested)

Bu dönüşüm otomatik olarak `CustomKeyVaultSecretManager` tarafından yapılır.

### Key Rotation

HMAC key'i düzenli olarak rotate edilmelidir:

```powershell
# Yeni key oluştur (Python ile)
python -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"

# Key Vault'ta güncelle
az keyvault secret set \
    --vault-name your-keyvault-name \
    --name hmac-secret-key \
    --value "NewGeneratedKey"
```

⏰ **Önerilen Rotation Periyodu**: 90 gün

## Security Best Practices

1. ✅ **Key Vault Kullanın**: Production'da secret'ları asla kod/config'de saklamayın
2. ✅ **RBAC Kontrol**: Key Vault erişimini kısıtlayın (Least Privilege)
3. ✅ **Audit Logs**: Key Vault audit loglarını aktif tutun
4. ✅ **Key Rotation**: Düzenli olarak key'i yenileyin
5. ✅ **Secure Transport**: HTTPS zorunlu olmalı
6. ✅ **Timestamp Validation**: Replay attack'lere karşı timestamp kontrolü yapın

## Troubleshooting

### "HMAC Secret Key not configured" Warning

**Sebep**: Configuration'da `Security:HmacSecretKey` bulunamadı
**Çözüm**:
- Development: `appsettings.Development.json`'a ekleyin
- Production: Azure Key Vault'ta `hmac-secret-key` secret'ını oluşturun

### "Failed to configure Azure Key Vault" Error

**Sebep**: Azure Key Vault bağlantı hatası
**Çözüm**:
1. `AZURE_KEY_VAULT_URI` doğru mu kontrol edin
2. Service Principal credentials doğru mu
3. Key Vault'ta uygulamanın erişim yetkisi var mı

### "Invalid HMAC Secret Key format" Error

**Sebep**: Secret base64 formatında değil
**Çözüm**: Secret'ın base64 encoded olduğundan emin olun

```bash
# Base64 encode kontrolü
echo "YojxNKH6zKpCREDa2nniWFCDfpqW1UMqipRi+MsH+kc=" | base64 -d | wc -c
# Output: 32 (256 bit)
```

## Monitoring

Key Vault erişim logları için Azure Monitor:

```kusto
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.KEYVAULT"
| where OperationName == "SecretGet"
| where ResultSignature == "OK"
| where id_s contains "hmac-secret-key"
| project TimeGenerated, CallerIPAddress, identity_claim_appid_g
```

## Reference

- [Azure Key Vault Documentation](https://docs.microsoft.com/en-us/azure/key-vault/)
- [HMAC RFC 2104](https://datatracker.ietf.org/doc/html/rfc2104)
- [NIST HMAC Guidelines](https://csrc.nist.gov/projects/hash-functions)
