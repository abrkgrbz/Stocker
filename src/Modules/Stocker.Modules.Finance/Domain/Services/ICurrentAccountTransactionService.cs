using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Services;

/// <summary>
/// Cari hesap hareket servisi.
/// Fatura ve ödeme işlemlerinden cari hesap hareketleri oluşturur.
/// </summary>
public interface ICurrentAccountTransactionService
{
    /// <summary>
    /// Fatura için cari hesap hareketi oluşturur.
    /// </summary>
    Task<CurrentAccountTransaction> CreateFromInvoiceAsync(
        Invoice invoice,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ödeme için cari hesap hareketi oluşturur.
    /// </summary>
    Task<CurrentAccountTransaction> CreateFromPaymentAsync(
        Payment payment,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Fatura iptalinden dolayı ters kayıt oluşturur.
    /// </summary>
    Task<CurrentAccountTransaction> CreateReversalForInvoiceAsync(
        Invoice invoice,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ödeme iptalinden dolayı ters kayıt oluşturur.
    /// </summary>
    Task<CurrentAccountTransaction> CreateReversalForPaymentAsync(
        Payment payment,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Yeni hareket numarası üretir.
    /// </summary>
    Task<string> GenerateTransactionNumberAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);
}
