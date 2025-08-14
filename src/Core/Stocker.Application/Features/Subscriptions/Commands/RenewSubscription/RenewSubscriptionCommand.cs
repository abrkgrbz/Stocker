using MediatR;
using Stocker.Application.DTOs.Subscription;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.RenewSubscription;

public class RenewSubscriptionCommand : IRequest<Result<SubscriptionDto>>
{
    public Guid SubscriptionId { get; set; }
    public int? AdditionalMonths { get; set; } = 1; // Default 1 month renewal
}