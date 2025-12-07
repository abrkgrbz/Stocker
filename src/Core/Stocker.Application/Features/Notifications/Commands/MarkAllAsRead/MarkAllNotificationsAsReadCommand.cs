using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Commands.MarkAllAsRead;

public record MarkAllNotificationsAsReadCommand : IRequest<Result>
{
    public Guid UserId { get; init; }
}
