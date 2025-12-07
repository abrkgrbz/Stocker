using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Commands.DeleteNotification;

public record DeleteNotificationCommand : IRequest<Result>
{
    public Guid NotificationId { get; init; }
    public Guid UserId { get; init; }
}
