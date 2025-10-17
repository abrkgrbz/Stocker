# Debug Scripts

## Auth Redirect Loop Debug Script

Bu script, authentication redirect loop sorununu analiz etmek için Playwright kullanır.

### Kurulum

```bash
# Playwright'ı yükleyin
npm install playwright

# Playwright browser'ları yükleyin
npx playwright install chromium
```

### Kullanım

```bash
# Script'i çalıştırın
node scripts/debug-auth-redirect.js
```

### Güvenlik (Önemli!)

**ASLA** credentials'ları script dosyasına hard-code etmeyin. İki seçenek:

#### Seçenek 1: Environment Variables (Önerilen)
```bash
# .env dosyası oluşturun (scripts/.env)
TEST_EMAIL=your-email@example.com
TEST_PASSWORD=your-password

# Script'i çalıştırın
cd scripts
node debug-auth-redirect.js
```

#### Seçenek 2: Inline Environment Variables
```bash
TEST_EMAIL="your@email.com" TEST_PASSWORD="yourpass" node scripts/debug-auth-redirect.js
```

### Output

Script şu dosyaları oluşturur:

```
scripts/debug-output/
├── redirect-chain.json      # Tüm redirect adımları ve cookie'ler
├── cookies.json             # Cookie değişimleri
├── network-logs.json        # Network request/response detayları
├── console-logs.json        # Browser console çıktıları
├── full-debug-report.json   # Tüm verileri içeren rapor
└── screenshots/             # Her adımda alınan screenshot'lar
    ├── step-1-timestamp.png
    ├── step-2-timestamp.png
    └── ...
```

### Analiz

1. **redirect-chain.json** dosyasını açın
   - `redirectChain` array'inde tüm adımları göreceksiniz
   - Her adımda URL, cookie'ler ve timestamp var

2. **Redirect loop kontrolü:**
   - Script otomatik olarak loop tespit eder
   - Console'da "🚨 REDIRECT LOOP TESPİT EDİLDİ!" mesajı göreceksiniz

3. **Cookie analizi:**
   - Her adımda hangi cookie'lerin set edildiğini görün
   - Domain, path, secure, httpOnly, sameSite değerlerini inceleyin

4. **Network logs:**
   - Tüm HTTP request/response'ları görün
   - 302/301 redirect'leri ve Location header'larını kontrol edin

### Troubleshooting

**Hata: "Executable doesn't exist"**
```bash
npx playwright install chromium
```

**Script çalışmıyor / timeout:**
- Selector'lar doğru mu kontrol edin
- Login formunun yapısı değişmiş olabilir
- Script'teki selector'ları güncelleyin

**Güvenlik uyarısı:**
- `.env` dosyası `.gitignore`'da - güvende
- Asla credential'ları commit etmeyin
- Test sonrası debug-output/ klasörünü temizleyin
