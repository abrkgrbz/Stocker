using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Commands.MarkAsRead;

public record MarkAsReadCommand(
    int NotificationId,
    Guid UserId
) : IRequest<Result<Unit>>;
