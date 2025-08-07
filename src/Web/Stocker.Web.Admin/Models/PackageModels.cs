namespace Stocker.Web.Admin.Models;

public class PackageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public int MaxUsers { get; set; }
    public int MaxStorage { get; set; }
    public bool IsActive { get; set; }
    public List<string> Features { get; set; } = new();
    public List<string> Modules { get; set; } = new();
}

public class CreatePackageRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public int MaxUsers { get; set; }
    public int MaxStorage { get; set; }
    public List<string> Features { get; set; } = new();
    public List<string> Modules { get; set; } = new();
}