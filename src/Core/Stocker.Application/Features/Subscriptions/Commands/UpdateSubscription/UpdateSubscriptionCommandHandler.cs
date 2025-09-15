using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Application.Features.Subscriptions.Commands.UpdateSubscription;

public class UpdateSubscriptionCommandHandler : IRequestHandler<UpdateSubscriptionCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<UpdateSubscriptionCommandHandler> _logger;

    public UpdateSubscriptionCommandHandler(
        IMasterDbContext context,
        ILogger<UpdateSubscriptionCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(UpdateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

            if (subscription == null)
            {
                return Result<bool>.Failure(Error.NotFound("Subscription.NotFound", $"Subscription with ID {request.Id} not found"));
            }

            // Update billing cycle and price if provided
            if (request.BillingCycle.HasValue && request.Price.HasValue)
            {
                var newPrice = Money.Create(request.Price.Value, request.Currency ?? "TRY");
                subscription.UpdateBillingCycle(request.BillingCycle.Value, newPrice);
            }

            // Update auto-renewal preference
            if (request.AutoRenew.HasValue)
            {
                subscription.SetAutoRenew(request.AutoRenew.Value);
            }

            // Update user count
            if (request.UserCount.HasValue)
            {
                subscription.UpdateUserCount(request.UserCount.Value);
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Subscription {SubscriptionId} updated successfully", request.Id);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating subscription {SubscriptionId}", request.Id);
            return Result<bool>.Failure(Error.Failure("Subscription.UpdateFailed", "Failed to update subscription"));
        }
    }
}