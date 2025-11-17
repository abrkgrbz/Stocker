# Azure Key Vault ve Coolify Deployment Rehberi

## 🔍 Problem: Veritabanları Oluşmuyor

Uygulama Hangfire kurulumunda takılıp kalıyor. **Sebep**: Connection string'ler Azure Key Vault'tan alınamıyor veya environment variable'lar eksik.

---

## ✅ ÇÖZÜM 1: Azure Key Vault KULLANMADAN Deploy (ÖNERİLEN)

Eğer Azure Key Vault kullanmak istemiyorsanız, sadece Coolify environment variable'larıyla çalışabilirsiniz.

### Coolify'da Environment Variables:

```bash
# Database Configuration (ZORUNLU)
SA_PASSWORD=YourStrongSQLPassword123!
DB_SERVER=mssql

# JWT Settings (ZORUNLU)
JwtSettings__Secret=YourVeryLongSecretKeyHere-Min32CharactersAtLeast!

# Azure Key Vault'u DEVRE DIŞI bırakmak için
# AZURE_KEY_VAULT_URI değişkenini TANIMLAMAYIN veya boş bırakın
```

### Bu Şekilde:
1. ✅ Startup script SA_PASSWORD ve DB_SERVER'dan connection string oluşturur
2. ✅ Azure Key Vault atlanır
3. ✅ Veritabanı migration'ları çalışır
4. ✅ Uygulama başlar

### Beklenen Loglar:
```
=== Stocker API Startup Script ===
Environment Check:
  SA_PASSWORD: ✓ Set
  DB_SERVER: mssql
  AZURE_KEY_VAULT_URI: ✗ Not set (using env vars)

✅ Connection strings constructed from SA_PASSWORD and DB_SERVER
Running Master database migrations...
Using MasterConnection for Master migrations
...
=== Starting Database Migration ===
Step 1/3: Creating Hangfire database...
Step 1/3: Hangfire database ready
...
```

---

## 🔐 ÇÖZÜM 2: Azure Key Vault İLE Deploy (ADVANCED)

Eğer Azure Key Vault kullanmak istiyorsanız:

### 1. Azure Key Vault'ta Secret'lar Oluşturun:

```bash
# Azure CLI ile secret ekleyin:
az keyvault secret set --vault-name stocker-kv-prod --name "sa-password" --value "YourPassword123!"
az keyvault secret set --vault-name stocker-kv-prod --name "connectionstrings-masterconnection" --value "Server=mssql;Database=StockerMasterDb;..."
az keyvault secret set --vault-name stocker-kv-prod --name "connectionstrings-tenantconnection" --value "Server=mssql;Database=StockerTenantDb;..."
az keyvault secret set --vault-name stocker-kv-prod --name "connectionstrings-hangfireconnection" --value "Server=mssql;Database=StockerHangfireDb;..."
az keyvault secret set --vault-name stocker-kv-prod --name "jwt-secret" --value "YourVeryLongSecretKey..."
```

### 2. Service Principal Oluşturun (Coolify için):

```bash
# Service Principal oluştur
az ad sp create-for-rbac --name "stocker-coolify-sp" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}

# Output'tan şunları kaydedin:
# - appId (AZURE_CLIENT_ID)
# - password (AZURE_CLIENT_SECRET)
# - tenant (AZURE_TENANT_ID)
```

### 3. Key Vault Access Policy Ekleyin:

```bash
az keyvault set-policy --name stocker-kv-prod \
  --spn {appId-from-above} \
  --secret-permissions get list
```

### 4. Coolify Environment Variables:

```bash
# Azure Key Vault
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Fallback için (Key Vault erişimi başarısız olursa)
SA_PASSWORD=YourPassword123!
DB_SERVER=mssql
JwtSettings__Secret=YourSecretKey...
```

---

## 📊 Deployment Sonrası Log Kontrolü

### Başarılı Deployment Logları:

```
=== Stocker API Startup Script ===
Environment Check:
  SA_PASSWORD: ✓ Set
  DB_SERVER: mssql
  AZURE_KEY_VAULT_URI: ✗ Not set (using env vars)  <-- veya Key Vault URL

✅ Connection strings constructed from SA_PASSWORD and DB_SERVER
Running Master database migrations...
Using MasterConnection for Master migrations
Build started...
Build succeeded.
Running Tenant database migrations...
...
Starting application...

=== Starting Database Migration ===
Step 1/3: Creating Hangfire database...
Step 1/3: Hangfire database ready
Step 2/3: Migrating Master database...
Step 2/3: Master database migrated
Step 3/3: Seeding Master data...
Step 3/3: Master data seeded
=== Database migration completed successfully ===
Stocker API started successfully

Start installing Hangfire SQL objects...
Hangfire SQL objects installed
```

### Başarısız Deployment Logları (Ne Aramak Gerek):

```
❌ Failed to configure Azure Key Vault: CredentialUnavailableException
   Error: DefaultAzureCredential failed to retrieve a token...
⚠️ Continuing with environment variables only.

# veya

⚠️ SA_PASSWORD or DB_SERVER not set - will use Azure Key Vault or appsettings

# Bu durumda: Connection string'ler boş olduğu için migration başarısız olur
# Hangfire kurulumunda takılır kalır
```

---

## 🎯 Hızlı Kontrol Listesi

- [ ] **SA_PASSWORD** environment variable tanımlı mı?
- [ ] **DB_SERVER** environment variable tanımlı mı? (örnek: `mssql`)
- [ ] **JwtSettings__Secret** tanımlı mı?
- [ ] SQL Server container çalışıyor mu? (`docker ps | grep mssql`)
- [ ] SQL Server'a bağlanabiliyor musunuz? (`docker exec -it mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'password'`)
- [ ] Coolify'da service restart yaptınız mı?

---

## 🔧 Troubleshooting

### Problem: "Hangfire SQL objects" kurulumunda takılıyor

**Sebep**: Connection string boş veya SQL Server'a erişilemiyor

**Çözüm**:
1. SA_PASSWORD ve DB_SERVER environment variable'larını ekleyin
2. Azure Key Vault kullanmıyorsanız AZURE_KEY_VAULT_URI'yi tanımlamayın
3. SQL Server container'ının çalıştığından emin olun
4. Coolify'da service'i restart edin

### Problem: Azure Key Vault credential hatası

**Sebep**: Service Principal credentials yanlış veya eksik

**Çözüm**:
1. AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID kontrol edin
2. Service Principal'ın Key Vault'a erişim yetkisi var mı kontrol edin
3. Veya Azure Key Vault'u tamamen devre dışı bırakın (AZURE_KEY_VAULT_URI'yi silın)

### Problem: Migration failed with exit code 1

**Sebep**: SQL Server henüz hazır değil veya connection string yanlış

**Çözüm**:
1. SQL Server container'ının tamamen başladığından emin olun (30-60 saniye bekleyin)
2. SA_PASSWORD'ün SQL Server'daki şifre ile aynı olduğundan emin olun
3. DB_SERVER değerinin SQL Server container/service adı ile aynı olduğundan emin olun

---

## 📝 Önerilen Basit Kurulum (Production için)

```bash
# Coolify Environment Variables:
SA_PASSWORD=StrongPassword123!@#
DB_SERVER=mssql
JwtSettings__Secret=ThisIsAVeryLongSecretKeyForJWTTokensAtLeast32Characters!

# Redis (opsiyonel, SignalR scale-out için)
ConnectionStrings__Redis=redis:6379

# RabbitMQ (opsiyonel, event messaging için)
RabbitMQ__Host=rabbitmq
RabbitMQ__Username=guest
RabbitMQ__Password=guest
RabbitMQ__Enabled=true
```

Bu basit kurulumla Azure Key Vault olmadan çalışır, veritabanları başarıyla oluşur.
