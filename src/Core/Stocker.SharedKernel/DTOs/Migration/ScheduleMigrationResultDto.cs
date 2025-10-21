namespace Stocker.SharedKernel.DTOs.Migration;

public class ScheduleMigrationResultDto
{
    public Guid ScheduleId { get; set; }
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public DateTime ScheduledTime { get; set; }
    public string? MigrationName { get; set; }
    public string? ModuleName { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled, Running, Completed, Failed
    public string Message { get; set; } = string.Empty;
}
