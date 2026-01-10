using Stocker.Modules.Finance.Domain.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Services;

/// <summary>
/// Türkiye vergi mevzuatına uygun vergi hesaplama servisi implementasyonu.
/// </summary>
public class TaxCalculationService : ITaxCalculationService
{
    private static readonly HashSet<decimal> ValidVatRates = new() { 0m, 1m, 10m, 20m };

    public TaxCalculationResult CalculateVat(Money netAmount, decimal vatRate)
    {
        ValidateVatRate(vatRate);

        var taxAmount = netAmount.Multiply(vatRate / 100);
        var grossAmount = netAmount.Add(taxAmount);

        return new TaxCalculationResult(netAmount, taxAmount, grossAmount, vatRate);
    }

    public TaxCalculationResult ExtractVat(Money grossAmount, decimal vatRate)
    {
        ValidateVatRate(vatRate);

        if (vatRate == 0)
        {
            return new TaxCalculationResult(
                grossAmount,
                Money.Zero(grossAmount.Currency),
                grossAmount,
                vatRate);
        }

        // Net = Gross / (1 + VatRate/100)
        var divisor = 1 + (vatRate / 100);
        var netAmount = grossAmount.Divide(divisor);
        var taxAmount = grossAmount.Subtract(netAmount);

        return new TaxCalculationResult(netAmount, taxAmount, grossAmount, vatRate);
    }

    public Money CalculateWithholding(Money amount, decimal withholdingRate)
    {
        if (withholdingRate < 0 || withholdingRate > 100)
            throw new ArgumentException(
                "Stopaj oranı 0-100 arasında olmalıdır.", nameof(withholdingRate));

        return amount.Multiply(withholdingRate / 100);
    }

    public TevkifatResult CalculateTevkifat(Money vatAmount, decimal tevkifatRate)
    {
        // Geçerli tevkifat oranları: 2/10, 3/10, 5/10, 7/10, 9/10
        if (tevkifatRate < 0 || tevkifatRate > 1)
            throw new ArgumentException(
                "Tevkifat oranı 0-1 arasında olmalıdır (örn: 0.5 = 5/10).", nameof(tevkifatRate));

        var tevkifatAmount = vatAmount.Multiply(tevkifatRate);
        var payableVatAmount = vatAmount.Subtract(tevkifatAmount);

        return new TevkifatResult(vatAmount, tevkifatAmount, payableVatAmount, tevkifatRate);
    }

    private static void ValidateVatRate(decimal vatRate)
    {
        if (!ValidVatRates.Contains(vatRate))
            throw new ArgumentException(
                $"Geçersiz KDV oranı: {vatRate}. Geçerli oranlar: {string.Join(", ", ValidVatRates)}",
                nameof(vatRate));
    }
}
