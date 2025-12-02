using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Features.Subscriptions.Commands.ChangePackage;

public class ChangePackageCommandHandler : IRequestHandler<ChangePackageCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<ChangePackageCommandHandler> _logger;
    private readonly IMemoryCache _cache;

    public ChangePackageCommandHandler(
        IMasterDbContext context,
        ILogger<ChangePackageCommandHandler> logger,
        IMemoryCache cache)
    {
        _context = context;
        _logger = logger;
        _cache = cache;
    }

    public async Task<Result<bool>> Handle(ChangePackageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get active subscription for tenant
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.TenantId == request.TenantId &&
                    (s.Status == SubscriptionStatus.Aktif || s.Status == SubscriptionStatus.Deneme),
                    cancellationToken);

            if (subscription == null)
            {
                return Result<bool>.Failure(Error.NotFound(
                    "Subscription.NotFound",
                    $"No active subscription found for tenant {request.TenantId}"));
            }

            // Get new package
            var newPackage = await _context.Packages
                .Include(p => p.Modules)
                .FirstOrDefaultAsync(p => p.Id == request.NewPackageId, cancellationToken);

            if (newPackage == null)
            {
                return Result<bool>.Failure(Error.NotFound(
                    "Package.NotFound",
                    $"Package with ID {request.NewPackageId} not found"));
            }

            if (!newPackage.IsActive)
            {
                return Result<bool>.Failure(Error.Validation(
                    "Package.Inactive",
                    "Cannot change to an inactive package"));
            }

            // Calculate price based on current billing cycle using package method
            var newPrice = newPackage.CalculatePriceForCycle(subscription.BillingCycle);

            // Change the package
            subscription.ChangePackage(request.NewPackageId, newPrice);

            await _context.SaveChangesAsync(cancellationToken);

            // Invalidate all module-related caches for this tenant
            InvalidateTenantModuleCache(request.TenantId);

            _logger.LogInformation(
                "Package changed for tenant {TenantId} from subscription {SubscriptionId} to package {PackageId}. Cache invalidated.",
                request.TenantId, subscription.Id, request.NewPackageId);

            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while changing package for tenant {TenantId}", request.TenantId);
            return Result<bool>.Failure(Error.Validation("Subscription.InvalidOperation", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing package for tenant {TenantId}", request.TenantId);
            return Result<bool>.Failure(Error.Failure("Subscription.ChangePackageFailed", "Failed to change package"));
        }
    }

    private void InvalidateTenantModuleCache(Guid tenantId)
    {
        // Cache keys used by TenantModuleService
        _cache.Remove($"tenant_modules:{tenantId}");
        _cache.Remove($"active_modules:{tenantId}");

        // Cache keys used by ModuleActivationService
        var moduleNames = new[] { "Inventory", "CRM", "Sales", "Purchasing", "Accounting", "HRM", "Manufacturing", "Logistics" };
        foreach (var moduleName in moduleNames)
        {
            _cache.Remove($"module_active:{tenantId}:{moduleName}");
        }

        _logger.LogDebug("Invalidated module caches for tenant {TenantId}", tenantId);
    }
}
