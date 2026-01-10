using Stocker.Modules.Finance.Domain.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Services;

/// <summary>
/// Fatura numarası üretici domain servisi.
/// Benzersiz ve sıralı fatura numaraları üretir.
/// </summary>
public interface IInvoiceNumberGenerator
{
    /// <summary>
    /// Belirtilen seri için yeni fatura numarası üretir.
    /// </summary>
    /// <param name="tenantId">Kiracı ID</param>
    /// <param name="series">Fatura serisi (3 harf)</param>
    /// <param name="cancellationToken">İptal token'ı</param>
    Task<InvoiceNumber> GenerateAsync(Guid tenantId, string series, CancellationToken cancellationToken = default);

    /// <summary>
    /// Belirtilen seri ve yıl için son fatura numarasını döndürür.
    /// </summary>
    Task<InvoiceNumber?> GetLastNumberAsync(Guid tenantId, string series, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Fatura numarasının benzersiz olduğunu doğrular.
    /// </summary>
    Task<bool> IsUniqueAsync(Guid tenantId, InvoiceNumber invoiceNumber, CancellationToken cancellationToken = default);
}
