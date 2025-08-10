using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Subscription;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Features.Subscriptions.Queries.GetSubscriptions;

public record GetSubscriptionsQuery : IRequest<Result<List<SubscriptionDto>>>
{
    public Guid? TenantId { get; init; }
    public SubscriptionStatus? Status { get; init; }
    public bool? AutoRenew { get; init; }
}