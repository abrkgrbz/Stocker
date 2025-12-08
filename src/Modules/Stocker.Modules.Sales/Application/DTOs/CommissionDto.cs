using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record CommissionPlanDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Type { get; init; } = string.Empty;
    public string CalculationType { get; init; } = string.Empty;
    public decimal? BaseRate { get; init; }
    public decimal? BaseAmount { get; init; }
    public bool IsActive { get; init; }
    public bool IsTiered { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? ApplicableProductCategories { get; init; }
    public string? ApplicableProducts { get; init; }
    public string? ExcludedProducts { get; init; }
    public string? ApplicableSalesPersons { get; init; }
    public string? ApplicableRoles { get; init; }
    public bool IncludeVat { get; init; }
    public bool CalculateOnProfit { get; init; }
    public decimal? MinimumSaleAmount { get; init; }
    public decimal? MaximumCommissionAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<CommissionTierDto> Tiers { get; init; } = new();
}

public record CommissionTierDto
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public decimal FromAmount { get; init; }
    public decimal? ToAmount { get; init; }
    public string CalculationType { get; init; } = string.Empty;
    public decimal Rate { get; init; }
    public decimal? FixedAmount { get; init; }
    public int SortOrder { get; init; }
}

public record CommissionPlanListDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string CalculationType { get; init; } = string.Empty;
    public decimal? BaseRate { get; init; }
    public decimal? BaseAmount { get; init; }
    public bool IsActive { get; init; }
    public bool IsTiered { get; init; }
    public int TierCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateCommissionPlanDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public CommissionType Type { get; init; }
    public CommissionCalculationType CalculationType { get; init; }
    public decimal? BaseRate { get; init; }
    public decimal? BaseAmount { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public List<Guid>? ApplicableProductCategories { get; init; }
    public List<Guid>? ApplicableProducts { get; init; }
    public List<Guid>? ExcludedProducts { get; init; }
    public List<Guid>? ApplicableSalesPersons { get; init; }
    public List<string>? ApplicableRoles { get; init; }
    public bool IncludeVat { get; init; }
    public bool CalculateOnProfit { get; init; }
    public decimal? MinimumSaleAmount { get; init; }
    public decimal? MaximumCommissionAmount { get; init; }
    public List<CreateCommissionTierDto>? Tiers { get; init; }
}

public record CreateCommissionTierDto
{
    public string? Name { get; init; }
    public decimal FromAmount { get; init; }
    public decimal? ToAmount { get; init; }
    public CommissionCalculationType CalculationType { get; init; }
    public decimal Rate { get; init; }
    public decimal? FixedAmount { get; init; }
}

public record UpdateCommissionPlanDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal? BaseRate { get; init; }
    public decimal? BaseAmount { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public bool IncludeVat { get; init; }
    public bool CalculateOnProfit { get; init; }
    public decimal? MinimumSaleAmount { get; init; }
    public decimal? MaximumCommissionAmount { get; init; }
}

public record SalesCommissionDto
{
    public Guid Id { get; init; }
    public Guid SalesOrderId { get; init; }
    public Guid? InvoiceId { get; init; }
    public Guid SalesPersonId { get; init; }
    public string SalesPersonName { get; init; } = string.Empty;
    public Guid CommissionPlanId { get; init; }
    public string CommissionPlanName { get; init; } = string.Empty;
    public decimal SaleAmount { get; init; }
    public decimal CommissionAmount { get; init; }
    public decimal CommissionRate { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CalculatedDate { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTime? PaidDate { get; init; }
    public string? PaymentReference { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record SalesCommissionListDto
{
    public Guid Id { get; init; }
    public Guid SalesOrderId { get; init; }
    public string SalesPersonName { get; init; } = string.Empty;
    public string CommissionPlanName { get; init; } = string.Empty;
    public decimal SaleAmount { get; init; }
    public decimal CommissionAmount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CalculatedDate { get; init; }
    public DateTime? PaidDate { get; init; }
}

public record CalculateCommissionDto
{
    public Guid SalesOrderId { get; init; }
    public Guid SalesPersonId { get; init; }
    public string SalesPersonName { get; init; } = string.Empty;
    public Guid CommissionPlanId { get; init; }
    public decimal SaleAmount { get; init; }
    public decimal? ProfitAmount { get; init; }
}

public record CommissionSummaryDto
{
    public Guid SalesPersonId { get; init; }
    public string SalesPersonName { get; init; } = string.Empty;
    public decimal TotalSales { get; init; }
    public decimal TotalCommission { get; init; }
    public decimal PendingCommission { get; init; }
    public decimal ApprovedCommission { get; init; }
    public decimal PaidCommission { get; init; }
    public int OrderCount { get; init; }
    public DateTime? LastSaleDate { get; init; }
}
