using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Commands.MarkAllAsRead;

public class MarkAllAsReadCommandHandler : IRequestHandler<MarkAllAsReadCommand, Result<Unit>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<MarkAllAsReadCommandHandler> _logger;

    public MarkAllAsReadCommandHandler(
        INotificationRepository notificationRepository,
        ILogger<MarkAllAsReadCommandHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(MarkAllAsReadCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var unreadNotifications = await _notificationRepository.GetByUserIdAsync(
                request.UserId,
                unreadOnly: true,
                cancellationToken
            );

            foreach (var notification in unreadNotifications)
            {
                notification.MarkAsRead();
                await _notificationRepository.UpdateAsync(notification, cancellationToken);
            }

            _logger.LogInformation("Marked {Count} notifications as read for user {UserId}",
                unreadNotifications.Count, request.UserId);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", request.UserId);
            return Result<Unit>.Failure(
                Error.Failure("Notification.MarkAllAsRead", $"Failed to mark all notifications as read: {ex.Message}")
            );
        }
    }
}
