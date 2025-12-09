namespace Stocker.Application.DTOs.Module;

public class ModuleDefinitionDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public decimal MonthlyPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public bool IsCore { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public string? Category { get; set; }
    public List<ModuleFeatureDto> Features { get; set; } = new();
    public List<string> Dependencies { get; set; } = new();
}

public class ModuleFeatureDto
{
    public string FeatureName { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CustomPackagePriceRequestDto
{
    public List<string> SelectedModuleCodes { get; set; } = new();
    public int UserCount { get; set; } = 1;
    public string? StoragePlanCode { get; set; }
    public List<string> SelectedAddOnCodes { get; set; } = new();
}

public class CustomPackagePriceResponseDto
{
    public decimal MonthlyTotal { get; set; }
    public decimal QuarterlyTotal { get; set; }
    public decimal SemiAnnualTotal { get; set; }
    public decimal AnnualTotal { get; set; }
    public string Currency { get; set; } = "TRY";
    public List<ModulePriceBreakdownDto> Breakdown { get; set; } = new();
    public decimal QuarterlyDiscount { get; set; } // Yüzde olarak
    public decimal SemiAnnualDiscount { get; set; }
    public decimal AnnualDiscount { get; set; }

    // User pricing breakdown
    public UserPricingDto? UserPricing { get; set; }

    // Storage pricing breakdown
    public StoragePricingDto? StoragePricing { get; set; }

    // Add-ons breakdown
    public List<AddOnPricingDto> AddOns { get; set; } = new();
}

public class UserPricingDto
{
    public int UserCount { get; set; }
    public string TierCode { get; set; } = string.Empty;
    public string TierName { get; set; } = string.Empty;
    public decimal PricePerUser { get; set; }
    public decimal BasePrice { get; set; }
    public decimal TotalMonthly { get; set; }
}

public class StoragePricingDto
{
    public string PlanCode { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public int StorageGB { get; set; }
    public decimal MonthlyPrice { get; set; }
}

public class AddOnPricingDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
}

public class ModulePriceBreakdownDto
{
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
    public bool IsCore { get; set; }
    public bool IsRequired { get; set; } // Bağımlılık nedeniyle zorunlu mu
}

public class CreateCustomPackageRequestDto
{
    public List<string> SelectedModuleCodes { get; set; } = new();
    public string BillingCycle { get; set; } = "Monthly"; // Monthly, Quarterly, SemiAnnual, Annual
}

public class CreateCustomPackageResponseDto
{
    public Guid PackageId { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public string BillingCycle { get; set; } = string.Empty;
    public List<string> IncludedModules { get; set; } = new();
}
