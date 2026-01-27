using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Features.Subscriptions.Commands.ReactivateSubscription;

public class ReactivateSubscriptionCommandHandler : IRequestHandler<ReactivateSubscriptionCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<ReactivateSubscriptionCommandHandler> _logger;

    public ReactivateSubscriptionCommandHandler(
        IMasterDbContext context,
        ILogger<ReactivateSubscriptionCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(ReactivateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

            if (subscription == null)
            {
                return Result<bool>.Failure(Error.NotFound("Subscription.NotFound", $"Subscription with ID {request.Id} not found"));
            }

            // Use domain method to reactivate subscription
            subscription.Reactivate();

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Subscription {SubscriptionId} reactivated successfully", request.Id);

            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when reactivating subscription {SubscriptionId}", request.Id);
            return Result<bool>.Failure(Error.Validation("Subscription.InvalidOperation", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reactivating subscription {SubscriptionId}", request.Id);
            return Result<bool>.Failure(Error.Failure("Subscription.ReactivateFailed", "Failed to reactivate subscription"));
        }
    }
}
