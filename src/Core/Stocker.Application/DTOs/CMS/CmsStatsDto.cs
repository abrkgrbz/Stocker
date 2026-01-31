namespace Stocker.Application.DTOs.CMS;

/// <summary>
/// CMS Dashboard istatistikleri DTO'su
/// </summary>
public class CmsStatsDto
{
    public StatItemDto TotalPages { get; set; } = null!;
    public StatItemDto TotalPosts { get; set; } = null!;
    public VisitorStatDto TotalVisitors { get; set; } = null!;
    public StorageStatDto Storage { get; set; } = null!;
    public List<RecentActivityDto> RecentActivity { get; set; } = new();
}

/// <summary>
/// İstatistik öğesi DTO'su
/// </summary>
public class StatItemDto
{
    public int Count { get; set; }
    public int Change { get; set; }
    public string Period { get; set; } = string.Empty;
}

/// <summary>
/// Ziyaretçi istatistik DTO'su
/// </summary>
public class VisitorStatDto
{
    public long Count { get; set; }
    public decimal ChangePercentage { get; set; }
    public string Period { get; set; } = string.Empty;
}

/// <summary>
/// Depolama istatistik DTO'su
/// </summary>
public class StorageStatDto
{
    public long UsedBytes { get; set; }
    public int FileCount { get; set; }
    public string UsedFormatted { get; set; } = string.Empty;
}

/// <summary>
/// Son aktivite DTO'su
/// </summary>
public class RecentActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
