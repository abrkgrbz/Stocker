#!/bin/bash

# Docker Tam Temizlik Script'i
# DİKKAT: Bu script TÜM Docker verilerini siler!

echo "========================================="
echo "DOCKER TAM TEMİZLİK BAŞLIYOR"
echo "DİKKAT: TÜM DOCKER VERİLERİ SİLİNECEK!"
echo "========================================="
echo ""

# 1. Önce Coolify'ı durdur
echo "1. Coolify durduruluyor..."
cd /data/coolify && docker compose down 2>/dev/null || true

# 2. Tüm çalışan container'ları durdur
echo "2. Tüm container'lar durduruluyor..."
docker stop $(docker ps -aq) 2>/dev/null || true

# 3. Tüm container'ları sil
echo "3. Tüm container'lar siliniyor..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

# 4. Tüm image'ları sil
echo "4. Tüm image'lar siliniyor..."
docker rmi -f $(docker images -aq) 2>/dev/null || true

# 5. Tüm volume'leri sil
echo "5. Tüm volume'ler siliniyor..."
docker volume rm -f $(docker volume ls -q) 2>/dev/null || true

# 6. Tüm network'leri sil (default'lar hariç)
echo "6. Custom network'ler siliniyor..."
docker network rm $(docker network ls -q --filter type=custom) 2>/dev/null || true

# 7. Docker sistem temizliği
echo "7. Docker sistem temizliği yapılıyor..."
docker system prune -af --volumes

# 8. Build cache temizliği
echo "8. Build cache temizleniyor..."
docker builder prune -af

# 9. Coolify dizinlerini temizle
echo "9. Coolify dizinleri temizleniyor..."
rm -rf /data/coolify
rm -rf /data/coolify-db
rm -rf /data/coolify-proxy
rm -rf /var/lib/docker/volumes/coolify*

# 10. Docker'ı yeniden başlat
echo "10. Docker servisi yeniden başlatılıyor..."
systemctl restart docker

echo ""
echo "========================================="
echo "TEMİZLİK TAMAMLANDI!"
echo "========================================="
echo ""
echo "Docker durumu:"
docker system df

echo ""
echo "Şimdi Coolify'ı temiz kurulum yapabilirsiniz:"
echo "curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash"