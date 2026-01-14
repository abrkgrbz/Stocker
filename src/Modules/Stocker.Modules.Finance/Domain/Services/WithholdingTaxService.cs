using Stocker.Modules.Finance.Domain.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Services;

/// <summary>
/// Türkiye stopaj (tevkifat) hesaplama servisi.
/// GİB muhtasar beyanname kodları ve oranlarına uygun hesaplama yapar.
///
/// Yasal dayanak:
/// - 193 Sayılı Gelir Vergisi Kanunu Madde 94
/// - 5520 Sayılı Kurumlar Vergisi Kanunu Madde 15, 30
/// </summary>
public class WithholdingTaxService : IWithholdingTaxService
{
    /// <summary>
    /// Stopaj kodları ve oranları (GİB Muhtasar Beyanname)
    /// </summary>
    private static readonly Dictionary<string, WithholdingTaxInfo> WithholdingTaxCodes = new()
    {
        // GVK Madde 94 - Gerçek kişilere yapılan ödemeler
        { "011", new WithholdingTaxInfo("011", "Kira Ödemeleri (Gerçek Kişi)", 20m, WithholdingCategory.Rent) },
        { "012", new WithholdingTaxInfo("012", "Kira Ödemeleri (Basit Usul)", 20m, WithholdingCategory.Rent) },
        { "021", new WithholdingTaxInfo("021", "Serbest Meslek Kazançları", 20m, WithholdingCategory.Freelance) },
        { "022", new WithholdingTaxInfo("022", "Serbest Meslek (Telif, Patent)", 17m, WithholdingCategory.Royalty) },
        { "031", new WithholdingTaxInfo("031", "Yıllara Sari İnşaat İşleri", 5m, WithholdingCategory.Construction) },
        { "032", new WithholdingTaxInfo("032", "Yıllara Sari Onarım İşleri", 5m, WithholdingCategory.Construction) },
        { "041", new WithholdingTaxInfo("041", "Repo/Ters Repo Gelirleri", 15m, WithholdingCategory.Interest) },
        { "042", new WithholdingTaxInfo("042", "Mevduat Faizleri", 15m, WithholdingCategory.Interest) },
        { "051", new WithholdingTaxInfo("051", "Devlet Tahvili/Hazine Bonosu", 10m, WithholdingCategory.Interest) },
        { "061", new WithholdingTaxInfo("061", "Kar Payları (Tam Mükellef Gerçek Kişi)", 10m, WithholdingCategory.Dividend) },
        { "062", new WithholdingTaxInfo("062", "Kar Payları (Dar Mükellef)", 15m, WithholdingCategory.Dividend) },
        { "091", new WithholdingTaxInfo("091", "Ücretler (Kümülatif)", 0m, WithholdingCategory.Wage) }, // Dilim bazlı
        { "092", new WithholdingTaxInfo("092", "Ücretler (Arızi)", 20m, WithholdingCategory.Wage) },

        // KVK Madde 15 - Kurumlara yapılan ödemeler
        { "121", new WithholdingTaxInfo("121", "Kira Ödemeleri (Kurum)", 20m, WithholdingCategory.RentCorporate) },
        { "122", new WithholdingTaxInfo("122", "Kooperatiflere Kira Ödemeleri", 20m, WithholdingCategory.RentCorporate) },
        { "131", new WithholdingTaxInfo("131", "Serbest Meslek (Kurum)", 20m, WithholdingCategory.FreelanceCorporate) },
        { "141", new WithholdingTaxInfo("141", "Yıllara Sari İnşaat (Kurum)", 5m, WithholdingCategory.ConstructionCorporate) },

        // KVK Madde 30 - Dar mükellef kurumlara ödemeler
        { "301", new WithholdingTaxInfo("301", "İştirak Kazançları (Dar Mükellef)", 15m, WithholdingCategory.DividendNonResident) },
        { "302", new WithholdingTaxInfo("302", "Serbest Meslek (Dar Mükellef)", 20m, WithholdingCategory.FreelanceNonResident) },
        { "303", new WithholdingTaxInfo("303", "Telif/Patent (Dar Mükellef)", 20m, WithholdingCategory.RoyaltyNonResident) },
        { "304", new WithholdingTaxInfo("304", "Kira (Dar Mükellef)", 20m, WithholdingCategory.RentNonResident) },
        { "305", new WithholdingTaxInfo("305", "Faiz (Dar Mükellef)", 10m, WithholdingCategory.InterestNonResident) },

        // Özel durumlar
        { "711", new WithholdingTaxInfo("711", "Götürü Gider (GVK 40/1)", 15m, WithholdingCategory.LumpSum) },
        { "811", new WithholdingTaxInfo("811", "Sporcu Ücretleri", 20m, WithholdingCategory.SportsFee) },
        { "812", new WithholdingTaxInfo("812", "Teknik Direktör Ücretleri", 20m, WithholdingCategory.SportsFee) },
    };

    /// <summary>
    /// Gelir vergisi dilimleri (2024)
    /// </summary>
    private static readonly List<TaxBracket> IncomeTaxBrackets2024 = new()
    {
        new TaxBracket(0, 110_000, 15),
        new TaxBracket(110_000, 230_000, 20),
        new TaxBracket(230_000, 580_000, 27),
        new TaxBracket(580_000, 3_000_000, 35),
        new TaxBracket(3_000_000, decimal.MaxValue, 40)
    };

    /// <summary>
    /// Stopaj kodu ile hesaplama yapar
    /// </summary>
    public WithholdingCalculationResult Calculate(string withholdingCode, Money grossAmount)
    {
        if (!WithholdingTaxCodes.TryGetValue(withholdingCode, out var taxInfo))
        {
            throw new ArgumentException($"Geçersiz stopaj kodu: {withholdingCode}", nameof(withholdingCode));
        }

        var withholdingAmount = grossAmount.Multiply(taxInfo.Rate / 100);
        var netAmount = grossAmount.Subtract(withholdingAmount);

        return new WithholdingCalculationResult(
            grossAmount,
            withholdingAmount,
            netAmount,
            taxInfo.Code,
            taxInfo.Description,
            taxInfo.Rate,
            taxInfo.Category);
    }

    /// <summary>
    /// Kategori ve oran ile hesaplama yapar
    /// </summary>
    public WithholdingCalculationResult Calculate(WithholdingCategory category, Money grossAmount, decimal? customRate = null)
    {
        var taxInfo = WithholdingTaxCodes.Values.FirstOrDefault(t => t.Category == category);
        if (taxInfo == null)
        {
            throw new ArgumentException($"Stopaj kategorisi bulunamadı: {category}", nameof(category));
        }

        var rate = customRate ?? taxInfo.Rate;
        var withholdingAmount = grossAmount.Multiply(rate / 100);
        var netAmount = grossAmount.Subtract(withholdingAmount);

        return new WithholdingCalculationResult(
            grossAmount,
            withholdingAmount,
            netAmount,
            taxInfo.Code,
            taxInfo.Description,
            rate,
            category);
    }

    /// <summary>
    /// Ücret gelir vergisi hesaplama (kümülatif)
    /// </summary>
    public WageWithholdingResult CalculateWageWithholding(
        Money grossWage,
        Money cumulativeGross,
        decimal sgkEmployeeDeduction,
        decimal unemploymentDeduction,
        bool hasMinimumWageExemption = true)
    {
        // SGK kesintileri düş
        var totalSocialSecurityDeduction = sgkEmployeeDeduction + unemploymentDeduction;
        var taxBase = grossWage.Subtract(Money.Create(totalSocialSecurityDeduction, grossWage.Currency));

        // Kümülatif matrah
        var previousCumulative = cumulativeGross.Subtract(grossWage);
        var previousTax = CalculateProgressiveTax(previousCumulative.Amount);
        var currentCumulative = cumulativeGross.Subtract(Money.Create(totalSocialSecurityDeduction, grossWage.Currency));
        var currentTax = CalculateProgressiveTax(currentCumulative.Amount);

        var monthlyTax = currentTax - previousTax;

        // Asgari ücret istisnası (2024)
        decimal minimumWageExemption = 0;
        if (hasMinimumWageExemption)
        {
            // 2024 asgari ücret üzerinden hesaplanan vergi muafiyeti
            const decimal minimumWageMonthlyTaxExemption = 1_500.19m; // Yaklaşık değer
            minimumWageExemption = Math.Min(monthlyTax, minimumWageMonthlyTaxExemption);
        }

        var netWithholding = monthlyTax - minimumWageExemption;

        return new WageWithholdingResult(
            grossWage,
            taxBase,
            Money.Create(monthlyTax, grossWage.Currency),
            Money.Create(minimumWageExemption, grossWage.Currency),
            Money.Create(Math.Max(0, netWithholding), grossWage.Currency),
            GetApplicableBracket(currentCumulative.Amount));
    }

    /// <summary>
    /// Artan oranlı vergi hesaplama
    /// </summary>
    private decimal CalculateProgressiveTax(decimal cumulativeAmount)
    {
        decimal totalTax = 0;
        decimal remainingAmount = cumulativeAmount;

        foreach (var bracket in IncomeTaxBrackets2024)
        {
            if (remainingAmount <= 0) break;

            var bracketSize = bracket.UpperLimit - bracket.LowerLimit;
            var taxableInBracket = Math.Min(remainingAmount, bracketSize);

            totalTax += taxableInBracket * (bracket.Rate / 100);
            remainingAmount -= taxableInBracket;
        }

        return Math.Round(totalTax, 2);
    }

    /// <summary>
    /// Geçerli vergi dilimini belirle
    /// </summary>
    private int GetApplicableBracket(decimal cumulativeAmount)
    {
        for (int i = 0; i < IncomeTaxBrackets2024.Count; i++)
        {
            if (cumulativeAmount <= IncomeTaxBrackets2024[i].UpperLimit)
                return i + 1;
        }
        return IncomeTaxBrackets2024.Count;
    }

    /// <summary>
    /// Tüm stopaj kodlarını döndür
    /// </summary>
    public IReadOnlyDictionary<string, WithholdingTaxInfo> GetAllWithholdingCodes()
    {
        return WithholdingTaxCodes;
    }

    /// <summary>
    /// Kategoriye göre stopaj kodlarını döndür
    /// </summary>
    public IEnumerable<WithholdingTaxInfo> GetWithholdingCodesByCategory(WithholdingCategory category)
    {
        return WithholdingTaxCodes.Values.Where(t => t.Category == category);
    }

    /// <summary>
    /// 2024 gelir vergisi dilimlerini döndür
    /// </summary>
    public IReadOnlyList<TaxBracket> GetIncomeTaxBrackets()
    {
        return IncomeTaxBrackets2024.AsReadOnly();
    }
}

/// <summary>
/// Stopaj hesaplama servisi interface
/// </summary>
public interface IWithholdingTaxService
{
    WithholdingCalculationResult Calculate(string withholdingCode, Money grossAmount);
    WithholdingCalculationResult Calculate(WithholdingCategory category, Money grossAmount, decimal? customRate = null);
    WageWithholdingResult CalculateWageWithholding(Money grossWage, Money cumulativeGross, decimal sgkEmployeeDeduction, decimal unemploymentDeduction, bool hasMinimumWageExemption = true);
    IReadOnlyDictionary<string, WithholdingTaxInfo> GetAllWithholdingCodes();
    IEnumerable<WithholdingTaxInfo> GetWithholdingCodesByCategory(WithholdingCategory category);
    IReadOnlyList<TaxBracket> GetIncomeTaxBrackets();
}

/// <summary>
/// Stopaj bilgisi
/// </summary>
public record WithholdingTaxInfo(
    string Code,
    string Description,
    decimal Rate,
    WithholdingCategory Category);

/// <summary>
/// Stopaj hesaplama sonucu
/// </summary>
public record WithholdingCalculationResult(
    Money GrossAmount,
    Money WithholdingAmount,
    Money NetAmount,
    string WithholdingCode,
    string WithholdingDescription,
    decimal WithholdingRate,
    WithholdingCategory Category);

/// <summary>
/// Ücret stopaj hesaplama sonucu
/// </summary>
public record WageWithholdingResult(
    Money GrossWage,
    Money TaxBase,
    Money CalculatedTax,
    Money MinimumWageExemption,
    Money NetWithholding,
    int TaxBracket);

/// <summary>
/// Vergi dilimi
/// </summary>
public record TaxBracket(
    decimal LowerLimit,
    decimal UpperLimit,
    decimal Rate);

/// <summary>
/// Stopaj kategorileri
/// </summary>
public enum WithholdingCategory
{
    // Gerçek kişi ödemeleri
    Rent,           // Kira
    Freelance,      // Serbest meslek
    Royalty,        // Telif/Patent
    Construction,   // Yıllara sari inşaat
    Interest,       // Faiz
    Dividend,       // Kar payı
    Wage,           // Ücret

    // Kurum ödemeleri
    RentCorporate,
    FreelanceCorporate,
    ConstructionCorporate,

    // Dar mükellef ödemeleri
    DividendNonResident,
    FreelanceNonResident,
    RoyaltyNonResident,
    RentNonResident,
    InterestNonResident,

    // Özel
    LumpSum,        // Götürü gider
    SportsFee       // Sporcu ücreti
}
