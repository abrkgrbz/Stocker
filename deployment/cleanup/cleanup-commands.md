# Docker ve Coolify Tam Temizlik Komutları

## Hızlı Temizlik (Tek Satırda)

```bash
# TÜM DOCKER VERİLERİNİ SİLER - DİKKATLİ KULLANIN!
docker stop $(docker ps -aq) && docker rm -f $(docker ps -aq) && docker rmi -f $(docker images -aq) && docker volume rm -f $(docker volume ls -q) && docker network prune -f && docker system prune -af --volumes
```

## Adım Adım Temizlik

### 1. Önce Coolify'ı Durdur
```bash
cd /data/coolify
docker compose down
```

### 2. Tüm Container'ları Durdur ve Sil
```bash
# Tüm çalışan container'ları durdur
docker stop $(docker ps -aq)

# Tüm container'ları sil
docker rm -f $(docker ps -aq)
```

### 3. Tüm Image'ları Sil
```bash
docker rmi -f $(docker images -aq)
```

### 4. Tüm Volume'leri Sil
```bash
docker volume rm -f $(docker volume ls -q)
```

### 5. Tüm Network'leri Sil
```bash
docker network prune -f
```

### 6. Docker Sistem Temizliği
```bash
# Her şeyi temizle (container, image, volume, network, build cache)
docker system prune -af --volumes

# Build cache'i de temizle
docker builder prune -af
```

### 7. Coolify Dizinlerini Sil
```bash
# Coolify verilerini sil
sudo rm -rf /data/coolify
sudo rm -rf /data/coolify-db
sudo rm -rf /data/coolify-proxy
sudo rm -rf /var/lib/docker/volumes/coolify*
```

### 8. Docker'ı Yeniden Başlat
```bash
sudo systemctl restart docker
```

## Temizlik Sonrası Kontrol

```bash
# Docker disk kullanımını kontrol et
docker system df

# Container'ları listele (boş olmalı)
docker ps -a

# Image'ları listele (boş olmalı)
docker images

# Volume'leri listele (boş olmalı)
docker volume ls

# Network'leri listele (sadece default'lar olmalı)
docker network ls
```

## Coolify'ı Yeniden Kurulum

Temizlik tamamlandıktan sonra Coolify'ı sıfırdan kurun:

```bash
# Coolify kurulum script'i
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

## Alternatif: Docker'ı Tamamen Kaldır ve Yeniden Kur

Eğer çok fazla sorun varsa Docker'ı tamamen kaldırıp yeniden kurabilirsiniz:

```bash
# Docker'ı kaldır
sudo apt-get purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd

# Docker'ı yeniden kur
curl -fsSL https://get.docker.com | bash
```

## Önemli Notlar

⚠️ **DİKKAT**: Bu komutlar TÜM Docker verilerinizi siler!
- Tüm container'lar
- Tüm image'lar
- Tüm volume'ler (veriler dahil)
- Tüm custom network'ler
- Tüm build cache

Eğer saklamak istediğiniz veriler varsa önce backup alın!