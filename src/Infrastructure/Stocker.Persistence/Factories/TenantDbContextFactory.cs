using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;
using Stocker.Domain.Master.Entities;
using System;
using System.Threading.Tasks;

namespace Stocker.Persistence.Factories;

public class TenantDbContextFactory : ITenantDbContextFactory
{
    private readonly IMasterDbContext _masterContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TenantDbContextFactory> _logger;

    public TenantDbContextFactory(
        IMasterDbContext masterContext,
        IConfiguration configuration,
        ILogger<TenantDbContextFactory> logger)
    {
        _masterContext = masterContext;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ITenantDbContext> CreateDbContextAsync(Guid tenantId)
    {
        var connectionString = await GetTenantConnectionStringAsync(tenantId);
        
        var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
        optionsBuilder.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
        
        if (_configuration.GetValue<bool>("Database:EnableSensitiveDataLogging"))
        {
            optionsBuilder.EnableSensitiveDataLogging();
        }
        
        if (_configuration.GetValue<bool>("Database:EnableDetailedErrors"))
        {
            optionsBuilder.EnableDetailedErrors();
        }

        var context = new TenantDbContext(optionsBuilder.Options, tenantId);

        try
        {
            // Ensure database exists and is migrated
            _logger.LogDebug("Ensuring database exists for tenant {TenantId}", tenantId);
            await context.Database.MigrateAsync();
            _logger.LogInformation("Tenant database ready for tenant {TenantId}", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to ensure database exists for tenant {TenantId}. Database may need manual migration.", tenantId);
            // Don't throw - let the application continue and fail on actual database operations
            // This allows for better error messages and retry logic
        }

        _logger.LogDebug("Created TenantDbContext for tenant {TenantId}", tenantId);

        return context;
    }

    public ITenantDbContext CreateDbContext(Guid tenantId)
    {
        return CreateDbContextAsync(tenantId).GetAwaiter().GetResult();
    }

    public async Task<string> GetTenantConnectionStringAsync(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
        {
            _logger.LogError("Cannot get connection string for empty tenant ID");
            throw new InvalidOperationException("Tenant ID cannot be empty");
        }

        var tenant = await _masterContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
        {
            _logger.LogError("Tenant {TenantId} not found in database", tenantId);
            throw new InvalidOperationException($"Tenant {tenantId} not found. Please ensure the tenant exists in the master database.");
        }

        if (tenant.ConnectionString == null || string.IsNullOrEmpty(tenant.ConnectionString.Value))
        {
            _logger.LogError("Tenant {TenantId} has no connection string configured", tenantId);
            throw new InvalidOperationException($"Tenant {tenantId} has no connection string configured.");
        }

        return tenant.ConnectionString.Value;
    }
}