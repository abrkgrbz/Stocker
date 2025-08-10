using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Subscription;

namespace Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionById;

public record GetSubscriptionByIdQuery : IRequest<Result<SubscriptionDto>>
{
    public Guid Id { get; init; }
}