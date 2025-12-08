using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record PurchaseContractDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public Guid SupplierId { get; init; }
    public string? SupplierCode { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal? TotalContractValue { get; init; }
    public decimal UsedAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? MinimumOrderValue { get; init; }
    public decimal? MaximumOrderValue { get; init; }
    public string? DeliveryTerms { get; init; }
    public string? PaymentTerms { get; init; }
    public string? QualityTerms { get; init; }
    public string? PenaltyTerms { get; init; }
    public string? OtherTerms { get; init; }
    public bool AutoRenew { get; init; }
    public int? RenewalNoticeDays { get; init; }
    public int? WarrantyPeriodMonths { get; init; }
    public Guid? CreatedById { get; init; }
    public string? CreatedByName { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public string? ApprovalNotes { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<PurchaseContractItemDto> Items { get; init; } = new();
}

public record PurchaseContractItemDto
{
    public Guid Id { get; init; }
    public Guid ContractId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal? ContractedQuantity { get; init; }
    public decimal UsedQuantity { get; init; }
    public decimal RemainingQuantity { get; init; }
    public decimal? MinOrderQuantity { get; init; }
    public decimal? MaxOrderQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal DiscountRate { get; init; }
    public decimal VatRate { get; init; }
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public int? LeadTimeDays { get; init; }
    public string? Specifications { get; init; }
    public string? Notes { get; init; }
    public bool IsActive { get; init; }
    public List<PurchaseContractPriceBreakDto> PriceBreaks { get; init; } = new();
}

public record PurchaseContractPriceBreakDto
{
    public Guid Id { get; init; }
    public Guid ContractItemId { get; init; }
    public decimal MinQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
}

public record PurchaseContractListDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal? TotalContractValue { get; init; }
    public decimal UsedAmount { get; init; }
    public decimal UsagePercentage { get; init; }
    public string Currency { get; init; } = "TRY";
    public int ItemCount { get; init; }
    public int DaysRemaining { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreatePurchaseContractDto
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public PurchaseContractType Type { get; init; } = PurchaseContractType.Standard;
    public Guid SupplierId { get; init; }
    public string? SupplierCode { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal? TotalContractValue { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? MinimumOrderValue { get; init; }
    public decimal? MaximumOrderValue { get; init; }
    public string? DeliveryTerms { get; init; }
    public string? PaymentTerms { get; init; }
    public string? QualityTerms { get; init; }
    public string? PenaltyTerms { get; init; }
    public string? OtherTerms { get; init; }
    public bool AutoRenew { get; init; }
    public int? RenewalNoticeDays { get; init; }
    public int? WarrantyPeriodMonths { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public List<CreatePurchaseContractItemDto> Items { get; init; } = new();
}

public record CreatePurchaseContractItemDto
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal? ContractedQuantity { get; init; }
    public decimal? MinOrderQuantity { get; init; }
    public decimal? MaxOrderQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatRate { get; init; } = 20;
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public int? LeadTimeDays { get; init; }
    public string? Specifications { get; init; }
    public string? Notes { get; init; }
    public List<CreatePriceBreakDto> PriceBreaks { get; init; } = new();
}

public record CreatePriceBreakDto
{
    public decimal MinQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
}

public record UpdatePurchaseContractDto
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public DateTime? EndDate { get; init; }
    public decimal? TotalContractValue { get; init; }
    public decimal? MinimumOrderValue { get; init; }
    public decimal? MaximumOrderValue { get; init; }
    public string? DeliveryTerms { get; init; }
    public string? PaymentTerms { get; init; }
    public string? QualityTerms { get; init; }
    public string? PenaltyTerms { get; init; }
    public string? OtherTerms { get; init; }
    public bool? AutoRenew { get; init; }
    public int? RenewalNoticeDays { get; init; }
    public int? WarrantyPeriodMonths { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record ContractPriceCheckDto
{
    public Guid ProductId { get; init; }
    public decimal Quantity { get; init; }
}

public record ContractPriceResultDto
{
    public bool HasContract { get; init; }
    public Guid? ContractId { get; init; }
    public string? ContractNumber { get; init; }
    public decimal? UnitPrice { get; init; }
    public decimal? DiscountRate { get; init; }
    public decimal? EffectivePrice { get; init; }
    public bool IsWithinLimits { get; init; }
    public string? Message { get; init; }
}

public record PurchaseContractSummaryDto
{
    public int TotalContracts { get; init; }
    public int ActiveContracts { get; init; }
    public int ExpiringWithin30Days { get; init; }
    public int ExpiredContracts { get; init; }
    public decimal TotalContractValue { get; init; }
    public decimal TotalUsedAmount { get; init; }
    public decimal OverallUsagePercentage { get; init; }
    public Dictionary<string, int> ContractsByStatus { get; init; } = new();
    public Dictionary<string, int> ContractsByType { get; init; } = new();
    public Dictionary<string, decimal> ValueBySupplier { get; init; } = new();
}
