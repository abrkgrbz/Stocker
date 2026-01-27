using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Features.Subscriptions.Commands.SuspendSubscription;

public class SuspendSubscriptionCommandHandler : IRequestHandler<SuspendSubscriptionCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<SuspendSubscriptionCommandHandler> _logger;

    public SuspendSubscriptionCommandHandler(
        IMasterDbContext context,
        ILogger<SuspendSubscriptionCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(SuspendSubscriptionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

            if (subscription == null)
            {
                return Result<bool>.Failure(Error.NotFound("Subscription.NotFound", $"Subscription with ID {request.Id} not found"));
            }

            // Use domain method to suspend subscription
            subscription.Suspend(request.Reason);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Subscription {SubscriptionId} suspended with reason: {Reason}", request.Id, request.Reason);

            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when suspending subscription {SubscriptionId}", request.Id);
            return Result<bool>.Failure(Error.Validation("Subscription.InvalidOperation", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suspending subscription {SubscriptionId}", request.Id);
            return Result<bool>.Failure(Error.Failure("Subscription.SuspendFailed", "Failed to suspend subscription"));
        }
    }
}
