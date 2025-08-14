# SSH Permission Denied Hatası Çözümü - Hetzner VPS

## 🔍 Hata Nedenleri ve Çözümleri

### 1. Yanlış Kullanıcı Adı
Hetzner'de default kullanıcı adı `root` **olmayabilir**. Kontrol edin:

```bash
# root yerine bu kullanıcıları deneyin:
ssh ubuntu@VPS_IP
ssh debian@VPS_IP
ssh user@VPS_IP
```

### 2. SSH Key Authentication Gerekiyor
Hetzner genelde SSH key authentication kullanır. 

#### A. Hetzner Cloud Console'dan Kontrol Edin:
1. [Hetzner Cloud Console](https://console.hetzner.cloud) giriş yapın
2. Server'ınızı seçin
3. "Rescue" veya "Console" sekmesine gidin
4. VNC Console ile bağlanın (tarayıcı üzerinden)

#### B. Windows'ta SSH Key Oluşturma:

**PowerShell'de:**
```powershell
# SSH key oluştur (eğer yoksa)
ssh-keygen -t rsa -b 4096

# Default location: C:\Users\PC\.ssh\id_rsa
# Enter'a basarak default'u kabul edin
```

#### C. SSH Key'i VPS'e Ekleme (Hetzner Console üzerinden):
1. Hetzner Cloud Console → SSH Keys
2. "Add SSH Key" butonuna tıklayın
3. Public key'inizi ekleyin:

**Public key'inizi görüntüleyin:**
```powershell
# Windows PowerShell'de
type C:\Users\PC\.ssh\id_rsa.pub
```

### 3. Password Authentication Kapalı Olabilir
Eğer Hetzner'den email ile password aldıysanız:

```bash
# Password ile bağlanmayı zorla
ssh -o PreferredAuthentications=password root@VPS_IP

# veya
ssh -o PubkeyAuthentication=no root@VPS_IP
```

### 4. Hetzner Rescue Mode Kullanımı
Eğer hiçbiri çalışmazsa, Rescue Mode'u aktifleştirin:

1. Hetzner Cloud Console → Server → Rescue
2. "Enable Rescue & Power Cycle" tıklayın
3. Geçici root şifresi gösterilecek
4. Bu şifre ile bağlanın:
```bash
ssh root@VPS_IP
# Geçici şifreyi girin
```

### 5. Windows SSH Client Sorunları

#### A. OpenSSH Client Kurulu mu?
```powershell
# Windows'ta OpenSSH Client kontrolü
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Client*'

# Kurulu değilse yükleyin
Add-WindowsCapability -Online -Name OpenSSH.Client*
```

#### B. PuTTY Kullanarak Bağlanma:
1. [PuTTY İndir](https://www.putty.org/)
2. PuTTY açın:
   - Host Name: VPS_IP
   - Port: 22
   - Connection Type: SSH
3. Open'a tıklayın
4. Username: root
5. Password: Hetzner'den gelen şifre

### 6. SSH Port Değişmiş Olabilir
```bash
# Farklı port deneyin (Hetzner bazen 2222 kullanır)
ssh -p 2222 root@VPS_IP
```

## 🔐 Hetzner'den Gelen Email'i Kontrol Edin

Email'de şunlar olmalı:
```
Server IP: xxx.xxx.xxx.xxx
Username: root (veya başka bir kullanıcı)
Password: xxxxxxxxxx
```

## 🌐 Hetzner Web Console Kullanımı (En Kolay Yol)

1. [Hetzner Cloud Console](https://console.hetzner.cloud) giriş yapın
2. Server'ınızı seçin
3. Sağ üstte "Console" butonuna tıklayın (>_)
4. Açılan web terminal'de:
   - Username: root
   - Password: Hetzner'den gelen şifre

## 🛠️ Web Console'dan SSH Ayarlarını Düzeltme

Web Console'a girdikten sonra:

```bash
# Root password'ü değiştirin
passwd root

# SSH config'i düzenleyin
nano /etc/ssh/sshd_config

# Şu satırları bulun ve düzenleyin:
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes

# SSH servisini yeniden başlatın
systemctl restart sshd

# Firewall kontrol
ufw status
ufw allow 22/tcp
```

## 💡 Hızlı Çözüm Adımları

### Adım 1: Web Console ile Bağlanın
Hetzner Cloud → Server → Console (>_)

### Adım 2: Root Şifresini Sıfırlayın
```bash
passwd root
# Yeni şifre girin
```

### Adım 3: SSH Ayarlarını Düzeltin
```bash
# SSH password authentication'ı aktifleştir
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin no/PermitRootLogin yes/g' /etc/ssh/sshd_config
systemctl restart sshd
```

### Adım 4: Tekrar SSH Deneyin
```bash
ssh root@VPS_IP
# Yeni şifrenizi girin
```

## 📱 Mobil Uygulama Alternatifi

Hetzner Cloud mobil uygulamasını kullanabilirsiniz:
- iOS: App Store'da "Hetzner Cloud"
- Android: Play Store'da "Hetzner Cloud"

Uygulama üzerinden de Console erişimi mevcut.

## ❓ Hala Sorun Devam Ediyorsa

Bana şu bilgileri verin:
1. Hetzner'den gelen email'in içeriği (şifreleri gizleyerek)
2. Hangi SSH komutu ile bağlanmaya çalışıyorsunuz?
3. Tam hata mesajı nedir?
4. Windows mu, Mac mi, Linux mu kullanıyorsunuz?

## 🔧 Windows Terminal'de SSH Debug Mode

Detaylı hata görmek için:
```powershell
ssh -vvv root@VPS_IP
```

Bu size detaylı debug bilgisi verecek ve sorunu tespit etmemize yardımcı olacak.