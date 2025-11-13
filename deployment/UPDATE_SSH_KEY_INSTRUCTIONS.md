# SSH Key'i Güncelleme Talimatları

## ✅ Mevcut Durum
Azure Key Vault'ta `docker-management-ssh-key` adında bir örnek SSH key var. Bu key'i gerçek SSH key ile değiştirmeniz gerekiyor.

## 📋 Gerçek SSH Key'i Ekleme Adımları

### Adım 1: Sunucudan Gerçek SSH Key'i Alın

```bash
# Sunucuya bağlanın
ssh root@95.217.219.4

# SSH key'i görüntüleyin (birini seçin)
cat ~/.ssh/docker_management_key   # Önerilen
# veya
cat ~/.ssh/id_rsa
# veya
cat ~/.ssh/id_ed25519
```

**ÖNEMLİ**: Tüm içeriği kopyalayın:
- `-----BEGIN OPENSSH PRIVATE KEY-----` ile başlamalı
- `-----END OPENSSH PRIVATE KEY-----` ile bitmeli

### Adım 2: Kopyaladığınız Key'i Bir Dosyaya Kaydedin

```powershell
# PowerShell'de
notepad real_ssh_key.txt
# Key'i yapıştırın ve kaydedin
```

### Adım 3: Azure Key Vault'taki Key'i Güncelleyin

```powershell
# PowerShell'de
cd C:\Users\PC\source\repos\Stocker\deployment

# Key'i güncelleyin (üzerine yazacak)
az keyvault secret set `
  --vault-name stocker-kv-prod `
  --name docker-management-ssh-key `
  --file real_ssh_key.txt

# Başarılıysa dosyayı silin
Remove-Item real_ssh_key.txt -Force
```

### Alternatif: Tek Satırda

Eğer key içeriğini clipboard'a kopyaladıysanız:

```powershell
# Key'i clipboard'dan dosyaya yazın
Get-Clipboard | Out-File -FilePath ssh_key.txt -NoNewline

# Azure'a yükleyin
az keyvault secret set --vault-name stocker-kv-prod --name docker-management-ssh-key --file ssh_key.txt

# Temizleyin
Remove-Item ssh_key.txt -Force
```

## 🔍 Doğrulama

Key'in güncellendiğini doğrulayın:

```powershell
# Son güncelleme zamanını kontrol edin
az keyvault secret show `
  --vault-name stocker-kv-prod `
  --name docker-management-ssh-key `
  --query "attributes.updated"
```

## 🚀 Deploy ve Test

1. **Coolify'da Deploy Edin**: Key otomatik olarak Azure Key Vault'tan alınacak
2. **Logları Kontrol Edin**: "SSH key loaded from Azure Key Vault" mesajını arayın
3. **Test Edin**: `/dashboard/system/docker-stats` sayfasını açın

## ⚠️ Önemli Notlar

- **Coolify Environment Variable'larında SSH key OLMAMALI**
- Sadece şunlar olmalı:
  - `DockerManagement__SshHost` = `95.217.219.4`
  - `DockerManagement__SshUser` = `root`
  - `AZURE_KEY_VAULT_ENDPOINT` = `https://stocker-kv-prod.vault.azure.net/`

## 🔒 Güvenlik

- SSH key'i güvenli tutun
- Asla Git'e commit etmeyin
- Test dosyalarını hemen silin
- Key Vault erişimlerini audit loglarından kontrol edin

## ❓ Sorun Giderme

### "Invalid key format" hatası
- Key'in tam olarak kopyalandığından emin olun
- Line ending'lerin doğru olduğunu kontrol edin (LF, not CRLF)

### "Access denied" hatası
- Service Principal'in Key Vault erişimi olduğunu kontrol edin
- Azure subscription'ının doğru olduğunu kontrol edin

### SSH bağlantı hatası
- Key'in sunucuda `authorized_keys`'e eklendiğinden emin olun
- Permissions'ların doğru olduğunu kontrol edin (600)