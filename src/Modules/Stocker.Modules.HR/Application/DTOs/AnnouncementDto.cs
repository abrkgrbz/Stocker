namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Announcement entity
/// </summary>
public class AnnouncementDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string AnnouncementType { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public DateTime PublishDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPinned { get; set; }
    public bool RequiresAcknowledgment { get; set; }
    public int? TargetDepartmentId { get; set; }
    public string? TargetDepartmentName { get; set; }
    public string? AttachmentUrl { get; set; }
    public int ViewCount { get; set; }
    public int AcknowledgmentCount { get; set; }
    public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for announcement summary list view
/// </summary>
public class AnnouncementSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string AnnouncementType { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public DateTime PublishDate { get; set; }
    public bool IsPinned { get; set; }
    public bool RequiresAcknowledgment { get; set; }
    public bool IsAcknowledged { get; set; }
    public int ViewCount { get; set; }
}

/// <summary>
/// DTO for creating an announcement
/// </summary>
public class CreateAnnouncementDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string AnnouncementType { get; set; } = "General";
    public string Priority { get; set; } = "Normal";
    public int AuthorId { get; set; }
    public DateTime PublishDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsPinned { get; set; }
    public bool RequiresAcknowledgment { get; set; }
    public int? TargetDepartmentId { get; set; }
}

/// <summary>
/// DTO for updating an announcement
/// </summary>
public class UpdateAnnouncementDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string AnnouncementType { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime PublishDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsPinned { get; set; }
    public bool RequiresAcknowledgment { get; set; }
    public int? TargetDepartmentId { get; set; }
}

/// <summary>
/// Data transfer object for AnnouncementAcknowledgment
/// </summary>
public class AnnouncementAcknowledgmentDto
{
    public int Id { get; set; }
    public int AnnouncementId { get; set; }
    public string AnnouncementTitle { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime AcknowledgedDate { get; set; }
    public string? Comments { get; set; }
}

/// <summary>
/// DTO for acknowledging an announcement
/// </summary>
public class AcknowledgeAnnouncementDto
{
    public string? Comments { get; set; }
}

/// <summary>
/// DTO for announcement statistics
/// </summary>
public class AnnouncementStatisticsDto
{
    public int AnnouncementId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int TotalTargetEmployees { get; set; }
    public int ViewCount { get; set; }
    public int AcknowledgmentCount { get; set; }
    public decimal ViewRate { get; set; }
    public decimal AcknowledgmentRate { get; set; }
    public List<AnnouncementAcknowledgmentDto> Acknowledgments { get; set; } = new();
}
