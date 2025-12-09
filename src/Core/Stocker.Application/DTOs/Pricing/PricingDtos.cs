namespace Stocker.Application.DTOs.Pricing;

/// <summary>
/// Add-on DTO
/// </summary>
public record AddOnDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Icon { get; init; }
    public decimal MonthlyPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public bool IsActive { get; init; }
    public int DisplayOrder { get; init; }
    public string? Category { get; init; }
    public List<AddOnFeatureDto> Features { get; init; } = new();
}

/// <summary>
/// Add-on Feature DTO
/// </summary>
public record AddOnFeatureDto
{
    public string FeatureName { get; init; } = string.Empty;
    public string? Description { get; init; }
}

/// <summary>
/// Storage Plan DTO
/// </summary>
public record StoragePlanDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int StorageGB { get; init; }
    public decimal MonthlyPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public bool IsActive { get; init; }
    public bool IsDefault { get; init; }
    public int DisplayOrder { get; init; }
}

/// <summary>
/// Industry DTO
/// </summary>
public record IndustryDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Icon { get; init; }
    public bool IsActive { get; init; }
    public int DisplayOrder { get; init; }
    public List<string> RecommendedModules { get; init; } = new();
}

/// <summary>
/// User Tier DTO
/// </summary>
public record UserTierDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int MinUsers { get; init; }
    public int MaxUsers { get; init; }
    public decimal PricePerUser { get; init; }
    public decimal? BasePrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public bool IsActive { get; init; }
    public int DisplayOrder { get; init; }
}

/// <summary>
/// Complete pricing options for setup wizard
/// </summary>
public record SetupPricingOptionsDto
{
    public List<UserTierDto> UserTiers { get; init; } = new();
    public List<StoragePlanDto> StoragePlans { get; init; } = new();
    public List<AddOnDto> AddOns { get; init; } = new();
    public List<IndustryDto> Industries { get; init; } = new();
}
