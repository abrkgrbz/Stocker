namespace Stocker.Modules.Finance.Domain.ValueObjects;

/// <summary>
/// Fatura numarası Value Object.
/// GİB e-Fatura formatına uygun: ABC2024000000001 (3 harf seri + 4 yıl + 9 sıra no)
/// </summary>
public sealed record InvoiceNumber
{
    public string Value { get; }
    public string Series { get; }
    public int Year { get; }
    public int SequenceNumber { get; }

    private InvoiceNumber(string series, int year, int sequenceNumber)
    {
        Series = series;
        Year = year;
        SequenceNumber = sequenceNumber;
        Value = $"{series}{year}{sequenceNumber:D9}";
    }

    /// <summary>
    /// Yeni fatura numarası oluşturur.
    /// </summary>
    /// <param name="series">3 harfli seri (örn: ABC, FAT, ARS)</param>
    /// <param name="year">4 haneli yıl</param>
    /// <param name="sequenceNumber">Sıra numarası (1-999999999)</param>
    public static InvoiceNumber Create(string series, int year, int sequenceNumber)
    {
        ValidateSeries(series);
        ValidateYear(year);
        ValidateSequenceNumber(sequenceNumber);

        return new InvoiceNumber(series.ToUpperInvariant(), year, sequenceNumber);
    }

    /// <summary>
    /// Mevcut fatura numarasını parse eder.
    /// </summary>
    public static InvoiceNumber Parse(string invoiceNumber)
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            throw new ArgumentException("Fatura numarası boş olamaz.", nameof(invoiceNumber));

        if (invoiceNumber.Length != 16)
            throw new ArgumentException(
                "Fatura numarası 16 karakter olmalıdır (ABC2024000000001).", nameof(invoiceNumber));

        var series = invoiceNumber[..3];
        var yearStr = invoiceNumber.Substring(3, 4);
        var seqStr = invoiceNumber[7..];

        if (!int.TryParse(yearStr, out var year))
            throw new ArgumentException("Geçersiz yıl formatı.", nameof(invoiceNumber));

        if (!int.TryParse(seqStr, out var sequenceNumber))
            throw new ArgumentException("Geçersiz sıra numarası formatı.", nameof(invoiceNumber));

        return Create(series, year, sequenceNumber);
    }

    /// <summary>
    /// Sonraki fatura numarasını döndürür.
    /// </summary>
    public InvoiceNumber Next()
    {
        var nextSequence = SequenceNumber + 1;

        if (nextSequence > 999999999)
            throw new InvalidOperationException(
                $"Seri {Series} için maksimum fatura numarasına ulaşıldı.");

        return new InvoiceNumber(Series, Year, nextSequence);
    }

    /// <summary>
    /// Yeni yıl için sıfırlanmış fatura numarası döndürür.
    /// </summary>
    public InvoiceNumber NewYear(int newYear)
    {
        ValidateYear(newYear);

        if (newYear <= Year)
            throw new ArgumentException(
                $"Yeni yıl ({newYear}) mevcut yıldan ({Year}) büyük olmalıdır.", nameof(newYear));

        return new InvoiceNumber(Series, newYear, 1);
    }

    private static void ValidateSeries(string series)
    {
        if (string.IsNullOrWhiteSpace(series))
            throw new ArgumentException("Seri boş olamaz.", nameof(series));

        if (series.Length != 3)
            throw new ArgumentException("Seri 3 karakter olmalıdır.", nameof(series));

        if (!series.All(char.IsLetter))
            throw new ArgumentException("Seri sadece harflerden oluşmalıdır.", nameof(series));
    }

    private static void ValidateYear(int year)
    {
        if (year < 2000 || year > 2100)
            throw new ArgumentException("Yıl 2000-2100 arasında olmalıdır.", nameof(year));
    }

    private static void ValidateSequenceNumber(int sequenceNumber)
    {
        if (sequenceNumber < 1 || sequenceNumber > 999999999)
            throw new ArgumentException(
                "Sıra numarası 1-999999999 arasında olmalıdır.", nameof(sequenceNumber));
    }

    public override string ToString() => Value;

    public string ToFormattedString() => $"{Series}{Year}-{SequenceNumber:D9}";
}
