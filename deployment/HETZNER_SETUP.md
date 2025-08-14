# Hetzner VPS Üzerinde Stocker Test Ortamı Kurulumu

## 🚀 Adım 1: VPS'e Bağlanma

```bash
# Windows Terminal veya PowerShell kullanarak
ssh root@YOUR_VPS_IP

# Eğer "Host key verification failed" hatası alırsanız:
ssh-keygen -R YOUR_VPS_IP
ssh root@YOUR_VPS_IP
```

## 📦 Adım 2: Sistem Güncellemesi ve Temel Araçlar

VPS'e bağlandıktan sonra aşağıdaki komutları sırayla çalıştırın:

```bash
# Sistem güncellemesi
apt update && apt upgrade -y

# Temel araçları yükle
apt install -y curl wget git nano htop net-tools

# Timezone ayarla (Istanbul)
timedatectl set-timezone Europe/Istanbul
```

## 🐳 Adım 3: Docker Kurulumu

```bash
# Docker kurulum script'ini çalıştır
curl -fsSL https://get.docker.com | bash

# Docker'ın çalıştığını kontrol et
systemctl status docker

# Docker version kontrolü
docker --version
docker compose version
```

## 🔧 Adım 4: Stocker Repository'yi Clone'la

```bash
# /opt dizinine geç
cd /opt

# Repository'yi clone'la (public ise)
git clone https://github.com/YOUR_USERNAME/Stocker.git stocker

# Eğer private repository ise, Personal Access Token kullanın:
git clone https://YOUR_GITHUB_TOKEN@github.com/YOUR_USERNAME/Stocker.git stocker

# Deployment dizinine geç
cd stocker/deployment
```

## 🛠️ Adım 5: Setup Script'ini Çalıştır

```bash
# Script'e çalıştırma izni ver
chmod +x setup-coolify.sh

# Coolify kurulumunu başlat
./setup-coolify.sh
```

Script tamamlandığında size şu bilgileri verecek:
- Coolify Dashboard URL
- API URL
- Web App URL
- Default credentials

## 🌐 Adım 6: Domain Ayarları (Opsiyonel)

Eğer domain kullanacaksanız:

### A. Domain DNS Ayarları
DNS yönetim panelinizde şu kayıtları ekleyin:
```
A Record: test.stocker.app → YOUR_VPS_IP
A Record: api.test.stocker.app → YOUR_VPS_IP
A Record: *.test.stocker.app → YOUR_VPS_IP
```

### B. Coolify'da Domain Konfigürasyonu
```bash
# Coolify dashboard'a giriş yapın
http://YOUR_VPS_IP:8000

# Applications → Your App → Domains
# Domain ekleyin: test.stocker.app
# API için: api.test.stocker.app
```

## 🔒 Adım 7: Güvenlik Ayarları

```bash
# Firewall kurallarını kontrol et
ufw status

# SSH port değiştirme (opsiyonel ama önerilir)
nano /etc/ssh/sshd_config
# Port 22 yerine Port 2222 yapın
systemctl restart sshd

# Firewall'da yeni SSH portunu açın
ufw allow 2222/tcp
ufw delete allow 22/tcp

# Fail2ban kurulumu (brute force koruması)
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 🚀 Adım 8: Uygulamayı Başlatma

```bash
# Docker Compose ile başlat
cd /opt/stocker
docker compose -f deployment/docker-compose.coolify.yml up -d

# Container'ları kontrol et
docker ps

# Logları kontrol et
docker logs stocker-api -f
# Ctrl+C ile çık
```

## ✅ Adım 9: Sağlık Kontrolü

```bash
# Health check script'ini çalıştır
/app/stocker/health-check.sh

# API erişimini test et
curl http://localhost:5104/health

# Database bağlantısını test et
docker exec stocker-db pg_isready -U postgres
```

## 📊 Adım 10: Monitoring Başlatma

```bash
# Continuous monitoring başlat (arka planda)
nohup /app/stocker/monitor.sh --continuous > /var/log/stocker-monitor.log 2>&1 &

# Monitor loglarını kontrol et
tail -f /var/log/stocker-monitor.log
```

## 🔄 Adım 11: Otomatik Backup Ayarı

```bash
# Crontab'ı kontrol et
crontab -l

# Manuel backup testi
/app/stocker/backup.sh

# Backup'ları kontrol et
ls -la /app/stocker/backups/
```

## 🎯 Adım 12: Test Et!

### Web Arayüzü:
1. Tarayıcınızda açın: `http://YOUR_VPS_IP:3000`
2. Test hesabı: `admin@stocker.test` / `Admin@2024!`

### API Swagger:
1. Tarayıcınızda açın: `http://YOUR_VPS_IP:5104/swagger`
2. API endpoint'lerini test edin

### SignalR Test:
1. `http://YOUR_VPS_IP:3000/signalr-test` adresine gidin
2. Real-time validation'ı test edin

### Database Admin:
1. `http://YOUR_VPS_IP:8080` adresine gidin
2. Server: `postgres`
3. Username: `postgres`
4. Password: `StockerDb2024!`

## 🐛 Troubleshooting

### Container başlamıyor:
```bash
# Detaylı logları kontrol et
docker logs stocker-api --tail 100

# Container'ı yeniden başlat
docker restart stocker-api
```

### Database bağlantı hatası:
```bash
# PostgreSQL loglarını kontrol et
docker logs stocker-db --tail 50

# Database'e manuel bağlan
docker exec -it stocker-db psql -U postgres
```

### Port çakışması:
```bash
# Kullanılan portları kontrol et
netstat -tulpn | grep LISTEN

# Docker compose'da port değiştir
nano deployment/docker-compose.coolify.yml
```

### Disk doldu:
```bash
# Disk kullanımını kontrol et
df -h

# Docker temizlik
docker system prune -a
docker volume prune
```

## 📝 Önemli Notlar

1. **IP Adresi**: Script çalıştıktan sonra gösterilen IP adresini not alın
2. **Passwords**: Güvenlik için default şifreleri değiştirin
3. **Backup**: Günlük backup'lar otomatik alınır (03:00)
4. **Monitoring**: Her dakika health check yapılır
5. **Logs**: `/app/stocker/logs/` dizininde saklanır

## 🔐 Güvenlik Kontrol Listesi

- [ ] SSH root login kapatıldı mı?
- [ ] SSH port değiştirildi mi?
- [ ] Firewall aktif mi?
- [ ] Fail2ban kurulu mu?
- [ ] Default şifreler değiştirildi mi?
- [ ] SSL sertifikası kuruldu mu?
- [ ] Backup'lar çalışıyor mu?

## 📞 Destek

Sorun yaşarsanız:
1. Önce logları kontrol edin
2. Health check çalıştırın
3. GitHub Issues'da sorun bildirin

---

**VPS Bilgileri** (doldurun):
- IP Adresi: _______________
- SSH Port: _______________
- Coolify URL: http://_______________:8000
- Web App URL: http://_______________:3000
- API URL: http://_______________:5104

**Kurulum Tarihi**: _______________
**Kurulumu Yapan**: _______________