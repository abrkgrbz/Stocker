# Docker Cleanup Scripts

Bu dizinde Docker cache ve container temizliği için script'ler bulunur.

## Scripts

### 1. `clean-stocker-admin-cache.sh`
**Kullanım**: Stocker-admin projesinin Docker cache'lerini temizler

```bash
# Local'de çalıştır
./deployment/cleanup/clean-stocker-admin-cache.sh

# Remote sunucuda çalıştır
ssh root@95.217.219.4 "cd /path/to/Stocker && bash deployment/cleanup/clean-stocker-admin-cache.sh"
```

**Ne yapar:**
- ✅ Stocker-admin container'larını durdurur ve siler
- ✅ Stocker-admin image'larını siler
- ✅ Dangling (kullanılmayan) image'ları temizler
- ✅ Build cache'i temizler
- ✅ Local `node_modules`, `dist`, `.vite` dizinlerini temizler

**Ne zaman kullanılır:**
- Build hatası alındığında
- Disk alanı dolduğunda
- Temiz bir build gerektiğinde
- Cache sorunları yaşandığında

---

### 2. `docker-full-cleanup.sh`
**⚠️ DİKKAT**: Bu script TÜM Docker verilerini siler!

```bash
# SADECE ACİL DURUMLARDA
./deployment/cleanup/docker-full-cleanup.sh
```

**Ne yapar:**
- ❌ Coolify'ı durdurur
- ❌ TÜM container'ları siler
- ❌ TÜM image'ları siler
- ❌ TÜM volume'leri siler
- ❌ TÜM network'leri siler
- ❌ Coolify dizinlerini siler

**Ne zaman kullanılır:**
- SADECE Docker'ı sıfırdan kurmak istediğinde
- SADECE tüm projeleri temizlemek istediğinde
- Production'da ASLA kullanma!

---

## Disk Alanı Kontrolü

```bash
# Docker disk kullanımını kontrol et
docker system df

# Detaylı bilgi
docker system df -v

# Genel sistem disk kullanımı
df -h
```

## Güvenli Temizlik Stratejisi

1. **Önce hafif temizlik**:
   ```bash
   docker system prune -f
   ```

2. **Image cache temizliği**:
   ```bash
   docker builder prune -af
   ```

3. **Proje-spesifik temizlik**:
   ```bash
   ./deployment/cleanup/clean-stocker-admin-cache.sh
   ```

4. **Son çare - tam temizlik** (dikkatli!):
   ```bash
   ./deployment/cleanup/docker-full-cleanup.sh
   ```
