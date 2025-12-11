using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Döviz Kuru (Exchange Rate)
/// TCMB döviz kurları ve kur yönetimi
/// </summary>
public class ExchangeRate : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Kaynak Para Birimi (Source Currency)
    /// </summary>
    public string SourceCurrency { get; private set; } = string.Empty;

    /// <summary>
    /// Hedef Para Birimi (Target Currency)
    /// </summary>
    public string TargetCurrency { get; private set; } = string.Empty;

    /// <summary>
    /// Kur Tarihi (Rate Date)
    /// </summary>
    public DateTime RateDate { get; private set; }

    /// <summary>
    /// Kur Türü (Rate Type)
    /// </summary>
    public ExchangeRateType RateType { get; private set; }

    #endregion

    #region Kur Değerleri (Rate Values)

    /// <summary>
    /// Döviz Alış (Forex Buying)
    /// </summary>
    public decimal? ForexBuying { get; private set; }

    /// <summary>
    /// Döviz Satış (Forex Selling)
    /// </summary>
    public decimal? ForexSelling { get; private set; }

    /// <summary>
    /// Efektif Alış (Banknote Buying)
    /// </summary>
    public decimal? BanknoteBuying { get; private set; }

    /// <summary>
    /// Efektif Satış (Banknote Selling)
    /// </summary>
    public decimal? BanknoteSelling { get; private set; }

    /// <summary>
    /// Ortalama Kur (Average Rate)
    /// </summary>
    public decimal AverageRate { get; private set; }

    /// <summary>
    /// Çapraz Kur (Cross Rate)
    /// </summary>
    public decimal? CrossRate { get; private set; }

    /// <summary>
    /// Birim (Unit) - örn: USD için 1, JPY için 100
    /// </summary>
    public int Unit { get; private set; } = 1;

    #endregion

    #region TCMB Bilgileri (TCMB Information)

    /// <summary>
    /// TCMB Kuru mu? (Is TCMB Rate)
    /// </summary>
    public bool IsTcmbRate { get; private set; }

    /// <summary>
    /// TCMB Bülten No (TCMB Bulletin Number)
    /// </summary>
    public string? TcmbBulletinNumber { get; private set; }

    /// <summary>
    /// Para Birimi ISO Kodu (Currency ISO Code)
    /// </summary>
    public string CurrencyIsoCode { get; private set; } = string.Empty;

    /// <summary>
    /// Para Birimi Adı (Currency Name)
    /// </summary>
    public string? CurrencyName { get; private set; }

    /// <summary>
    /// Para Birimi Türkçe Adı (Currency Name Turkish)
    /// </summary>
    public string? CurrencyNameTurkish { get; private set; }

    #endregion

    #region Değişim Bilgileri (Change Information)

    /// <summary>
    /// Önceki Kur (Previous Rate)
    /// </summary>
    public decimal? PreviousRate { get; private set; }

    /// <summary>
    /// Değişim Tutarı (Change Amount)
    /// </summary>
    public decimal? ChangeAmount { get; private set; }

    /// <summary>
    /// Değişim Oranı % (Change Percentage)
    /// </summary>
    public decimal? ChangePercentage { get; private set; }

    /// <summary>
    /// Trend (Trend Direction)
    /// </summary>
    public ExchangeRateTrend Trend { get; private set; }

    #endregion

    #region Kaynak Bilgileri (Source Information)

    /// <summary>
    /// Kaynak (Source)
    /// </summary>
    public ExchangeRateSource Source { get; private set; }

    /// <summary>
    /// Manuel Giriş mi? (Is Manual Entry)
    /// </summary>
    public bool IsManualEntry { get; private set; }

    /// <summary>
    /// Entegrasyon Tarihi (Integration Date)
    /// </summary>
    public DateTime? IntegrationDate { get; private set; }

    /// <summary>
    /// Giren Kullanıcı ID (Entered By User ID)
    /// </summary>
    public int? EnteredByUserId { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Geçerli mi? (Is Valid)
    /// </summary>
    public bool IsValid { get; private set; }

    /// <summary>
    /// Varsayılan Kur mu? (Is Default Rate for Date)
    /// </summary>
    public bool IsDefaultForDate { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    protected ExchangeRate() { }

    public ExchangeRate(
        string sourceCurrency,
        string targetCurrency,
        DateTime rateDate,
        decimal averageRate,
        ExchangeRateType rateType = ExchangeRateType.Daily,
        ExchangeRateSource source = ExchangeRateSource.TCMB,
        int unit = 1)
    {
        SourceCurrency = sourceCurrency.ToUpperInvariant();
        TargetCurrency = targetCurrency.ToUpperInvariant();
        CurrencyIsoCode = sourceCurrency.ToUpperInvariant();
        RateDate = rateDate.Date;
        AverageRate = averageRate;
        RateType = rateType;
        Source = source;
        Unit = unit;

        IsTcmbRate = source == ExchangeRateSource.TCMB;
        IsManualEntry = source == ExchangeRateSource.Manual;
        IsActive = true;
        IsValid = true;
        IsDefaultForDate = false;
        Trend = ExchangeRateTrend.Stable;
    }

    public void SetForexRates(decimal? buying, decimal? selling)
    {
        ForexBuying = buying;
        ForexSelling = selling;

        if (buying.HasValue && selling.HasValue)
        {
            AverageRate = (buying.Value + selling.Value) / 2;
        }
    }

    public void SetBanknoteRates(decimal? buying, decimal? selling)
    {
        BanknoteBuying = buying;
        BanknoteSelling = selling;
    }

    public void SetCrossRate(decimal? crossRate)
    {
        CrossRate = crossRate;
    }

    public void SetTcmbInfo(string? bulletinNumber, string? currencyName, string? currencyNameTurkish)
    {
        TcmbBulletinNumber = bulletinNumber;
        CurrencyName = currencyName;
        CurrencyNameTurkish = currencyNameTurkish;
    }

    public void SetPreviousRate(decimal? previousRate)
    {
        PreviousRate = previousRate;

        if (previousRate.HasValue && previousRate.Value != 0)
        {
            ChangeAmount = AverageRate - previousRate.Value;
            ChangePercentage = (ChangeAmount / previousRate.Value) * 100;

            Trend = ChangeAmount switch
            {
                > 0.001m => ExchangeRateTrend.Rising,
                < -0.001m => ExchangeRateTrend.Falling,
                _ => ExchangeRateTrend.Stable
            };
        }
    }

    public void SetManualEntry(int userId, string? notes = null)
    {
        IsManualEntry = true;
        EnteredByUserId = userId;
        Source = ExchangeRateSource.Manual;
        Notes = notes;
    }

    public void SetAsDefaultForDate()
    {
        IsDefaultForDate = true;
    }

    public void RemoveDefaultForDate()
    {
        IsDefaultForDate = false;
    }

    public void MarkAsIntegrated(DateTime integrationDate)
    {
        IntegrationDate = integrationDate;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void Invalidate()
    {
        IsValid = false;
        IsActive = false;
    }

    /// <summary>
    /// Tutarı çevir (Convert Amount)
    /// </summary>
    public decimal Convert(decimal amount, bool useBuying = false)
    {
        var rate = useBuying ? (ForexBuying ?? AverageRate) : (ForexSelling ?? AverageRate);
        return amount * rate / Unit;
    }

    /// <summary>
    /// Ters çevir (Reverse Convert)
    /// </summary>
    public decimal ReverseConvert(decimal amount, bool useSelling = false)
    {
        var rate = useSelling ? (ForexSelling ?? AverageRate) : (ForexBuying ?? AverageRate);
        if (rate == 0) return 0;
        return amount * Unit / rate;
    }

    /// <summary>
    /// Çapraz kur hesapla (Calculate Cross Rate)
    /// </summary>
    public static decimal CalculateCrossRate(ExchangeRate rate1, ExchangeRate rate2)
    {
        if (rate1.TargetCurrency != rate2.TargetCurrency)
            throw new InvalidOperationException("Target currencies must be the same for cross rate calculation");

        if (rate2.AverageRate == 0)
            return 0;

        return rate1.AverageRate / rate2.AverageRate;
    }

    #region Factory Methods

    /// <summary>
    /// TCMB kuru oluştur (Create TCMB rate)
    /// </summary>
    public static ExchangeRate CreateTcmbRate(
        string currencyCode,
        DateTime date,
        decimal forexBuying,
        decimal forexSelling,
        decimal? banknoteBuying = null,
        decimal? banknoteSelling = null,
        string? bulletinNumber = null,
        int unit = 1)
    {
        var rate = new ExchangeRate(
            currencyCode,
            "TRY",
            date,
            (forexBuying + forexSelling) / 2,
            ExchangeRateType.Daily,
            ExchangeRateSource.TCMB,
            unit);

        rate.SetForexRates(forexBuying, forexSelling);
        rate.SetBanknoteRates(banknoteBuying, banknoteSelling);
        rate.SetTcmbInfo(bulletinNumber, null, null);

        return rate;
    }

    /// <summary>
    /// Manuel kur oluştur (Create manual rate)
    /// </summary>
    public static ExchangeRate CreateManualRate(
        string sourceCurrency,
        string targetCurrency,
        DateTime date,
        decimal rate,
        int userId,
        string? notes = null)
    {
        var exchangeRate = new ExchangeRate(
            sourceCurrency,
            targetCurrency,
            date,
            rate,
            ExchangeRateType.Manual,
            ExchangeRateSource.Manual);

        exchangeRate.SetManualEntry(userId, notes);

        return exchangeRate;
    }

    /// <summary>
    /// Aylık ortalama kur oluştur (Create monthly average rate)
    /// </summary>
    public static ExchangeRate CreateMonthlyAverageRate(
        string currencyCode,
        int year,
        int month,
        decimal averageRate)
    {
        var date = new DateTime(year, month, 1);

        return new ExchangeRate(
            currencyCode,
            "TRY",
            date,
            averageRate,
            ExchangeRateType.MonthlyAverage,
            ExchangeRateSource.TCMB);
    }

    /// <summary>
    /// Yıllık ortalama kur oluştur (Create yearly average rate)
    /// </summary>
    public static ExchangeRate CreateYearlyAverageRate(
        string currencyCode,
        int year,
        decimal averageRate)
    {
        var date = new DateTime(year, 1, 1);

        return new ExchangeRate(
            currencyCode,
            "TRY",
            date,
            averageRate,
            ExchangeRateType.YearlyAverage,
            ExchangeRateSource.TCMB);
    }

    #endregion
}

/// <summary>
/// Döviz Kuru Türleri (Exchange Rate Types)
/// </summary>
public enum ExchangeRateType
{
    /// <summary>
    /// Günlük (Daily)
    /// </summary>
    Daily = 1,

    /// <summary>
    /// Haftalık Ortalama (Weekly Average)
    /// </summary>
    WeeklyAverage = 2,

    /// <summary>
    /// Aylık Ortalama (Monthly Average)
    /// </summary>
    MonthlyAverage = 3,

    /// <summary>
    /// Yıllık Ortalama (Yearly Average)
    /// </summary>
    YearlyAverage = 4,

    /// <summary>
    /// Ay Sonu (Month End)
    /// </summary>
    MonthEnd = 5,

    /// <summary>
    /// Yıl Sonu (Year End)
    /// </summary>
    YearEnd = 6,

    /// <summary>
    /// Spot (Spot Rate)
    /// </summary>
    Spot = 7,

    /// <summary>
    /// Manuel (Manual Entry)
    /// </summary>
    Manual = 99
}

/// <summary>
/// Döviz Kuru Kaynakları (Exchange Rate Sources)
/// </summary>
public enum ExchangeRateSource
{
    /// <summary>
    /// TCMB - Türkiye Cumhuriyet Merkez Bankası
    /// </summary>
    TCMB = 1,

    /// <summary>
    /// ECB - European Central Bank
    /// </summary>
    ECB = 2,

    /// <summary>
    /// Reuters
    /// </summary>
    Reuters = 3,

    /// <summary>
    /// Bloomberg
    /// </summary>
    Bloomberg = 4,

    /// <summary>
    /// Banka (Bank)
    /// </summary>
    Bank = 5,

    /// <summary>
    /// XE.com
    /// </summary>
    XE = 6,

    /// <summary>
    /// Manuel (Manual Entry)
    /// </summary>
    Manual = 99
}

/// <summary>
/// Döviz Kuru Trendi (Exchange Rate Trend)
/// </summary>
public enum ExchangeRateTrend
{
    /// <summary>
    /// Yükseliyor (Rising)
    /// </summary>
    Rising = 1,

    /// <summary>
    /// Düşüyor (Falling)
    /// </summary>
    Falling = 2,

    /// <summary>
    /// Sabit (Stable)
    /// </summary>
    Stable = 3
}

/// <summary>
/// Para Birimi Bilgileri (Currency Information)
/// </summary>
public class Currency : BaseEntity
{
    /// <summary>
    /// ISO Kodu (ISO Code)
    /// </summary>
    public string IsoCode { get; private set; } = string.Empty;

    /// <summary>
    /// Sayısal Kod (Numeric Code)
    /// </summary>
    public string NumericCode { get; private set; } = string.Empty;

    /// <summary>
    /// Adı (Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Türkçe Adı (Turkish Name)
    /// </summary>
    public string? NameTurkish { get; private set; }

    /// <summary>
    /// Sembol (Symbol)
    /// </summary>
    public string Symbol { get; private set; } = string.Empty;

    /// <summary>
    /// Ondalık Basamak (Decimal Places)
    /// </summary>
    public int DecimalPlaces { get; private set; } = 2;

    /// <summary>
    /// Ülke (Country)
    /// </summary>
    public string? Country { get; private set; }

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Ana Para Birimi mi? (Is Base Currency)
    /// </summary>
    public bool IsBaseCurrency { get; private set; }

    /// <summary>
    /// Sıralama (Sort Order)
    /// </summary>
    public int SortOrder { get; private set; }

    protected Currency() { }

    public Currency(
        string isoCode,
        string numericCode,
        string name,
        string symbol,
        int decimalPlaces = 2)
    {
        IsoCode = isoCode.ToUpperInvariant();
        NumericCode = numericCode;
        Name = name;
        Symbol = symbol;
        DecimalPlaces = decimalPlaces;
        IsActive = true;
        IsBaseCurrency = false;
    }

    public void SetTurkishName(string? nameTurkish)
    {
        NameTurkish = nameTurkish;
    }

    public void SetCountry(string? country)
    {
        Country = country;
    }

    public void SetAsBaseCurrency()
    {
        IsBaseCurrency = true;
    }

    public void RemoveBaseCurrency()
    {
        IsBaseCurrency = false;
    }

    public void SetSortOrder(int order)
    {
        SortOrder = order;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// TRY (Türk Lirası)
    /// </summary>
    public static Currency TRY => new("TRY", "949", "Turkish Lira", "₺", 2)
    {
        NameTurkish = "Türk Lirası",
        Country = "Türkiye",
        IsBaseCurrency = true,
        SortOrder = 1
    };

    /// <summary>
    /// USD (Amerikan Doları)
    /// </summary>
    public static Currency USD => new("USD", "840", "US Dollar", "$", 2)
    {
        NameTurkish = "Amerikan Doları",
        Country = "United States",
        SortOrder = 2
    };

    /// <summary>
    /// EUR (Euro)
    /// </summary>
    public static Currency EUR => new("EUR", "978", "Euro", "€", 2)
    {
        NameTurkish = "Euro",
        Country = "European Union",
        SortOrder = 3
    };

    /// <summary>
    /// GBP (İngiliz Sterlini)
    /// </summary>
    public static Currency GBP => new("GBP", "826", "British Pound", "£", 2)
    {
        NameTurkish = "İngiliz Sterlini",
        Country = "United Kingdom",
        SortOrder = 4
    };

    /// <summary>
    /// CHF (İsviçre Frangı)
    /// </summary>
    public static Currency CHF => new("CHF", "756", "Swiss Franc", "CHF", 2)
    {
        NameTurkish = "İsviçre Frangı",
        Country = "Switzerland",
        SortOrder = 5
    };

    /// <summary>
    /// JPY (Japon Yeni)
    /// </summary>
    public static Currency JPY => new("JPY", "392", "Japanese Yen", "¥", 0)
    {
        NameTurkish = "Japon Yeni",
        Country = "Japan",
        SortOrder = 6
    };

    /// <summary>
    /// SAR (Suudi Arabistan Riyali)
    /// </summary>
    public static Currency SAR => new("SAR", "682", "Saudi Riyal", "﷼", 2)
    {
        NameTurkish = "Suudi Arabistan Riyali",
        Country = "Saudi Arabia",
        SortOrder = 7
    };

    /// <summary>
    /// AED (BAE Dirhemi)
    /// </summary>
    public static Currency AED => new("AED", "784", "UAE Dirham", "د.إ", 2)
    {
        NameTurkish = "BAE Dirhemi",
        Country = "United Arab Emirates",
        SortOrder = 8
    };

    /// <summary>
    /// RUB (Rus Rublesi)
    /// </summary>
    public static Currency RUB => new("RUB", "643", "Russian Ruble", "₽", 2)
    {
        NameTurkish = "Rus Rublesi",
        Country = "Russia",
        SortOrder = 9
    };

    /// <summary>
    /// CNY (Çin Yuanı)
    /// </summary>
    public static Currency CNY => new("CNY", "156", "Chinese Yuan", "¥", 2)
    {
        NameTurkish = "Çin Yuanı",
        Country = "China",
        SortOrder = 10
    };
}
