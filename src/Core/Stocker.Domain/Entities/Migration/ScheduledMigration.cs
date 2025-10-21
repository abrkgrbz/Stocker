using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Entities.Migration;

public class ScheduledMigration : Entity
{
    public Guid ScheduleId { get; private set; }
    public Guid TenantId { get; private set; }
    public DateTime ScheduledTime { get; private set; }
    public string? MigrationName { get; private set; }
    public string? ModuleName { get; private set; }
    public string Status { get; private set; } = "Pending"; // Pending, Running, Completed, Failed, Cancelled
    public string CreatedBy { get; private set; } = string.Empty;
    public DateTime? ExecutedAt { get; private set; }
    public string? Error { get; private set; }
    public string? HangfireJobId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    protected ScheduledMigration() { }

    public ScheduledMigration(
        Guid tenantId,
        DateTime scheduledTime,
        string createdBy,
        string? migrationName = null,
        string? moduleName = null)
    {
        ScheduleId = Guid.NewGuid();
        TenantId = tenantId;
        ScheduledTime = scheduledTime;
        MigrationName = migrationName;
        ModuleName = moduleName;
        CreatedBy = createdBy;
        Status = "Pending";
        CreatedAt = DateTime.UtcNow;
    }

    public void SetHangfireJobId(string jobId)
    {
        HangfireJobId = jobId;
    }

    public void MarkAsRunning()
    {
        Status = "Running";
        ExecutedAt = DateTime.UtcNow;
    }

    public void MarkAsCompleted()
    {
        Status = "Completed";
        if (ExecutedAt == null)
            ExecutedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string error)
    {
        Status = "Failed";
        Error = error;
        if (ExecutedAt == null)
            ExecutedAt = DateTime.UtcNow;
    }

    public void MarkAsCancelled()
    {
        Status = "Cancelled";
    }
}
