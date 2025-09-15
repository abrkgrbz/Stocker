using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.UnitOfWork;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Persistence.Factories;

public interface ITenantUnitOfWorkFactory
{
    Task<ITenantUnitOfWork> CreateAsync(Guid tenantId);
    Task<ITenantUnitOfWork> CreateAsync(string tenantIdentifier);
}

public class TenantUnitOfWorkFactory : ITenantUnitOfWorkFactory
{
    private readonly ITenantDbContextFactory _contextFactory;
    private readonly ILogger<TenantUnitOfWorkFactory> _logger;

    public TenantUnitOfWorkFactory(
        ITenantDbContextFactory contextFactory,
        ILogger<TenantUnitOfWorkFactory> logger)
    {
        _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ITenantUnitOfWork> CreateAsync(Guid tenantId)
    {
        try
        {
            var context = await _contextFactory.CreateDbContextAsync(tenantId);
            
            var unitOfWork = new TenantUnitOfWork((TenantDbContext)context);
            
            return unitOfWork;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create TenantUnitOfWork for tenant {TenantId}: {Message}", 
                tenantId, ex.Message);
            throw;
        }
    }

    public async Task<ITenantUnitOfWork> CreateAsync(string tenantIdentifier)
    {
        try
        {
            _logger.LogInformation("TenantUnitOfWorkFactory.CreateAsync started for tenant identifier {TenantIdentifier}", tenantIdentifier);
            // Convert string identifier to Guid
            if (!Guid.TryParse(tenantIdentifier, out var tenantId))
            {
                throw new ArgumentException($"Invalid tenant identifier: {tenantIdentifier}");
            }
            
            var context = await _contextFactory.CreateDbContextAsync(tenantId);
            var unitOfWork = new TenantUnitOfWork((TenantDbContext)context);
            _logger.LogInformation("TenantUnitOfWork created successfully for tenant identifier {TenantIdentifier}", tenantIdentifier);
            return unitOfWork;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create TenantUnitOfWork for tenant identifier {TenantIdentifier}: {Message}", 
                tenantIdentifier, ex.Message);
            throw;
        }
    }
}