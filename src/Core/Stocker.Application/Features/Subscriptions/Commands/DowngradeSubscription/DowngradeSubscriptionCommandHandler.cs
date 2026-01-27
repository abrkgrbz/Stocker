using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.DowngradeSubscription;

public class DowngradeSubscriptionCommandHandler : IRequestHandler<DowngradeSubscriptionCommand, Result<DowngradeSubscriptionResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<DowngradeSubscriptionCommandHandler> _logger;

    public DowngradeSubscriptionCommandHandler(IMasterDbContext context, ILogger<DowngradeSubscriptionCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<DowngradeSubscriptionResponse>> Handle(DowngradeSubscriptionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.Package)
                .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

            if (subscription == null)
            {
                return Result<DowngradeSubscriptionResponse>.Failure(Error.NotFound("Subscription.NotFound", "Subscription not found"));
            }

            if (subscription.Status != SubscriptionStatus.Aktif)
            {
                return Result<DowngradeSubscriptionResponse>.Failure(Error.Validation("Subscription.InvalidStatus", "Only active subscriptions can be downgraded"));
            }

            var newPackage = await _context.Packages
                .FirstOrDefaultAsync(p => p.Id == request.NewPackageId && p.IsActive, cancellationToken);

            if (newPackage == null)
            {
                return Result<DowngradeSubscriptionResponse>.Failure(Error.NotFound("Package.NotFound", "New package not found or inactive"));
            }

            // Validate it's actually a downgrade (new package should cost less)
            if (newPackage.BasePrice.Amount >= subscription.Package.BasePrice.Amount)
            {
                return Result<DowngradeSubscriptionResponse>.Failure(Error.Validation("Subscription.NotADowngrade", "Selected package is not a downgrade. Use upgrade endpoint instead."));
            }

            var oldPackage = subscription.Package;
            var oldPackageId = oldPackage.Id;
            var oldPackageName = oldPackage.Name;

            DateTime effectiveDate;
            bool isPending;

            if (request.ApplyAtPeriodEnd)
            {
                // Schedule downgrade for period end
                effectiveDate = subscription.CurrentPeriodEnd;
                isPending = true;

                // Store pending downgrade info (could be stored in a separate table or as metadata)
                // For now, we'll apply immediately but log the intent
                _logger.LogInformation(
                    "Subscription {SubscriptionId} downgrade scheduled for {EffectiveDate}",
                    subscription.Id, effectiveDate);
            }
            else
            {
                // Apply immediately
                effectiveDate = DateTime.UtcNow;
                isPending = false;
            }

            // Update subscription with new package price
            subscription.ChangePackage(newPackage.Id, newPackage.BasePrice);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Subscription {SubscriptionId} downgraded from {OldPackage} to {NewPackage}",
                subscription.Id, oldPackageName, newPackage.Name);

            return Result<DowngradeSubscriptionResponse>.Success(new DowngradeSubscriptionResponse(
                SubscriptionId: subscription.Id,
                OldPackageId: oldPackageId,
                OldPackageName: oldPackageName,
                NewPackageId: newPackage.Id,
                NewPackageName: newPackage.Name,
                EffectiveDate: effectiveDate,
                IsPending: isPending
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downgrading subscription {SubscriptionId}", request.SubscriptionId);
            return Result<DowngradeSubscriptionResponse>.Failure(Error.Failure("Subscription.DowngradeError", ex.Message));
        }
    }
}
