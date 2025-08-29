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
        try
        {
            _logger.LogWarning("CreateDbContextAsync START for tenant {TenantId}", tenantId);
            
            // Include gerekli değil, OwnsOne otomatik yükler
            _logger.LogWarning("Querying MasterDb for tenant {TenantId}...", tenantId);
            var tenant = await _masterDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId);
            
            _logger.LogWarning("Query completed. Tenant found: {Found}", tenant != null);
            
            if (tenant == null)
            {
                _logger.LogError("Tenant with ID '{TenantId}' not found in MasterDb", tenantId);
                throw new InvalidOperationException($"Tenant with ID '{tenantId}' not found.");
            }
            
            _logger.LogWarning("Tenant ConnectionString check for {TenantId}...", tenantId);
            if (tenant.ConnectionString == null || string.IsNullOrEmpty(tenant.ConnectionString.Value))
            {
                _logger.LogError("Tenant {TenantId} has no connection string configured", tenantId);
                throw new InvalidOperationException($"Tenant {tenantId} has no connection string configured");
            }
            _logger.LogWarning("Tenant ConnectionString OK: {ConnStr}", 
                tenant.ConnectionString.Value?.Replace("Password", "***") ?? "NULL");

            // Set current tenant in the service
            _logger.LogWarning("Getting TenantService for {TenantId}...", tenantId);
            var tenantService = _serviceProvider.GetRequiredService<ITenantService>();
            
            // Skip setting tenant in service to avoid circular dependency
            // The tenant is already resolved and we have the connection string
            _logger.LogWarning("Skipping SetCurrentTenant to avoid circular dependency for {TenantId}", tenantId);
            
            _logger.LogWarning("Creating DbContext for {TenantId}...", tenantId);
            var context = CreateDbContext(tenant.ConnectionString.Value);
            _logger.LogWarning("DbContext created for {TenantId}", tenantId);
            
            // Test connection
            _logger.LogWarning("Testing connection for {TenantId}...", tenantId);
            var canConnect = await context.Database.CanConnectAsync();
            _logger.LogWarning("Connection test result for {TenantId}: {Result}", tenantId, canConnect);
            
            if (!canConnect)
            {
                throw new InvalidOperationException($"Cannot connect to tenant database for tenant {tenantId}");
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
}