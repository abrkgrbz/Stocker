using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Commands.DeleteNotification;

public record DeleteNotificationCommand(
    int NotificationId,
    Guid UserId
) : IRequest<Result<Unit>>;
