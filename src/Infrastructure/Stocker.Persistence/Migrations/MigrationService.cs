using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;
using Stocker.Persistence.SeedData;
using Stocker.Persistence.Services;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Settings;
using Stocker.SharedKernel.Exceptions;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Persistence.Migrations;

public class MigrationService : IMigrationService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MigrationService> _logger;

    public MigrationService(IServiceProvider serviceProvider, ILogger<MigrationService> logger)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task CreateHangfireDatabaseAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var configuration = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
        
        var hangfireConnectionString = configuration.GetConnectionString("HangfireConnection");
        
        if (string.IsNullOrEmpty(hangfireConnectionString))
        {
            _logger.LogWarning("Hangfire connection string not found. Skipping Hangfire database creation.");
            return;
        }

        try
        {
            _logger.LogInformation("Checking Hangfire database...");
            
            // Parse connection string to get database name and server
            var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(hangfireConnectionString);
            var databaseName = builder.InitialCatalog;
            
            // Create connection string to master database
            builder.InitialCatalog = "master";
            var masterConnectionString = builder.ConnectionString;
            
            using var connection = new Microsoft.Data.SqlClient.SqlConnection(masterConnectionString);
            await connection.OpenAsync();
            
            // Check if database exists
            var checkDbCommand = connection.CreateCommand();
            checkDbCommand.CommandText = $"SELECT database_id FROM sys.databases WHERE Name = '{databaseName}'";
            var dbExists = await checkDbCommand.ExecuteScalarAsync();
            
            if (dbExists == null)
            {
                _logger.LogInformation("Creating Hangfire database: {DatabaseName}...", databaseName);
                
                var createDbCommand = connection.CreateCommand();
                createDbCommand.CommandText = $"CREATE DATABASE [{databaseName}]";
                await createDbCommand.ExecuteNonQueryAsync();

                _logger.LogInformation("Hangfire database created successfully: {DatabaseName}", databaseName);

                // Wait for database to be fully ready
                await Task.Delay(2000); // 2 second delay for SQL Server to complete database creation
            }
            else
            {
                _logger.LogInformation("Hangfire database already exists: {DatabaseName}", databaseName);
            }

            // Close master connection before connecting to Hangfire database
            await connection.CloseAsync();

            // Now connect to the Hangfire database and create schema if needed
            _logger.LogInformation("Initializing Hangfire schema...");
            using var hangfireConnection = new Microsoft.Data.SqlClient.SqlConnection(hangfireConnectionString);
            await hangfireConnection.OpenAsync();
            
            // Check if Hangfire schema exists
            var checkSchemaCommand = hangfireConnection.CreateCommand();
            checkSchemaCommand.CommandText = "SELECT schema_id FROM sys.schemas WHERE name = 'Hangfire'";
            var schemaExists = await checkSchemaCommand.ExecuteScalarAsync();
            
            if (schemaExists == null)
            {
                _logger.LogInformation("Creating Hangfire schema...");
                var createSchemaCommand = hangfireConnection.CreateCommand();
                createSchemaCommand.CommandText = "CREATE SCHEMA [Hangfire]";
                await createSchemaCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Hangfire schema created successfully");
            }
            else
            {
                _logger.LogInformation("Hangfire schema already exists");
            }
        }
        catch (Microsoft.Data.SqlClient.SqlException ex)
        {
            _logger.LogError(ex, "SQL error while creating Hangfire database.");
            throw new DatabaseException("Migration.HangfireFailed", "Failed to create Hangfire database", ex);
        }
        catch (DatabaseException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while creating Hangfire database.");
            throw new ApplicationException("Unexpected error during Hangfire database creation", ex);
        }
    }

    public async Task MigrateMasterDatabaseAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

        try
        {
            _logger.LogInformation("Starting master database migration...");
            
            // MigrateAsync will create database if it doesn't exist
            _logger.LogInformation("Applying migrations and creating database if needed...");
            await context.Database.MigrateAsync();
            
            _logger.LogInformation("Master database migration completed successfully.");
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database update error while migrating the master database.");
            throw new DatabaseException("Migration.MasterFailed", "Failed to migrate master database", ex);
        }
        catch (DatabaseException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while migrating the master database.");
            throw new ApplicationException("Unexpected error during master database migration", ex);
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
            
            // Create the database context
            using var context = await tenantDbContextFactory.CreateDbContextAsync(tenantId);
            
            // Cast to TenantDbContext to access Database property
            var tenantDbContext = (TenantDbContext)context;
            
            // MigrateAsync will create the database if it doesn't exist and apply all migrations
            _logger.LogInformation("Creating database and applying migrations for tenant {TenantId}...", tenantId);
            await tenantDbContext.Database.MigrateAsync();
            
            _logger.LogInformation("Tenant database migration completed successfully for tenant {TenantId}.", tenantId);

            // Apply CRM module migrations if tenant has CRM module access
            try
            {
                _logger.LogInformation("Checking CRM module access for tenant {TenantId}...", tenantId);
                
                // Get tenant module service to check if tenant has CRM access
                var tenantModuleService = scope.ServiceProvider.GetService<ITenantModuleService>();
                
                if (tenantModuleService != null)
                {
                    var hasCrmAccess = await tenantModuleService.HasModuleAccessAsync(tenantId, "CRM", CancellationToken.None);
                    
                    if (hasCrmAccess)
                    {
                        _logger.LogInformation("Tenant {TenantId} has CRM module access. Applying CRM migrations...", tenantId);
                        
                        // Get tenant connection string
                        var connectionString = tenantDbContext.Database.GetConnectionString();
                        
                        // Create CRMDbContext manually with tenant connection string
                        // Cannot use scoped ITenantService here as tenant context is not set during migration
                        var crmOptionsBuilder = new DbContextOptionsBuilder<Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext>();
                        crmOptionsBuilder.UseSqlServer(connectionString, sqlOptions =>
                        {
                            sqlOptions.MigrationsAssembly(typeof(Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext).Assembly.FullName);
                            sqlOptions.CommandTimeout(30);
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 5,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorNumbersToAdd: null);
                        });
                        
                        // Create a simple ITenantService implementation for CRMDbContext constructor
                        var mockTenantService = new Stocker.Persistence.Migrations.MockTenantService(tenantId, connectionString);
                        
                        using var crmDbContext = new Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext(
                            crmOptionsBuilder.Options, 
                            mockTenantService);
                        
                        await crmDbContext.Database.MigrateAsync();
                        _logger.LogInformation("CRM module migrations completed successfully for tenant {TenantId}.", tenantId);
                    }
                    else
                    {
                        _logger.LogInformation("Tenant {TenantId} does not have CRM module access. CRM migrations skipped.", tenantId);
                    }
                }
                else
                {
                    _logger.LogWarning("TenantModuleService not available. CRM module check skipped for tenant {TenantId}.", tenantId);
                }
            }
            catch (Exception crmEx)
            {
                _logger.LogError(crmEx, "Error applying CRM migrations for tenant {TenantId}. CRM module may not be fully functional.", tenantId);
                // Don't fail the overall migration if CRM migrations fail
            }
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database update error while migrating the tenant database for tenant {TenantId}.", tenantId);
            throw new DatabaseException("Migration.TenantFailed", $"Failed to migrate tenant database for tenant {tenantId}", ex);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Invalid operation while migrating tenant {TenantId}.", tenantId);
            throw new InvalidOperationException(ex.Message, ex);
        }
        catch (DatabaseException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while migrating the tenant database for tenant {TenantId}.", tenantId);
            throw new ApplicationException($"Unexpected error during tenant database migration for tenant {tenantId}", ex);
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
            catch (DatabaseException ex)
            {
                _logger.LogError(ex, "Database error migrating tenant {TenantId}. Continuing with next tenant...", tenantId);
                // Continue with other tenants even if one fails
            }
        catch (System.Exception ex)
            {
                _logger.LogError(ex, "Unexpected error migrating tenant {TenantId}. Continuing with next tenant...", tenantId);
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
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while seeding master data.");
            throw new DatabaseException("Seed.MasterFailed", "Failed to seed master data", ex);
        }
        catch (DatabaseException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while seeding master data.");
            throw new ApplicationException("Unexpected error during master data seeding", ex);
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

        // Get registration data to find admin email
        var registration = await masterDbContext.TenantRegistrations
            .FirstOrDefaultAsync(r => r.TenantId == tenantId);

        // Find MasterUser for this tenant's admin
        Guid? masterUserId = null;
        string? adminEmail = null;
        string? adminFirstName = null;
        string? adminLastName = null;

        if (registration != null)
        {
            adminEmail = registration.AdminEmail?.Value;
            adminFirstName = registration.AdminFirstName;
            adminLastName = registration.AdminLastName;

            if (!string.IsNullOrEmpty(adminEmail))
            {
                var masterUser = await masterDbContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Email.Value == adminEmail);

                if (masterUser != null)
                {
                    masterUserId = masterUser.Id;
                    _logger.LogInformation("Found MasterUser {MasterUserId} for admin email: {Email}",
                        masterUserId, adminEmail);
                }
                else
                {
                    _logger.LogWarning("MasterUser not found for admin email: {Email} - TenantUser will not be created",
                        adminEmail);
                }
            }
        }

        try
        {
            _logger.LogInformation("Starting tenant data seeding for tenant {TenantId}...", tenantId);

            // Get package name for seed data
            var packageName = tenant.Subscriptions?.FirstOrDefault()?.Package?.Name ?? "Starter";

            // Create DbContext with the background tenant service
            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseSqlServer(tenant.ConnectionString.Value, sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);
            });

            using var context = new TenantDbContext(optionsBuilder.Options, backgroundTenantService);
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<TenantDataSeeder>>();
            var seeder = new TenantDataSeeder(
                context,
                logger,
                tenantId,
                packageName,
                masterUserId,
                adminEmail,
                adminFirstName,
                adminLastName);
            await seeder.SeedAsync();

            _logger.LogInformation("Tenant data seeding completed successfully for tenant {TenantId}.", tenantId);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while seeding tenant data for tenant {TenantId}.", tenantId);
            throw new DatabaseException("Seed.TenantFailed", $"Failed to seed tenant data for tenant {tenantId}", ex);
        }
        catch (DatabaseException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while seeding tenant data for tenant {TenantId}.", tenantId);
            throw new ApplicationException($"Unexpected error during tenant data seeding for tenant {tenantId}", ex);
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
        catch (DatabaseException ex)
        {
            _logger.LogError(ex, "Database error during startup migration.");
            // Don't throw - let the application start even if migration fails
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Failed to migrate databases on startup.");
            // Don't throw - let the application start even if migration fails
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

/// <summary>
/// Mock implementation of ITenantService for use during database migrations
/// where tenant context is not available from HTTP request.
/// </summary>
internal class MockTenantService : ITenantService
{
    private readonly Guid _tenantId;
    private readonly string _connectionString;

    public MockTenantService(Guid tenantId, string connectionString)
    {
        _tenantId = tenantId;
        _connectionString = connectionString;
    }

    public Guid? GetCurrentTenantId() => _tenantId;
    
    public string? GetCurrentTenantName() => null;
    
    public string? GetConnectionString() => _connectionString;
    
    public Task<bool> SetCurrentTenant(Guid tenantId) => Task.FromResult(true);
    
    public Task<bool> SetCurrentTenant(string tenantIdentifier) => Task.FromResult(true);
}