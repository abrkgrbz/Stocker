using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Queries.GetTenantNotifications;

public record GetTenantNotificationsQuery : IRequest<Result<GetTenantNotificationsResponse>>
{
    public Guid UserId { get; init; }
    public bool? IsRead { get; init; }
    public int Skip { get; init; } = 0;
    public int Take { get; init; } = 50;
}

public class GetTenantNotificationsResponse
{
    public List<TenantNotificationDto> Notifications { get; set; } = new();
    public int TotalCount { get; set; }
    public int UnreadCount { get; set; }
}

public class TenantNotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public bool IsDismissed { get; set; }
    public bool RequiresAcknowledgment { get; set; }
    public bool IsAcknowledged { get; set; }
    public string? IconName { get; set; }
    public string? IconColor { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public List<string>? Tags { get; set; }
}
