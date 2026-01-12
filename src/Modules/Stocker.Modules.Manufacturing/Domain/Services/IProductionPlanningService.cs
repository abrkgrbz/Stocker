using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Services;

/// <summary>
/// Üretim planlama servisi - MRP, kapasite planlama, çizelgeleme
/// </summary>
public interface IProductionPlanningService
{
    /// <summary>
    /// Üretim emri için çizelgeleme yapar
    /// </summary>
    Task<ProductionScheduleResult> ScheduleProductionOrderAsync(
        ProductionOrder order,
        IEnumerable<Machine> availableMachines,
        IEnumerable<WorkCenter> workCenters,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Kapasiteye göre üretim başlangıç tarihi hesaplar
    /// </summary>
    DateTime CalculateStartDate(
        ProductionOrder order,
        Routing routing,
        IEnumerable<Machine> machines);

    /// <summary>
    /// Toplam üretim süresini hesaplar (dakika)
    /// </summary>
    decimal CalculateTotalProductionTime(
        Routing routing,
        decimal quantity);

    /// <summary>
    /// İş merkezi yükünü hesaplar
    /// </summary>
    WorkCenterLoadResult CalculateWorkCenterLoad(
        WorkCenter workCenter,
        DateTime startDate,
        DateTime endDate,
        IEnumerable<ProductionOrder> orders);

    /// <summary>
    /// Darboğaz analizi yapar
    /// </summary>
    IEnumerable<BottleneckInfo> AnalyzeBottlenecks(
        IEnumerable<WorkCenter> workCenters,
        IEnumerable<ProductionOrder> orders,
        DateTime analysisDate);

    /// <summary>
    /// Malzeme ihtiyaç planlaması (MRP)
    /// </summary>
    Task<MrpResult> CalculateMaterialRequirementsAsync(
        ProductionOrder order,
        BillOfMaterial bom,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Üretim çizelgeleme sonucu
/// </summary>
public record ProductionScheduleResult(
    DateTime SuggestedStartDate,
    DateTime SuggestedEndDate,
    decimal TotalSetupTime,
    decimal TotalRunTime,
    decimal TotalLeadTime,
    IReadOnlyList<OperationSchedule> OperationSchedules,
    IReadOnlyList<string> Warnings);

/// <summary>
/// Operasyon çizelgesi
/// </summary>
public record OperationSchedule(
    int OperationSequence,
    string OperationName,
    int WorkCenterId,
    string WorkCenterName,
    int? MachineId,
    string? MachineName,
    DateTime PlannedStartDate,
    DateTime PlannedEndDate,
    decimal SetupTime,
    decimal RunTime);

/// <summary>
/// İş merkezi yük sonucu
/// </summary>
public record WorkCenterLoadResult(
    int WorkCenterId,
    string WorkCenterName,
    decimal TotalCapacityMinutes,
    decimal PlannedLoadMinutes,
    decimal UtilizationRate,
    decimal AvailableCapacityMinutes,
    IReadOnlyList<DailyLoad> DailyLoads);

/// <summary>
/// Günlük yük bilgisi
/// </summary>
public record DailyLoad(
    DateTime Date,
    decimal PlannedMinutes,
    decimal CapacityMinutes,
    decimal UtilizationRate);

/// <summary>
/// Darboğaz bilgisi
/// </summary>
public record BottleneckInfo(
    int WorkCenterId,
    string WorkCenterName,
    decimal UtilizationRate,
    decimal OverloadMinutes,
    string Severity, // Kritik, Yüksek, Orta, Düşük
    IReadOnlyList<int> AffectedOrderIds);

/// <summary>
/// MRP sonucu
/// </summary>
public record MrpResult(
    IReadOnlyList<MaterialRequirement> Requirements,
    IReadOnlyList<MaterialShortage> Shortages,
    decimal TotalMaterialCost);

/// <summary>
/// Malzeme ihtiyacı
/// </summary>
public record MaterialRequirement(
    int MaterialId,
    string MaterialCode,
    string MaterialName,
    decimal RequiredQuantity,
    string Unit,
    DateTime RequiredDate,
    decimal CurrentStock,
    decimal AvailableStock,
    decimal ShortageQuantity,
    decimal UnitCost,
    decimal TotalCost);

/// <summary>
/// Malzeme eksikliği
/// </summary>
public record MaterialShortage(
    int MaterialId,
    string MaterialCode,
    string MaterialName,
    decimal ShortageQuantity,
    string Unit,
    DateTime RequiredDate,
    string SuggestedAction); // Satınalma, Üretim, Transfer
