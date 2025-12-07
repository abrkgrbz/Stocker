namespace Stocker.Shared.Events.HR;

/// <summary>
/// Published when an announcement is published and should notify users
/// </summary>
public record AnnouncementPublishedEvent(
    int AnnouncementId,
    Guid TenantId,
    string Title,
    string Content,
    string? Summary,
    string AnnouncementType,
    string Priority,
    int AuthorId,
    string AuthorName,
    int? TargetDepartmentId,
    string? TargetDepartmentName,
    bool RequiresAcknowledgment,
    DateTime PublishDate,
    DateTime? ExpiryDate
) : IntegrationEvent;
