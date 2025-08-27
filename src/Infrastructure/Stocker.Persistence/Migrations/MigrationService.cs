using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;
using Stocker.Persistence.SeedData;
using Stocker.Persistence.Services;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Settings;

namespace Stocker.Persistence.Migrations;

public interface IMigrationService
{
    // - MigrateMasterDatabaseAsync(): Master veritaban�na migration uygular
    //  - MigrateTenantDatabaseAsync(Guid tenantId): Belirli bir tenant'�n veritaban�na migration uygular
    //  - MigrateAllTenantDatabasesAsync(): T�m aktif tenant'lar�n veritabanlar�na migration uygular

    Task MigrateMasterDatabaseAsync();
    Task MigrateTenantDatabaseAsync(Guid tenantId);
    Task MigrateAllTenantDatabasesAsync();
    Task SeedMasterDataAsync();
    Task SeedTenantDataAsync(Guid tenantId);
}

public class MigrationService : IMigrationService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MigrationService> _logger;

    public MigrationService(IServiceProvider serviceProvider, ILogger<MigrationService> logger)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task MigrateMasterDatabaseAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

        try
        {
            _logger.LogInformation("Starting master database migration...");
            await context.Database.MigrateAsync();
            _logger.LogInformation("Master database migration completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while migrating the master database.");
            throw;
        }
    }

    public async Task MigrateTenantDatabaseAsync(Guid tenantId)
    {
        using var scope = _serviceProvider.CreateScope();
        var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();
        var masterContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

        try
        {
            _logger.LogInformation("Starting tenant database migration for tenant {TenantId}...", tenantId);
            
            // Get tenant information
            var tenant = await masterContext.Tenants.FindAsync(tenantId);
            if (tenant == null)
            {
                throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
            }
            
            using var context = await tenantDbContextFactory.CreateDbContextAsync(tenantId);
            
            // MigrateAsync will create the database if it doesn't exist and apply all migrations
            _logger.LogInformation("Creating database and applying migrations for tenant {TenantId}...", tenantId);
            await context.Database.MigrateAsync();
            
            _logger.LogInformation("Tenant database migration completed successfully for tenant {TenantId}.", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while migrating the tenant database for tenant {TenantId}.", tenantId);
            throw;
        }
    }

    public async Task MigrateAllTenantDatabasesAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var masterContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

        var activeTenants = await masterContext.Tenants
            .Where(t => t.IsActive)
            .Select(t => t.Id)
            .ToListAsync();

        _logger.LogInformation("Found {Count} active tenants to migrate.", activeTenants.Count);

        foreach (var tenantId in activeTenants)
        {
            try
            {
                await MigrateTenantDatabaseAsync(tenantId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate tenant {TenantId}. Continuing with next tenant...", tenantId);
                // Continue with other tenants even if one fails
            }
        }
    }

    public async Task SeedMasterDataAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<MasterDataSeeder>>();
        var adminCredentials = scope.ServiceProvider.GetRequiredService<IOptions<AdminCredentials>>();
        var seeder = new MasterDataSeeder(context, logger, adminCredentials);

        try
        {
            _logger.LogInformation("Starting master data seeding...");
            await seeder.SeedAsync();
            _logger.LogInformation("Master data seeding completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding master data.");
            throw;
        }
    }

    public async Task SeedTenantDataAsync(Guid tenantId)
    {
        using var scope = _serviceProvider.CreateScope();
        
        // Create a background tenant service for this operation
        var backgroundTenantService = new BackgroundTenantService();
        backgroundTenantService.SetTenantInfo(tenantId);
        
        // Get the tenant and package info
        var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
        var tenant = await masterDbContext.Tenants
            .Include(t => t.Subscriptions)
                .ThenInclude(s => s.Package)
            .FirstOrDefaultAsync(t => t.Id == tenantId);
        
        if (tenant == null)
        {
            _logger.LogError("Tenant {TenantId} not found", tenantId);
            return;
        }

        try
        {
            _logger.LogInformation("Starting tenant data seeding for tenant {TenantId}...", tenantId);
            
            // Get package name for seed data
            var packageName = tenant.Subscriptions?.FirstOrDefault()?.Package?.Name ?? "Starter";
            
            // Create DbContext with the background tenant service
            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);
            
            using var context = new TenantDbContext(optionsBuilder.Options, backgroundTenantService);
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<TenantDataSeeder>>();
            var seeder = new TenantDataSeeder(context, logger, tenantId, packageName);
            await seeder.SeedAsync();
            
            _logger.LogInformation("Tenant data seeding completed successfully for tenant {TenantId}.", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding tenant data for tenant {TenantId}.", tenantId);
            throw;
        }
    }
}

// Hosted service for automatic migration on startup
public class DatabaseMigrationHostedService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseMigrationHostedService> _logger;

    public DatabaseMigrationHostedService(IServiceProvider serviceProvider, ILogger<DatabaseMigrationHostedService> logger)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var migrationService = scope.ServiceProvider.GetRequiredService<IMigrationService>();

        try
        {
            // Migrate master database
            await migrationService.MigrateMasterDatabaseAsync();
            
            // Seed master data if needed
            await migrationService.SeedMasterDataAsync();

            // Optionally migrate all tenant databases
            // This might be too heavy for startup in production
            // await migrationService.MigrateAllTenantDatabasesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to migrate databases on startup.");
            // Don't throw - let the application start even if migration fails
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}