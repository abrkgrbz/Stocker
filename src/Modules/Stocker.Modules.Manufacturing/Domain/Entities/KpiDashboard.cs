using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// KPI Tanımı - Üretim performans göstergeleri
/// </summary>
public class KpiDefinition : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public KpiType Type { get; private set; }
    public string Unit { get; private set; } = "%";
    public string? Formula { get; private set; }
    public decimal? TargetValue { get; private set; }
    public decimal? MinThreshold { get; private set; }       // Warning threshold
    public decimal? MaxThreshold { get; private set; }       // Maximum expected
    public decimal? TolerancePercent { get; private set; }   // Acceptable variance %
    public bool IsHigherBetter { get; private set; } = true; // OEE, Efficiency = true; Scrap, Downtime = false
    public KpiPeriodType DefaultPeriod { get; private set; } = KpiPeriodType.Günlük;
    public bool IsActive { get; private set; } = true;
    public int DisplayOrder { get; private set; }
    public string? Category { get; private set; }
    public string? Color { get; private set; }               // Display color code
    public string? IconName { get; private set; }            // UI icon

    // Navigation
    public virtual ICollection<KpiValue> Values { get; private set; } = new List<KpiValue>();
    public virtual ICollection<KpiTarget> Targets { get; private set; } = new List<KpiTarget>();

    protected KpiDefinition() { }

    public KpiDefinition(string code, string name, KpiType type)
    {
        Code = code;
        Name = name;
        Type = type;
    }

    public void SetDescription(string description)
    {
        Description = description;
    }

    public void SetUnit(string unit)
    {
        Unit = unit;
    }

    public void SetFormula(string formula)
    {
        Formula = formula;
    }

    public void SetTargets(decimal? target, decimal? min, decimal? max, decimal? tolerance)
    {
        TargetValue = target;
        MinThreshold = min;
        MaxThreshold = max;
        TolerancePercent = tolerance;
    }

    public void SetDisplayProperties(int order, string? category, string? color, string? icon)
    {
        DisplayOrder = order;
        Category = category;
        Color = color;
        IconName = icon;
    }

    public void SetHigherBetter(bool isHigherBetter)
    {
        IsHigherBetter = isHigherBetter;
    }

    public void SetDefaultPeriod(KpiPeriodType period)
    {
        DefaultPeriod = period;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// KPI Değeri - Hesaplanan KPI sonuçları
/// </summary>
public class KpiValue : BaseEntity
{
    public int KpiDefinitionId { get; private set; }
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }
    public KpiPeriodType PeriodType { get; private set; }
    public decimal Value { get; private set; }
    public decimal? PreviousValue { get; private set; }
    public decimal? ChangePercent { get; private set; }
    public KpiTargetStatus Status { get; private set; }
    public decimal? TargetValue { get; private set; }
    public decimal? Variance { get; private set; }
    public decimal? VariancePercent { get; private set; }

    // Breakdown components (for OEE: Availability, Performance, Quality)
    public decimal? Component1 { get; private set; }
    public string? Component1Name { get; private set; }
    public decimal? Component2 { get; private set; }
    public string? Component2Name { get; private set; }
    public decimal? Component3 { get; private set; }
    public string? Component3Name { get; private set; }

    // Context
    public int? WorkCenterId { get; private set; }
    public int? ProductId { get; private set; }
    public int? ProductionOrderId { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CalculatedDate { get; private set; }
    public string? CalculatedBy { get; private set; }

    // Navigation
    public virtual KpiDefinition? KpiDefinition { get; private set; }

    protected KpiValue() { }

    public KpiValue(
        int kpiDefinitionId,
        DateTime periodStart,
        DateTime periodEnd,
        KpiPeriodType periodType,
        decimal value)
    {
        KpiDefinitionId = kpiDefinitionId;
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        PeriodType = periodType;
        Value = value;
        CalculatedDate = DateTime.UtcNow;
    }

    public void SetPreviousValue(decimal? previousValue)
    {
        PreviousValue = previousValue;
        if (previousValue.HasValue && previousValue.Value != 0)
        {
            ChangePercent = ((Value - previousValue.Value) / previousValue.Value) * 100;
        }
    }

    public void SetTarget(decimal? targetValue, bool isHigherBetter)
    {
        TargetValue = targetValue;
        if (targetValue.HasValue)
        {
            Variance = Value - targetValue.Value;
            VariancePercent = targetValue.Value != 0 ? (Variance / targetValue.Value) * 100 : 0;

            // Determine status based on target comparison
            if (isHigherBetter)
            {
                Status = Value >= targetValue.Value ? KpiTargetStatus.Başarılı :
                         Value >= targetValue.Value * 0.9m ? KpiTargetStatus.Uyarı :
                         KpiTargetStatus.Başarısız;
            }
            else
            {
                Status = Value <= targetValue.Value ? KpiTargetStatus.Başarılı :
                         Value <= targetValue.Value * 1.1m ? KpiTargetStatus.Uyarı :
                         KpiTargetStatus.Başarısız;
            }
        }
        else
        {
            Status = KpiTargetStatus.Belirsiz;
        }
    }

    public void SetComponents(decimal? c1, string? c1Name, decimal? c2, string? c2Name, decimal? c3, string? c3Name)
    {
        Component1 = c1;
        Component1Name = c1Name;
        Component2 = c2;
        Component2Name = c2Name;
        Component3 = c3;
        Component3Name = c3Name;
    }

    public void SetContext(int? workCenterId, int? productId, int? productionOrderId)
    {
        WorkCenterId = workCenterId;
        ProductId = productId;
        ProductionOrderId = productionOrderId;
    }

    public void SetNotes(string notes) => Notes = notes;
    public void SetCalculatedBy(string userName) => CalculatedBy = userName;
}

/// <summary>
/// KPI Hedefi - Dönemsel hedef tanımları
/// </summary>
public class KpiTarget : BaseEntity
{
    public int KpiDefinitionId { get; private set; }
    public int Year { get; private set; }
    public int? Month { get; private set; }
    public int? Quarter { get; private set; }
    public decimal TargetValue { get; private set; }
    public decimal? StretchTarget { get; private set; }  // Aggressive target
    public decimal? MinimumTarget { get; private set; }  // Minimum acceptable
    public int? WorkCenterId { get; private set; }
    public int? ProductId { get; private set; }
    public string? Notes { get; private set; }
    public string? SetBy { get; private set; }
    public DateTime SetDate { get; private set; }
    public bool IsApproved { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }

    // Navigation
    public virtual KpiDefinition? KpiDefinition { get; private set; }

    protected KpiTarget() { }

    public KpiTarget(int kpiDefinitionId, int year, decimal targetValue)
    {
        KpiDefinitionId = kpiDefinitionId;
        Year = year;
        TargetValue = targetValue;
        SetDate = DateTime.UtcNow;
    }

    public void SetPeriod(int? month, int? quarter)
    {
        Month = month;
        Quarter = quarter;
    }

    public void SetTargetRange(decimal? stretch, decimal? minimum)
    {
        StretchTarget = stretch;
        MinimumTarget = minimum;
    }

    public void SetScope(int? workCenterId, int? productId)
    {
        WorkCenterId = workCenterId;
        ProductId = productId;
    }

    public void SetSetBy(string userName)
    {
        SetBy = userName;
    }

    public void SetNotes(string notes) => Notes = notes;

    public void Approve(string userName)
    {
        IsApproved = true;
        ApprovedBy = userName;
        ApprovedDate = DateTime.UtcNow;
    }
}

/// <summary>
/// Dashboard Yapılandırması
/// </summary>
public class DashboardConfiguration : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsPublic { get; private set; }
    public new string? CreatedBy { get; private set; }
    public int RefreshIntervalSeconds { get; private set; } = 60;
    public string? LayoutJson { get; private set; }  // Grid layout configuration
    public bool IsActive { get; private set; } = true;

    // Navigation
    public virtual ICollection<DashboardWidget> Widgets { get; private set; } = new List<DashboardWidget>();

    protected DashboardConfiguration() { }

    public DashboardConfiguration(string code, string name)
    {
        Code = code;
        Name = name;
    }

    public void SetDescription(string description) => Description = description;
    public void SetAsDefault(bool isDefault) => IsDefault = isDefault;
    public void SetAsPublic(bool isPublic) => IsPublic = isPublic;
    public void SetCreatedBy(string userName) => CreatedBy = userName;
    public void SetRefreshInterval(int seconds) => RefreshIntervalSeconds = seconds;
    public void SetLayout(string layoutJson) => LayoutJson = layoutJson;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public DashboardWidget AddWidget(string title, DashboardWidgetType type, int? kpiDefinitionId)
    {
        var widget = new DashboardWidget(Id, title, type, kpiDefinitionId);
        Widgets.Add(widget);
        return widget;
    }
}

/// <summary>
/// Dashboard Widget
/// </summary>
public class DashboardWidget : BaseEntity
{
    public int DashboardConfigurationId { get; private set; }
    public string Title { get; private set; } = null!;
    public DashboardWidgetType Type { get; private set; }
    public int? KpiDefinitionId { get; private set; }
    public int PositionX { get; private set; }
    public int PositionY { get; private set; }
    public int Width { get; private set; } = 4;   // Grid units
    public int Height { get; private set; } = 3;  // Grid units
    public string? ConfigurationJson { get; private set; }  // Widget-specific settings
    public string? DataSourceQuery { get; private set; }    // Custom query for data
    public KpiPeriodType? DefaultPeriod { get; private set; }
    public int? WorkCenterId { get; private set; }
    public int? ProductId { get; private set; }
    public bool ShowTrend { get; private set; }
    public bool ShowTarget { get; private set; }
    public bool IsVisible { get; private set; } = true;
    public int DisplayOrder { get; private set; }

    // Navigation
    public virtual DashboardConfiguration? DashboardConfiguration { get; private set; }
    public virtual KpiDefinition? KpiDefinition { get; private set; }

    protected DashboardWidget() { }

    public DashboardWidget(int dashboardConfigurationId, string title, DashboardWidgetType type, int? kpiDefinitionId)
    {
        DashboardConfigurationId = dashboardConfigurationId;
        Title = title;
        Type = type;
        KpiDefinitionId = kpiDefinitionId;
    }

    public void SetPosition(int x, int y)
    {
        PositionX = x;
        PositionY = y;
    }

    public void SetSize(int width, int height)
    {
        Width = width;
        Height = height;
    }

    public void SetConfiguration(string configJson) => ConfigurationJson = configJson;
    public void SetDataSource(string query) => DataSourceQuery = query;
    public void SetDefaultPeriod(KpiPeriodType period) => DefaultPeriod = period;
    public void SetScope(int? workCenterId, int? productId)
    {
        WorkCenterId = workCenterId;
        ProductId = productId;
    }

    public void SetDisplayOptions(bool showTrend, bool showTarget)
    {
        ShowTrend = showTrend;
        ShowTarget = showTarget;
    }

    public void SetDisplayOrder(int order) => DisplayOrder = order;
    public void Show() => IsVisible = true;
    public void Hide() => IsVisible = false;
}

/// <summary>
/// OEE Kaydı - Overall Equipment Effectiveness
/// </summary>
public class OeeRecord : BaseEntity
{
    public int WorkCenterId { get; private set; }
    public string? WorkCenterCode { get; private set; }
    public string? WorkCenterName { get; private set; }
    public DateTime RecordDate { get; private set; }
    public DateTime ShiftStart { get; private set; }
    public DateTime ShiftEnd { get; private set; }
    public string? ShiftName { get; private set; }

    // Time Components (minutes)
    public decimal PlannedProductionTime { get; private set; }    // Total planned production time
    public decimal ActualProductionTime { get; private set; }     // Actual running time
    public decimal DowntimeMinutes { get; private set; }          // Unplanned downtime
    public decimal SetupMinutes { get; private set; }             // Setup/changeover time
    public decimal BreakMinutes { get; private set; }             // Planned breaks

    // Production Components
    public decimal PlannedQuantity { get; private set; }
    public decimal ActualQuantity { get; private set; }
    public decimal GoodQuantity { get; private set; }
    public decimal DefectQuantity { get; private set; }
    public decimal ReworkQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }

    // Speed Components
    public decimal IdealCycleTime { get; private set; }  // Seconds per unit
    public decimal ActualCycleTime { get; private set; }

    // OEE Components (percentages)
    public decimal Availability { get; private set; }
    public decimal Performance { get; private set; }
    public decimal Quality { get; private set; }
    public decimal OeeValue { get; private set; }

    // Production Order Context
    public int? ProductionOrderId { get; private set; }
    public string? ProductionOrderNumber { get; private set; }
    public int? ProductId { get; private set; }
    public string? ProductCode { get; private set; }

    public string? Notes { get; private set; }
    public string? RecordedBy { get; private set; }
    public bool IsValidated { get; private set; }
    public string? ValidatedBy { get; private set; }
    public DateTime? ValidatedDate { get; private set; }

    protected OeeRecord() { }

    public OeeRecord(int workCenterId, DateTime recordDate, DateTime shiftStart, DateTime shiftEnd)
    {
        WorkCenterId = workCenterId;
        RecordDate = recordDate;
        ShiftStart = shiftStart;
        ShiftEnd = shiftEnd;
    }

    public void SetWorkCenterInfo(string code, string name)
    {
        WorkCenterCode = code;
        WorkCenterName = name;
    }

    public void SetShiftName(string shiftName) => ShiftName = shiftName;

    public void SetTimeComponents(decimal planned, decimal actual, decimal downtime, decimal setup, decimal breaks)
    {
        PlannedProductionTime = planned;
        ActualProductionTime = actual;
        DowntimeMinutes = downtime;
        SetupMinutes = setup;
        BreakMinutes = breaks;
        CalculateOee();
    }

    public void SetProductionComponents(decimal planned, decimal actual, decimal good, decimal defect, decimal rework, decimal scrap)
    {
        PlannedQuantity = planned;
        ActualQuantity = actual;
        GoodQuantity = good;
        DefectQuantity = defect;
        ReworkQuantity = rework;
        ScrapQuantity = scrap;
        CalculateOee();
    }

    public void SetCycleTimes(decimal ideal, decimal actual)
    {
        IdealCycleTime = ideal;
        ActualCycleTime = actual;
        CalculateOee();
    }

    public void SetProductionOrderContext(int? orderId, string? orderNumber, int? productId, string? productCode)
    {
        ProductionOrderId = orderId;
        ProductionOrderNumber = orderNumber;
        ProductId = productId;
        ProductCode = productCode;
    }

    private void CalculateOee()
    {
        // Availability = (Actual Production Time) / (Planned Production Time - Breaks)
        var availableTime = PlannedProductionTime - BreakMinutes;
        Availability = availableTime > 0 ? (ActualProductionTime / availableTime) * 100 : 0;

        // Performance = (Ideal Cycle Time × Actual Quantity) / Actual Production Time
        if (ActualProductionTime > 0 && IdealCycleTime > 0)
        {
            var idealTime = (IdealCycleTime / 60) * ActualQuantity; // Convert to minutes
            Performance = (idealTime / ActualProductionTime) * 100;
            Performance = Math.Min(Performance, 100); // Cap at 100%
        }
        else
        {
            Performance = 0;
        }

        // Quality = Good Quantity / Actual Quantity
        Quality = ActualQuantity > 0 ? (GoodQuantity / ActualQuantity) * 100 : 0;

        // OEE = Availability × Performance × Quality
        OeeValue = (Availability / 100) * (Performance / 100) * (Quality / 100) * 100;
    }

    public void SetNotes(string notes) => Notes = notes;
    public void SetRecordedBy(string userName) => RecordedBy = userName;

    public void Validate(string userName)
    {
        IsValidated = true;
        ValidatedBy = userName;
        ValidatedDate = DateTime.UtcNow;
    }
}

/// <summary>
/// Üretim Performans Özeti - Daily/Weekly/Monthly aggregates
/// </summary>
public class ProductionPerformanceSummary : BaseEntity
{
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }
    public KpiPeriodType PeriodType { get; private set; }
    public int? WorkCenterId { get; private set; }
    public string? WorkCenterCode { get; private set; }
    public int? ProductId { get; private set; }
    public string? ProductCode { get; private set; }

    // Production Metrics
    public int TotalOrders { get; private set; }
    public int CompletedOrders { get; private set; }
    public int OnTimeOrders { get; private set; }
    public decimal PlannedQuantity { get; private set; }
    public decimal ProducedQuantity { get; private set; }
    public decimal GoodQuantity { get; private set; }
    public decimal DefectQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }

    // Time Metrics (minutes)
    public decimal PlannedTime { get; private set; }
    public decimal ActualTime { get; private set; }
    public decimal DowntimeMinutes { get; private set; }
    public decimal SetupMinutes { get; private set; }

    // Efficiency Metrics (percentages)
    public decimal ProductionEfficiency { get; private set; }
    public decimal QualityRate { get; private set; }
    public decimal OnTimeDeliveryRate { get; private set; }
    public decimal OeeAverage { get; private set; }
    public decimal CapacityUtilization { get; private set; }
    public decimal ScrapRate { get; private set; }

    // Cost Metrics
    public decimal PlannedCost { get; private set; }
    public decimal ActualCost { get; private set; }
    public decimal CostVariance { get; private set; }
    public decimal CostVariancePercent { get; private set; }

    public DateTime CalculatedDate { get; private set; }
    public string? CalculatedBy { get; private set; }

    protected ProductionPerformanceSummary() { }

    public ProductionPerformanceSummary(DateTime periodStart, DateTime periodEnd, KpiPeriodType periodType)
    {
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        PeriodType = periodType;
        CalculatedDate = DateTime.UtcNow;
    }

    public void SetScope(int? workCenterId, string? workCenterCode, int? productId, string? productCode)
    {
        WorkCenterId = workCenterId;
        WorkCenterCode = workCenterCode;
        ProductId = productId;
        ProductCode = productCode;
    }

    public void SetProductionMetrics(int total, int completed, int onTime, decimal planned, decimal produced, decimal good, decimal defect, decimal scrap)
    {
        TotalOrders = total;
        CompletedOrders = completed;
        OnTimeOrders = onTime;
        PlannedQuantity = planned;
        ProducedQuantity = produced;
        GoodQuantity = good;
        DefectQuantity = defect;
        ScrapQuantity = scrap;
        CalculateRates();
    }

    public void SetTimeMetrics(decimal planned, decimal actual, decimal downtime, decimal setup)
    {
        PlannedTime = planned;
        ActualTime = actual;
        DowntimeMinutes = downtime;
        SetupMinutes = setup;
        CalculateRates();
    }

    public void SetOeeAverage(decimal oee) => OeeAverage = oee;
    public void SetCapacityUtilization(decimal utilization) => CapacityUtilization = utilization;

    public void SetCostMetrics(decimal planned, decimal actual)
    {
        PlannedCost = planned;
        ActualCost = actual;
        CostVariance = actual - planned;
        CostVariancePercent = planned > 0 ? (CostVariance / planned) * 100 : 0;
    }

    private void CalculateRates()
    {
        // Production Efficiency = Produced / Planned
        ProductionEfficiency = PlannedQuantity > 0 ? (ProducedQuantity / PlannedQuantity) * 100 : 0;

        // Quality Rate = Good / Produced
        QualityRate = ProducedQuantity > 0 ? (GoodQuantity / ProducedQuantity) * 100 : 0;

        // On-Time Delivery = OnTime / Completed
        OnTimeDeliveryRate = CompletedOrders > 0 ? ((decimal)OnTimeOrders / CompletedOrders) * 100 : 0;

        // Scrap Rate = Scrap / Produced
        ScrapRate = ProducedQuantity > 0 ? (ScrapQuantity / ProducedQuantity) * 100 : 0;
    }

    public void SetCalculatedBy(string userName) => CalculatedBy = userName;
}
