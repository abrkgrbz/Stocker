# 🔐 Git Güvenlik Rehberi - .env Dosyası Yönetimi

## ✅ .gitignore Güncellendi!

`.gitignore` dosyasına güvenlik bölümü eklendi. Artık şu dosyalar GİT'e EKLENMEYECEKl:

- `.env` (tüm varyasyonları)
- `secrets.json`
- `appsettings.Production.json`
- `*.pfx`, `*.key`, `*.pem` (sertifikalar)
- `*.bak` (backup dosyaları)

## 📋 .env Dosyası Oluşturma Adımları

### 1️⃣ .env Dosyasını Oluştur
```bash
# PowerShell veya CMD'de:
copy .env.example .env

# VEYA manuel olarak:
# .env.example dosyasını kopyala ve .env olarak kaydet
```

### 2️⃣ .env Dosyasını Düzenle
```bash
# Notepad++ veya VS Code ile aç:
notepad .env

# TÜM şifreleri değiştir!
# ChangeThis... ile başlayan her değeri güvenli bir şifreyle değiştir
```

### 3️⃣ Git'e Eklenmediğini Kontrol Et
```bash
# Git status kontrol:
git status

# .env dosyası GÖRÜNMEMELI!
# Sadece .env.example görünmeli
```

## 🛡️ Güvenlik Kontrol Komutları

### Hassas Dosyaları Kontrol Et:
```bash
# .env dosyalarını ara:
git ls-files | grep -E "\.env$"
# Sonuç BOŞ olmalı!

# Staging area'yı kontrol et:
git status --porcelain | grep "\.env"
# Sonuç BOŞ olmalı!

# Commit geçmişinde .env ara:
git log --all --full-history -- "*.env"
# Eğer sonuç varsa, geçmişten temizle!
```

## ⚠️ Eğer .env Yanlışlıkla Eklendiyse

### DURUM 1: Henüz commit edilmedi (staged)
```bash
# Staging'den kaldır:
git rm --cached .env

# .gitignore'a eklendiğini kontrol et:
type .gitignore | findstr ".env"
```

### DURUM 2: Commit edildi ama push edilmedi
```bash
# Son commit'i geri al:
git reset --soft HEAD~1

# .env'yi kaldır:
git rm --cached .env

# Tekrar commit et (.env olmadan):
git commit -m "Remove sensitive files"
```

### DURUM 3: Push edildi (EN KRİTİK!)
```bash
# ACIL: Tüm şifreleri DEĞİŞTİR!

# Geçmişten tamamen sil (BFG Repo Cleaner kullan):
# 1. BFG'yi indir: https://rtyley.github.io/bfg-repo-cleaner/
# 2. Çalıştır:
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push yap:
git push --force
```

## 🔍 Periyodik Güvenlik Kontrolü

### Haftalık Kontrol Script'i:
```bash
# security-check.bat oluştur:
@echo off
echo === GIT SECURITY CHECK ===
echo.
echo Checking for .env files...
git ls-files | findstr /E "\.env"
echo.
echo Checking for secrets...
git ls-files | findstr "secret password token key"
echo.
echo Checking staged files...
git status --porcelain | findstr "\.env secret"
echo.
echo === CHECK COMPLETE ===
pause
```

## 📁 Doğru Dosya Yapısı

```
Stocker/
├── .env                 ← GIT'TE YOK (ignored) ❌
├── .env.example         ← GIT'TE VAR (template) ✅
├── .gitignore          ← .env'yi ignore ediyor ✅
├── appsettings.json    ← Şifre YOK ✅
└── secrets.json        ← GIT'TE YOK (ignored) ❌
```

## 🚀 Best Practices

### ✅ YAPILACAKLAR:
1. **Her zaman .env.example'ı güncelle** (şifresiz template)
2. **README'ye .env kurulum talimatı ekle**
3. **CI/CD'de environment variable kullan**
4. **Production'da Azure Key Vault kullan**

### ❌ YAPILMAYACAKLAR:
1. **Asla .env'yi commit etme**
2. **Şifreleri kod içine yazma**
3. **Backup dosyalarını (.bak) commit etme**
4. **Production config'lerini repo'da tutma**

## 🔄 Git Hook ile Otomatik Kontrol

### .git/hooks/pre-commit dosyası oluştur:
```bash
#!/bin/sh
# Hassas dosyaları kontrol et
if git diff --cached --name-only | grep -E "\.env$|secrets\.json|\.bak$"
then
    echo "⚠️  UYARI: Hassas dosya commit edilmeye çalışılıyor!"
    echo "Bu dosyalar commit edilemez: .env, secrets.json, *.bak"
    exit 1
fi
```

## 📋 Kontrol Listesi

- [x] .gitignore güncellendi
- [ ] .env dosyası oluşturuldu
- [ ] .env şifreleri değiştirildi
- [ ] git status ile kontrol edildi
- [ ] .env.example güncellendi
- [ ] README'ye kurulum notu eklendi
- [ ] Team'e bilgi verildi

## 🆘 Yardım

Eğer yanlışlıkla .env'yi commit ettiysen:
1. **ŞİFRELERİ HEMEN DEĞİŞTİR**
2. **Yukarıdaki temizleme adımlarını uygula**
3. **Tüm team üyelerini bilgilendir**

---

**NOT**: Güvenlik en önemli konudur. Şüphen varsa, sor!