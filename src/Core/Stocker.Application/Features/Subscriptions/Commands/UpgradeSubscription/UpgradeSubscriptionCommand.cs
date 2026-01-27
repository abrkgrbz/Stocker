using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.UpgradeSubscription;

public record UpgradeSubscriptionCommand : IRequest<Result<UpgradeSubscriptionResponse>>
{
    public Guid SubscriptionId { get; init; }
    public Guid NewPackageId { get; init; }
    public bool ProrateBilling { get; init; } = true;
}

public record UpgradeSubscriptionResponse(
    Guid SubscriptionId,
    Guid OldPackageId,
    string OldPackageName,
    Guid NewPackageId,
    string NewPackageName,
    decimal ProratedAmount,
    string Currency,
    DateTime EffectiveDate
);
