using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.UpgradeSubscription;

public class UpgradeSubscriptionCommandHandler : IRequestHandler<UpgradeSubscriptionCommand, Result<UpgradeSubscriptionResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<UpgradeSubscriptionCommandHandler> _logger;

    public UpgradeSubscriptionCommandHandler(IMasterDbContext context, ILogger<UpgradeSubscriptionCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<UpgradeSubscriptionResponse>> Handle(UpgradeSubscriptionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.Package)
                .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

            if (subscription == null)
            {
                return Result<UpgradeSubscriptionResponse>.Failure(Error.NotFound("Subscription.NotFound", "Subscription not found"));
            }

            if (subscription.Status != SubscriptionStatus.Aktif && subscription.Status != SubscriptionStatus.Deneme)
            {
                return Result<UpgradeSubscriptionResponse>.Failure(Error.Validation("Subscription.InvalidStatus", "Only active or trial subscriptions can be upgraded"));
            }

            var newPackage = await _context.Packages
                .FirstOrDefaultAsync(p => p.Id == request.NewPackageId && p.IsActive, cancellationToken);

            if (newPackage == null)
            {
                return Result<UpgradeSubscriptionResponse>.Failure(Error.NotFound("Package.NotFound", "New package not found or inactive"));
            }

            // Validate it's actually an upgrade (new package should cost more)
            if (newPackage.BasePrice.Amount <= subscription.Package.BasePrice.Amount)
            {
                return Result<UpgradeSubscriptionResponse>.Failure(Error.Validation("Subscription.NotAnUpgrade", "Selected package is not an upgrade. Use downgrade endpoint instead."));
            }

            var oldPackage = subscription.Package;
            var oldPackageId = oldPackage.Id;
            var oldPackageName = oldPackage.Name;

            // Calculate prorated amount
            decimal proratedAmount = 0;
            if (request.ProrateBilling)
            {
                var daysRemaining = (subscription.CurrentPeriodEnd - DateTime.UtcNow).Days;
                var totalDays = (subscription.CurrentPeriodEnd - subscription.CurrentPeriodStart).Days;
                if (totalDays > 0 && daysRemaining > 0)
                {
                    var dailyDifference = (newPackage.BasePrice.Amount - oldPackage.BasePrice.Amount) / 30;
                    proratedAmount = dailyDifference * daysRemaining;
                }
            }

            // Update subscription with the new package price
            subscription.ChangePackage(newPackage.Id, newPackage.BasePrice);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Subscription {SubscriptionId} upgraded from {OldPackage} to {NewPackage}",
                subscription.Id, oldPackageName, newPackage.Name);

            return Result<UpgradeSubscriptionResponse>.Success(new UpgradeSubscriptionResponse(
                SubscriptionId: subscription.Id,
                OldPackageId: oldPackageId,
                OldPackageName: oldPackageName,
                NewPackageId: newPackage.Id,
                NewPackageName: newPackage.Name,
                ProratedAmount: proratedAmount,
                Currency: subscription.Price.Currency,
                EffectiveDate: DateTime.UtcNow
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upgrading subscription {SubscriptionId}", request.SubscriptionId);
            return Result<UpgradeSubscriptionResponse>.Failure(Error.Failure("Subscription.UpgradeError", ex.Message));
        }
    }
}
