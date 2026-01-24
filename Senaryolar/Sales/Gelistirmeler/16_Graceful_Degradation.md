# İyileştirme 16: Graceful Degradation (Zarif Düşüş)

**İlgili Senaryo:** Kargo Servisi Çökmesi, Kısmi Stok Verisi (Level 5)
**Öncelik:** Orta (P2) - UX

## Sorun
Bir dış servis veya alt modül yanıt vermediğinde, ana işlem (Sipariş Oluşturma, Ürün Görüntüleme) tamamen hata vererek durmaktadır. Oysa ki bazı bilgiler kritik olmayabilir veya varsayılan değerlerle süreç ilerletilebilir.

## Çözüm Önerisi
Servis çağrıları `try-catch` blokları ile sarmalanarak, hata durumunda "Fallback" (B planı) değerleri döndürülmelidir.

### Teknik Adımlar
1.  **Kargo Fallback:** Kargo API hata verirse, dinamik fiyat yerine veritabanındaki "Sabit Kargo Ücreti" (örn: 50 TL) veya "Ücretsiz Kargo" seçeneği gösterilmeli.
2.  **Stok Fallback:** Depo servisi yanıt vermezse, o deponun stoğu 0 varsayılmalı ama diğer depolardaki stoklar gösterilmeye devam edilmeli (Toplam Stok = Mevcut Olanlar). Kullanıcıya "Sınırlı stok bilgisi" uyarısı gösterilebilir.

```csharp
// ShippingService.cs
try 
{
    return await _cargoApi.CalculatePriceAsync(address);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Kargo API hatası, fallback uygulanıyor.");
    return new ShippingOption { Price = 50.0m, Name = "Standart Kargo (Sistem Hatası)" };
}
```
