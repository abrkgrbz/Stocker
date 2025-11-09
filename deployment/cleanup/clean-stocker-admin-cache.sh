#!/bin/bash

# Stocker Admin Docker Cache Temizleme
# Sadece stocker-admin ile ilgili cache'leri temizler

echo "========================================="
echo "STOCKER-ADMIN CACHE TEMİZLİĞİ"
echo "========================================="
echo ""

# 1. Stocker-admin container'larını durdur ve sil
echo "1. Stocker-admin container'ları temizleniyor..."
docker ps -a | grep stocker-admin | awk '{print $1}' | xargs -r docker stop 2>/dev/null || true
docker ps -a | grep stocker-admin | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

# 2. Stocker-admin image'larını sil
echo "2. Stocker-admin image'ları siliniyor..."
docker images | grep stocker-admin | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# 3. Dangling (kullanılmayan) image'ları temizle
echo "3. Dangling image'lar temizleniyor..."
docker image prune -f

# 4. Build cache temizliği (tüm projeler için)
echo "4. Build cache temizleniyor..."
docker builder prune -af

# 5. Local node_modules ve dist temizliği
echo "5. Local build artifacts temizleniyor..."
cd stocker-admin 2>/dev/null || cd ../stocker-admin 2>/dev/null || true
if [ -d "node_modules" ]; then
    echo "   - node_modules siliniyor..."
    rm -rf node_modules
fi
if [ -d "dist" ]; then
    echo "   - dist siliniyor..."
    rm -rf dist
fi
if [ -d ".vite" ]; then
    echo "   - .vite cache siliniyor..."
    rm -rf .vite
fi

echo ""
echo "========================================="
echo "TEMİZLİK TAMAMLANDI!"
echo "========================================="
echo ""
echo "Docker durumu:"
docker system df
echo ""
echo "Yeni build için:"
echo "  cd stocker-admin"
echo "  npm install"
echo "  npm run build"
