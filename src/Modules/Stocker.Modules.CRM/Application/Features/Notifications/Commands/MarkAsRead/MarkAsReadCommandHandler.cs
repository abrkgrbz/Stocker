using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Commands.MarkAsRead;

public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand, Result<Unit>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<MarkAsReadCommandHandler> _logger;

    public MarkAsReadCommandHandler(
        INotificationRepository notificationRepository,
        ILogger<MarkAsReadCommandHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
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
                    Error.Forbidden("Notification", "You don't have permission to mark this notification as read")
                );
            }

            var result = notification.MarkAsRead();
            if (!result.IsSuccess)
            {
                return Result<Unit>.Failure(result.Error);
            }

            await _notificationRepository.UpdateAsync(notification, cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification {NotificationId} as read", request.NotificationId);
            return Result<Unit>.Failure(
                Error.Failure("Notification.MarkAsRead", $"Failed to mark notification as read: {ex.Message}")
            );
        }
    }
}
