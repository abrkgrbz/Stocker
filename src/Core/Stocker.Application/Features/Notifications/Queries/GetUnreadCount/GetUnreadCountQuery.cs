using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Queries.GetUnreadCount;

public record GetUnreadCountQuery : IRequest<Result<UnreadCountResponse>>
{
    public Guid UserId { get; init; }
}

public class UnreadCountResponse
{
    public int UnreadCount { get; set; }
}
