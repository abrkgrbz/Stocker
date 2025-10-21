namespace Stocker.SharedKernel.DTOs.Migration;

public class MigrationSettingsDto
{
    public bool AutoApplyMigrations { get; set; }
    public bool BackupBeforeMigration { get; set; }
    public int MigrationTimeout { get; set; } = 300; // seconds
    public bool EnableScheduledMigrations { get; set; }
    public string? DefaultScheduleTime { get; set; } // HH:mm format
    public bool NotifyOnMigrationComplete { get; set; }
    public bool NotifyOnMigrationFailure { get; set; }
    public List<string> NotificationEmails { get; set; } = new();
}
