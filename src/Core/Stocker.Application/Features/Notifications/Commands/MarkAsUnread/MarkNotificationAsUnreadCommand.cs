using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Commands.MarkAsUnread;

public record MarkNotificationAsUnreadCommand : IRequest<Result>
{
    public Guid NotificationId { get; init; }
    public Guid UserId { get; init; }
}
