using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record PurchaseRequestDto
{
    public Guid Id { get; init; }
    public string RequestNumber { get; init; } = string.Empty;
    public DateTime RequestDate { get; init; }
    public DateTime? RequiredDate { get; init; }
    public Guid RequestedById { get; init; }
    public string? RequestedByName { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string? Purpose { get; init; }
    public string? Justification { get; init; }
    public decimal EstimatedTotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal BudgetAmount { get; init; }
    public string? BudgetCode { get; init; }
    public bool RequiresApproval { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public string? ApprovalNotes { get; init; }
    public string? RejectionReason { get; init; }
    public Guid? ConvertedToPurchaseOrderId { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<PurchaseRequestItemDto> Items { get; init; } = new();
}

public record PurchaseRequestItemDto
{
    public Guid Id { get; init; }
    public Guid PurchaseRequestId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal EstimatedUnitPrice { get; init; }
    public decimal EstimatedTotalPrice { get; init; }
    public Guid? PreferredSupplierId { get; init; }
    public string? PreferredSupplierName { get; init; }
    public string? Specifications { get; init; }
    public string? Notes { get; init; }
}

public record PurchaseRequestListDto
{
    public Guid Id { get; init; }
    public string RequestNumber { get; init; } = string.Empty;
    public DateTime RequestDate { get; init; }
    public DateTime? RequiredDate { get; init; }
    public string? RequestedByName { get; init; }
    public string? DepartmentName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public decimal EstimatedTotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreatePurchaseRequestDto
{
    public DateTime? RequiredDate { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public PurchaseRequestPriority Priority { get; init; } = PurchaseRequestPriority.Normal;
    public string? Purpose { get; init; }
    public string? Justification { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal BudgetAmount { get; init; }
    public string? BudgetCode { get; init; }
    public string? Notes { get; init; }
    public List<CreatePurchaseRequestItemDto> Items { get; init; } = new();
}

public record CreatePurchaseRequestItemDto
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal EstimatedUnitPrice { get; init; }
    public Guid? PreferredSupplierId { get; init; }
    public string? PreferredSupplierName { get; init; }
    public string? Specifications { get; init; }
    public string? Notes { get; init; }
}

public record UpdatePurchaseRequestDto
{
    public DateTime? RequiredDate { get; init; }
    public PurchaseRequestPriority? Priority { get; init; }
    public string? Purpose { get; init; }
    public string? Justification { get; init; }
    public decimal? BudgetAmount { get; init; }
    public string? BudgetCode { get; init; }
    public string? Notes { get; init; }
}

public record ApprovePurchaseRequestDto
{
    public string? ApprovalNotes { get; init; }
}

public record RejectPurchaseRequestDto
{
    public string RejectionReason { get; init; } = string.Empty;
}

public record PurchaseRequestSummaryDto
{
    public int TotalRequests { get; init; }
    public int PendingRequests { get; init; }
    public int ApprovedRequests { get; init; }
    public int RejectedRequests { get; init; }
    public int ConvertedRequests { get; init; }
    public decimal TotalEstimatedAmount { get; init; }
    public Dictionary<string, int> RequestsByPriority { get; init; } = new();
    public Dictionary<string, int> RequestsByDepartment { get; init; } = new();
}
