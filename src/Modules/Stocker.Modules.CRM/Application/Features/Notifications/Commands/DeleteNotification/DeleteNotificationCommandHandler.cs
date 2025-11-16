using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Commands.DeleteNotification;

public class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand, Result<Unit>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<DeleteNotificationCommandHandler> _logger;

    public DeleteNotificationCommandHandler(
        INotificationRepository notificationRepository,
        ILogger<DeleteNotificationCommandHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var notification = await _notificationRepository.GetByIdAsync(request.NotificationId, cancellationToken);

            if (notification == null)
            {
                return Result<Unit>.Failure(
                    Error.NotFound("Notification", $"Notification with ID {request.NotificationId} not found")
                );
            }

            // Verify the notification belongs to the user
            if (notification.UserId != request.UserId)
            {
                return Result<Unit>.Failure(
                    Error.Forbidden("Notification", "You don't have permission to delete this notification")
                );
            }

            await _notificationRepository.DeleteAsync(request.NotificationId, cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notification {NotificationId}", request.NotificationId);
            return Result<Unit>.Failure(
                Error.Failure("Notification.Delete", $"Failed to delete notification: {ex.Message}")
            );
        }
    }
}
