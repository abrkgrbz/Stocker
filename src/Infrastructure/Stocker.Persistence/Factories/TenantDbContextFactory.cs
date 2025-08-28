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
        _logger.LogWarning("CreateDbContext called with connection string: {ConnectionString}", 
            connectionString?.Replace("Password", "***HIDDEN***") ?? "NULL");
        
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
            _logger.LogInformation("TenantDbContextFactory.CreateDbContextAsync started for tenant {TenantId}", tenantId);
            
            _logger.LogInformation("Finding tenant {TenantId} in MasterDb", tenantId);
            _logger.LogInformation("MasterDb connection state: {State}", _masterDbContext.Database.GetConnectionString()?.Replace("Password", "***"));
            
            // Include gerekli değil, OwnsOne otomatik yükler
            var tenant = await _masterDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                _logger.LogError("Tenant with ID '{TenantId}' not found in MasterDb", tenantId);
                throw new InvalidOperationException($"Tenant with ID '{tenantId}' not found.");
            }
            
            _logger.LogWarning("Tenant {TenantId} found. Name: {TenantName}, Code: {TenantCode}", 
                tenantId, tenant.Name, tenant.Code);
            _logger.LogWarning("Tenant connection string: {ConnectionString}", 
                tenant.ConnectionString?.Value?.Replace("Password", "***HIDDEN***") ?? "NULL");

            if (tenant.ConnectionString == null || string.IsNullOrEmpty(tenant.ConnectionString.Value))
            {
                _logger.LogError("Tenant {TenantId} has no connection string configured", tenantId);
                throw new InvalidOperationException($"Tenant {tenantId} has no connection string configured");
            }

            // Set current tenant in the service
            _logger.LogInformation("Setting current tenant in TenantService for tenant {TenantId}", tenantId);
            var tenantService = _serviceProvider.GetRequiredService<ITenantService>();
            await tenantService.SetCurrentTenant(tenantId);

            _logger.LogInformation("Creating TenantDbContext with connection string for tenant {TenantId}", tenantId);
            var context = CreateDbContext(tenant.ConnectionString.Value);
            
            // Test connection
            _logger.LogInformation("Testing database connection for tenant {TenantId}", tenantId);
            _logger.LogInformation("Attempting to connect to database: {DatabaseName}", 
                context.Database.GetConnectionString()?.Split(';')
                    .FirstOrDefault(s => s.StartsWith("Database="))?.Replace("Database=", "") ?? "UNKNOWN");
            
            try
            {
                var canConnect = await context.Database.CanConnectAsync();
                _logger.LogInformation("Database connection test for tenant {TenantId}: {Result}", 
                    tenantId, canConnect ? "SUCCESS" : "FAILED");
                
                if (!canConnect)
                {
                    throw new InvalidOperationException($"Cannot connect to tenant database for tenant {tenantId}");
                }
            }
            catch (Exception connEx)
            {
                _logger.LogError(connEx, "Connection test failed for tenant {TenantId}. Error: {Error}", 
                    tenantId, connEx.Message);
                throw;
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