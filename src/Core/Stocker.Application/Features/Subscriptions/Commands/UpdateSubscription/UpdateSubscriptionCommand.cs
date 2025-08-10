using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Features.Subscriptions.Commands.UpdateSubscription;

public record UpdateSubscriptionCommand : IRequest<Result<bool>>
{
    public Guid Id { get; init; }
    public BillingCycle? BillingCycle { get; init; }
    public decimal? Price { get; init; }
    public string? Currency { get; init; }
    public bool? AutoRenew { get; init; }
    public int? UserCount { get; init; }
}