namespace Stocker.SharedKernel.DTOs.Migration;

public class ApplyMigrationResultDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> AppliedMigrations { get; set; } = new();
    public string? Error { get; set; }
}
