using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Persistence.Services;

public class TenantContextFactory : ITenantContextFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ITenantResolver _tenantResolver;
    private readonly ITenantService _tenantService;

    public TenantContextFactory(
        IServiceProvider serviceProvider,
        ITenantResolver tenantResolver,
        ITenantService tenantService)
    {
        _serviceProvider = serviceProvider;
        _tenantResolver = tenantResolver;
        _tenantService = tenantService;
    }

    public async Task<DbContext> CreateAsync(Guid tenantId)
    {
        // Get tenant info
        var tenantInfo = await _tenantResolver.ResolveByIdAsync(tenantId);
        if (tenantInfo == null)
        {
            throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
        }

        // Create a new service scope for the tenant context
        var scope = _serviceProvider.CreateScope();
        var dbContextOptions = new DbContextOptionsBuilder<TenantDbContext>()
            .UseSqlServer(tenantInfo.ConnectionString)
            .Options;

        var context = new TenantDbContext(dbContextOptions, tenantId);
        return context;
    }

    public async Task<DbContext> CreateForCurrentTenantAsync()
    {
        var currentTenantId = _tenantService.GetCurrentTenantId();
        if (!currentTenantId.HasValue)
        {
            throw new InvalidOperationException("No current tenant context available");
        }

        return await CreateAsync(currentTenantId.Value);
    }
}