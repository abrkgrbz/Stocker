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

    public TenantUnitOfWorkFactory(ITenantDbContextFactory contextFactory)
    {
        _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
    }

    public async Task<ITenantUnitOfWork> CreateAsync(Guid tenantId)
    {
        var context = await _contextFactory.CreateDbContextAsync(tenantId);
        return new TenantUnitOfWork(context);
    }

    public async Task<ITenantUnitOfWork> CreateAsync(string tenantIdentifier)
    {
        var context = await _contextFactory.CreateDbContextAsync(tenantIdentifier);
        return new TenantUnitOfWork(context);
    }
}