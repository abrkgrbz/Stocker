using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Modules.Inventory.Domain.Services;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Inventory.Infrastructure.BackgroundServices;

/// <summary>
/// Background service that periodically cleans up expired stock reservations.
/// Releases reserved quantities back to available stock when reservations expire.
/// Runs every 5 minutes to minimize "dead stock" from forgotten reservations.
///
/// Multi-tenant aware: Processes expired reservations for all active tenants.
/// </summary>
public class ReservationCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReservationCleanupService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    public ReservationCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<ReservationCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReservationCleanupService started. Interval: {Interval}", Interval);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(Interval, stoppingToken);
                await ProcessAllTenantsExpiredReservationsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Graceful shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing expired reservations. Will retry next interval.");
            }
        }

        _logger.LogInformation("ReservationCleanupService stopped.");
    }

    /// <summary>
    /// Processes expired reservations for all active tenants.
    /// This method iterates through all tenants and sets the background tenant context
    /// before processing each tenant's expired reservations.
    /// </summary>
    private async Task ProcessAllTenantsExpiredReservationsAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var masterContext = scope.ServiceProvider.GetRequiredService<IMasterDbContext>();

        // Get all active tenants with their connection strings
        var tenants = await masterContext.Tenants
            .Where(t => t.IsActive)
            .Select(t => new
            {
                t.Id,
                t.Name,
                ConnectionString = t.ConnectionString.Value
            })
            .ToListAsync(cancellationToken);

        if (!tenants.Any())
        {
            _logger.LogDebug("No active tenants found for reservation cleanup.");
            return;
        }

        _logger.LogDebug("Processing expired reservations for {TenantCount} active tenants.", tenants.Count);

        var totalProcessed = 0;
        var tenantsProcessed = 0;

        foreach (var tenant in tenants)
        {
            try
            {
                var processedCount = await ProcessTenantExpiredReservationsAsync(
                    tenant.Id,
                    tenant.Name,
                    tenant.ConnectionString,
                    cancellationToken);

                if (processedCount > 0)
                {
                    totalProcessed += processedCount;
                    _logger.LogInformation(
                        "Processed {Count} expired reservations for tenant {TenantName} ({TenantId}).",
                        processedCount, tenant.Name, tenant.Id);
                }

                tenantsProcessed++;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Error processing expired reservations for tenant {TenantId}. Continuing with next tenant.",
                    tenant.Id);
                // Continue with other tenants
            }
        }

        if (totalProcessed > 0)
        {
            _logger.LogInformation(
                "Reservation cleanup completed. {TenantsProcessed} tenants processed, {TotalProcessed} total reservations released.",
                tenantsProcessed, totalProcessed);
        }
    }

    /// <summary>
    /// Processes expired reservations for a specific tenant.
    /// Creates a new scope with tenant context set for proper DbContext resolution.
    /// </summary>
    private async Task<int> ProcessTenantExpiredReservationsAsync(
        Guid tenantId,
        string tenantName,
        string connectionString,
        CancellationToken cancellationToken)
    {
        // Create a new scope for this tenant to ensure fresh DbContext
        using var scope = _scopeFactory.CreateScope();

        // Set the background tenant context BEFORE resolving any tenant-dependent services
        var backgroundTenantService = scope.ServiceProvider.GetRequiredService<IBackgroundTenantService>();
        backgroundTenantService.SetTenantInfo(tenantId, tenantName, connectionString);

        // Now resolve the reservation service - it will use the tenant context we just set
        var reservationService = scope.ServiceProvider.GetService<IStockReservationService>();

        if (reservationService == null)
        {
            _logger.LogDebug("IStockReservationService not available for tenant {TenantId}. Inventory module may not be active.", tenantId);
            return 0;
        }

        return await reservationService.ProcessExpiredReservationsAsync(cancellationToken);
    }
}
