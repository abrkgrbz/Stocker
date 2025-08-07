using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Stocker.SharedKernel.Settings;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Persistence.Factories;

public interface ITenantDbContextFactory
{
    TenantDbContext CreateDbContext(string connectionString);
    Task<TenantDbContext> CreateDbContextAsync(Guid tenantId);
    Task<TenantDbContext> CreateDbContextAsync(string tenantIdentifier);
}

public class TenantDbContextFactory : ITenantDbContextFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly MasterDbContext _masterDbContext;
    private readonly DatabaseSettings _databaseSettings;

    public TenantDbContextFactory(
        IServiceProvider serviceProvider, 
        MasterDbContext masterDbContext,
        IOptions<DatabaseSettings> databaseSettings)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _masterDbContext = masterDbContext ?? throw new ArgumentNullException(nameof(masterDbContext));
        _databaseSettings = databaseSettings?.Value ?? throw new ArgumentNullException(nameof(databaseSettings));
    }

    public TenantDbContext CreateDbContext(string connectionString)
    {
        var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
        optionsBuilder.UseSqlServer(connectionString, sqlOptions =>
        {
            if (_databaseSettings.CommandTimeout > 0)
            {
                sqlOptions.CommandTimeout(_databaseSettings.CommandTimeout);
            }
        });
        
        // Apply development settings if configured
        if (_databaseSettings.EnableSensitiveDataLogging)
        {
            optionsBuilder.EnableSensitiveDataLogging();
        }
        
        if (_databaseSettings.EnableDetailedErrors)
        {
            optionsBuilder.EnableDetailedErrors();
        }

        var tenantService = _serviceProvider.GetRequiredService<ITenantService>();
        return new TenantDbContext(optionsBuilder.Options, tenantService);
    }

    public async Task<TenantDbContext> CreateDbContextAsync(Guid tenantId)
    {
        var tenant = await _masterDbContext.Tenants.FindAsync(tenantId);
        if (tenant == null || !tenant.IsActive)
        {
            throw new InvalidOperationException($"Tenant with ID '{tenantId}' not found or not active.");
        }

        // Set current tenant in the service
        var tenantService = _serviceProvider.GetRequiredService<ITenantService>();
        await tenantService.SetCurrentTenant(tenantId);

        return CreateDbContext(tenant.ConnectionString.Value);
    }

    public async Task<TenantDbContext> CreateDbContextAsync(string tenantIdentifier)
    {
        var tenant = _masterDbContext.Tenants
            .FirstOrDefault(t => t.Code == tenantIdentifier);

        if (tenant == null || !tenant.IsActive)
        {
            throw new InvalidOperationException($"Tenant with identifier '{tenantIdentifier}' not found or not active.");
        }

        // Set current tenant in the service
        var tenantService = _serviceProvider.GetRequiredService<ITenantService>();
        await tenantService.SetCurrentTenant(tenantIdentifier);

        return CreateDbContext(tenant.ConnectionString.Value);
    }
}