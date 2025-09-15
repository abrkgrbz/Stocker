using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Features.Subscriptions.Commands.CancelSubscription;

public class CancelSubscriptionCommandHandler : IRequestHandler<CancelSubscriptionCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CancelSubscriptionCommandHandler> _logger;

    public CancelSubscriptionCommandHandler(
        IMasterDbContext context,
        ILogger<CancelSubscriptionCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(CancelSubscriptionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

            if (subscription == null)
            {
                return Result<bool>.Failure(Error.NotFound("Subscription.NotFound", $"Subscription with ID {request.Id} not found"));
            }

            // Use domain method to cancel subscription
            subscription.Cancel(request.Reason);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Subscription {SubscriptionId} cancelled with reason: {Reason}", request.Id, request.Reason);

            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when cancelling subscription {SubscriptionId}", request.Id);
            return Result<bool>.Failure(Error.Validation("Subscription.InvalidOperation", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling subscription {SubscriptionId}", request.Id);
            return Result<bool>.Failure(Error.Failure("Subscription.CancelFailed", "Failed to cancel subscription"));
        }
    }
}