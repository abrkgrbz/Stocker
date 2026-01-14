namespace Stocker.Modules.HR.Domain.Services;

/// <summary>
/// Kıdem ve İhbar Tazminatı Hesaplama Servisi
///
/// Yasal Dayanak:
/// - 4857 sayılı İş Kanunu
/// - 1475 sayılı İş Kanunu Madde 14 (Kıdem tazminatı)
/// - 4857 sayılı İş Kanunu Madde 17 (İhbar süreleri)
///
/// Hesaplama Mantığı:
/// - Kıdem: Her tam yıl için 30 günlük brüt ücret
/// - İhbar: Çalışma süresine göre 2-8 haftalık brüt ücret
/// </summary>
public class SeveranceCalculationService : ISeveranceCalculationService
{
    /// <summary>
    /// Kıdem tazminatı tavan değerleri (6 aylık dönemler)
    /// </summary>
    private static readonly List<SeveranceCeiling> CeilingHistory = new()
    {
        new SeveranceCeiling("2025/1", new DateTime(2025, 1, 1), new DateTime(2025, 6, 30), 41_828.42m),
        new SeveranceCeiling("2024/2", new DateTime(2024, 7, 1), new DateTime(2024, 12, 31), 35_058.58m),
        new SeveranceCeiling("2024/1", new DateTime(2024, 1, 1), new DateTime(2024, 6, 30), 28_761.90m),
        new SeveranceCeiling("2023/2", new DateTime(2023, 7, 1), new DateTime(2023, 12, 31), 23_489.83m),
        new SeveranceCeiling("2023/1", new DateTime(2023, 1, 1), new DateTime(2023, 6, 30), 19_982.83m),
        new SeveranceCeiling("2022/2", new DateTime(2022, 7, 1), new DateTime(2022, 12, 31), 15_371.40m),
        new SeveranceCeiling("2022/1", new DateTime(2022, 1, 1), new DateTime(2022, 6, 30), 10_596.74m),
    };

    /// <summary>
    /// İhbar süreleri (4857 sayılı İş Kanunu Madde 17)
    /// </summary>
    private static readonly List<NoticePeriodRule> NoticePeriods = new()
    {
        new NoticePeriodRule(0, 6, 14, "6 aydan az çalışma"),
        new NoticePeriodRule(6, 18, 28, "6 ay - 1.5 yıl çalışma"),
        new NoticePeriodRule(18, 36, 42, "1.5 yıl - 3 yıl çalışma"),
        new NoticePeriodRule(36, int.MaxValue, 56, "3 yıldan fazla çalışma"),
    };

    /// <summary>
    /// Damga vergisi oranı
    /// </summary>
    private const decimal StampTaxRate = 0.00759m;

    /// <summary>
    /// Kıdem ve ihbar tazminatı hesaplama
    /// </summary>
    public SeveranceCalculationResult Calculate(SeveranceCalculationRequest request)
    {
        ValidateRequest(request);

        var terminationInfo = GetTerminationInfo(request.TerminationType);
        var workDuration = CalculateWorkDuration(request.HireDate, request.TerminationDate);
        var ceiling = GetSeveranceCeiling(request.TerminationDate);

        // Günlük brüt ücret hesaplama (yan haklar dahil)
        var totalMonthlyWage = request.BaseSalary
            + (request.BonusPerMonth ?? 0)
            + (request.FoodAllowance ?? 0)
            + (request.TransportAllowance ?? 0)
            + (request.OtherBenefits ?? 0);

        var dailyWage = totalMonthlyWage / 30;

        // Tavan kontrolü
        var effectiveDailyWage = Math.Min(dailyWage, ceiling.Amount / 30);
        var isAboveCeiling = dailyWage > (ceiling.Amount / 30);

        // Kıdem tazminatı hesaplama
        decimal grossSeverance = 0;
        decimal severanceTax = 0;
        decimal netSeverance = 0;

        if (terminationInfo.SeveranceEligible && workDuration.TotalYears >= 1)
        {
            // Her tam yıl için 30 günlük ücret
            var severanceDays = workDuration.TotalYears * 30;
            // Kalan aylar için orantılı hesaplama
            severanceDays += (workDuration.RemainingMonths * 30) / 12m;

            grossSeverance = severanceDays * effectiveDailyWage;
            severanceTax = grossSeverance * StampTaxRate;
            netSeverance = grossSeverance - severanceTax;
        }

        // İhbar tazminatı hesaplama
        decimal grossNotice = 0;
        decimal noticeTax = 0;
        decimal netNotice = 0;
        var noticePeriodDays = 0;

        if (terminationInfo.NoticeEligible)
        {
            var noticePeriod = GetNoticePeriod(workDuration.TotalMonths);
            noticePeriodDays = noticePeriod.Days;

            // İhbar tazminatında tavan uygulanmaz
            grossNotice = noticePeriodDays * dailyWage;

            // İhbar tazminatı için kümülatif gelir vergisi hesaplanabilir
            // Basit hesaplama için damga vergisi
            noticeTax = CalculateNoticeTax(grossNotice, request.CumulativeIncome ?? 0);
            netNotice = grossNotice - noticeTax;
        }

        return new SeveranceCalculationResult
        {
            // Çalışma süresi
            WorkYears = workDuration.TotalYears,
            WorkMonths = workDuration.RemainingMonths,
            WorkDays = workDuration.RemainingDays,
            TotalWorkDays = workDuration.TotalDays,

            // Ücret bilgileri
            MonthlyGrossWage = totalMonthlyWage,
            DailyWage = dailyWage,
            EffectiveDailyWage = effectiveDailyWage,

            // Tavan bilgileri
            SeveranceCeiling = ceiling.Amount,
            CeilingPeriod = ceiling.Period,
            IsAboveCeiling = isAboveCeiling,

            // Kıdem tazminatı
            GrossSeverance = grossSeverance,
            SeveranceStampTax = severanceTax,
            NetSeverance = netSeverance,
            IsSeveranceEligible = terminationInfo.SeveranceEligible,

            // İhbar tazminatı
            NoticePeriodDays = noticePeriodDays,
            GrossNotice = grossNotice,
            NoticeIncomeTax = 0, // Basitleştirilmiş
            NoticeStampTax = grossNotice * StampTaxRate,
            NoticeSgkDeduction = 0, // İhbar tazminatından SGK kesilmez
            NetNotice = netNotice,
            IsNoticeEligible = terminationInfo.NoticeEligible,

            // Toplam
            TotalGross = grossSeverance + grossNotice,
            TotalTax = severanceTax + noticeTax,
            TotalNet = netSeverance + netNotice,

            // Fesih bilgileri
            TerminationType = request.TerminationType,
            TerminationDescription = terminationInfo.Description,

            // Hesaplama tarihi
            CalculationDate = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Belirli bir çalışan için tazminat hesaplama
    /// </summary>
    public SeveranceCalculationResult CalculateForEmployee(
        Entities.Employee employee,
        TerminationType terminationType,
        DateTime terminationDate,
        decimal? cumulativeIncome = null)
    {
        var request = new SeveranceCalculationRequest
        {
            EmployeeId = employee.Id,
            EmployeeCode = employee.EmployeeCode,
            EmployeeName = employee.FullName,
            HireDate = employee.HireDate,
            TerminationDate = terminationDate,
            BaseSalary = employee.BaseSalary,
            TerminationType = terminationType,
            CumulativeIncome = cumulativeIncome
        };

        return Calculate(request);
    }

    /// <summary>
    /// Toplu tazminat hesaplama (işyeri kapanması senaryosu)
    /// </summary>
    public IEnumerable<SeveranceCalculationResult> CalculateBulk(
        IEnumerable<SeveranceCalculationRequest> requests)
    {
        return requests.Select(Calculate);
    }

    /// <summary>
    /// Mevcut kıdem tazminatı tavanını döndürür
    /// </summary>
    public SeveranceCeiling GetCurrentCeiling()
    {
        return GetSeveranceCeiling(DateTime.UtcNow);
    }

    /// <summary>
    /// Tüm tavan geçmişini döndürür
    /// </summary>
    public IReadOnlyList<SeveranceCeiling> GetCeilingHistory()
    {
        return CeilingHistory.AsReadOnly();
    }

    /// <summary>
    /// İhbar süresi kurallarını döndürür
    /// </summary>
    public IReadOnlyList<NoticePeriodRule> GetNoticePeriodRules()
    {
        return NoticePeriods.AsReadOnly();
    }

    /// <summary>
    /// Fesih türü bilgilerini döndürür
    /// </summary>
    public IReadOnlyDictionary<TerminationType, TerminationTypeInfo> GetTerminationTypes()
    {
        return new Dictionary<TerminationType, TerminationTypeInfo>
        {
            { TerminationType.Resignation, new TerminationTypeInfo("İstifa", "İşçinin kendi isteğiyle işten ayrılması", false, false) },
            { TerminationType.DismissalJustified, new TerminationTypeInfo("Haklı Nedenle Fesih (İşveren)", "İşverenin haklı nedenle iş akdini feshetmesi", false, false) },
            { TerminationType.DismissalUnjustified, new TerminationTypeInfo("Haksız/Geçersiz Fesih", "İşverenin geçerli bir neden olmaksızın fesih", true, true) },
            { TerminationType.Retirement, new TerminationTypeInfo("Emeklilik", "Yaşlılık aylığı almak için ayrılma", true, false) },
            { TerminationType.Military, new TerminationTypeInfo("Askerlik", "Muvazzaf askerlik hizmeti", true, false) },
            { TerminationType.Death, new TerminationTypeInfo("Vefat", "İşçinin vefatı halinde hak sahiplerine ödeme", true, false) },
            { TerminationType.MarriageFemale, new TerminationTypeInfo("Kadın İşçi Evlilik", "Evlilikten itibaren 1 yıl içinde ayrılma", true, false) },
            { TerminationType.MutualAgreement, new TerminationTypeInfo("İkale", "Karşılıklı anlaşma ile sonlandırma", true, true) },
            { TerminationType.ContractEnd, new TerminationTypeInfo("Belirli Süreli Sözleşme Bitimi", "Sözleşme süresinin dolması", false, false) },
            { TerminationType.WorkplaceClosure, new TerminationTypeInfo("İşyeri Kapanması", "İşyerinin kapanması veya faaliyetinin durması", true, true) },
        };
    }

    #region Private Methods

    private void ValidateRequest(SeveranceCalculationRequest request)
    {
        if (request.HireDate >= request.TerminationDate)
            throw new ArgumentException("İşe giriş tarihi, işten çıkış tarihinden önce olmalıdır.");

        if (request.BaseSalary <= 0)
            throw new ArgumentException("Brüt maaş pozitif bir değer olmalıdır.");
    }

    private TerminationTypeInfo GetTerminationInfo(TerminationType type)
    {
        return GetTerminationTypes()[type];
    }

    private WorkDuration CalculateWorkDuration(DateTime hireDate, DateTime terminationDate)
    {
        var totalDays = (terminationDate - hireDate).Days;
        var years = (int)(totalDays / 365.25);
        var remainingDays = totalDays - (int)(years * 365.25);
        var months = remainingDays / 30;
        var days = remainingDays % 30;
        var totalMonths = (int)(totalDays / 30.4375);

        return new WorkDuration(years, months, days, totalDays, totalMonths);
    }

    private SeveranceCeiling GetSeveranceCeiling(DateTime date)
    {
        var ceiling = CeilingHistory.FirstOrDefault(c =>
            date >= c.StartDate && date <= c.EndDate);

        return ceiling ?? CeilingHistory.First(); // En güncel tavan
    }

    private NoticePeriodRule GetNoticePeriod(int totalMonths)
    {
        return NoticePeriods.FirstOrDefault(p =>
            totalMonths >= p.MinMonths && totalMonths < p.MaxMonths)
            ?? NoticePeriods.Last();
    }

    private decimal CalculateNoticeTax(decimal grossNotice, decimal cumulativeIncome)
    {
        // Basitleştirilmiş vergi hesabı
        // Gerçek uygulamada kümülatif gelir vergisi hesaplanmalı
        var stampTax = grossNotice * StampTaxRate;

        // Gelir vergisi dilimi hesabı (yaklaşık)
        var taxRate = cumulativeIncome switch
        {
            < 110_000 => 0.15m,
            < 230_000 => 0.20m,
            < 580_000 => 0.27m,
            < 3_000_000 => 0.35m,
            _ => 0.40m
        };

        var incomeTax = grossNotice * taxRate;
        return stampTax + incomeTax;
    }

    #endregion
}

#region Interfaces and Models

/// <summary>
/// Kıdem tazminatı hesaplama servisi interface
/// </summary>
public interface ISeveranceCalculationService
{
    SeveranceCalculationResult Calculate(SeveranceCalculationRequest request);
    SeveranceCalculationResult CalculateForEmployee(Entities.Employee employee, TerminationType terminationType, DateTime terminationDate, decimal? cumulativeIncome = null);
    IEnumerable<SeveranceCalculationResult> CalculateBulk(IEnumerable<SeveranceCalculationRequest> requests);
    SeveranceCeiling GetCurrentCeiling();
    IReadOnlyList<SeveranceCeiling> GetCeilingHistory();
    IReadOnlyList<NoticePeriodRule> GetNoticePeriodRules();
    IReadOnlyDictionary<TerminationType, TerminationTypeInfo> GetTerminationTypes();
}

/// <summary>
/// Kıdem tazminatı hesaplama isteği
/// </summary>
public class SeveranceCalculationRequest
{
    public int? EmployeeId { get; set; }
    public string? EmployeeCode { get; set; }
    public string? EmployeeName { get; set; }
    public DateTime HireDate { get; set; }
    public DateTime TerminationDate { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal? BonusPerMonth { get; set; }
    public decimal? FoodAllowance { get; set; }
    public decimal? TransportAllowance { get; set; }
    public decimal? OtherBenefits { get; set; }
    public TerminationType TerminationType { get; set; }
    public decimal? CumulativeIncome { get; set; }
}

/// <summary>
/// Kıdem tazminatı hesaplama sonucu
/// </summary>
public class SeveranceCalculationResult
{
    // Çalışma süresi
    public int WorkYears { get; set; }
    public int WorkMonths { get; set; }
    public int WorkDays { get; set; }
    public int TotalWorkDays { get; set; }

    // Ücret bilgileri
    public decimal MonthlyGrossWage { get; set; }
    public decimal DailyWage { get; set; }
    public decimal EffectiveDailyWage { get; set; }

    // Tavan bilgileri
    public decimal SeveranceCeiling { get; set; }
    public string CeilingPeriod { get; set; } = string.Empty;
    public bool IsAboveCeiling { get; set; }

    // Kıdem tazminatı
    public decimal GrossSeverance { get; set; }
    public decimal SeveranceStampTax { get; set; }
    public decimal NetSeverance { get; set; }
    public bool IsSeveranceEligible { get; set; }

    // İhbar tazminatı
    public int NoticePeriodDays { get; set; }
    public decimal GrossNotice { get; set; }
    public decimal NoticeIncomeTax { get; set; }
    public decimal NoticeStampTax { get; set; }
    public decimal NoticeSgkDeduction { get; set; }
    public decimal NetNotice { get; set; }
    public bool IsNoticeEligible { get; set; }

    // Toplam
    public decimal TotalGross { get; set; }
    public decimal TotalTax { get; set; }
    public decimal TotalNet { get; set; }

    // Fesih bilgileri
    public TerminationType TerminationType { get; set; }
    public string TerminationDescription { get; set; } = string.Empty;

    // Meta
    public DateTime CalculationDate { get; set; }
}

/// <summary>
/// Kıdem tazminatı tavanı
/// </summary>
public record SeveranceCeiling(
    string Period,
    DateTime StartDate,
    DateTime EndDate,
    decimal Amount);

/// <summary>
/// İhbar süresi kuralı
/// </summary>
public record NoticePeriodRule(
    int MinMonths,
    int MaxMonths,
    int Days,
    string Description);

/// <summary>
/// Çalışma süresi
/// </summary>
public record WorkDuration(
    int TotalYears,
    int RemainingMonths,
    int RemainingDays,
    int TotalDays,
    int TotalMonths);

/// <summary>
/// Fesih türü bilgisi
/// </summary>
public record TerminationTypeInfo(
    string Label,
    string Description,
    bool SeveranceEligible,
    bool NoticeEligible);

/// <summary>
/// Fesih türleri
/// </summary>
public enum TerminationType
{
    /// <summary>İstifa</summary>
    Resignation,

    /// <summary>Haklı Nedenle Fesih (İşveren)</summary>
    DismissalJustified,

    /// <summary>Haksız/Geçersiz Fesih</summary>
    DismissalUnjustified,

    /// <summary>Emeklilik</summary>
    Retirement,

    /// <summary>Askerlik</summary>
    Military,

    /// <summary>Vefat</summary>
    Death,

    /// <summary>Kadın İşçi Evlilik</summary>
    MarriageFemale,

    /// <summary>İkale (Karşılıklı Anlaşma)</summary>
    MutualAgreement,

    /// <summary>Belirli Süreli Sözleşme Bitimi</summary>
    ContractEnd,

    /// <summary>İşyeri Kapanması</summary>
    WorkplaceClosure
}

#endregion
