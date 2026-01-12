using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Services;

/// <summary>
/// Üretim maliyet hesaplama servisi
/// </summary>
public interface IProductionCostingService
{
    /// <summary>
    /// Üretim emri için tahmini maliyet hesaplar
    /// </summary>
    Task<ProductionCostEstimate> CalculateEstimatedCostAsync(
        ProductionOrder order,
        BillOfMaterial bom,
        Routing routing,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Üretim emri için gerçekleşen maliyeti hesaplar
    /// </summary>
    Task<ProductionCostActual> CalculateActualCostAsync(
        ProductionOrder order,
        IEnumerable<ProductionReceipt> receipts,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Maliyet sapma analizi yapar
    /// </summary>
    CostVarianceAnalysis AnalyzeCostVariance(
        ProductionCostEstimate estimated,
        ProductionCostActual actual);

    /// <summary>
    /// Birim maliyet hesaplar
    /// </summary>
    decimal CalculateUnitCost(
        decimal totalCost,
        decimal completedQuantity);

    /// <summary>
    /// Operasyon maliyeti hesaplar
    /// </summary>
    OperationCostResult CalculateOperationCost(
        Operation operation,
        decimal quantity,
        Machine? machine = null);

    /// <summary>
    /// Malzeme maliyeti hesaplar
    /// </summary>
    MaterialCostResult CalculateMaterialCost(
        BillOfMaterial bom,
        decimal quantity);
}

/// <summary>
/// Tahmini üretim maliyeti
/// </summary>
public record ProductionCostEstimate(
    int ProductionOrderId,
    string OrderNumber,
    decimal PlannedQuantity,

    // Maliyet kalemleri
    decimal MaterialCost,
    decimal LaborCost,
    decimal MachineCost,
    decimal OverheadCost,
    decimal SubcontractCost,
    decimal SetupCost,

    // Toplamlar
    decimal TotalDirectCost,
    decimal TotalIndirectCost,
    decimal TotalCost,
    decimal UnitCost,

    // Detaylar
    IReadOnlyList<MaterialCostDetail> MaterialDetails,
    IReadOnlyList<OperationCostDetail> OperationDetails,

    DateTime CalculationDate);

/// <summary>
/// Gerçekleşen üretim maliyeti
/// </summary>
public record ProductionCostActual(
    int ProductionOrderId,
    string OrderNumber,
    decimal CompletedQuantity,

    // Maliyet kalemleri
    decimal MaterialCost,
    decimal LaborCost,
    decimal MachineCost,
    decimal OverheadCost,
    decimal SubcontractCost,
    decimal SetupCost,
    decimal ScrapCost,
    decimal ReworkCost,

    // Toplamlar
    decimal TotalDirectCost,
    decimal TotalIndirectCost,
    decimal TotalCost,
    decimal UnitCost,

    // Detaylar
    IReadOnlyList<MaterialCostDetail> MaterialDetails,
    IReadOnlyList<OperationCostDetail> OperationDetails,

    DateTime CalculationDate);

/// <summary>
/// Maliyet sapma analizi
/// </summary>
public record CostVarianceAnalysis(
    int ProductionOrderId,

    // Sapma tutarları
    decimal MaterialVariance,
    decimal LaborVariance,
    decimal MachineVariance,
    decimal OverheadVariance,
    decimal TotalVariance,

    // Sapma yüzdeleri
    decimal MaterialVariancePercent,
    decimal LaborVariancePercent,
    decimal MachineVariancePercent,
    decimal OverheadVariancePercent,
    decimal TotalVariancePercent,

    // Sapma nedenleri
    IReadOnlyList<VarianceReason> Reasons,

    // Değerlendirme
    string OverallAssessment, // İyi, Kabul Edilebilir, Dikkat Gerekli, Kritik
    IReadOnlyList<string> Recommendations);

/// <summary>
/// Sapma nedeni
/// </summary>
public record VarianceReason(
    string Category, // Malzeme, İşçilik, Makine, Genel Gider
    string Description,
    decimal Impact,
    string Severity); // Düşük, Orta, Yüksek

/// <summary>
/// Malzeme maliyet detayı
/// </summary>
public record MaterialCostDetail(
    int MaterialId,
    string MaterialCode,
    string MaterialName,
    decimal PlannedQuantity,
    decimal ActualQuantity,
    decimal UnitCost,
    decimal PlannedCost,
    decimal ActualCost,
    decimal Variance);

/// <summary>
/// Operasyon maliyet detayı
/// </summary>
public record OperationCostDetail(
    int OperationSequence,
    string OperationName,
    string WorkCenterName,
    decimal PlannedTime,
    decimal ActualTime,
    decimal LaborCost,
    decimal MachineCost,
    decimal OverheadCost,
    decimal TotalCost,
    decimal Variance);

/// <summary>
/// Operasyon maliyet sonucu
/// </summary>
public record OperationCostResult(
    decimal SetupCost,
    decimal RunCost,
    decimal MachineCost,
    decimal LaborCost,
    decimal OverheadCost,
    decimal TotalCost);

/// <summary>
/// Malzeme maliyet sonucu
/// </summary>
public record MaterialCostResult(
    decimal TotalCost,
    IReadOnlyList<MaterialCostDetail> Details);
