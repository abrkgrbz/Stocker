# Tenant Domain Ekleme Rehberi

## Manuel Yöntem (Şu an kullandığınız)

Her yeni tenant için Coolify UI'da:
1. Applications → Web uygulamanız → Settings → Domains
2. Yeni satır ekleyin: `https://<tenant-slug>.stoocker.app`
3. Save
4. Redeploy

## Otomatik Yöntem Alternatifleri

### Option 1: Path-Based Routing (Önerilen)
Subdomain yerine path kullanarak wildcard ihtiyacını ortadan kaldırın:
- `stoocker.app/t/demo` 
- `stoocker.app/t/techstart`

Frontend'de yapılacak değişiklik:
```typescript
// stocker-web/src/utils/tenant.ts
export function getTenantUrl(slug: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/t/${slug}`;
}

export function getCurrentTenant(): string | null {
  const path = window.location.pathname;
  const match = path.match(/^\/t\/([a-z0-9-]+)/);
  return match ? match[1] : null;
}
```

### Option 2: Coolify API ile Otomatik Domain Ekleme
Coolify'ın API'sini kullanarak yeni tenant oluşturulduğunda otomatik domain ekleyin:

```csharp
// API'de tenant oluşturduktan sonra
public async Task AddTenantDomainToCoolify(string tenantSlug)
{
    // Coolify API endpoint'i ve token'ı gerekli
    var coolifyApiUrl = "https://coolify.stoocker.app/api/v1";
    var coolifyToken = "your-coolify-api-token";
    
    // Domain'i Coolify'a ekle
    var client = new HttpClient();
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {coolifyToken}");
    
    var payload = new {
        domain = $"https://{tenantSlug}.stoocker.app"
    };
    
    await client.PostAsJsonAsync($"{coolifyApiUrl}/applications/{appId}/domains", payload);
}
```

### Option 3: Wildcard SSL Sertifikası (Enterprise)
Coolify Enterprise versiyonunda veya kendi Traefik kurulumunuzda gerçek wildcard desteği.

## Geçici Çözüm: Batch Domain Ekleme

Birden fazla tenant'ınız varsa, hepsini tek seferde ekleyebilirsiniz:

Coolify UI → Domains alanına (her satır bir domain):
```
https://stoocker.app
https://www.stoocker.app
https://demo.stoocker.app
https://techstart.stoocker.app
https://tenant1.stoocker.app
https://tenant2.stoocker.app
https://tenant3.stoocker.app
```

## Tavsiye

**Path-based routing'e geçmenizi öneririm** çünkü:
- Wildcard SSL gerekmez
- Her tenant için manuel domain ekleme gerekmez
- Daha kolay yönetilebilir
- SEO açısından da avantajlı olabilir

Hangisini tercih edersiniz?