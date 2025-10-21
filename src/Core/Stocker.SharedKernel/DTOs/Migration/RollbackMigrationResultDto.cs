namespace Stocker.SharedKernel.DTOs.Migration;

public class RollbackMigrationResultDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string MigrationName { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Error { get; set; }
    public DateTime RolledBackAt { get; set; }
}
