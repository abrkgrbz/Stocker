namespace Stocker.SharedKernel.DTOs.Migration;

public class MigrationHistoryDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string TenantCode { get; set; } = string.Empty;
    public List<string> AppliedMigrations { get; set; } = new();
    public int TotalMigrations { get; set; }
}
