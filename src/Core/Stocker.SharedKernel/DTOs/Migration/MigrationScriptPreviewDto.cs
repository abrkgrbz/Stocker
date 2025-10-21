namespace Stocker.SharedKernel.DTOs.Migration;

public class MigrationScriptPreviewDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string MigrationName { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string SqlScript { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<string> AffectedTables { get; set; } = new();
    public int EstimatedDuration { get; set; } // seconds
}
