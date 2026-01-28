using FluentValidation;

namespace Stocker.Application.Common.Validators;

/// <summary>
/// Custom FluentValidation rule builder extensions - Türkçe hata mesajları ile
/// </summary>
public static class ValidationExtensions
{
    /// <summary>
    /// GUID'in boş olmadığını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, Guid> NotEmptyGuid<T>(this IRuleBuilder<T, Guid> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("{PropertyName} boş olamaz.");
    }

    /// <summary>
    /// Nullable GUID değer içeriyorsa boş olmadığını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, Guid?> NotEmptyGuidWhenNotNull<T>(this IRuleBuilder<T, Guid?> ruleBuilder)
    {
        return ruleBuilder
            .Must(g => !g.HasValue || g.Value != Guid.Empty)
            .WithMessage("{PropertyName} belirtildiğinde boş olamaz.");
    }

    /// <summary>
    /// Türk telefon numarası formatını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, string?> TurkishPhoneNumber<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^(\+90|0)?[5][0-9]{9}$")
            .When(s => !string.IsNullOrWhiteSpace((s as dynamic)?.Phone ?? s.ToString()))
            .WithMessage("{PropertyName} geçerli bir Türk telefon numarası olmalıdır (örn: +905551234567).");
    }

    /// <summary>
    /// Türk Vergi Kimlik Numarasını (VKN) doğrular - 10 haneli
    /// </summary>
    public static IRuleBuilderOptions<T, string?> TurkishTaxNumber<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^[0-9]{10}$")
            .WithMessage("{PropertyName} 10 haneli geçerli bir vergi numarası olmalıdır.")
            .Must(BeValidTurkishTaxNumber!)
            .When(s => !string.IsNullOrWhiteSpace(s.ToString()))
            .WithMessage("{PropertyName} kontrol basamağı hatalı.");
    }

    /// <summary>
    /// Türk TC Kimlik Numarasını doğrular - 11 haneli
    /// </summary>
    public static IRuleBuilderOptions<T, string?> TurkishNationalId<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^[1-9][0-9]{10}$")
            .WithMessage("{PropertyName} sıfır ile başlamayan 11 haneli geçerli bir TC kimlik numarası olmalıdır.")
            .Must(BeValidTurkishNationalId!)
            .When(s => !string.IsNullOrWhiteSpace(s.ToString()))
            .WithMessage("{PropertyName} kontrol basamağı hatalı.");
    }

    /// <summary>
    /// Türk IBAN numarasını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, string?> TurkishIban<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^TR[0-9]{24}$")
            .When(s => !string.IsNullOrWhiteSpace(s.ToString()))
            .WithMessage("{PropertyName} geçerli bir Türk IBAN'ı olmalıdır (TR + 24 rakam).");
    }

    /// <summary>
    /// Decimal değerin geçerli bir para tutarı olduğunu doğrular (pozitif, en fazla 2 ondalık basamak)
    /// </summary>
    public static IRuleBuilderOptions<T, decimal> ValidMoney<T>(this IRuleBuilder<T, decimal> ruleBuilder)
    {
        return ruleBuilder
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} pozitif bir tutar olmalıdır.")
            .ScalePrecision(2, 18)
            .WithMessage("{PropertyName} en fazla 2 ondalık basamak içerebilir.");
    }

    /// <summary>
    /// Decimal değerin geçerli bir yüzde olduğunu doğrular (0-100)
    /// </summary>
    public static IRuleBuilderOptions<T, decimal> ValidPercentage<T>(this IRuleBuilder<T, decimal> ruleBuilder)
    {
        return ruleBuilder
            .InclusiveBetween(0, 100)
            .WithMessage("{PropertyName} 0 ile 100 arasında olmalıdır.");
    }

    /// <summary>
    /// Decimal değerin geçerli bir vergi oranı olduğunu doğrular (0-100, en fazla 4 ondalık basamak)
    /// </summary>
    public static IRuleBuilderOptions<T, decimal> ValidTaxRate<T>(this IRuleBuilder<T, decimal> ruleBuilder)
    {
        return ruleBuilder
            .InclusiveBetween(0, 100)
            .WithMessage("{PropertyName} 0 ile 100 arasında olmalıdır.")
            .ScalePrecision(4, 6)
            .WithMessage("{PropertyName} en fazla 4 ondalık basamak içerebilir.");
    }

    /// <summary>
    /// Tam sayının geçerli bir miktar olduğunu doğrular (pozitif)
    /// </summary>
    public static IRuleBuilderOptions<T, int> ValidQuantity<T>(this IRuleBuilder<T, int> ruleBuilder)
    {
        return ruleBuilder
            .GreaterThan(0)
            .WithMessage("{PropertyName} sıfırdan büyük olmalıdır.");
    }

    /// <summary>
    /// Kod formatını doğrular (alfanumerik, tire ve alt çizgi içerebilir)
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidCode<T>(
        this IRuleBuilder<T, string?> ruleBuilder,
        int minLength = 2,
        int maxLength = 50)
    {
        return ruleBuilder
            .Length(minLength, maxLength)
            .WithMessage($"{{PropertyName}} {minLength} ile {maxLength} karakter arasında olmalıdır.")
            .Matches(@"^[A-Za-z0-9\-_]+$")
            .When(s => !string.IsNullOrWhiteSpace(s.ToString()))
            .WithMessage("{PropertyName} yalnızca harf, rakam, tire ve alt çizgi içerebilir.");
    }

    /// <summary>
    /// Slug formatını doğrular (küçük harf alfanumerik ve tire)
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidSlug<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .When(s => !string.IsNullOrWhiteSpace(s.ToString()))
            .WithMessage("{PropertyName} geçerli bir slug formatında olmalıdır (küçük harf, rakam ve tire).");
    }

    /// <summary>
    /// URL formatını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidUrl<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Must(BeValidUrl!)
            .When(s => !string.IsNullOrWhiteSpace(s.ToString()))
            .WithMessage("{PropertyName} geçerli bir URL olmalıdır.");
    }

    /// <summary>
    /// Tarihin geçmişte olmadığını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime> NotInPast<T>(this IRuleBuilder<T, DateTime> ruleBuilder)
    {
        return ruleBuilder
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("{PropertyName} geçmiş bir tarih olamaz.");
    }

    /// <summary>
    /// Tarihin gelecekte olmadığını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime> NotInFuture<T>(this IRuleBuilder<T, DateTime> ruleBuilder)
    {
        return ruleBuilder
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("{PropertyName} gelecek bir tarih olamaz.");
    }

    /// <summary>
    /// Bitiş tarihinin başlangıç tarihinden sonra olduğunu doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime> AfterDate<T>(
        this IRuleBuilder<T, DateTime> ruleBuilder,
        Func<T, DateTime> startDateSelector,
        string startDateName = "başlangıç tarihi")
    {
        return ruleBuilder
            .Must((model, endDate) => endDate > startDateSelector(model))
            .WithMessage($"{{PropertyName}} {startDateName}nden sonra olmalıdır.");
    }

    /// <summary>
    /// Koleksiyonun boş olmadığını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, IEnumerable<TElement>> NotEmptyCollection<T, TElement>(
        this IRuleBuilder<T, IEnumerable<TElement>> ruleBuilder)
    {
        return ruleBuilder
            .Must(x => x != null && x.Any())
            .WithMessage("{PropertyName} en az bir öğe içermelidir.");
    }

    /// <summary>
    /// Koleksiyonun maksimum öğe sayısını doğrular
    /// </summary>
    public static IRuleBuilderOptions<T, IEnumerable<TElement>> MaxItems<T, TElement>(
        this IRuleBuilder<T, IEnumerable<TElement>> ruleBuilder,
        int maxCount)
    {
        return ruleBuilder
            .Must(x => x == null || x.Count() <= maxCount)
            .WithMessage($"{{PropertyName}} en fazla {maxCount} öğe içerebilir.");
    }

    #region Private Helper Methods

    private static bool BeValidTurkishTaxNumber(string taxNumber)
    {
        if (string.IsNullOrWhiteSpace(taxNumber) || taxNumber.Length != 10)
            return false;

        // Turkish Tax Number validation algorithm
        var digits = taxNumber.Select(c => int.Parse(c.ToString())).ToArray();
        var sum = 0;

        for (var i = 0; i < 9; i++)
        {
            var temp = (digits[i] + 9 - i) % 10;
            sum += (temp * (int)Math.Pow(2, 9 - i)) % 9;
            if (temp == 0) sum += 9;
        }

        return (10 - (sum % 10)) % 10 == digits[9];
    }

    private static bool BeValidTurkishNationalId(string nationalId)
    {
        if (string.IsNullOrWhiteSpace(nationalId) || nationalId.Length != 11)
            return false;

        if (nationalId[0] == '0')
            return false;

        var digits = nationalId.Select(c => int.Parse(c.ToString())).ToArray();

        // First check: 10th digit
        var oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        var evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        var tenthDigit = ((oddSum * 7) - evenSum) % 10;
        if (tenthDigit < 0) tenthDigit += 10;

        if (digits[9] != tenthDigit)
            return false;

        // Second check: 11th digit
        var sumFirst10 = digits.Take(10).Sum();
        if (digits[10] != sumFirst10 % 10)
            return false;

        return true;
    }

    private static bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
               && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }

    #endregion
}
