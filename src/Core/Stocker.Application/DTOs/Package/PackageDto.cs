namespace Stocker.Application.DTOs.Package;

public class PackageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public MoneyDto BasePrice { get; set; } = new();
    public string Currency { get; set; } = "TRY";
    public string Type { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = "Monthly";
    public int MaxUsers { get; set; }
    public int MaxStorage { get; set; } // In GB
    public int TrialDays { get; set; }
    public bool IsActive { get; set; }
    public bool IsPublic { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PackageFeatureDto> Features { get; set; } = new();
    public List<PackageModuleDto> Modules { get; set; } = new();
}

public class MoneyDto
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
}

public class PackageFeatureDto
{
    public string FeatureCode { get; set; } = string.Empty;
    public string FeatureName { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
}

public class PackageModuleDto
{
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public bool IsIncluded { get; set; }
}