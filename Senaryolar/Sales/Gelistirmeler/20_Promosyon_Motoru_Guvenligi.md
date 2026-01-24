# İyileştirme 20: Promosyon Motoru Güvenliği ve Yönetimi

**İlgili Senaryolar:**
*   Level 7: İstiflenebilir Kuponların Yarattığı Mantık Bombası
*   Level 10: Promosyon Motoru Kıyameti (%90 İndirim Hatası)

**Öncelik:** Kritik (P0) - Finansal

## Sorun
Promosyon sistemi esnek olsa da, kuralların birbirleriyle etkileşimi (Promosyon A + Promosyon B) öngörülemeyen sonuçlar doğurabilmektedir. Ayrıca yanlış tanımlanan bir kampanya (örn: %90 indirim) sistemde anında aktif olup büyük zarara yol açabilir ve bunları durduracak bir "Acil Durum Anahtarı" (Kill Switch) yoktur.

## Çözüm Önerisi
1.  **Promosyon Pipeline'ı:** Kuralların sırasını ve birleşme mantığını (Exclusive, Stackable) yöneten merkezi bir motor.
2.  **Kill Switch:** Redis/FeatureFlag üzerinden anlık olarak tüm promosyonları veya belirli bir kuralı devre dışı bırakma yeteneği.
3.  **Simülasyon Modu:** Yeni bir kural tanımlanırken, "Eğer bu kural aktif olursa, geçen haftaki 1000 siparişin tutarı ne olurdu?" simülasyonunu çalıştırıp anomali tespiti yapma.

### Teknik Adımlar
*   **Pipeline Pattern:** `IPromotionRule` interface'i ile `Calculate(Order order)` metodunu zincirleme çalıştır.
*   **Validation:** İndirim oranı %50'nin üzerindeyse ikinci bir yönetici onayı (4-Eyes Principle) iste.
*   **Circuit Breaker:** Toplam indirim tutarı belirli bir eşiği (örn: 1 saatte 100.000 TL) aşarsa promosyonu otomatik askıya al.

```csharp
// PromotionEngine.cs
public void ApplyPromotions(SalesOrder order) {
    if (_featureManager.IsEnabled("Emergency_Stop_Promotions")) return;
    
    foreach(var rule in _rules.OrderBy(r => r.Priority)) {
        if (!rule.IsApplicable(order)) continue;
        if (rule.IsExclusive && order.HasPromotions) break;
        
        rule.Apply(order);
    }
}
```
