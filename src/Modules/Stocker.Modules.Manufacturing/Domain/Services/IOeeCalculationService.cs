using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Services;

/// <summary>
/// OEE (Overall Equipment Effectiveness) hesaplama servisi
/// Genel Ekipman Verimliliği
/// </summary>
public interface IOeeCalculationService
{
    /// <summary>
    /// Makine için OEE hesaplar
    /// </summary>
    OeeResult CalculateMachineOee(
        Machine machine,
        DateTime startDate,
        DateTime endDate,
        IEnumerable<ProductionOperation> operations,
        IEnumerable<MachineDowntime>? downtimes = null);

    /// <summary>
    /// İş merkezi için OEE hesaplar
    /// </summary>
    OeeResult CalculateWorkCenterOee(
        WorkCenter workCenter,
        DateTime startDate,
        DateTime endDate,
        IEnumerable<ProductionOperation> operations);

    /// <summary>
    /// Üretim emri için OEE hesaplar
    /// </summary>
    OeeResult CalculateProductionOrderOee(
        ProductionOrder order,
        IEnumerable<ProductionOperation> operations);

    /// <summary>
    /// Kullanılabilirlik oranı hesaplar
    /// </summary>
    decimal CalculateAvailability(
        decimal plannedProductionTime,
        decimal actualRunTime,
        decimal downtime);

    /// <summary>
    /// Performans oranı hesaplar
    /// </summary>
    decimal CalculatePerformance(
        decimal idealCycleTime,
        decimal actualCycleTime,
        decimal totalPieces);

    /// <summary>
    /// Kalite oranı hesaplar
    /// </summary>
    decimal CalculateQuality(
        decimal totalPieces,
        decimal goodPieces);

    /// <summary>
    /// OEE trend analizi yapar
    /// </summary>
    OeeTrendAnalysis AnalyzeTrend(
        IEnumerable<OeeResult> historicalData,
        int periodDays = 30);

    /// <summary>
    /// Kayıp analizi yapar (Six Big Losses)
    /// </summary>
    LossAnalysis AnalyzeLosses(
        Machine machine,
        DateTime startDate,
        DateTime endDate,
        IEnumerable<ProductionOperation> operations,
        IEnumerable<MachineDowntime>? downtimes = null);
}

/// <summary>
/// OEE hesaplama sonucu
/// </summary>
public record OeeResult(
    // Temel metrikler
    decimal Availability,      // Kullanılabilirlik (%)
    decimal Performance,       // Performans (%)
    decimal Quality,          // Kalite (%)
    decimal Oee,              // OEE = Availability * Performance * Quality (%)

    // Zaman metrikleri (dakika)
    decimal PlannedProductionTime,
    decimal ActualRunTime,
    decimal IdealCycleTime,
    decimal ActualCycleTime,
    decimal TotalDowntime,

    // Üretim metrikleri
    decimal TotalPieces,
    decimal GoodPieces,
    decimal DefectPieces,
    decimal ScrapPieces,

    // Değerlendirme
    string OeeClass,          // World Class (85%+), Good (75-85%), Average (60-75%), Poor (<60%)
    IReadOnlyList<string> ImprovementSuggestions,

    // Referans bilgiler
    DateTime PeriodStart,
    DateTime PeriodEnd);

/// <summary>
/// OEE trend analizi
/// </summary>
public record OeeTrendAnalysis(
    // Trend özeti
    decimal AverageOee,
    decimal MinOee,
    decimal MaxOee,
    decimal StandardDeviation,
    string TrendDirection,    // Yükselen, Düşen, Stabil
    decimal TrendSlope,

    // Dönemsel veriler
    IReadOnlyList<PeriodOee> PeriodData,

    // Analiz
    IReadOnlyList<string> Insights,
    IReadOnlyList<string> Recommendations);

/// <summary>
/// Dönemsel OEE
/// </summary>
public record PeriodOee(
    DateTime Date,
    decimal Oee,
    decimal Availability,
    decimal Performance,
    decimal Quality);

/// <summary>
/// Kayıp analizi (Six Big Losses)
/// </summary>
public record LossAnalysis(
    // Kullanılabilirlik kayıpları
    decimal EquipmentFailure,           // Ekipman arızası
    decimal SetupAndAdjustment,         // Kurulum ve ayar

    // Performans kayıpları
    decimal IdlingAndMinorStops,        // Boşta kalma ve küçük duruşlar
    decimal ReducedSpeed,               // Hız düşüşü

    // Kalite kayıpları
    decimal ProcessDefects,             // Proses hataları
    decimal ReducedYield,               // Başlangıç kayıpları (startup)

    // Toplam
    decimal TotalLossTime,
    decimal TotalLossPercent,

    // Pareto analizi
    IReadOnlyList<LossItem> LossByCategory,

    // Öneriler
    IReadOnlyList<LossReduction> ReductionOpportunities);

/// <summary>
/// Kayıp kalemi
/// </summary>
public record LossItem(
    string Category,
    string Description,
    decimal LossTime,          // Dakika
    decimal LossPercent,
    decimal CumulativePercent,
    string Priority);          // Yüksek, Orta, Düşük

/// <summary>
/// Kayıp azaltma fırsatı
/// </summary>
public record LossReduction(
    string LossCategory,
    string Action,
    decimal PotentialSaving,   // Dakika/gün
    decimal EstimatedOeeGain,  // %
    string Complexity,         // Kolay, Orta, Zor
    string TimeToImplement);   // Kısa vadeli, Orta vadeli, Uzun vadeli
