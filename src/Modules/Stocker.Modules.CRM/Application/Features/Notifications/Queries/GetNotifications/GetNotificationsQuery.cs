using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery(
    Guid UserId,
    bool? UnreadOnly = null,
    int Skip = 0,
    int Take = 50
) : IRequest<Result<GetNotificationsResponse>>;
