namespace Stocker.SharedKernel.DTOs.Migration;

/// <summary>
/// Master database migration status DTO
/// </summary>
public class MasterMigrationStatusDto
{
    public List<string> PendingMigrations { get; set; } = new();
    public List<string> AppliedMigrations { get; set; } = new();
    public bool HasPendingMigrations { get; set; }
    public string? Error { get; set; }
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
}
