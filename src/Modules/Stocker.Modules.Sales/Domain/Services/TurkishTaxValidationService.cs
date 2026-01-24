using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Services;

/// <summary>
/// Türkiye vergi mevzuatı doğrulama servisi
/// VUK, TTK ve GİB kurallarına uygunluk kontrolü
/// </summary>
public static class TurkishTaxValidationService
{
    #region VKN / TCKN Doğrulama

    /// <summary>
    /// Vergi kimlik numarası formatını doğrular (VKN veya TCKN)
    /// </summary>
    public static Result ValidateTaxNumber(string? taxNumber, TaxIdType? taxIdType)
    {
        if (string.IsNullOrWhiteSpace(taxNumber))
            return Result.Success(); // Optional field

        var cleanNumber = taxNumber.Trim().Replace(" ", "");

        if (!cleanNumber.All(char.IsDigit))
            return Result.Failure(Error.Validation("TaxNumber", "Tax number must contain only digits"));

        return taxIdType switch
        {
            TaxIdType.VKN => ValidateVkn(cleanNumber),
            TaxIdType.TCKN => ValidateTckn(cleanNumber),
            TaxIdType.Foreign => Result.Success(), // No format validation for foreign tax IDs
            null => ValidateAuto(cleanNumber),
            _ => Result.Success()
        };
    }

    /// <summary>
    /// VKN (Vergi Kimlik Numarası) doğrulama - 10 haneli, tüzel kişi
    /// </summary>
    private static Result ValidateVkn(string vkn)
    {
        if (vkn.Length != 10)
            return Result.Failure(Error.Validation("TaxNumber.VKN", "VKN must be exactly 10 digits"));

        // VKN check digit algorithm
        var digits = vkn.Select(c => int.Parse(c.ToString())).ToArray();
        var sum = 0;

        for (var i = 0; i < 9; i++)
        {
            var tmp = (digits[i] + (9 - i)) % 10;
            sum += (tmp * (int)Math.Pow(2, 9 - i)) % 9;
            if (tmp != 0 && (tmp * (int)Math.Pow(2, 9 - i)) % 9 == 0)
                sum += 9;
        }

        var checkDigit = (10 - (sum % 10)) % 10;
        if (checkDigit != digits[9])
            return Result.Failure(Error.Validation("TaxNumber.VKN", "Invalid VKN check digit"));

        return Result.Success();
    }

    /// <summary>
    /// TCKN (TC Kimlik Numarası) doğrulama - 11 haneli, gerçek kişi
    /// </summary>
    private static Result ValidateTckn(string tckn)
    {
        if (tckn.Length != 11)
            return Result.Failure(Error.Validation("TaxNumber.TCKN", "TCKN must be exactly 11 digits"));

        if (tckn[0] == '0')
            return Result.Failure(Error.Validation("TaxNumber.TCKN", "TCKN cannot start with 0"));

        var digits = tckn.Select(c => int.Parse(c.ToString())).ToArray();

        // 10. hane kontrolü: ((d1+d3+d5+d7+d9)*7 - (d2+d4+d6+d8)) % 10 == d10
        var oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        var evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        var tenthDigit = ((oddSum * 7) - evenSum) % 10;
        if (tenthDigit < 0) tenthDigit += 10;

        if (tenthDigit != digits[9])
            return Result.Failure(Error.Validation("TaxNumber.TCKN", "Invalid TCKN check digit (10th)"));

        // 11. hane kontrolü: (d1+d2+...+d10) % 10 == d11
        var totalSum = digits.Take(10).Sum();
        if (totalSum % 10 != digits[10])
            return Result.Failure(Error.Validation("TaxNumber.TCKN", "Invalid TCKN check digit (11th)"));

        return Result.Success();
    }

    /// <summary>
    /// Otomatik tip tespiti ve doğrulama (hane sayısına göre)
    /// </summary>
    private static Result ValidateAuto(string taxNumber)
    {
        return taxNumber.Length switch
        {
            10 => ValidateVkn(taxNumber),
            11 => ValidateTckn(taxNumber),
            _ => Result.Failure(Error.Validation("TaxNumber", "Tax number must be 10 digits (VKN) or 11 digits (TCKN)"))
        };
    }

    #endregion

    #region KDV Oranı Doğrulama

    /// <summary>
    /// KDV oranının Türkiye'de geçerli olup olmadığını kontrol eder
    /// Geçerli oranlar: %0, %1, %5, %8, %10, %20
    /// </summary>
    public static Result ValidateVatRate(decimal vatRate)
    {
        if (!TurkishVatRates.IsValidRate(vatRate))
        {
            var validRatesStr = string.Join(", ", TurkishVatRates.ValidRates.Select(r => $"%{r}"));
            return Result.Failure(Error.Validation(
                "VatRate",
                $"Invalid VAT rate: %{vatRate}. Valid Turkish VAT rates are: {validRatesStr}"));
        }

        return Result.Success();
    }

    /// <summary>
    /// Fatura kalemlerinin KDV oranlarını toplu doğrular
    /// </summary>
    public static Result ValidateInvoiceItemVatRates(IEnumerable<decimal> vatRates)
    {
        var invalidRates = vatRates.Where(r => !TurkishVatRates.IsValidRate(r)).Distinct().ToList();

        if (invalidRates.Any())
        {
            var invalidRatesStr = string.Join(", ", invalidRates.Select(r => $"%{r}"));
            return Result.Failure(Error.Validation(
                "VatRate",
                $"Invalid VAT rates found: {invalidRatesStr}. Valid Turkish VAT rates are: %0, %1, %5, %8, %10, %20"));
        }

        return Result.Success();
    }

    #endregion

    #region Fatura Numaralama Doğrulama

    /// <summary>
    /// Fatura numarasının VUK uyumlu formatta olup olmadığını kontrol eder
    /// Format: {Seri}{Yıl}{SıraNo} - Örn: A2024000001
    /// </summary>
    public static Result ValidateInvoiceNumber(string? invoiceNumber)
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            return Result.Failure(Error.Validation("InvoiceNumber", "Invoice number is required"));

        if (invoiceNumber.Length < 5)
            return Result.Failure(Error.Validation("InvoiceNumber", "Invoice number is too short"));

        if (invoiceNumber.Length > 16)
            return Result.Failure(Error.Validation("InvoiceNumber", "Invoice number exceeds maximum length (16 characters)"));

        return Result.Success();
    }

    #endregion

    #region Tevkifat Doğrulama

    /// <summary>
    /// GİB tarafından tanımlanan geçerli tevkifat kodları
    /// </summary>
    private static readonly Dictionary<string, string> ValidWithholdingCodes = new()
    {
        { "601", "Yapım İşleri ile Bu İşlerle Birlikte İfa Edilen Mühendislik-Mimarlık" },
        { "602", "Etüt, Plan-Proje, Danışmanlık, Denetim ve Benzeri Hizmetler" },
        { "603", "Makine, Teçhizat, Demirbaş ve Taşıtlara Ait Tadil, Bakım ve Onarım" },
        { "604", "Yemek Servis ve Organizasyon Hizmetleri" },
        { "605", "İşgücü Temin Hizmetleri" },
        { "606", "Yapı Denetim Hizmetleri" },
        { "607", "Fason Olarak Yaptırılan Tekstil ve Konfeksiyon İşleri" },
        { "608", "Turistik Mağazalara Verilen Müşteri Bulma / Götürme Hizmetleri" },
        { "609", "Spor Kulüplerinin Yayın, Reklam ve İsim Hakkı Gelirleri" },
        { "610", "Temizlik, Çevre ve Bahçe Bakım Hizmetleri" },
        { "611", "Taşımacılık Hizmetleri" },
        { "612", "Her Türlü Baskı ve Basım Hizmetleri" },
        { "613", "Diğer Hizmetler" },
        { "614", "Kamu Özel İş Birliği Modeli ile Yaptırılan Sağlık Tesislerine İlişkin İşletme Döneminde Sunulan Hizmetler" },
        { "615", "Ticari Reklam Hizmetleri" }
    };

    /// <summary>
    /// Tevkifat kodunun geçerliliğini kontrol eder
    /// </summary>
    public static Result ValidateWithholdingTaxCode(string? code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure(Error.Validation("WithholdingTaxCode", "Withholding tax code is required"));

        if (!ValidWithholdingCodes.ContainsKey(code))
            return Result.Failure(Error.Validation("WithholdingTaxCode",
                $"Invalid withholding tax code: {code}. See GİB tevkifat kodları for valid codes."));

        return Result.Success();
    }

    /// <summary>
    /// Geçerli tevkifat oranlarını kontrol eder
    /// GİB standart oranları: 2/10, 3/10, 5/10, 7/10, 9/10
    /// </summary>
    public static Result ValidateWithholdingTaxRate(decimal rate)
    {
        var validRates = new[] { 20m, 30m, 50m, 70m, 90m };

        if (!validRates.Contains(rate))
        {
            var validRatesStr = string.Join(", ", validRates.Select(r => $"{r / 10}/10"));
            return Result.Failure(Error.Validation("WithholdingTaxRate",
                $"Invalid withholding tax rate: {rate}%. Valid rates are: {validRatesStr}"));
        }

        return Result.Success();
    }

    #endregion

    #region Yardımcı Metotlar

    /// <summary>
    /// Vergi numarasından tip tespiti yapar
    /// </summary>
    public static TaxIdType? DetectTaxIdType(string? taxNumber)
    {
        if (string.IsNullOrWhiteSpace(taxNumber))
            return null;

        var cleanNumber = taxNumber.Trim().Replace(" ", "");

        if (!cleanNumber.All(char.IsDigit))
            return null;

        return cleanNumber.Length switch
        {
            10 => TaxIdType.VKN,
            11 => TaxIdType.TCKN,
            _ => null
        };
    }

    /// <summary>
    /// Geçerli tevkifat kodlarının listesini döndürür
    /// </summary>
    public static IReadOnlyDictionary<string, string> GetValidWithholdingCodes()
        => ValidWithholdingCodes;

    #endregion
}
