namespace Stocker.SharedKernel.DTOs.Migration;

public class TenantMigrationStatusDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string TenantCode { get; set; } = string.Empty;
    public List<MigrationModuleDto> PendingMigrations { get; set; } = new();
    public List<MigrationModuleDto> AppliedMigrations { get; set; } = new();
    public bool HasPendingMigrations { get; set; }
    public string? Error { get; set; }
}
