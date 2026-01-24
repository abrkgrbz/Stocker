# İyileştirme 24: Güvenli Yetkilendirme (Secure Authorization)

**İlgili Senaryolar:**
*   Level 7: Stok Transfer Emri Üzerinde Oynama (Parameter Tampering)
*   Level 7: Başka Bir Kiracının Stok Verisini Görme (Tenant Isolation)
*   Level 9: Başka Bir Kiracının Stok Verisini Cache'leme

**Öncelik:** Kritik (P0) - Güvenlik

## Sorun
Mevcut yetkilendirme sistemi "Role Based" (Bu kullanıcı bu API'yi çağırabilir mi?) seviyesindedir. Ancak "Bu kullanıcı, BU depodan transfer yapabilir mi?" gibi Resource-Based kontroller eksiktir. Bu durum, parametre manipülasyonu ile yetki aşımına (IDOR) izin verir. Ayrıca Cache anahtarlarında TenantID unutulması veri sızıntısı yaratır.

## Çözüm Önerisi
1.  **Resource Evaluation:** Her kritik işlemde (Transfer, Stok Güncelleme), kullanıcının o kaynağa erişim hakkı olup olmadığı Policy Server veya Handler içinde kontrol edilmeli.
2.  **Cache Key Strategy:** Tüm cache anahtarları otomatik olarak `{TenantId}:{UserId}:...` hiyerarşisiyle başlamalı.
3.  **Global Filters:** EF Core filtreleri asla `IgnoreQueryFilters` ile keyfi olarak kapatılmamalı.

### Teknik Adımlar
*   **Authorization Handler:** `IAuthorizationService.AuthorizeAsync(User, resource, "CanTransferStock")` kullanımı.
*   **Cache Service Wrapper:** Cache servisi, tenantId'yi request context'ten otomatik alıp key'e eklemeli.

```csharp
// StockTransferHandler.cs
var sourceWarehouse = await _repo.GetByIdAsync(request.SourceId);
var authResult = await _authService.AuthorizeAsync(User, sourceWarehouse, "WarehouseOperation");
if (!authResult.Succeeded) throw new ForbiddenException();
```
