using Stocker.Modules.Finance.Domain.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Services;

/// <summary>
/// Vergi hesaplama domain servisi.
/// Türkiye vergi mevzuatına uygun KDV, ÖTV, stopaj hesaplamaları yapar.
/// </summary>
public interface ITaxCalculationService
{
    /// <summary>
    /// KDV hesaplar.
    /// </summary>
    /// <param name="netAmount">KDV hariç tutar</param>
    /// <param name="vatRate">KDV oranı (0, 1, 10, 20)</param>
    TaxCalculationResult CalculateVat(Money netAmount, decimal vatRate);

    /// <summary>
    /// KDV dahil tutardan KDV'yi ayırır.
    /// </summary>
    TaxCalculationResult ExtractVat(Money grossAmount, decimal vatRate);

    /// <summary>
    /// Stopaj hesaplar.
    /// </summary>
    /// <param name="amount">Brüt tutar</param>
    /// <param name="withholdingRate">Stopaj oranı</param>
    Money CalculateWithholding(Money amount, decimal withholdingRate);

    /// <summary>
    /// Tevkifatlı KDV hesaplar.
    /// </summary>
    /// <param name="vatAmount">KDV tutarı</param>
    /// <param name="tevkifatRate">Tevkifat oranı (örn: 5/10, 9/10)</param>
    TevkifatResult CalculateTevkifat(Money vatAmount, decimal tevkifatRate);
}

/// <summary>
/// Vergi hesaplama sonucu.
/// </summary>
public sealed record TaxCalculationResult(
    Money NetAmount,
    Money TaxAmount,
    Money GrossAmount,
    decimal TaxRate);

/// <summary>
/// Tevkifat hesaplama sonucu.
/// </summary>
public sealed record TevkifatResult(
    Money OriginalVatAmount,
    Money TevkifatAmount,
    Money PayableVatAmount,
    decimal TevkifatRate);
