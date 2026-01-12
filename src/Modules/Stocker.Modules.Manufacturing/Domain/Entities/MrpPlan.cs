using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// MRP Planı - Material Requirements Planning çalıştırma kaydı
/// </summary>
public class MrpPlan : BaseEntity
{
    public string PlanNumber { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public MrpPlanType Type { get; private set; }
    public MrpPlanStatus Status { get; private set; }

    // Planlama parametreleri
    public DateTime PlanningHorizonStart { get; private set; }
    public DateTime PlanningHorizonEnd { get; private set; }
    public int PlanningBucketDays { get; private set; } // Günlük, haftalık, aylık
    public bool IncludeSafetyStock { get; private set; }
    public bool ConsiderLeadTimes { get; private set; }
    public bool NetChangeOnly { get; private set; } // Sadece değişen kalemler

    // Lot sizing parametreleri
    public LotSizingMethod DefaultLotSizingMethod { get; private set; }
    public decimal? FixedOrderQuantity { get; private set; }
    public int? PeriodsOfSupply { get; private set; }

    // Çalıştırma bilgileri
    public DateTime? ExecutionStartTime { get; private set; }
    public DateTime? ExecutionEndTime { get; private set; }
    public int? ProcessedItemCount { get; private set; }
    public int? GeneratedRequirementCount { get; private set; }
    public int? GeneratedOrderCount { get; private set; }

    public string? ExecutedBy { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovalDate { get; private set; }

    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ICollection<MrpRequirement> Requirements { get; private set; } = new List<MrpRequirement>();
    public virtual ICollection<PlannedOrder> PlannedOrders { get; private set; } = new List<PlannedOrder>();
    public virtual ICollection<MrpException> Exceptions { get; private set; } = new List<MrpException>();

    protected MrpPlan() { }

    public MrpPlan(string planNumber, string name, MrpPlanType type, DateTime horizonStart, DateTime horizonEnd)
    {
        PlanNumber = planNumber;
        Name = name;
        Type = type;
        Status = MrpPlanStatus.Taslak;
        PlanningHorizonStart = horizonStart;
        PlanningHorizonEnd = horizonEnd;
        PlanningBucketDays = 7; // Default haftalık
        IncludeSafetyStock = true;
        ConsiderLeadTimes = true;
        NetChangeOnly = false;
        DefaultLotSizingMethod = LotSizingMethod.LotForLot;
        IsActive = true;
    }

    public void SetPlanningParameters(int bucketDays, bool includeSafetyStock, bool considerLeadTimes, bool netChangeOnly)
    {
        PlanningBucketDays = bucketDays;
        IncludeSafetyStock = includeSafetyStock;
        ConsiderLeadTimes = considerLeadTimes;
        NetChangeOnly = netChangeOnly;
    }

    public void SetLotSizingMethod(LotSizingMethod method, decimal? fixedQuantity = null, int? periodsOfSupply = null)
    {
        DefaultLotSizingMethod = method;
        FixedOrderQuantity = fixedQuantity;
        PeriodsOfSupply = periodsOfSupply;
    }

    public void StartExecution(string executedBy)
    {
        if (Status != MrpPlanStatus.Taslak && Status != MrpPlanStatus.Hazır)
            throw new InvalidOperationException("Plan sadece taslak veya hazır durumundayken çalıştırılabilir.");

        Status = MrpPlanStatus.Çalışıyor;
        ExecutionStartTime = DateTime.UtcNow;
        ExecutedBy = executedBy;
    }

    public void CompleteExecution(int processedItems, int generatedRequirements, int generatedOrders)
    {
        Status = MrpPlanStatus.Tamamlandı;
        ExecutionEndTime = DateTime.UtcNow;
        ProcessedItemCount = processedItems;
        GeneratedRequirementCount = generatedRequirements;
        GeneratedOrderCount = generatedOrders;
    }

    public void FailExecution(string errorMessage)
    {
        Status = MrpPlanStatus.Hatalı;
        ExecutionEndTime = DateTime.UtcNow;
        Notes = $"Hata: {errorMessage}. {Notes}";
    }

    public void Approve(string approvedBy)
    {
        if (Status != MrpPlanStatus.Tamamlandı)
            throw new InvalidOperationException("Sadece tamamlanmış planlar onaylanabilir.");

        Status = MrpPlanStatus.Onaylandı;
        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == MrpPlanStatus.Çalışıyor)
            throw new InvalidOperationException("Çalışan plan iptal edilemez.");

        Status = MrpPlanStatus.İptal;
    }

    public MrpRequirement AddRequirement(int productId, DateTime requirementDate, decimal grossRequirement,
        decimal onHandStock, decimal scheduledReceipts, decimal safetyStock)
    {
        var netRequirement = Math.Max(0, grossRequirement - onHandStock - scheduledReceipts + safetyStock);

        var requirement = new MrpRequirement(
            Id, productId, requirementDate, grossRequirement,
            onHandStock, scheduledReceipts, safetyStock, netRequirement);

        Requirements.Add(requirement);
        return requirement;
    }

    public PlannedOrder AddPlannedOrder(int productId, decimal quantity, string unit,
        DateTime plannedStartDate, DateTime plannedEndDate, PlannedOrderType orderType)
    {
        var order = new PlannedOrder(Id, productId, quantity, unit, plannedStartDate, plannedEndDate, orderType);
        PlannedOrders.Add(order);
        return order;
    }

    public MrpException AddException(int productId, MrpExceptionType exceptionType, string message)
    {
        var exception = new MrpException(Id, productId, exceptionType, message);
        Exceptions.Add(exception);
        return exception;
    }

    public void SetNotes(string? notes) => Notes = notes;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// MRP Gereksinim - Ürün bazlı malzeme gereksinimi
/// </summary>
public class MrpRequirement : BaseEntity
{
    public int MrpPlanId { get; private set; }
    public int ProductId { get; private set; }
    public DateTime RequirementDate { get; private set; }
    public int PeriodNumber { get; private set; }

    // Gereksinim hesaplamaları
    public decimal GrossRequirement { get; private set; }
    public decimal OnHandStock { get; private set; }
    public decimal ScheduledReceipts { get; private set; }
    public decimal SafetyStock { get; private set; }
    public decimal NetRequirement { get; private set; }
    public decimal PlannedOrderReceipt { get; private set; }
    public decimal PlannedOrderRelease { get; private set; }
    public decimal ProjectedOnHand { get; private set; }

    // Kaynak bilgisi
    public string? DemandSource { get; private set; } // SalesOrder, ProductionOrder, Forecast
    public int? DemandSourceId { get; private set; }

    public bool IsProcessed { get; private set; }

    // Navigation
    public virtual MrpPlan MrpPlan { get; private set; } = null!;

    protected MrpRequirement() { }

    public MrpRequirement(int mrpPlanId, int productId, DateTime requirementDate,
        decimal grossRequirement, decimal onHandStock, decimal scheduledReceipts,
        decimal safetyStock, decimal netRequirement)
    {
        MrpPlanId = mrpPlanId;
        ProductId = productId;
        RequirementDate = requirementDate;
        GrossRequirement = grossRequirement;
        OnHandStock = onHandStock;
        ScheduledReceipts = scheduledReceipts;
        SafetyStock = safetyStock;
        NetRequirement = netRequirement;
        ProjectedOnHand = onHandStock + scheduledReceipts - grossRequirement;
        IsProcessed = false;
    }

    public void SetPeriodNumber(int periodNumber) => PeriodNumber = periodNumber;

    public void SetDemandSource(string source, int? sourceId)
    {
        DemandSource = source;
        DemandSourceId = sourceId;
    }

    public void SetPlannedOrders(decimal receipt, decimal release)
    {
        PlannedOrderReceipt = receipt;
        PlannedOrderRelease = release;
        ProjectedOnHand = OnHandStock + ScheduledReceipts + PlannedOrderReceipt - GrossRequirement;
    }

    public void MarkAsProcessed() => IsProcessed = true;
}

/// <summary>
/// Planlı Sipariş - MRP tarafından oluşturulan sipariş önerileri
/// </summary>
public class PlannedOrder : BaseEntity
{
    public int MrpPlanId { get; private set; }
    public int ProductId { get; private set; }
    public PlannedOrderType OrderType { get; private set; }
    public PlannedOrderStatus Status { get; private set; }

    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = null!;

    public DateTime PlannedStartDate { get; private set; }
    public DateTime PlannedEndDate { get; private set; }
    public DateTime? ReleaseDate { get; private set; }

    // Lot sizing bilgisi
    public LotSizingMethod LotSizingMethod { get; private set; }
    public decimal OriginalQuantity { get; private set; } // Lot sizing öncesi miktar

    // Dönüştürme bilgileri
    public int? ConvertedToOrderId { get; private set; }
    public string? ConvertedToOrderType { get; private set; } // ProductionOrder, PurchaseOrder
    public DateTime? ConversionDate { get; private set; }
    public string? ConvertedBy { get; private set; }

    public string? Notes { get; private set; }

    // Navigation
    public virtual MrpPlan MrpPlan { get; private set; } = null!;

    protected PlannedOrder() { }

    public PlannedOrder(int mrpPlanId, int productId, decimal quantity, string unit,
        DateTime plannedStartDate, DateTime plannedEndDate, PlannedOrderType orderType)
    {
        MrpPlanId = mrpPlanId;
        ProductId = productId;
        Quantity = quantity;
        OriginalQuantity = quantity;
        Unit = unit;
        PlannedStartDate = plannedStartDate;
        PlannedEndDate = plannedEndDate;
        OrderType = orderType;
        Status = PlannedOrderStatus.Önerildi;
        LotSizingMethod = LotSizingMethod.LotForLot;
    }

    public void SetLotSizing(LotSizingMethod method, decimal adjustedQuantity)
    {
        LotSizingMethod = method;
        Quantity = adjustedQuantity;
    }

    public void Confirm()
    {
        if (Status != PlannedOrderStatus.Önerildi)
            throw new InvalidOperationException("Sadece önerilen siparişler onaylanabilir.");

        Status = PlannedOrderStatus.Onaylandı;
    }

    public void Release()
    {
        if (Status != PlannedOrderStatus.Onaylandı)
            throw new InvalidOperationException("Sadece onaylanmış siparişler serbest bırakılabilir.");

        Status = PlannedOrderStatus.Serbest;
        ReleaseDate = DateTime.UtcNow;
    }

    public void ConvertToOrder(int orderId, string orderType, string convertedBy)
    {
        if (Status != PlannedOrderStatus.Serbest && Status != PlannedOrderStatus.Onaylandı)
            throw new InvalidOperationException("Sadece serbest veya onaylanmış siparişler dönüştürülebilir.");

        Status = PlannedOrderStatus.Dönüştürüldü;
        ConvertedToOrderId = orderId;
        ConvertedToOrderType = orderType;
        ConversionDate = DateTime.UtcNow;
        ConvertedBy = convertedBy;
    }

    public void Cancel()
    {
        if (Status == PlannedOrderStatus.Dönüştürüldü)
            throw new InvalidOperationException("Dönüştürülmüş sipariş iptal edilemez.");

        Status = PlannedOrderStatus.İptal;
    }

    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// MRP İstisna - Planlama sırasında oluşan uyarı ve hatalar
/// </summary>
public class MrpException : BaseEntity
{
    public int MrpPlanId { get; private set; }
    public int? ProductId { get; private set; }
    public MrpExceptionType ExceptionType { get; private set; }
    public MrpExceptionSeverity Severity { get; private set; }

    public string Message { get; private set; } = null!;
    public string? Details { get; private set; }
    public DateTime OccurredAt { get; private set; }

    public bool IsResolved { get; private set; }
    public string? ResolvedBy { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public string? ResolutionNotes { get; private set; }

    // Navigation
    public virtual MrpPlan MrpPlan { get; private set; } = null!;

    protected MrpException() { }

    public MrpException(int mrpPlanId, int? productId, MrpExceptionType exceptionType, string message)
    {
        MrpPlanId = mrpPlanId;
        ProductId = productId;
        ExceptionType = exceptionType;
        Message = message;
        OccurredAt = DateTime.UtcNow;
        IsResolved = false;

        // Severity'yi exception type'a göre belirle
        Severity = exceptionType switch
        {
            MrpExceptionType.BomEksik => MrpExceptionSeverity.Kritik,
            MrpExceptionType.RotaEksik => MrpExceptionSeverity.Kritik,
            MrpExceptionType.LeadTimeAşımı => MrpExceptionSeverity.Orta,
            MrpExceptionType.KapasiteYetersiz => MrpExceptionSeverity.Yüksek,
            MrpExceptionType.StokYetersiz => MrpExceptionSeverity.Orta,
            MrpExceptionType.TedarikçiEksik => MrpExceptionSeverity.Yüksek,
            _ => MrpExceptionSeverity.Bilgi
        };
    }

    public void SetDetails(string details) => Details = details;

    public void Resolve(string resolvedBy, string? notes)
    {
        IsResolved = true;
        ResolvedBy = resolvedBy;
        ResolvedAt = DateTime.UtcNow;
        ResolutionNotes = notes;
    }
}
