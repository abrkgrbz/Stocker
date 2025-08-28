using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Persistence.Factories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Persistence.UnitOfWork;

/// <summary>
/// Lazy proxy for ITenantUnitOfWork that creates the actual unit of work
/// only when a method is called, ensuring tenant is already resolved
/// </summary>
public class LazyTenantUnitOfWork : ITenantUnitOfWork
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LazyTenantUnitOfWork> _logger;
    private ITenantUnitOfWork? _innerUnitOfWork;
    private readonly object _lock = new object();

    public LazyTenantUnitOfWork(
        IServiceProvider serviceProvider,
        ILogger<LazyTenantUnitOfWork> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    private ITenantUnitOfWork GetOrCreateUnitOfWork()
    {
        if (_innerUnitOfWork != null)
            return _innerUnitOfWork;

        lock (_lock)
        {
            if (_innerUnitOfWork != null)
                return _innerUnitOfWork;

            var tenantService = _serviceProvider.GetRequiredService<ITenantService>();
            var currentTenantId = tenantService.GetCurrentTenantId();

            if (!currentTenantId.HasValue || currentTenantId.Value == Guid.Empty)
            {
                var errorMessage = $"Cannot create TenantUnitOfWork: No tenant resolved. Current tenant ID: {currentTenantId?.ToString() ?? "NULL"}";
                _logger.LogError(errorMessage);
                throw new InvalidOperationException(errorMessage);
            }

            _logger.LogInformation("Creating TenantUnitOfWork for tenant {TenantId}", currentTenantId.Value);

            var factory = _serviceProvider.GetRequiredService<ITenantUnitOfWorkFactory>();
            _innerUnitOfWork = factory.CreateAsync(currentTenantId.Value).GetAwaiter().GetResult();
            
            _logger.LogInformation("TenantUnitOfWork created successfully for tenant {TenantId}", currentTenantId.Value);
            
            return _innerUnitOfWork;
        }
    }

    public Guid TenantId => GetOrCreateUnitOfWork().TenantId;

    public IRepository<TEntity> Repository<TEntity>() where TEntity : class, IEntity
    {
        return GetOrCreateUnitOfWork().Repository<TEntity>();
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return GetOrCreateUnitOfWork().SaveChangesAsync(cancellationToken);
    }

    public Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        return GetOrCreateUnitOfWork().SaveEntitiesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _innerUnitOfWork?.Dispose();
    }
}