namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for CycleCount entity
/// </summary>
public record CycleCountDto
{
    public int Id { get; init; }
    public string PlanNumber { get; init; } = string.Empty;
    public string PlanName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string CountType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime ScheduledStartDate { get; init; }
    public DateTime ScheduledEndDate { get; init; }
    public DateTime? ActualStartDate { get; init; }
    public DateTime? ActualEndDate { get; init; }
    public string? Frequency { get; init; }
    public DateTime? NextScheduledDate { get; init; }
    public int WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public int? ZoneId { get; init; }
    public string? ZoneName { get; init; }
    public int? CategoryId { get; init; }
    public string? CategoryName { get; init; }
    public string? AbcClassFilter { get; init; }
    public bool OnlyNegativeStocks { get; init; }
    public bool OnlyZeroStocks { get; init; }
    public int? DaysSinceLastMovement { get; init; }
    public int TotalItems { get; init; }
    public int CountedItems { get; init; }
    public int ItemsWithVariance { get; init; }
    public decimal ProgressPercent { get; init; }
    public decimal? AccuracyPercent { get; init; }
    public decimal QuantityTolerancePercent { get; init; }
    public decimal? ValueTolerance { get; init; }
    public bool BlockAutoApproveOnToleranceExceeded { get; init; }
    public string? AssignedTo { get; init; }
    public Guid? AssignedUserId { get; init; }
    public string? ApprovedBy { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public string? PlanningNotes { get; init; }
    public string? CountNotes { get; init; }
    public List<CycleCountItemDto> Items { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Data transfer object for CycleCountItem
/// </summary>
public record CycleCountItemDto
{
    public int Id { get; init; }
    public int ProductId { get; init; }
    public string? ProductName { get; init; }
    public int? LocationId { get; init; }
    public string? LocationName { get; init; }
    public string? LotNumber { get; init; }
    public decimal SystemQuantity { get; init; }
    public decimal? CountedQuantity { get; init; }
    public decimal VarianceQuantity { get; init; }
    public decimal VariancePercent { get; init; }
    public bool IsCounted { get; init; }
    public bool HasVariance { get; init; }
    public decimal? UnitCost { get; init; }
    public decimal? VarianceValue { get; init; }
    public DateTime? CountedDate { get; init; }
    public string? CountedBy { get; init; }
    public string? Notes { get; init; }
    public int CountAttempts { get; init; }
}

/// <summary>
/// DTO for creating a cycle count
/// </summary>
public record CreateCycleCountDto
{
    public string PlanName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string CountType { get; init; } = "Standard";
    public int WarehouseId { get; init; }
    public DateTime ScheduledStartDate { get; init; }
    public DateTime ScheduledEndDate { get; init; }
    public int? ZoneId { get; init; }
    public int? CategoryId { get; init; }
    public string? AbcClassFilter { get; init; }
    public string? Frequency { get; init; }
    public bool OnlyNegativeStocks { get; init; }
    public bool OnlyZeroStocks { get; init; }
    public int? DaysSinceLastMovement { get; init; }
    public decimal QuantityTolerancePercent { get; init; }
    public decimal? ValueTolerance { get; init; }
    public bool BlockAutoApproveOnToleranceExceeded { get; init; } = true;
    public string? AssignedTo { get; init; }
    public Guid? AssignedUserId { get; init; }
    public string? PlanningNotes { get; init; }
}

/// <summary>
/// DTO for adding items to cycle count
/// </summary>
public record AddCycleCountItemDto
{
    public int ProductId { get; init; }
    public int? LocationId { get; init; }
    public decimal SystemQuantity { get; init; }
    public decimal? UnitCost { get; init; }
    public string? LotNumber { get; init; }
}

/// <summary>
/// DTO for recording count result
/// </summary>
public record RecordCycleCountDto
{
    public int ItemId { get; init; }
    public decimal CountedQuantity { get; init; }
    public string? Notes { get; init; }
    public string? CountedBy { get; init; }
}

/// <summary>
/// DTO for updating a cycle count
/// </summary>
public record UpdateCycleCountDto
{
    public string? PlanName { get; init; }
    public string? Description { get; init; }
    public DateTime? ScheduledStartDate { get; init; }
    public DateTime? ScheduledEndDate { get; init; }
    public int? ZoneId { get; init; }
    public int? CategoryId { get; init; }
    public string? AbcClassFilter { get; init; }
    public string? Frequency { get; init; }
    public bool? OnlyNegativeStocks { get; init; }
    public bool? OnlyZeroStocks { get; init; }
    public int? DaysSinceLastMovement { get; init; }
    public decimal? QuantityTolerancePercent { get; init; }
    public decimal? ValueTolerance { get; init; }
    public bool? BlockAutoApproveOnToleranceExceeded { get; init; }
    public string? AssignedTo { get; init; }
    public Guid? AssignedUserId { get; init; }
    public string? PlanningNotes { get; init; }
    public string? CountNotes { get; init; }
}
