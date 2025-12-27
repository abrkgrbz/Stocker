namespace Stocker.Application.DTOs.Backup;

/// <summary>
/// DTO for backup list item
/// </summary>
public class BackupDto
{
    public Guid Id { get; set; }
    public string BackupName { get; set; } = string.Empty;
    public string BackupType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    public string? StorageLocation { get; set; }
    public bool IncludesDatabase { get; set; }
    public bool IncludesFiles { get; set; }
    public bool IncludesConfiguration { get; set; }
    public bool IsCompressed { get; set; }
    public bool IsEncrypted { get; set; }
    public bool IsRestorable { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? Description { get; set; }

    // Computed properties
    public string SizeFormatted => FormatSize(SizeInBytes);
    public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;

    private static string FormatSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        int order = 0;
        double len = bytes;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}

/// <summary>
/// DTO for backup detail
/// </summary>
public class BackupDetailDto : BackupDto
{
    public string? FilePath { get; set; }
    public string? DownloadUrl { get; set; }
    public string? EncryptionKey { get; set; }
    public DateTime? LastRestoredAt { get; set; }
    public int RestoreCount { get; set; }
    public string? RestoreNotes { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
    public string? Tags { get; set; }
    public string? Metadata { get; set; }
}

/// <summary>
/// DTO for backup statistics
/// </summary>
public class BackupStatisticsDto
{
    public int TotalBackups { get; set; }
    public int CompletedBackups { get; set; }
    public int PendingBackups { get; set; }
    public int FailedBackups { get; set; }
    public long TotalSizeBytes { get; set; }
    public string TotalSizeFormatted => FormatSize(TotalSizeBytes);
    public DateTime? LastBackupDate { get; set; }
    public DateTime? NextScheduledBackup { get; set; }
    public int RestorableBackups { get; set; }
    public int ExpiredBackups { get; set; }

    private static string FormatSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        int order = 0;
        double len = bytes;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}

/// <summary>
/// DTO for backup settings
/// </summary>
public class BackupSettingsDto
{
    public bool AutoBackupEnabled { get; set; }
    public string BackupFrequency { get; set; } = "daily";
    public string BackupTime { get; set; } = "03:00";
    public int RetentionDays { get; set; } = 30;
    public string StorageLocation { get; set; } = "local";
    public bool IncludeDatabase { get; set; } = true;
    public bool IncludeFiles { get; set; } = true;
    public bool IncludeConfiguration { get; set; } = true;
    public bool CompressBackups { get; set; } = true;
    public bool EncryptBackups { get; set; } = true;
    public bool EmailNotification { get; set; } = true;
    public string? NotificationEmail { get; set; }
}
