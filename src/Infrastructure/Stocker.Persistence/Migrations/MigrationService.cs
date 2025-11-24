using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
using Stocker.SharedKernel.Exceptions;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Extensions;
using Npgsql;

namespace Stocker.Persistence.Migrations;

// Migration service implementation
public partial class MigrationService : IMigrationService
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

            // Parse connection string to get database name
            var builder = new NpgsqlConnectionStringBuilder(hangfireConnectionString);
            var databaseName = builder.Database;

            // Create connection string to postgres maintenance database
            builder.Database = "postgres";
            var postgresConnectionString = builder.ConnectionString;

            using var connection = new NpgsqlConnection(postgresConnectionString);
            await connection.OpenAsync();

            // Check if database exists
            var checkDbCommand = connection.CreateCommand();
            checkDbCommand.CommandText = $"SELECT 1 FROM pg_database WHERE datname = '{databaseName}'";
            var dbExists = await checkDbCommand.ExecuteScalarAsync();

            if (dbExists == null)
            {
                _logger.LogInformation("Creating Hangfire database: {DatabaseName}...", databaseName);

                var createDbCommand = connection.CreateCommand();
                createDbCommand.CommandText = $"CREATE DATABASE \"{databaseName}\"";
                await createDbCommand.ExecuteNonQueryAsync();

                _logger.LogInformation("Hangfire database created successfully: {DatabaseName}", databaseName);

                // Brief delay for database initialization
                await Task.Delay(1000);
            }
            else
            {
                _logger.LogInformation("Hangfire database already exists: {DatabaseName}", databaseName);
            }

            await connection.CloseAsync();

            // Connect to Hangfire database and create schema if needed
            _logger.LogInformation("Initializing Hangfire schema...");
            using var hangfireConnection = new NpgsqlConnection(hangfireConnectionString);
            await hangfireConnection.OpenAsync();

            // Check if Hangfire schema exists
            var checkSchemaCommand = hangfireConnection.CreateCommand();
            checkSchemaCommand.CommandText = "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'hangfire'";
            var schemaExists = await checkSchemaCommand.ExecuteScalarAsync();

            if (schemaExists == null)
            {
                _logger.LogInformation("Creating Hangfire schema...");
                var createSchemaCommand = hangfireConnection.CreateCommand();
                createSchemaCommand.CommandText = "CREATE SCHEMA hangfire";
                await createSchemaCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Hangfire schema created successfully");
            }
            else
            {
                _logger.LogInformation("Hangfire schema already exists");
            }
        }
        catch (NpgsqlException ex)
        {
            _logger.LogError(ex, "PostgreSQL error while creating Hangfire database.");
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

            // Check if database exists, if not create it (required for PostgreSQL)
            var connectionString = tenantDbContext.Database.GetConnectionString();
            var builder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);
            var databaseName = builder.Database;

            // Connect to postgres database to create tenant database
            builder.Database = "postgres";
            var masterConnectionString = builder.ConnectionString;

            using (var masterConnection = new Npgsql.NpgsqlConnection(masterConnectionString))
            {
                await masterConnection.OpenAsync();

                // Check if database exists
                var checkDbCommand = masterConnection.CreateCommand();
                checkDbCommand.CommandText = $"SELECT 1 FROM pg_database WHERE datname = '{databaseName}'";
                var dbExists = await checkDbCommand.ExecuteScalarAsync();

                if (dbExists == null)
                {
                    _logger.LogInformation("Creating database {DatabaseName} for tenant {TenantId}...", databaseName, tenantId);

                    // Create database
                    var createDbCommand = masterConnection.CreateCommand();
                    createDbCommand.CommandText = $"CREATE DATABASE \"{databaseName}\"";
                    await createDbCommand.ExecuteNonQueryAsync();

                    _logger.LogInformation("Database {DatabaseName} created successfully.", databaseName);
                }
                else
                {
                    _logger.LogInformation("Database {DatabaseName} already exists.", databaseName);
                }
            }

            // Now apply migrations
            _logger.LogInformation("Applying migrations for tenant {TenantId}...", tenantId);
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
                        var crmConnectionString = tenantDbContext.Database.GetConnectionString();

                        // Create CRMDbContext manually with tenant connection string
                        // Cannot use scoped ITenantService here as tenant context is not set during migration
                        var crmOptionsBuilder = new DbContextOptionsBuilder<Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext>();
                        crmOptionsBuilder.UseNpgsql(crmConnectionString, sqlOptions =>
                        {
                            sqlOptions.MigrationsAssembly(typeof(Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext).Assembly.FullName);
                            sqlOptions.CommandTimeout(30);
                            sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                        });
                        
                        // Create a simple ITenantService implementation for CRMDbContext constructor
                        var mockTenantService = new Stocker.Persistence.Migrations.MockTenantService(tenantId, crmConnectionString);
                        
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
        var environment = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Hosting.IHostEnvironment>();
        var seeder = new MasterDataSeeder(context, logger, adminCredentials, environment);

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
            optionsBuilder.UseNpgsql(tenant.ConnectionString.Value, sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
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

// Extension of MigrationService class - real implementations
public partial class MigrationService
{
    public async Task<List<TenantMigrationStatusDto>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<Stocker.SharedKernel.Repositories.IMasterUnitOfWork>();
        var tenantModuleService = scope.ServiceProvider.GetRequiredService<ITenantModuleService>();

        var tenants = await masterUnitOfWork.Tenants()
            .AsQueryable()
            .AsNoTracking()
            .Where(t => t.IsActive)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Code,
                ConnectionString = t.ConnectionString.Value
            })
            .ToListAsync(cancellationToken);

        var results = new List<TenantMigrationStatusDto>();

        foreach (var tenant in tenants)
        {
            try
            {
                var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
                optionsBuilder.UseNpgsql(tenant.ConnectionString);

                using var tenantContext = new TenantDbContext(optionsBuilder.Options, tenant.Id);

                var pendingMigrations = await tenantContext.Database.GetPendingMigrationsAsync(cancellationToken);
                var appliedMigrations = await tenantContext.Database.GetAppliedMigrationsAsync(cancellationToken);

                var pendingList = pendingMigrations.ToList();
                var appliedList = appliedMigrations.ToList();

                // Check CRM module migrations if tenant has CRM access
                List<string> crmPendingMigrations = new();
                List<string> crmAppliedMigrations = new();

                try
                {
                    var hasCrmAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "CRM", cancellationToken);

                    if (hasCrmAccess)
                    {
                        var crmOptionsBuilder = new DbContextOptionsBuilder<Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext>();
                        crmOptionsBuilder.UseNpgsql(tenant.ConnectionString);
                        crmOptionsBuilder.ConfigureWarnings(warnings =>
                            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                        var mockTenantService = new MockTenantService(tenant.Id, tenant.ConnectionString);

                        using var crmDbContext = new Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext(
                            crmOptionsBuilder.Options,
                            mockTenantService);

                        var crmPending = await crmDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                        var crmApplied = await crmDbContext.Database.GetAppliedMigrationsAsync(cancellationToken);

                        crmPendingMigrations = crmPending.ToList();
                        crmAppliedMigrations = crmApplied.ToList();
                    }
                }
                catch (Exception crmEx)
                {
                    _logger.LogWarning(crmEx, "Failed to check CRM migrations for tenant {TenantId}", tenant.Id);
                }

                var allPendingMigrations = new List<MigrationModuleDto>();
                if (pendingList.Any())
                {
                    allPendingMigrations.Add(new MigrationModuleDto
                    {
                        Module = "Core",
                        Migrations = pendingList
                    });
                }
                if (crmPendingMigrations.Any())
                {
                    allPendingMigrations.Add(new MigrationModuleDto
                    {
                        Module = "CRM",
                        Migrations = crmPendingMigrations
                    });
                }

                var allAppliedMigrations = new List<MigrationModuleDto>();
                if (appliedList.Any())
                {
                    allAppliedMigrations.Add(new MigrationModuleDto
                    {
                        Module = "Core",
                        Migrations = appliedList
                    });
                }
                if (crmAppliedMigrations.Any())
                {
                    allAppliedMigrations.Add(new MigrationModuleDto
                    {
                        Module = "CRM",
                        Migrations = crmAppliedMigrations
                    });
                }

                results.Add(new TenantMigrationStatusDto
                {
                    TenantId = tenant.Id,
                    TenantName = tenant.Name,
                    TenantCode = tenant.Code,
                    PendingMigrations = allPendingMigrations,
                    AppliedMigrations = allAppliedMigrations,
                    HasPendingMigrations = pendingList.Any() || crmPendingMigrations.Any()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking migrations for tenant {TenantId}", tenant.Id);
                results.Add(new TenantMigrationStatusDto
                {
                    TenantId = tenant.Id,
                    TenantName = tenant.Name,
                    TenantCode = tenant.Code,
                    Error = $"Error: {ex.Message}",
                    HasPendingMigrations = false
                });
            }
        }

        return results;
    }

    public async Task<ApplyMigrationResultDto> ApplyMigrationToTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<Stocker.SharedKernel.Repositories.IMasterUnitOfWork>();
        var tenantModuleService = scope.ServiceProvider.GetRequiredService<ITenantModuleService>();

        var tenant = await masterUnitOfWork.Tenants()
            .AsQueryable()
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive, cancellationToken);

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
        }

        _logger.LogInformation("Applying migrations to tenant {TenantId} - {TenantName}", tenant.Id, tenant.Name);

        var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
        optionsBuilder.UseNpgsql(tenant.ConnectionString.Value);
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

        using var tenantContext = new TenantDbContext(optionsBuilder.Options, tenant.Id);

        // Check CORE/Tenant migrations
        var pendingMigrations = await tenantContext.Database.GetPendingMigrationsAsync(cancellationToken);
        var pendingList = pendingMigrations.ToList();
        var allAppliedMigrations = new List<string>();

        _logger.LogWarning("DEBUG ApplyMigration: Core pending migrations count: {Count}, Migrations: {Migrations}",
            pendingList.Count, string.Join(", ", pendingList));

        // Apply Core/Tenant migrations if any
        if (pendingList.Any())
        {
            _logger.LogInformation("Applying {Count} Core migrations to tenant {TenantId}", pendingList.Count, tenant.Id);
            await tenantContext.Database.MigrateAsync(cancellationToken);
            allAppliedMigrations.AddRange(pendingList);
            _logger.LogInformation("Core migrations applied successfully. Applied: {Migrations}", string.Join(", ", pendingList));
        }
        else
        {
            _logger.LogInformation("No Core migrations to apply for tenant {TenantId}", tenant.Id);
        }

        // Check CRM module migrations if tenant has CRM access
        List<string> crmPendingMigrations = new();
        try
        {
            var hasCrmAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "CRM", cancellationToken);
            _logger.LogWarning("DEBUG ApplyMigration: Tenant {TenantId} has CRM access: {HasCrmAccess}", tenant.Id, hasCrmAccess);

            if (hasCrmAccess)
            {
                _logger.LogInformation("Tenant {TenantId} has CRM module access. Checking CRM migrations...", tenant.Id);

                var crmOptionsBuilder = new DbContextOptionsBuilder<Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext>();
                crmOptionsBuilder.UseNpgsql(tenant.ConnectionString.Value, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext).Assembly.FullName);
                    sqlOptions.CommandTimeout(30);
                    sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                });
                crmOptionsBuilder.ConfigureWarnings(warnings =>
                    warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                var mockTenantService = new MockTenantService(tenant.Id, tenant.ConnectionString.Value);

                using var crmDbContext = new Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext(
                    crmOptionsBuilder.Options,
                    mockTenantService);

                var crmPending = await crmDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                crmPendingMigrations = crmPending.ToList();

                _logger.LogWarning("DEBUG ApplyMigration: CRM pending migrations count: {Count}, Migrations: {Migrations}",
                    crmPendingMigrations.Count, string.Join(", ", crmPendingMigrations));

                if (crmPendingMigrations.Any())
                {
                    _logger.LogInformation("Applying {Count} CRM migrations to tenant {TenantId}", crmPendingMigrations.Count, tenant.Id);
                    await crmDbContext.Database.MigrateAsync(cancellationToken);
                    allAppliedMigrations.AddRange(crmPendingMigrations.Select(m => $"CRM:{m}"));
                    _logger.LogInformation("CRM migrations applied successfully. Applied: {Migrations}", string.Join(", ", crmPendingMigrations));
                }
                else
                {
                    _logger.LogInformation("No CRM migrations to apply for tenant {TenantId}", tenant.Id);
                }
            }
            else
            {
                _logger.LogInformation("Tenant {TenantId} does not have CRM module access. CRM migrations skipped.", tenant.Id);
            }
        }
        catch (Exception crmEx)
        {
            _logger.LogError(crmEx, "Error applying CRM migrations for tenant {TenantId}. Continuing...", tenant.Id);
            // Don't fail the overall migration if CRM migrations fail
        }

        // Return result
        if (!allAppliedMigrations.Any())
        {
            return new ApplyMigrationResultDto
            {
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                Success = true,
                Message = "Uygulanacak migration yok",
                AppliedMigrations = new List<string>()
            };
        }

        _logger.LogInformation("All migrations applied successfully to tenant {TenantId}. Total applied: {Count}",
            tenant.Id, allAppliedMigrations.Count);

        return new ApplyMigrationResultDto
        {
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            Success = true,
            Message = $"{allAppliedMigrations.Count} migration başarıyla uygulandı",
            AppliedMigrations = allAppliedMigrations
        };
    }

    public async Task<List<ApplyMigrationResultDto>> ApplyMigrationsToAllTenantsAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<Stocker.SharedKernel.Repositories.IMasterUnitOfWork>();

        var tenants = await masterUnitOfWork.Tenants()
            .AsQueryable()
            .Where(t => t.IsActive)
            .ToListAsync(cancellationToken);

        var results = new List<ApplyMigrationResultDto>();

        foreach (var tenant in tenants)
        {
            try
            {
                _logger.LogInformation("Applying migrations to tenant {TenantId} - {TenantName}", tenant.Id, tenant.Name);

                var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
                optionsBuilder.UseNpgsql(tenant.ConnectionString.Value);

                using var tenantContext = new TenantDbContext(optionsBuilder.Options, tenant.Id);

                var pendingMigrations = await tenantContext.Database.GetPendingMigrationsAsync(cancellationToken);
                var pendingList = pendingMigrations.ToList();

                if (pendingList.Any())
                {
                    await tenantContext.Database.MigrateAsync(cancellationToken);

                    results.Add(new ApplyMigrationResultDto
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        Success = true,
                        Message = $"{pendingList.Count} migration uygulandı",
                        AppliedMigrations = pendingList
                    });
                }
                else
                {
                    results.Add(new ApplyMigrationResultDto
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        Success = true,
                        Message = "Migration yok",
                        AppliedMigrations = new List<string>()
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying migrations to tenant {TenantId}", tenant.Id);

                results.Add(new ApplyMigrationResultDto
                {
                    TenantId = tenant.Id,
                    TenantName = tenant.Name,
                    Success = false,
                    Message = $"Error: {ex.Message}",
                    Error = ex.InnerException?.Message
                });
            }
        }

        return results;
    }

    public async Task<MigrationHistoryDto> GetMigrationHistoryAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<Stocker.SharedKernel.Repositories.IMasterUnitOfWork>();

            var tenant = await masterUnitOfWork.Tenants()
                .AsQueryable()
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive, cancellationToken);

            if (tenant == null)
            {
                throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
            }

            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseNpgsql(tenant.ConnectionString.Value);
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

            using var tenantContext = new TenantDbContext(optionsBuilder.Options, tenant.Id);

            // Test database connection
            var canConnect = await tenantContext.Database.CanConnectAsync(cancellationToken);
            if (!canConnect)
            {
                _logger.LogWarning("Cannot connect to tenant database for tenant {TenantId}", tenantId);
                return new MigrationHistoryDto
                {
                    TenantId = tenant.Id,
                    TenantName = tenant.Name,
                    TenantCode = tenant.Code,
                    AppliedMigrations = new List<string>(),
                    TotalMigrations = 0
                };
            }

            var appliedMigrations = await tenantContext.Database.GetAppliedMigrationsAsync(cancellationToken);
            var appliedList = appliedMigrations.ToList();

            return new MigrationHistoryDto
            {
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                TenantCode = tenant.Code,
                AppliedMigrations = appliedList,
                TotalMigrations = appliedList.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting migration history for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<MigrationScriptPreviewDto> GetMigrationScriptPreviewAsync(
        Guid tenantId,
        string migrationName,
        string moduleName,
        CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<Stocker.SharedKernel.Repositories.IMasterUnitOfWork>();

        var tenant = await masterUnitOfWork.Tenants()
            .AsQueryable()
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive, cancellationToken);

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
        }

        try
        {
            _logger.LogInformation("Generating migration script preview for tenant {TenantId}, migration {MigrationName}", tenantId, migrationName);

            // Get the appropriate DbContext based on module
            DbContext? dbContext = null;
            var affectedTables = new List<string>();
            string sqlScript = string.Empty;

            switch (moduleName?.ToUpperInvariant())
            {
                case "TENANT":
                case "CRM":
                    var tenantDbContext = scope.ServiceProvider.GetRequiredService<TenantDbContext>();
                    dbContext = tenantDbContext;
                    break;
                case "MASTER":
                    dbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
                    break;
                default:
                    _logger.LogWarning("Unknown module: {ModuleName}, using Tenant context", moduleName);
                    var defaultTenantContext = scope.ServiceProvider.GetRequiredService<TenantDbContext>();
                    dbContext = defaultTenantContext;
                    break;
            }

            if (dbContext != null)
            {
                // Generate script for pending migrations
                var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync(cancellationToken);

                if (pendingMigrations.Any())
                {
                    // Generate SQL script preview (simplified - just list pending migrations)
                    sqlScript = $"-- Pending Migrations:\n-- {string.Join("\n-- ", pendingMigrations)}\n\n-- Note: Run 'dotnet ef database update' to apply these migrations";

                    // Estimated affected tables based on pending migrations count
                    affectedTables = pendingMigrations.Select(m => m.Split('_')[0]).Distinct().ToList();

                    _logger.LogInformation("Found {Count} pending migrations", pendingMigrations.Count());
                }
                else
                {
                    sqlScript = "-- No pending migrations found";
                    _logger.LogInformation("No pending migrations found for {ModuleName}", moduleName);
                }
            }

            return new MigrationScriptPreviewDto
            {
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                MigrationName = migrationName,
                ModuleName = moduleName,
                SqlScript = sqlScript,
                Description = $"Migration preview for {moduleName} module",
                CreatedAt = DateTime.UtcNow,
                AffectedTables = affectedTables,
                EstimatedDuration = affectedTables.Count * 2 // Rough estimate: 2 seconds per table
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate migration script preview for tenant {TenantId}", tenantId);
            return new MigrationScriptPreviewDto
            {
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                MigrationName = migrationName,
                ModuleName = moduleName,
                SqlScript = $"-- Error generating script: {ex.Message}",
                Description = $"Migration preview failed: {ex.Message}",
                CreatedAt = DateTime.UtcNow,
                AffectedTables = new List<string>(),
                EstimatedDuration = 0
            };
        }
    }

    public async Task<RollbackMigrationResultDto> RollbackMigrationAsync(
        Guid tenantId,
        string migrationName,
        string moduleName,
        CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<Stocker.SharedKernel.Repositories.IMasterUnitOfWork>();

        var tenant = await masterUnitOfWork.Tenants()
            .AsQueryable()
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive, cancellationToken);

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
        }

        try
        {
            _logger.LogInformation("Attempting to rollback migration {MigrationName} for tenant {TenantId}", migrationName, tenantId);

            // Get the appropriate DbContext based on module
            DbContext? dbContext = null;

            switch (moduleName?.ToUpperInvariant())
            {
                case "TENANT":
                case "CRM":
                    var tenantDbContext = scope.ServiceProvider.GetRequiredService<TenantDbContext>();
                    dbContext = tenantDbContext;
                    break;
                case "MASTER":
                    dbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
                    break;
                default:
                    _logger.LogWarning("Unknown module: {ModuleName}, cannot rollback", moduleName);
                    return new RollbackMigrationResultDto
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        MigrationName = migrationName,
                        ModuleName = moduleName,
                        Success = false,
                        Message = $"Unknown module: {moduleName}",
                        Error = "Invalid module name",
                        RolledBackAt = DateTime.UtcNow
                    };
            }

            if (dbContext != null)
            {
                // Get applied migrations
                var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync(cancellationToken);
                var appliedList = appliedMigrations.ToList();

                // Find the target migration
                var targetIndex = appliedList.FindIndex(m => m.Contains(migrationName));

                if (targetIndex == -1)
                {
                    _logger.LogWarning("Migration {MigrationName} not found in applied migrations", migrationName);
                    return new RollbackMigrationResultDto
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        MigrationName = migrationName,
                        ModuleName = moduleName,
                        Success = false,
                        Message = $"Migration {migrationName} not found in applied migrations",
                        Error = "Migration not found",
                        RolledBackAt = DateTime.UtcNow
                    };
                }

                // Get the previous migration to rollback to
                string? targetMigration = targetIndex > 0 ? appliedList[targetIndex - 1] : null;

                // Note: Actual rollback using EF Core requires the Migrator service
                // For now, we document the limitation and return a message
                _logger.LogWarning("Migration rollback requires manual SQL execution or EF Core CLI tools");

                return new RollbackMigrationResultDto
                {
                    TenantId = tenant.Id,
                    TenantName = tenant.Name,
                    MigrationName = migrationName,
                    ModuleName = moduleName,
                    Success = false,
                    Message = $"To rollback, use: dotnet ef database update {targetMigration ?? "0"} --context {moduleName}DbContext",
                    Error = "Automatic rollback not supported. Use EF Core CLI tools for rollback.",
                    RolledBackAt = DateTime.UtcNow,
                    PreviousMigration = targetMigration
                };
            }

            return new RollbackMigrationResultDto
            {
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                MigrationName = migrationName,
                ModuleName = moduleName,
                Success = false,
                Message = "Unable to initialize DbContext for rollback",
                Error = "DbContext initialization failed",
                RolledBackAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rolling back migration {MigrationName} for tenant {TenantId}", migrationName, tenantId);

            return new RollbackMigrationResultDto
            {
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                MigrationName = migrationName,
                ModuleName = moduleName,
                Success = false,
                Message = "Rollback failed",
                Error = ex.Message,
                RolledBackAt = DateTime.UtcNow
            };
        }
    }

    public async Task<ScheduleMigrationResultDto> ScheduleMigrationAsync(
        Guid tenantId,
        DateTime scheduledTime,
        string? migrationName = null,
        string? moduleName = null,
        CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<Stocker.SharedKernel.Repositories.IMasterUnitOfWork>();

        var tenant = await masterUnitOfWork.Tenants()
            .AsQueryable()
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive, cancellationToken);

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
        }

        try
        {
            _logger.LogInformation("Scheduling migration for tenant {TenantId} at {ScheduledTime}", tenantId, scheduledTime);

            var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
            var backgroundJobService = scope.ServiceProvider.GetRequiredService<Stocker.Application.Common.Interfaces.IBackgroundJobService>();

            // Create scheduled migration entity
            var scheduledMigration = new Stocker.Domain.Entities.Migration.ScheduledMigration(
                tenantId: tenantId,
                scheduledTime: scheduledTime,
                createdBy: "System", // TODO: Get from current user context
                migrationName: migrationName,
                moduleName: moduleName
            );

            await masterDbContext.ScheduledMigrations.AddAsync(scheduledMigration, cancellationToken);
            await masterDbContext.SaveChangesAsync(cancellationToken);

            // Schedule Hangfire job - using IMigrationService interface
            var jobId = backgroundJobService.Schedule<IMigrationService>(
                x => x.ExecuteScheduledMigrationAsync(scheduledMigration.ScheduleId, CancellationToken.None),
                scheduledTime.ToUniversalTime()
            );

            // Update with Hangfire job ID
            scheduledMigration.SetHangfireJobId(jobId);
            await masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Migration scheduled successfully with job ID: {JobId}", jobId);

            return new ScheduleMigrationResultDto
            {
                ScheduleId = scheduledMigration.ScheduleId,
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                ScheduledTime = scheduledTime,
                MigrationName = migrationName,
                ModuleName = moduleName,
                Status = "Scheduled",
                Message = $"Migration scheduled for {scheduledTime:yyyy-MM-dd HH:mm}"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to schedule migration for tenant {TenantId}", tenantId);
            return new ScheduleMigrationResultDto
            {
                ScheduleId = Guid.Empty,
                TenantId = tenantId,
                TenantName = tenant.Name,
                ScheduledTime = scheduledTime,
                MigrationName = migrationName,
                ModuleName = moduleName,
                Status = "Failed",
                Message = $"Failed to schedule migration: {ex.Message}"
            };
        }
    }

    public async Task<List<ScheduledMigrationDto>> GetScheduledMigrationsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

            _logger.LogInformation("Getting scheduled migrations from database");

            // Check if ScheduledMigrations table exists
            var canConnect = await masterDbContext.Database.CanConnectAsync(cancellationToken);
            if (!canConnect)
            {
                _logger.LogWarning("Cannot connect to master database for scheduled migrations");
                return new List<ScheduledMigrationDto>();
            }

            var scheduledMigrations = await masterDbContext.ScheduledMigrations
                .Where(s => s.Status == "Pending" || s.Status == "Running")
                .OrderBy(s => s.ScheduledTime)
                .ToListAsync(cancellationToken);

            var result = new List<ScheduledMigrationDto>();

            foreach (var migration in scheduledMigrations)
            {
                // Get tenant details
                var tenant = await masterDbContext.Tenants
                    .FirstOrDefaultAsync(t => t.Id == migration.TenantId, cancellationToken);

                result.Add(new ScheduledMigrationDto
                {
                    ScheduleId = migration.ScheduleId,
                    TenantId = migration.TenantId,
                    TenantName = tenant?.Name ?? "Unknown",
                    TenantCode = tenant?.Code ?? "Unknown",
                    ScheduledTime = migration.ScheduledTime,
                    MigrationName = migration.MigrationName,
                    ModuleName = migration.ModuleName,
                    Status = migration.Status,
                    CreatedAt = migration.CreatedAt,
                    CreatedBy = migration.CreatedBy,
                    ExecutedAt = migration.ExecutedAt,
                    Error = migration.Error
                });
            }

            _logger.LogInformation("Found {Count} scheduled migrations", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            // Table might not exist yet (migration not applied)
            _logger.LogWarning(ex, "Failed to get scheduled migrations, table might not exist yet");
            return new List<ScheduledMigrationDto>();
        }
    }

    public async Task<bool> CancelScheduledMigrationAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
        var backgroundJobService = scope.ServiceProvider.GetRequiredService<Stocker.Application.Common.Interfaces.IBackgroundJobService>();

        _logger.LogInformation("Cancelling scheduled migration {ScheduleId}", scheduleId);

        var scheduledMigration = await masterDbContext.ScheduledMigrations
            .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId, cancellationToken);

        if (scheduledMigration == null)
        {
            _logger.LogWarning("Scheduled migration not found: {ScheduleId}", scheduleId);
            return false;
        }

        if (scheduledMigration.Status != "Pending")
        {
            _logger.LogWarning("Cannot cancel migration in status: {Status}", scheduledMigration.Status);
            return false;
        }

        try
        {
            // Cancel Hangfire job if exists
            if (!string.IsNullOrEmpty(scheduledMigration.HangfireJobId))
            {
                var deleted = backgroundJobService.Delete(scheduledMigration.HangfireJobId);
                if (!deleted)
                {
                    _logger.LogWarning("Failed to delete Hangfire job: {JobId}", scheduledMigration.HangfireJobId);
                }
            }

            // Update status
            scheduledMigration.MarkAsCancelled();
            await masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Scheduled migration cancelled successfully: {ScheduleId}", scheduleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cancel scheduled migration: {ScheduleId}", scheduleId);
            return false;
        }
    }

    /// <summary>
    /// Executes a scheduled migration. This method is called by Hangfire.
    /// </summary>
    public async Task ExecuteScheduledMigrationAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

        _logger.LogInformation("Executing scheduled migration {ScheduleId}", scheduleId);

        var scheduledMigration = await masterDbContext.ScheduledMigrations
            .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId, cancellationToken);

        if (scheduledMigration == null)
        {
            _logger.LogError("Scheduled migration not found: {ScheduleId}", scheduleId);
            return;
        }

        try
        {
            scheduledMigration.MarkAsRunning();
            await masterDbContext.SaveChangesAsync(cancellationToken);

            // Execute the migration
            if (string.IsNullOrEmpty(scheduledMigration.MigrationName))
            {
                // Apply all pending migrations for the tenant
                await ApplyMigrationToTenantAsync(scheduledMigration.TenantId, cancellationToken);
            }
            else
            {
                // Apply specific migration (not implemented yet, would require more complex logic)
                _logger.LogWarning("Specific migration execution not yet implemented: {MigrationName}", scheduledMigration.MigrationName);
                await ApplyMigrationToTenantAsync(scheduledMigration.TenantId, cancellationToken);
            }

            scheduledMigration.MarkAsCompleted();
            await masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Scheduled migration completed successfully: {ScheduleId}", scheduleId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Scheduled migration failed: {ScheduleId}", scheduleId);
            scheduledMigration.MarkAsFailed(ex.Message);
            await masterDbContext.SaveChangesAsync(cancellationToken);
            throw;
        }
    }

    public async Task<MigrationSettingsDto> GetMigrationSettingsAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

        _logger.LogInformation("Getting migration settings from database");

        // Try to get existing settings from database
        var settingsEntity = await masterDbContext.SystemSettings
            .FirstOrDefaultAsync(s => s.Category == "Migration" && s.Key == "MigrationSettings", cancellationToken);

        if (settingsEntity != null)
        {
            try
            {
                var settings = settingsEntity.GetValue<MigrationSettingsDto>();
                if (settings != null)
                {
                    _logger.LogInformation("Migration settings loaded from database");
                    return settings;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to deserialize migration settings, using defaults");
            }
        }

        // Return default settings if not found or failed to deserialize
        _logger.LogInformation("Using default migration settings");
        return new MigrationSettingsDto
        {
            AutoApplyMigrations = false,
            BackupBeforeMigration = true,
            MigrationTimeout = 300,
            EnableScheduledMigrations = false,
            DefaultScheduleTime = "02:00",
            NotifyOnMigrationComplete = true,
            NotifyOnMigrationFailure = true,
            NotificationEmails = new List<string>()
        };
    }

    public async Task<MigrationSettingsDto> UpdateMigrationSettingsAsync(
        MigrationSettingsDto settings,
        CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

        _logger.LogInformation("Updating migration settings in database");

        // Try to get existing settings
        var settingsEntity = await masterDbContext.SystemSettings
            .FirstOrDefaultAsync(s => s.Category == "Migration" && s.Key == "MigrationSettings", cancellationToken);

        if (settingsEntity != null)
        {
            // Update existing settings
            settingsEntity.SetValue(settings);
            _logger.LogInformation("Updated existing migration settings");
        }
        else
        {
            // Create new settings entity
            settingsEntity = new Stocker.Domain.Entities.Settings.SystemSettings(
                category: "Migration",
                key: "MigrationSettings",
                value: System.Text.Json.JsonSerializer.Serialize(settings),
                description: "Migration system configuration settings",
                isSystem: true,
                isEncrypted: false
            );
            settingsEntity.SetValue(settings);
            await masterDbContext.SystemSettings.AddAsync(settingsEntity, cancellationToken);
            _logger.LogInformation("Created new migration settings");
        }

        await masterDbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Migration settings saved successfully");

        return settings;
    }
}

/// <summary>
/// Mock implementation of ITenantService for use during database migrations
/// where tenant context is not available from HTTP request.
/// </summary>
public class MockTenantService : ITenantService
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