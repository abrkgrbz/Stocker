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
        optionsBuilder.UseSqlServer(connectionString);
        
        if (_configuration.GetValue<bool>("Database:EnableSensitiveDataLogging"))
        {
            optionsBuilder.EnableSensitiveDataLogging();
        }
        
        if (_configuration.GetValue<bool>("Database:EnableDetailedErrors"))
        {
            optionsBuilder.EnableDetailedErrors();
        }

        var context = new TenantDbContext(optionsBuilder.Options, tenantId);
        
        _logger.LogDebug("Created TenantDbContext for tenant {TenantId}", tenantId);
        
        return context;
    }

    public ITenantDbContext CreateDbContext(Guid tenantId)
    {
        return CreateDbContextAsync(tenantId).GetAwaiter().GetResult();
    }

    public async Task<string> GetTenantConnectionStringAsync(Guid tenantId)
    {
        var tenant = await _masterContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
        {
            _logger.LogError("Tenant {TenantId} not found", tenantId);
            throw new InvalidOperationException($"Tenant {tenantId} not found");
        }

        return tenant.ConnectionString.Value;
    }
}