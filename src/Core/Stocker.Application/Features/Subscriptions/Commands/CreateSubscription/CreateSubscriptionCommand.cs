using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Subscription;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Features.Subscriptions.Commands.CreateSubscription;

public record CreateSubscriptionCommand : IRequest<Result<SubscriptionDto>>
{
    public Guid TenantId { get; init; }
    public Guid PackageId { get; init; }
    public BillingCycle BillingCycle { get; init; } = BillingCycle.Aylik;
    public decimal? CustomPrice { get; init; } // Null ise Package fiyatını kullan
    public string Currency { get; init; } = "TRY";
    public DateTime? StartDate { get; init; }
    public int? TrialDays { get; init; }
    public bool AutoRenew { get; init; } = true;
    public int UserCount { get; init; } = 1;
}