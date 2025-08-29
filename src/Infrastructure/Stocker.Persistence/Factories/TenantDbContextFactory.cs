using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.SharedKernel.Settings;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Persistence.Factories;

public interface ITenantDbContextFactory
{
    TenantDbContext CreateDbContext(string connectionString);
    Task<TenantDbContext> CreateDbContextAsync(Guid tenantId);
    Task<TenantDbContext> CreateDbContextAsync(Guid tenantId, bool skipConnectionTest);
    Task<TenantDbContext> CreateDbContextAsync(string tenantIdentifier);
}

public class TenantDbContextFactory : ITenantDbContextFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly MasterDbContext _masterDbContext;
    private readonly DatabaseSettings _databaseSettings;
    private readonly ILogger<TenantDbContextFactory> _logger;

    public TenantDbContextFactory(
        IServiceProvider serviceProvider, 
        MasterDbContext masterDbContext,
        IOptions<DatabaseSettings> databaseSettings,
        ILogger<TenantDbContextFactory> logger)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _masterDbContext = masterDbContext ?? throw new ArgumentNullException(nameof(masterDbContext));
        _databaseSettings = databaseSettings?.Value ?? throw new ArgumentNullException(nameof(databaseSettings));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public TenantDbContext CreateDbContext(string connectionString)
    {
        return CreateDbContextWithTenantId(connectionString, null);
    }
    
    private TenantDbContext CreateDbContextWithTenantId(string connectionString, Guid? tenantId)
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

        // Always use StubTenantService to avoid circular dependency
        // TenantService depends on MasterDbContext which may not be fully initialized yet
        var stubService = new StubTenantService();
        if (tenantId.HasValue)
        {
            stubService.SetTenantId(tenantId.Value);
        }
        
        var context = new TenantDbContext(optionsBuilder.Options, stubService);
        return context;
    }

    public async Task<TenantDbContext> CreateDbContextAsync(Guid tenantId)
    {
        return await CreateDbContextAsync(tenantId, skipConnectionTest: false);
    }
    
    public async Task<TenantDbContext> CreateDbContextAsync(Guid tenantId, bool skipConnectionTest)
    {
        try
        {
            var tenant = await _masterDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId);
            
            if (tenant == null)
            {
                _logger.LogError("Tenant with ID '{TenantId}' not found in MasterDb", tenantId);
                throw new InvalidOperationException($"Tenant with ID '{tenantId}' not found.");
            }
            
            if (tenant.ConnectionString == null || string.IsNullOrEmpty(tenant.ConnectionString.Value))
            {
                _logger.LogError("Tenant {TenantId} has no connection string configured", tenantId);
                throw new InvalidOperationException($"Tenant {tenantId} has no connection string configured");
            }

            var context = CreateDbContextWithTenantId(tenant.ConnectionString.Value, tenantId);
            
            // Test connection only if not skipped (needed for initial migrations)
            if (!skipConnectionTest)
            {
                var canConnect = await context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    throw new InvalidOperationException($"Cannot connect to tenant database for tenant {tenantId}");
                }
            }
            
            return context;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create TenantDbContext for tenant {TenantId}: {Message}", 
                tenantId, ex.Message);
            throw;
        }
    }

    public async Task<TenantDbContext> CreateDbContextAsync(string tenantIdentifier)
    {
        var tenant = _masterDbContext.Tenants
            .FirstOrDefault(t => t.Code == tenantIdentifier);

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant with identifier '{tenantIdentifier}' not found.");
        }

        // Set current tenant in the service
        var tenantService = _serviceProvider.GetRequiredService<ITenantService>();
        await tenantService.SetCurrentTenant(tenantIdentifier);

        return CreateDbContext(tenant.ConnectionString.Value);
    }
    
    /// <summary>
    /// Stub implementation of ITenantService to avoid circular dependency
    /// </summary>
    private class StubTenantService : ITenantService
    {
        private Guid? _tenantId;
        
        public void SetTenantId(Guid tenantId)
        {
            _tenantId = tenantId;
        }
        
        public Guid? GetCurrentTenantId() => _tenantId;
        
        public string? GetCurrentTenantName() => null;
        
        public string? GetConnectionString() => null;
        
        public Task<bool> SetCurrentTenant(Guid tenantId)
        {
            _tenantId = tenantId;
            return Task.FromResult(true);
        }
        
        public Task<bool> SetCurrentTenant(string tenantIdentifier)
        {
            return Task.FromResult(false);
        }
    }
}