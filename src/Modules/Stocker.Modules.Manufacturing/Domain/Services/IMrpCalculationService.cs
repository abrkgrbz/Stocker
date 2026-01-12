using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Services;

/// <summary>
/// MRP Hesaplama Servisi - Net gereksinim hesaplama ve lot boyutlandırma
/// </summary>
public interface IMrpCalculationService
{
    /// <summary>
    /// MRP planı çalıştırır ve tüm gereksinimleri hesaplar
    /// </summary>
    Task<MrpCalculationResult> ExecuteMrpAsync(
        Guid tenantId,
        MrpPlan plan,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tek bir ürün için net gereksinim hesaplar
    /// </summary>
    Task<NetRequirementResult> CalculateNetRequirementAsync(
        Guid tenantId,
        Guid productId,
        DateTime periodStart,
        DateTime periodEnd,
        decimal grossRequirement,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// BOM patlatma yapar - tüm alt bileşenleri getirir
    /// </summary>
    Task<IReadOnlyList<BomExplosionItem>> ExplodeBomAsync(
        Guid tenantId,
        Guid productId,
        decimal quantity,
        int maxLevel = 99,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Lot boyutlandırma algoritması uygular
    /// </summary>
    decimal ApplyLotSizing(
        LotSizingMethod method,
        decimal netRequirement,
        decimal minimumOrderQty,
        decimal maximumOrderQty,
        decimal orderMultiple,
        decimal? economicOrderQty = null,
        int? periodsOfSupply = null);

    /// <summary>
    /// Lead time offsetleme yapar - planlı sipariş tarihlerini hesaplar
    /// </summary>
    DateTime CalculatePlannedOrderDate(
        DateTime requiredDate,
        int leadTimeDays,
        int safetyLeadTimeDays = 0);

    /// <summary>
    /// MPS'den gelen talepleri MRP'ye aktarır
    /// </summary>
    Task<IReadOnlyList<MrpRequirement>> GenerateRequirementsFromMpsAsync(
        Guid tenantId,
        Guid mpsId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// MRP hesaplama sonucu
/// </summary>
public class MrpCalculationResult
{
    public bool Success { get; set; }
    public int TotalItemsProcessed { get; set; }
    public int PlannedOrdersCreated { get; set; }
    public int ExceptionsGenerated { get; set; }
    public TimeSpan ExecutionTime { get; set; }
    public IReadOnlyList<MrpRequirement> Requirements { get; set; } = new List<MrpRequirement>();
    public IReadOnlyList<PlannedOrder> PlannedOrders { get; set; } = new List<PlannedOrder>();
    public IReadOnlyList<MrpException> Exceptions { get; set; } = new List<MrpException>();
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Net gereksinim hesaplama sonucu
/// </summary>
public class NetRequirementResult
{
    public Guid ProductId { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public decimal GrossRequirement { get; set; }
    public decimal OnHandStock { get; set; }
    public decimal ScheduledReceipts { get; set; }
    public decimal SafetyStock { get; set; }
    public decimal NetRequirement { get; set; }
    public decimal ProjectedAvailableBalance { get; set; }

    /// <summary>
    /// Net Gereksinim = Brüt Gereksinim - Eldeki Stok - Planlanmış Girişler + Emniyet Stoğu
    /// </summary>
    public static decimal Calculate(decimal grossRequirement, decimal onHand, decimal scheduledReceipts, decimal safetyStock)
    {
        var net = grossRequirement - onHand - scheduledReceipts + safetyStock;
        return net > 0 ? net : 0;
    }
}

/// <summary>
/// BOM patlatma sonuç satırı
/// </summary>
public class BomExplosionItem
{
    public int Level { get; set; }
    public Guid ProductId { get; set; }
    public string? ProductCode { get; set; }
    public string? ProductName { get; set; }
    public Guid? ParentProductId { get; set; }
    public decimal RequiredQuantity { get; set; }
    public decimal CumulativeQuantity { get; set; }
    public string? UnitOfMeasure { get; set; }
    public int LeadTimeDays { get; set; }
    public bool IsPhantom { get; set; }
    public bool IsPurchased { get; set; }
    public bool IsManufactured { get; set; }
}
