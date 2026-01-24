# İyileştirme 2: Transaction Bütünlüğü (Atomic Transactions)

**İlgili Senaryo:** Sipariş İptali ve Asenkron Transferin Yarattığı Kara Delik (Level 10)
**Öncelik:** Kritik (P0)

## Sorun
`CreateSalesOrderHandler` metodu içerisinde `_unitOfWork.SaveChangesAsync()` metodu 4 kez çağrılmaktadır:
1. Sipariş Kaydı
2. Stok Rezervasyonu
3. Backorder Kaydı
4. Müşteri Kredi Limiti Güncellemesi

Bu durum, işlemin ortasında (örneğin 3. adımda) bir hata alınması durumunda, önceki adımların (Sipariş Kaydı, Stok Rezervasyonu) veritabanında kalıcı hale gelmesine ("Zombie Data") ve veri tutarsızlığına yol açar.

## Çözüm Önerisi
Tüm işlemler tek bir veritabanı Transaction'ı (Unit of Work) içerisinde atomik olarak gerçekleştirilmelidir.

### Teknik Adımlar
1.  **Execution Strategy:** EF Core `IExecutionStrategy` kullanılarak retry mekanizması eklenmeli.
2.  **Tek SaveChanges:** Mümkünse tüm değişiklikler (Sipariş, Stok, Kontrat) aynı `DbContext` üzerinden izlenip tek bir `SaveChanges` ile commit edilmeli.
3.  **TransactionScope:** Farklı modüller/DbContext'ler söz konusu ise `TransactionScope` veya Outbox Pattern kullanılmalı.

```csharp
// Örnek Yaklaşım (Transaction Scope)
using (var transaction = _unitOfWork.BeginTransaction())
{
    try 
    {
        // 1. Siparişi Oluştur (Memory'de)
        // 2. Stok Rezerve Et (Memory'de veya aynı Tx içinde)
        // 3. Krediyi Düş (Memory'de veya aynı Tx içinde)
        
        await _unitOfWork.SaveChangesAsync(); // Tek Seferde Commit
        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```
