namespace Stocker.Application.DTOs.Tenant.Modules;

public class ModuleDto
{
    public Guid Id { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime? EnabledDate { get; set; }
    public DateTime? DisabledDate { get; set; }
    public string? Configuration { get; set; }
    public int? UserLimit { get; set; }
    public int? StorageLimit { get; set; }
    public int? RecordLimit { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsTrial { get; set; }
    public bool IsExpired { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}