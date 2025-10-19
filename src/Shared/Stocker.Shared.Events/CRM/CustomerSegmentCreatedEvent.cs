namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a new customer segment is created in the CRM module
/// </summary>
public record CustomerSegmentCreatedEvent(
    int SegmentId,
    Guid TenantId,
    string Name,
    string Description,
    string SegmentType,
    int MemberCount,
    DateTime CreatedAt,
    Guid CreatedBy
) : IntegrationEvent;
