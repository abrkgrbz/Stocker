# Server SSH Key Setup Instructions

Bu talimatları **SUNUCUDA (95.217.219.4)** uygulayın.

## Yöntem 1: Script Kullanarak (Önerilen)

### Adım 1: Script'i Sunucuya Kopyalayın

```bash
# Sunucuya SSH ile bağlanın
ssh root@95.217.219.4

# Script'i oluşturun
cat > /tmp/setup-docker-ssh.sh << 'EOF'
#!/bin/bash

echo "======================================"
echo "Docker Management SSH Key Setup"
echo "======================================"

SSH_KEY_PATH="/root/.ssh/docker_management_key"

# Check if key exists
if [ -f "$SSH_KEY_PATH" ]; then
    echo "Using existing key at $SSH_KEY_PATH"
else
    echo "Generating new SSH key..."
    ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "docker-management@stocker"

    # Add to authorized_keys
    cat "${SSH_KEY_PATH}.pub" >> /root/.ssh/authorized_keys
    chmod 600 /root/.ssh/authorized_keys
fi

# Convert to Base64
echo ""
echo "====== COOLIFY ENVIRONMENT VARIABLES ======"
echo ""
echo "DockerManagement__SshKeyBase64="
base64 -w 0 < "$SSH_KEY_PATH"
echo ""
echo ""
echo "DockerManagement__SshHost=95.217.219.4"
echo "DockerManagement__SshUser=root"
echo ""
echo "==========================================="
EOF

# Script'i çalıştırılabilir yapın
chmod +x /tmp/setup-docker-ssh.sh

# Script'i çalıştırın
/tmp/setup-docker-ssh.sh
```

### Adım 2: Base64 String'i Kopyalayın

Script çalıştıktan sonra uzun bir Base64 string göreceksiniz. Bu string'i kopyalayın.

### Adım 3: Coolify'a Ekleyin

1. Coolify dashboard'a gidin
2. Stocker uygulamanıza gidin
3. **Environment Variables** bölümüne gidin
4. Şu değişkenleri ekleyin:
   - `DockerManagement__SshKeyBase64` = [kopyaladığınız Base64 string]
   - `DockerManagement__SshHost` = `95.217.219.4`
   - `DockerManagement__SshUser` = `root`

## Yöntem 2: Manuel Kurulum

### Adım 1: Sunucuya Bağlanın

```bash
ssh root@95.217.219.4
```

### Adım 2: SSH Key Oluşturun veya Mevcut Key'i Kullanın

```bash
# Mevcut key'leri kontrol edin
ls -la ~/.ssh/

# Eğer id_rsa veya id_ed25519 varsa, onu kullanabilirsiniz
# Yoksa yeni bir key oluşturun:
ssh-keygen -t ed25519 -f ~/.ssh/docker_management_key -N ""

# Public key'i authorized_keys'e ekleyin (kendine SSH yapabilmesi için)
cat ~/.ssh/docker_management_key.pub >> ~/.ssh/authorized_keys
```

### Adım 3: Private Key'i Base64'e Çevirin

```bash
# Private key'i Base64 formatına çevirin
base64 -w 0 < ~/.ssh/docker_management_key

# veya mevcut key için:
base64 -w 0 < ~/.ssh/id_rsa
```

Bu komut çok uzun tek satırlık bir string üretecek. Bu string'i kopyalayın.

### Adım 4: Coolify'a Environment Variable Olarak Ekleyin

Coolify dashboard'da:
1. Applications → Stocker → Environment Variables
2. Add Variable:
   - Key: `DockerManagement__SshKeyBase64`
   - Value: [Base64 string'i yapıştırın]

## Test Etme

### Sunucuda Test

```bash
# SSH bağlantısını test edin
ssh -i ~/.ssh/docker_management_key root@localhost "docker --version"
```

### Uygulama Tarafında Test

Coolify'da deploy ettikten sonra:
1. Sentry'de hata loglarını kontrol edin
2. `/dashboard/system/docker-stats` sayfasını açın

## Güvenlik Notları

⚠️ **ÖNEMLİ**:
- Base64 string'i asla public repository'ye commit etmeyin
- Coolify'da "Secret" olarak işaretleyin
- SSH key'i düzenli olarak yenileyin (3-6 ayda bir)

## Sorun Giderme

### "Permission denied" Hatası
```bash
# Dosya izinlerini kontrol edin
chmod 600 ~/.ssh/docker_management_key
chmod 644 ~/.ssh/docker_management_key.pub
chmod 600 ~/.ssh/authorized_keys
```

### "Host key verification failed" Hatası
```bash
# Known hosts'a ekleyin
ssh-keyscan -H localhost >> ~/.ssh/known_hosts
ssh-keyscan -H 95.217.219.4 >> ~/.ssh/known_hosts
```

### Base64 String Çok Uzun
Base64 string genelde 2000-3000 karakter olur. Eğer Coolify'da sorun yaşarsanız:
1. String'in başında/sonunda boşluk olmamalı
2. Tek satır olmalı (line break olmamalı)
3. Coolify'ın "Large Text" seçeneğini kullanın

## Alternatif: Docker Socket Mount

Eğer SSH çalışmazsa, Docker socket'i mount edebilirsiniz:

```yaml
# docker-compose.yml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

Ancak bu güvenlik riski oluşturur, SSH key yöntemi daha güvenlidir.