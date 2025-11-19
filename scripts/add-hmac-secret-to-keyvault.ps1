# Azure Key Vault'a HMAC Secret Ekleme Script'i
# Bu script, HMAC secret key'i Azure Key Vault'a güvenli bir şekilde ekler

param(
    [Parameter(Mandatory=$true)]
    [string]$KeyVaultName,

    [Parameter(Mandatory=$false)]
    [string]$SecretValue = "YojxNKH6zKpCREDa2nniWFCDfpqW1UMqipRi+MsH+kc=",

    [Parameter(Mandatory=$false)]
    [string]$SecretName = "hmac-secret-key"
)

Write-Host "🔑 Azure Key Vault HMAC Secret Ekleme" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Azure CLI yüklü mü kontrol et
$azCliInstalled = Get-Command az -ErrorAction SilentlyContinue
if (-not $azCliInstalled) {
    Write-Host "❌ Azure CLI bulunamadı!" -ForegroundColor Red
    Write-Host "💡 Azure CLI'yi yüklemek için: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Azure CLI bulundu" -ForegroundColor Green

# Azure'a login olmuş mu kontrol et
Write-Host "🔄 Azure oturum kontrolü..." -ForegroundColor Yellow
$accountInfo = az account show 2>$null
if (-not $accountInfo) {
    Write-Host "⚠️ Azure'a giriş yapılmamış. Oturum açılıyor..." -ForegroundColor Yellow
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Azure oturum açma başarısız!" -ForegroundColor Red
        exit 1
    }
}

$account = az account show | ConvertFrom-Json
Write-Host "✅ Azure oturumu aktif: $($account.user.name)" -ForegroundColor Green
Write-Host "   Subscription: $($account.name)" -ForegroundColor Gray
Write-Host ""

# Key Vault'un var olup olmadığını kontrol et
Write-Host "🔄 Key Vault kontrolü: $KeyVaultName..." -ForegroundColor Yellow
$kvExists = az keyvault show --name $KeyVaultName 2>$null
if (-not $kvExists) {
    Write-Host "❌ Key Vault bulunamadı: $KeyVaultName" -ForegroundColor Red
    Write-Host "💡 Önce Key Vault oluşturun:" -ForegroundColor Yellow
    Write-Host "   az keyvault create --name $KeyVaultName --resource-group <resource-group> --location <location>" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Key Vault bulundu: $KeyVaultName" -ForegroundColor Green
Write-Host ""

# Secret'ı ekle veya güncelle
Write-Host "🔄 Secret ekleniyor: $SecretName..." -ForegroundColor Yellow
$result = az keyvault secret set `
    --vault-name $KeyVaultName `
    --name $SecretName `
    --value $SecretValue `
    --output json

if ($LASTEXITCODE -eq 0) {
    $secretInfo = $result | ConvertFrom-Json
    Write-Host "✅ Secret başarıyla eklendi!" -ForegroundColor Green
    Write-Host "   Name: $($secretInfo.name)" -ForegroundColor Gray
    Write-Host "   ID: $($secretInfo.id)" -ForegroundColor Gray
    Write-Host "   Created: $($secretInfo.attributes.created)" -ForegroundColor Gray
    Write-Host ""

    # Uygulama yapılandırması bilgisi
    Write-Host "📋 Uygulama Yapılandırması" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Environment Variables (Coolify/Docker):" -ForegroundColor Yellow
    Write-Host "   AZURE_KEY_VAULT_URI=https://$KeyVaultName.vault.azure.net/" -ForegroundColor White
    Write-Host "   AZURE_TENANT_ID=<your-tenant-id>" -ForegroundColor White
    Write-Host "   AZURE_CLIENT_ID=<your-client-id>" -ForegroundColor White
    Write-Host "   AZURE_CLIENT_SECRET=<your-client-secret>" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Uygulama Configuration Key:" -ForegroundColor Yellow
    Write-Host "   Security:HmacSecretKey" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Kullanım:" -ForegroundColor Yellow
    Write-Host "   services.AddSingleton<IHmacService, HmacService>();" -ForegroundColor White
    Write-Host ""

    # Secret'ı doğrula
    Write-Host "🔍 Secret doğrulanıyor..." -ForegroundColor Yellow
    $retrievedSecret = az keyvault secret show `
        --vault-name $KeyVaultName `
        --name $SecretName `
        --query "value" `
        --output tsv

    if ($retrievedSecret -eq $SecretValue) {
        Write-Host "✅ Secret doğrulama başarılı!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Secret doğrulanamadı!" -ForegroundColor Yellow
    }

} else {
    Write-Host "❌ Secret eklenirken hata oluştu!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 İşlem tamamlandı!" -ForegroundColor Green
