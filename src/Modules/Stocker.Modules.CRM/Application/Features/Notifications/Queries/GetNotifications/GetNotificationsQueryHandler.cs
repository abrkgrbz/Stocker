using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Queries.GetNotifications;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, Result<GetNotificationsResponse>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<GetNotificationsQueryHandler> _logger;

    public GetNotificationsQueryHandler(
        INotificationRepository notificationRepository,
        ILogger<GetNotificationsQueryHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public async Task<Result<GetNotificationsResponse>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Get paged notifications
            var notifications = await _notificationRepository.GetPagedAsync(
                request.UserId,
                request.Skip,
                request.Take,
                request.UnreadOnly,
                cancellationToken
            );

            // Get counts
            var totalCount = await _notificationRepository.GetTotalCountAsync(
                request.UserId,
                request.UnreadOnly,
                cancellationToken
            );

            var unreadCount = await _notificationRepository.GetUnreadCountAsync(
                request.UserId,
                cancellationToken
            );

            // Map to response
            var notificationResponses = notifications.Select(n => new NotificationResponse(
                n.Id,
                n.Type,
                n.Title,
                n.Message,
                n.Channel,
                n.Status,
                n.RelatedEntityId,
                n.RelatedEntityType,
                n.ReadAt.HasValue,
                n.CreatedDate,
                n.ReadAt
            )).ToList();

            var response = new GetNotificationsResponse(
                notificationResponses,
                totalCount,
                unreadCount
            );

            return Result<GetNotificationsResponse>.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notifications for user {UserId}", request.UserId);
            return Result<GetNotificationsResponse>.Failure(
                Error.Failure("Notifications.Get", $"Failed to retrieve notifications: {ex.Message}")
            );
        }
    }
}
