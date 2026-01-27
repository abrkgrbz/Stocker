using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.DowngradeSubscription;

public record DowngradeSubscriptionCommand : IRequest<Result<DowngradeSubscriptionResponse>>
{
    public Guid SubscriptionId { get; init; }
    public Guid NewPackageId { get; init; }
    public bool ApplyAtPeriodEnd { get; init; } = true;
}

public record DowngradeSubscriptionResponse(
    Guid SubscriptionId,
    Guid OldPackageId,
    string OldPackageName,
    Guid NewPackageId,
    string NewPackageName,
    DateTime EffectiveDate,
    bool IsPending
);
