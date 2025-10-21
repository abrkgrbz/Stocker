namespace Stocker.SharedKernel.DTOs.Migration;

public class ScheduledMigrationDto
{
    public Guid ScheduleId { get; set; }
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string TenantCode { get; set; } = string.Empty;
    public DateTime ScheduledTime { get; set; }
    public string? MigrationName { get; set; }
    public string? ModuleName { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Running, Completed, Failed, Cancelled
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? ExecutedAt { get; set; }
    public string? Error { get; set; }
}
