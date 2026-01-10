using System.Text.RegularExpressions;

namespace Stocker.Modules.Finance.Domain.ValueObjects;

/// <summary>
/// Türkiye Vergi Kimlik Numarası (VKN) veya TC Kimlik Numarası Value Object.
/// 10 haneli VKN veya 11 haneli TCKN formatını destekler.
/// </summary>
public sealed record TaxNumber
{
    public string Value { get; }
    public TaxNumberType Type { get; }

    private TaxNumber(string value, TaxNumberType type)
    {
        Value = value;
        Type = type;
    }

    /// <summary>
    /// Vergi numarası oluşturur. Otomatik olarak VKN veya TCKN tipini belirler.
    /// </summary>
    public static TaxNumber Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Vergi numarası boş olamaz.", nameof(value));

        // Sadece rakamları al
        var digitsOnly = new string(value.Where(char.IsDigit).ToArray());

        if (digitsOnly.Length == 10)
        {
            if (!IsValidVKN(digitsOnly))
                throw new ArgumentException("Geçersiz Vergi Kimlik Numarası (VKN).", nameof(value));

            return new TaxNumber(digitsOnly, TaxNumberType.VKN);
        }

        if (digitsOnly.Length == 11)
        {
            if (!IsValidTCKN(digitsOnly))
                throw new ArgumentException("Geçersiz TC Kimlik Numarası.", nameof(value));

            return new TaxNumber(digitsOnly, TaxNumberType.TCKN);
        }

        throw new ArgumentException(
            "Vergi numarası 10 haneli VKN veya 11 haneli TCKN formatında olmalıdır.", nameof(value));
    }

    /// <summary>
    /// Vergi Kimlik Numarası (10 hane) oluşturur.
    /// </summary>
    public static TaxNumber CreateVKN(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("VKN boş olamaz.", nameof(value));

        var digitsOnly = new string(value.Where(char.IsDigit).ToArray());

        if (digitsOnly.Length != 10)
            throw new ArgumentException("VKN 10 haneli olmalıdır.", nameof(value));

        if (!IsValidVKN(digitsOnly))
            throw new ArgumentException("Geçersiz Vergi Kimlik Numarası.", nameof(value));

        return new TaxNumber(digitsOnly, TaxNumberType.VKN);
    }

    /// <summary>
    /// TC Kimlik Numarası (11 hane) oluşturur.
    /// </summary>
    public static TaxNumber CreateTCKN(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("TCKN boş olamaz.", nameof(value));

        var digitsOnly = new string(value.Where(char.IsDigit).ToArray());

        if (digitsOnly.Length != 11)
            throw new ArgumentException("TCKN 11 haneli olmalıdır.", nameof(value));

        if (!IsValidTCKN(digitsOnly))
            throw new ArgumentException("Geçersiz TC Kimlik Numarası.", nameof(value));

        return new TaxNumber(digitsOnly, TaxNumberType.TCKN);
    }

    /// <summary>
    /// VKN algoritması doğrulaması (Mod 10 algoritması)
    /// </summary>
    private static bool IsValidVKN(string vkn)
    {
        if (vkn.Length != 10 || !vkn.All(char.IsDigit))
            return false;

        // VKN algoritması
        int[] digits = vkn.Select(c => c - '0').ToArray();
        int sum = 0;

        for (int i = 0; i < 9; i++)
        {
            int tmp = (digits[i] + (9 - i)) % 10;
            sum += (tmp * (int)Math.Pow(2, 9 - i)) % 9;
            if (tmp != 0 && (tmp * (int)Math.Pow(2, 9 - i)) % 9 == 0)
                sum += 9;
        }

        return (10 - (sum % 10)) % 10 == digits[9];
    }

    /// <summary>
    /// TCKN algoritması doğrulaması
    /// </summary>
    private static bool IsValidTCKN(string tckn)
    {
        if (tckn.Length != 11 || !tckn.All(char.IsDigit))
            return false;

        // İlk hane 0 olamaz
        if (tckn[0] == '0')
            return false;

        int[] digits = tckn.Select(c => c - '0').ToArray();

        // 10. hane kontrolü: ((1,3,5,7,9. haneler toplamı * 7) - (2,4,6,8. haneler toplamı)) mod 10
        int oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        int evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        int tenthDigit = ((oddSum * 7) - evenSum) % 10;
        if (tenthDigit < 0) tenthDigit += 10;

        if (digits[9] != tenthDigit)
            return false;

        // 11. hane kontrolü: İlk 10 hanenin toplamı mod 10
        int totalSum = digits.Take(10).Sum();
        if (digits[10] != totalSum % 10)
            return false;

        return true;
    }

    public bool IsVKN => Type == TaxNumberType.VKN;
    public bool IsTCKN => Type == TaxNumberType.TCKN;

    public override string ToString() => Value;

    public string ToFormattedString()
    {
        return Type switch
        {
            TaxNumberType.VKN => $"{Value[..3]} {Value[3..6]} {Value[6..]}",
            TaxNumberType.TCKN => $"{Value[..3]} {Value[3..6]} {Value[6..9]} {Value[9..]}",
            _ => Value
        };
    }
}

public enum TaxNumberType
{
    /// <summary>Vergi Kimlik Numarası (10 hane) - Tüzel kişiler</summary>
    VKN,
    /// <summary>TC Kimlik Numarası (11 hane) - Gerçek kişiler</summary>
    TCKN
}
