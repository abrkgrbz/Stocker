using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Commands.MarkAsRead;

public record MarkNotificationAsReadCommand : IRequest<Result>
{
    public Guid NotificationId { get; init; }
    public Guid UserId { get; init; }
}
