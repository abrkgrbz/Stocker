namespace Stocker.Application.DTOs.Package;

public class PackageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? BillingCycle { get; set; } // Made nullable since it comes from context
    public int TrialDays { get; set; }
    public int MaxUsers { get; set; }
    public int MaxStorage { get; set; } // In GB
    public int MaxProjects { get; set; }
    public int MaxApiCalls { get; set; } // Per month
    public List<string> Features { get; set; } = new();
    public bool IsActive { get; set; }
    public bool IsPopular { get; set; }
    public int DisplayOrder { get; set; }
}