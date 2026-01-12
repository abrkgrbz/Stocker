using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Kapasite Planı (CRP - Capacity Requirements Planning)
/// İş merkezlerinin kapasite yüklemelerini hesaplar ve raporlar
/// </summary>
public class CapacityPlan : BaseEntity
{
    public string PlanNumber { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public int? MrpPlanId { get; private set; }
    public DateTime PlanningHorizonStart { get; private set; }
    public DateTime PlanningHorizonEnd { get; private set; }
    public int PlanningBucketDays { get; private set; }

    // Plan parametreleri
    public bool IsFiniteCapacity { get; private set; }
    public bool IncludeSetupTime { get; private set; }
    public bool IncludeQueueTime { get; private set; }
    public bool IncludeMoveTime { get; private set; }
    public decimal OverloadThreshold { get; private set; } // % aşırı yükleme eşiği
    public decimal BottleneckThreshold { get; private set; } // % darboğaz eşiği

    // Durum
    public CapacityPlanStatus Status { get; private set; }
    public DateTime? ExecutionStartTime { get; private set; }
    public DateTime? ExecutionEndTime { get; private set; }
    public string? ExecutedBy { get; private set; }

    // Sonuçlar
    public int WorkCenterCount { get; private set; }
    public int OverloadedPeriodCount { get; private set; }
    public int BottleneckCount { get; private set; }
    public decimal AverageUtilization { get; private set; }

    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual MrpPlan? MrpPlan { get; private set; }
    public virtual ICollection<CapacityRequirement> Requirements { get; private set; } = new List<CapacityRequirement>();
    public virtual ICollection<CapacityException> Exceptions { get; private set; } = new List<CapacityException>();

    protected CapacityPlan() { }

    public CapacityPlan(string planNumber, string name, DateTime planningHorizonStart, DateTime planningHorizonEnd)
    {
        PlanNumber = planNumber;
        Name = name;
        PlanningHorizonStart = planningHorizonStart;
        PlanningHorizonEnd = planningHorizonEnd;
        PlanningBucketDays = 1;
        IsFiniteCapacity = false;
        IncludeSetupTime = true;
        IncludeQueueTime = true;
        IncludeMoveTime = true;
        OverloadThreshold = 100;
        BottleneckThreshold = 90;
        Status = CapacityPlanStatus.Taslak;
        IsActive = true;
    }

    public void SetMrpPlan(int? mrpPlanId)
    {
        MrpPlanId = mrpPlanId;
    }

    public void SetPlanningParameters(int bucketDays, bool isFiniteCapacity, bool includeSetup, bool includeQueue, bool includeMove)
    {
        PlanningBucketDays = bucketDays;
        IsFiniteCapacity = isFiniteCapacity;
        IncludeSetupTime = includeSetup;
        IncludeQueueTime = includeQueue;
        IncludeMoveTime = includeMove;
    }

    public void SetThresholds(decimal overloadThreshold, decimal bottleneckThreshold)
    {
        OverloadThreshold = overloadThreshold;
        BottleneckThreshold = bottleneckThreshold;
    }

    public void StartExecution(string executedBy)
    {
        if (Status != CapacityPlanStatus.Taslak && Status != CapacityPlanStatus.Hazır)
            throw new InvalidOperationException("Plan çalıştırılmaya uygun durumda değil.");

        Status = CapacityPlanStatus.Çalışıyor;
        ExecutionStartTime = DateTime.UtcNow;
        ExecutedBy = executedBy;
    }

    public void CompleteExecution(int workCenterCount, int overloadedPeriods, int bottleneckCount, decimal avgUtilization)
    {
        if (Status != CapacityPlanStatus.Çalışıyor)
            throw new InvalidOperationException("Plan çalışmıyor.");

        Status = CapacityPlanStatus.Tamamlandı;
        ExecutionEndTime = DateTime.UtcNow;
        WorkCenterCount = workCenterCount;
        OverloadedPeriodCount = overloadedPeriods;
        BottleneckCount = bottleneckCount;
        AverageUtilization = avgUtilization;
    }

    public void FailExecution(string reason)
    {
        Status = CapacityPlanStatus.Hatalı;
        ExecutionEndTime = DateTime.UtcNow;
        Notes = reason;
    }

    public void Approve(string approvedBy)
    {
        if (Status != CapacityPlanStatus.Tamamlandı)
            throw new InvalidOperationException("Sadece tamamlanmış planlar onaylanabilir.");

        Status = CapacityPlanStatus.Onaylandı;
    }

    public void Cancel()
    {
        if (Status == CapacityPlanStatus.Onaylandı)
            throw new InvalidOperationException("Onaylanmış plan iptal edilemez.");

        Status = CapacityPlanStatus.İptal;
        IsActive = false;
    }

    public CapacityRequirement AddRequirement(int workCenterId, DateTime periodDate, decimal requiredHours, decimal availableHours)
    {
        var requirement = new CapacityRequirement(Id, workCenterId, periodDate, requiredHours, availableHours);
        Requirements.Add(requirement);
        return requirement;
    }

    public CapacityException AddException(int workCenterId, DateTime periodDate, CapacityExceptionType type, string message)
    {
        var exception = new CapacityException(Id, workCenterId, periodDate, type, message);
        Exceptions.Add(exception);
        return exception;
    }

    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Kapasite Plan durumu
/// </summary>
public enum CapacityPlanStatus
{
    Taslak = 0,
    Hazır = 1,
    Çalışıyor = 2,
    Tamamlandı = 3,
    Onaylandı = 4,
    Hatalı = 5,
    İptal = 6
}

/// <summary>
/// Kapasite Gereksinimi - İş merkezi bazlı dönemsel kapasite yüklemesi
/// </summary>
public class CapacityRequirement : BaseEntity
{
    public int CapacityPlanId { get; private set; }
    public int WorkCenterId { get; private set; }
    public DateTime PeriodDate { get; private set; }
    public int PeriodNumber { get; private set; }

    // Kapasite değerleri (saat cinsinden)
    public decimal AvailableCapacity { get; private set; }
    public decimal RequiredCapacity { get; private set; }
    public decimal SetupTime { get; private set; }
    public decimal RunTime { get; private set; }
    public decimal QueueTime { get; private set; }
    public decimal MoveTime { get; private set; }

    // Hesaplanan değerler
    public decimal LoadPercent { get; private set; }
    public decimal OverUnderCapacity { get; private set; }
    public CapacityStatus Status { get; private set; }

    // Finite capacity sonuçları
    public decimal ShiftedHours { get; private set; }
    public DateTime? ShiftedToDate { get; private set; }

    public string? Notes { get; private set; }

    // Navigation
    public virtual CapacityPlan CapacityPlan { get; private set; } = null!;
    public virtual WorkCenter WorkCenter { get; private set; } = null!;
    public virtual ICollection<CapacityLoadDetail> LoadDetails { get; private set; } = new List<CapacityLoadDetail>();

    protected CapacityRequirement() { }

    public CapacityRequirement(int capacityPlanId, int workCenterId, DateTime periodDate, decimal requiredCapacity, decimal availableCapacity)
    {
        CapacityPlanId = capacityPlanId;
        WorkCenterId = workCenterId;
        PeriodDate = periodDate;
        RequiredCapacity = requiredCapacity;
        AvailableCapacity = availableCapacity;
        CalculateMetrics();
    }

    public void SetPeriodNumber(int periodNumber) => PeriodNumber = periodNumber;

    public void SetTimeBreakdown(decimal setupTime, decimal runTime, decimal queueTime, decimal moveTime)
    {
        SetupTime = setupTime;
        RunTime = runTime;
        QueueTime = queueTime;
        MoveTime = moveTime;
        RequiredCapacity = setupTime + runTime + queueTime + moveTime;
        CalculateMetrics();
    }

    public void UpdateCapacity(decimal requiredCapacity, decimal availableCapacity)
    {
        RequiredCapacity = requiredCapacity;
        AvailableCapacity = availableCapacity;
        CalculateMetrics();
    }

    public void SetShiftedCapacity(decimal shiftedHours, DateTime shiftedToDate)
    {
        ShiftedHours = shiftedHours;
        ShiftedToDate = shiftedToDate;
    }

    private void CalculateMetrics()
    {
        if (AvailableCapacity > 0)
        {
            LoadPercent = (RequiredCapacity / AvailableCapacity) * 100;
            OverUnderCapacity = AvailableCapacity - RequiredCapacity;
        }
        else
        {
            LoadPercent = RequiredCapacity > 0 ? 999 : 0;
            OverUnderCapacity = -RequiredCapacity;
        }

        Status = LoadPercent switch
        {
            < 80 => CapacityStatus.Uygun,
            < 100 => CapacityStatus.Yüksek,
            >= 100 when LoadPercent < 120 => CapacityStatus.Aşırı,
            _ => CapacityStatus.Darboğaz
        };
    }

    public CapacityLoadDetail AddLoadDetail(int? productionOrderId, int? plannedOrderId, int? operationId,
        decimal setupHours, decimal runHours, decimal queueHours, decimal moveHours)
    {
        var detail = new CapacityLoadDetail(Id, productionOrderId, plannedOrderId, operationId,
            setupHours, runHours, queueHours, moveHours);
        LoadDetails.Add(detail);
        return detail;
    }

    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Kapasite Yükleme Detayı - Hangi siparişten/operasyondan geldiği
/// </summary>
public class CapacityLoadDetail : BaseEntity
{
    public int CapacityRequirementId { get; private set; }
    public int? ProductionOrderId { get; private set; }
    public int? PlannedOrderId { get; private set; }
    public int? OperationId { get; private set; }
    public int? ProductId { get; private set; }

    public decimal SetupHours { get; private set; }
    public decimal RunHours { get; private set; }
    public decimal QueueHours { get; private set; }
    public decimal MoveHours { get; private set; }
    public decimal TotalHours { get; private set; }

    public decimal Quantity { get; private set; }
    public DateTime PlannedStartDate { get; private set; }
    public DateTime PlannedEndDate { get; private set; }

    public CapacityLoadType LoadType { get; private set; }

    // Navigation
    public virtual CapacityRequirement CapacityRequirement { get; private set; } = null!;
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual Operation? Operation { get; private set; }

    protected CapacityLoadDetail() { }

    public CapacityLoadDetail(int capacityRequirementId, int? productionOrderId, int? plannedOrderId,
        int? operationId, decimal setupHours, decimal runHours, decimal queueHours, decimal moveHours)
    {
        CapacityRequirementId = capacityRequirementId;
        ProductionOrderId = productionOrderId;
        PlannedOrderId = plannedOrderId;
        OperationId = operationId;
        SetupHours = setupHours;
        RunHours = runHours;
        QueueHours = queueHours;
        MoveHours = moveHours;
        TotalHours = setupHours + runHours + queueHours + moveHours;
        LoadType = CapacityLoadType.Total;
    }

    public void SetProduct(int productId, decimal quantity)
    {
        ProductId = productId;
        Quantity = quantity;
    }

    public void SetPlannedDates(DateTime startDate, DateTime endDate)
    {
        PlannedStartDate = startDate;
        PlannedEndDate = endDate;
    }
}

/// <summary>
/// Kapasite İstisnası - CRP hesaplamasında oluşan uyarı/hatalar
/// </summary>
public class CapacityException : BaseEntity
{
    public int CapacityPlanId { get; private set; }
    public int WorkCenterId { get; private set; }
    public DateTime PeriodDate { get; private set; }
    public CapacityExceptionType Type { get; private set; }
    public CapacityExceptionSeverity Severity { get; private set; }
    public string Message { get; private set; } = null!;

    public decimal? RequiredCapacity { get; private set; }
    public decimal? AvailableCapacity { get; private set; }
    public decimal? ShortageHours { get; private set; }

    public bool IsResolved { get; private set; }
    public string? ResolvedBy { get; private set; }
    public DateTime? ResolvedDate { get; private set; }
    public string? ResolutionNotes { get; private set; }

    // Navigation
    public virtual CapacityPlan CapacityPlan { get; private set; } = null!;
    public virtual WorkCenter WorkCenter { get; private set; } = null!;

    protected CapacityException() { }

    public CapacityException(int capacityPlanId, int workCenterId, DateTime periodDate,
        CapacityExceptionType type, string message)
    {
        CapacityPlanId = capacityPlanId;
        WorkCenterId = workCenterId;
        PeriodDate = periodDate;
        Type = type;
        Message = message;
        Severity = DetermineSeverity(type);
        IsResolved = false;
    }

    public void SetCapacityDetails(decimal requiredCapacity, decimal availableCapacity)
    {
        RequiredCapacity = requiredCapacity;
        AvailableCapacity = availableCapacity;
        ShortageHours = requiredCapacity - availableCapacity;
    }

    public void Resolve(string resolvedBy, string? resolutionNotes)
    {
        IsResolved = true;
        ResolvedBy = resolvedBy;
        ResolvedDate = DateTime.UtcNow;
        ResolutionNotes = resolutionNotes;
    }

    private static CapacityExceptionSeverity DetermineSeverity(CapacityExceptionType type) => type switch
    {
        CapacityExceptionType.Darboğaz => CapacityExceptionSeverity.Kritik,
        CapacityExceptionType.AşırıYükleme => CapacityExceptionSeverity.Yüksek,
        CapacityExceptionType.KapasiteEksik => CapacityExceptionSeverity.Orta,
        CapacityExceptionType.TakvimÇakışması => CapacityExceptionSeverity.Düşük,
        _ => CapacityExceptionSeverity.Bilgi
    };
}

/// <summary>
/// Kapasite İstisna tipi
/// </summary>
public enum CapacityExceptionType
{
    Darboğaz = 0,
    AşırıYükleme = 1,
    KapasiteEksik = 2,
    TakvimÇakışması = 3,
    KayıpZaman = 4,
    İşMerkeziPasif = 5
}

/// <summary>
/// Kapasite İstisna önem derecesi
/// </summary>
public enum CapacityExceptionSeverity
{
    Bilgi = 0,
    Düşük = 1,
    Orta = 2,
    Yüksek = 3,
    Kritik = 4
}
