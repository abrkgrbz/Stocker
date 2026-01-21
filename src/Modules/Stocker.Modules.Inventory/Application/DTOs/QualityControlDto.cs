namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for QualityControl entity
/// </summary>
public record QualityControlDto
{
    public int Id { get; init; }
    public string QcNumber { get; init; } = string.Empty;
    public string QcType { get; init; } = string.Empty;
    public DateTime InspectionDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public int ProductId { get; init; }
    public string? ProductName { get; init; }
    public string? LotNumber { get; init; }
    public int? SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public int? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public int? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public decimal InspectedQuantity { get; init; }
    public decimal AcceptedQuantity { get; init; }
    public decimal RejectedQuantity { get; init; }
    public decimal? SampleQuantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public string Result { get; init; } = string.Empty;
    public decimal? QualityScore { get; init; }
    public string? QualityGrade { get; init; }
    public string? RejectionReason { get; init; }
    public string? RejectionCategory { get; init; }
    public string? InspectorName { get; init; }
    public Guid? InspectorUserId { get; init; }
    public int? InspectionDurationMinutes { get; init; }
    public string? InspectionLocation { get; init; }
    public string? InspectionStandard { get; init; }
    public string RecommendedAction { get; init; } = string.Empty;
    public string? AppliedAction { get; init; }
    public string? ActionDescription { get; init; }
    public DateTime? ActionDate { get; init; }
    public string? InspectionNotes { get; init; }
    public string? InternalNotes { get; init; }
    public string? SupplierNotification { get; init; }
    public List<QualityControlItemDto> Items { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Data transfer object for QualityControlItem
/// </summary>
public record QualityControlItemDto
{
    public int Id { get; init; }
    public string CheckName { get; init; } = string.Empty;
    public string? Specification { get; init; }
    public string? AcceptanceCriteria { get; init; }
    public string? MeasuredValue { get; init; }
    public bool? IsPassed { get; init; }
    public string? Notes { get; init; }
    public int SortOrder { get; init; }
}

/// <summary>
/// DTO for creating a quality control record
/// </summary>
public record CreateQualityControlDto
{
    public string QcType { get; init; } = string.Empty;
    public int ProductId { get; init; }
    public decimal InspectedQuantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public string? LotNumber { get; init; }
    public int? SupplierId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public int? WarehouseId { get; init; }
    public decimal? SampleQuantity { get; init; }
    public string? InspectionLocation { get; init; }
    public string? InspectionStandard { get; init; }
    public string? InspectionNotes { get; init; }
    public List<CreateQualityControlItemDto> Items { get; init; } = new();
}

/// <summary>
/// DTO for creating a quality control item
/// </summary>
public record CreateQualityControlItemDto
{
    public string CheckName { get; init; } = string.Empty;
    public string? Specification { get; init; }
    public string? AcceptanceCriteria { get; init; }
    public int SortOrder { get; init; }
}

/// <summary>
/// DTO for completing quality control inspection
/// </summary>
public record CompleteQualityControlDto
{
    public string Result { get; init; } = string.Empty;
    public decimal AcceptedQuantity { get; init; }
    public decimal RejectedQuantity { get; init; }
    public decimal? QualityScore { get; init; }
    public string? QualityGrade { get; init; }
    public string? RejectionReason { get; init; }
    public string? RejectionCategory { get; init; }
    public List<RecordQualityControlItemDto> ItemResults { get; init; } = new();
}

/// <summary>
/// DTO for recording quality control item result
/// </summary>
public record RecordQualityControlItemDto
{
    public int ItemId { get; init; }
    public string? MeasuredValue { get; init; }
    public bool IsPassed { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// DTO for updating a quality control record
/// </summary>
public record UpdateQualityControlDto
{
    public string? LotNumber { get; init; }
    public decimal? SampleQuantity { get; init; }
    public string? InspectionLocation { get; init; }
    public string? InspectionStandard { get; init; }
    public string? InspectionNotes { get; init; }
    public string? InternalNotes { get; init; }
}

/// <summary>
/// DTO for approving a quality control inspection
/// </summary>
public record ApproveQualityControlDto
{
    public string? Notes { get; init; }
}

/// <summary>
/// DTO for rejecting a quality control inspection
/// </summary>
public record RejectQualityControlDto
{
    public string? Reason { get; init; }
    public Domain.Entities.RejectionCategory? Category { get; init; }
}
