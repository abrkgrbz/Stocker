namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for ShelfLife entity
/// </summary>
public record ShelfLifeDto
{
    public int Id { get; init; }
    public int ProductId { get; init; }
    public string? ProductName { get; init; }
    public string ShelfLifeType { get; init; } = string.Empty;
    public int TotalShelfLifeDays { get; init; }
    public bool IsActive { get; init; }
    public int MinReceivingShelfLifeDays { get; init; }
    public decimal? MinReceivingShelfLifePercent { get; init; }
    public string ReceivingRuleType { get; init; } = string.Empty;
    public int MinSalesShelfLifeDays { get; init; }
    public decimal? MinSalesShelfLifePercent { get; init; }
    public string SalesRuleType { get; init; } = string.Empty;
    public int AlertThresholdDays { get; init; }
    public decimal? AlertThresholdPercent { get; init; }
    public int CriticalThresholdDays { get; init; }
    public decimal? CriticalThresholdPercent { get; init; }
    public bool HasCustomerSpecificRules { get; init; }
    public int? DefaultCustomerMinShelfLifeDays { get; init; }
    public string ExpiryAction { get; init; } = string.Empty;
    public bool AutoQuarantineOnExpiry { get; init; }
    public bool AutoScrapOnExpiry { get; init; }
    public int? DaysBeforeQuarantineAlert { get; init; }
    public bool RequiresSpecialStorage { get; init; }
    public string? StorageConditions { get; init; }
    public string? RequiredZoneType { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// DTO for creating shelf life configuration
/// </summary>
public record CreateShelfLifeDto
{
    public int ProductId { get; init; }
    public string ShelfLifeType { get; init; } = string.Empty;
    public int TotalShelfLifeDays { get; init; }
    public int MinReceivingShelfLifeDays { get; init; }
    public decimal? MinReceivingShelfLifePercent { get; init; }
    public string ReceivingRuleType { get; init; } = "Days";
    public int MinSalesShelfLifeDays { get; init; }
    public decimal? MinSalesShelfLifePercent { get; init; }
    public string SalesRuleType { get; init; } = "Days";
    public int AlertThresholdDays { get; init; }
    public decimal? AlertThresholdPercent { get; init; }
    public int CriticalThresholdDays { get; init; }
    public decimal? CriticalThresholdPercent { get; init; }
    public bool HasCustomerSpecificRules { get; init; }
    public int? DefaultCustomerMinShelfLifeDays { get; init; }
    public string ExpiryAction { get; init; } = "Quarantine";
    public bool AutoQuarantineOnExpiry { get; init; } = true;
    public bool AutoScrapOnExpiry { get; init; }
    public int? DaysBeforeQuarantineAlert { get; init; }
    public bool RequiresSpecialStorage { get; init; }
    public string? StorageConditions { get; init; }
    public string? RequiredZoneType { get; init; }
}

/// <summary>
/// DTO for updating shelf life configuration
/// </summary>
public record UpdateShelfLifeDto
{
    public int TotalShelfLifeDays { get; init; }
    public bool IsActive { get; init; }
    public int MinReceivingShelfLifeDays { get; init; }
    public decimal? MinReceivingShelfLifePercent { get; init; }
    public string ReceivingRuleType { get; init; } = "Days";
    public int MinSalesShelfLifeDays { get; init; }
    public decimal? MinSalesShelfLifePercent { get; init; }
    public string SalesRuleType { get; init; } = "Days";
    public int AlertThresholdDays { get; init; }
    public decimal? AlertThresholdPercent { get; init; }
    public int CriticalThresholdDays { get; init; }
    public decimal? CriticalThresholdPercent { get; init; }
    public bool HasCustomerSpecificRules { get; init; }
    public int? DefaultCustomerMinShelfLifeDays { get; init; }
    public string ExpiryAction { get; init; } = "Quarantine";
    public bool AutoQuarantineOnExpiry { get; init; }
    public bool AutoScrapOnExpiry { get; init; }
    public int? DaysBeforeQuarantineAlert { get; init; }
    public bool RequiresSpecialStorage { get; init; }
    public string? StorageConditions { get; init; }
    public string? RequiredZoneType { get; init; }
}
