using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
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
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.Modules.HR.Infrastructure.Persistence;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.Modules.Manufacturing.Infrastructure.Data;
using Stocker.Modules.Finance.Infrastructure.Persistence;
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
            var connectionString = context.Database.GetConnectionString();
            _logger.LogInformation("Starting master database migration to: {Database}",
                connectionString?.Split(';').FirstOrDefault(s => s.StartsWith("Database=", StringComparison.OrdinalIgnoreCase)) ?? "unknown");

            // Check pending migrations
            var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
            _logger.LogInformation("Pending migrations: {Migrations}", string.Join(", ", pendingMigrations));

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
        // Retry configuration for transient failures (connection drops, admin commands, etc.)
        const int maxRetries = 3;
        const int initialDelayMs = 1000;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                await MigrateTenantDatabaseInternalAsync(tenantId);
                return; // Success - exit retry loop
            }
            catch (PostgresException ex) when (IsTransientPostgresError(ex) && attempt < maxRetries)
            {
                var delay = initialDelayMs * (int)Math.Pow(2, attempt - 1); // Exponential backoff
                _logger.LogWarning(ex, 
                    "Transient PostgreSQL error (SqlState: {SqlState}) during tenant {TenantId} migration. Attempt {Attempt}/{MaxRetries}. Retrying in {Delay}ms...", 
                    ex.SqlState, tenantId, attempt, maxRetries, delay);
                await Task.Delay(delay);
            }
            catch (NpgsqlException ex) when (IsTransientNpgsqlError(ex) && attempt < maxRetries)
            {
                var delay = initialDelayMs * (int)Math.Pow(2, attempt - 1);
                _logger.LogWarning(ex, 
                    "Transient Npgsql error during tenant {TenantId} migration. Attempt {Attempt}/{MaxRetries}. Retrying in {Delay}ms...", 
                    tenantId, attempt, maxRetries, delay);
                await Task.Delay(delay);
            }
        }
    }
    
    private static bool IsTransientPostgresError(PostgresException ex)
    {
        // PostgreSQL error codes that are transient and worth retrying
        return ex.SqlState switch
        {
            "57P01" => true, // admin_shutdown - terminating connection due to administrator command
            "57P02" => true, // crash_shutdown
            "57P03" => true, // cannot_connect_now
            "08000" => true, // connection_exception
            "08003" => true, // connection_does_not_exist
            "08006" => true, // connection_failure
            "08001" => true, // sqlclient_unable_to_establish_sqlconnection
            "08004" => true, // sqlserver_rejected_establishment_of_sqlconnection
            "40001" => true, // serialization_failure
            "40P01" => true, // deadlock_detected
            "55P03" => true, // lock_not_available
            "57014" => true, // query_canceled
            _ => false
        };
    }
    
    private static bool IsTransientNpgsqlError(NpgsqlException ex)
    {
        // Check for connection-related transient errors
        return ex.InnerException is System.Net.Sockets.SocketException ||
               ex.InnerException is System.IO.IOException ||
               ex.Message.Contains("connection") ||
               ex.Message.Contains("timeout", StringComparison.OrdinalIgnoreCase);
    }

    private async Task MigrateTenantDatabaseInternalAsync(Guid tenantId)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        try
        {
            _logger.LogInformation("Starting tenant database migration for tenant {TenantId}...", tenantId);

            // Get tenant information
            var tenant = await masterContext.Tenants.FindAsync(tenantId);
            if (tenant == null)
            {
                throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
            }

            // Get connection string from tenant entity (not from factory to avoid connecting to non-existent DB)
            var connectionString = tenant.ConnectionString?.Value;
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException($"Tenant {tenantId} has no connection string configured");
            }

            var builder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);
            var databaseName = builder.Database;

            _logger.LogInformation("🗄️ Checking/Creating database {DatabaseName} for tenant {TenantId}...", databaseName, tenantId);

            // Connect to postgres database to create tenant database FIRST
            builder.Database = "postgres";
            var postgresConnectionString = builder.ConnectionString;

            using (var postgresConnection = new Npgsql.NpgsqlConnection(postgresConnectionString))
            {
                await postgresConnection.OpenAsync();

                // Check if database exists
                var checkDbCommand = postgresConnection.CreateCommand();
                checkDbCommand.CommandText = $"SELECT 1 FROM pg_database WHERE datname = '{databaseName}'";
                var dbExists = await checkDbCommand.ExecuteScalarAsync();

                if (dbExists == null)
                {
                    _logger.LogInformation("📦 Creating database {DatabaseName} for tenant {TenantId}...", databaseName, tenantId);

                    // Create database
                    var createDbCommand = postgresConnection.CreateCommand();
                    createDbCommand.CommandText = $"CREATE DATABASE \"{databaseName}\"";
                    await createDbCommand.ExecuteNonQueryAsync();

                    _logger.LogInformation("✅ Database {DatabaseName} created successfully.", databaseName);

                    // Brief delay for database initialization
                    await Task.Delay(500);
                }
                else
                {
                    _logger.LogInformation("📋 Database {DatabaseName} already exists.", databaseName);
                }
            }

            // NOW create the TenantDbContext and apply migrations (database exists now)
            _logger.LogInformation("📥 Applying migrations for tenant {TenantId}...", tenantId);

            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: new[] { "57P01", "57P02", "57P03" }); // Add admin shutdown codes
            });

            // Suppress PendingModelChangesWarning for navigation configuration changes
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

            using var tenantDbContext = new TenantDbContext(optionsBuilder.Options, tenantId);
            await tenantDbContext.Database.MigrateAsync();
            
            _logger.LogInformation("Tenant database migration completed successfully for tenant {TenantId}.", tenantId);

            // NOTE: Module migrations (CRM, Inventory, HR, etc.) are NOT applied here during registration.
            // Module migrations are only applied after the user completes the Setup Wizard.
            // This ensures modules are only activated when the user explicitly selects them.
            // Module migrations are handled by ApplyModuleMigrationsAsync() which is called from
            // TenantProvisioningJob.ProvisionModulesAsync() after Setup Wizard completion.
            _logger.LogInformation("Base tenant migrations completed for tenant {TenantId}. Module migrations will be applied after Setup Wizard completion.", tenantId);
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
    public async Task<MasterMigrationStatusDto> GetMasterPendingMigrationsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

            var pendingMigrations = await masterDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
            var appliedMigrations = await masterDbContext.Database.GetAppliedMigrationsAsync(cancellationToken);

            return new MasterMigrationStatusDto
            {
                PendingMigrations = pendingMigrations.ToList(),
                AppliedMigrations = appliedMigrations.ToList(),
                HasPendingMigrations = pendingMigrations.Any(),
                CheckedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting master pending migrations");
            return new MasterMigrationStatusDto
            {
                Error = ex.Message,
                HasPendingMigrations = false,
                CheckedAt = DateTime.UtcNow
            };
        }
    }

    public async Task<ApplyMigrationResultDto> ApplyMasterMigrationAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var masterDbContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

            var pendingMigrations = await masterDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
            var pendingList = pendingMigrations.ToList();

            if (!pendingList.Any())
            {
                return new ApplyMigrationResultDto
                {
                    TenantId = Guid.Empty,
                    TenantName = "Master",
                    Success = true,
                    Message = "Uygulanacak migration yok",
                    AppliedMigrations = new List<string>()
                };
            }

            _logger.LogInformation("Applying {Count} Master migrations: {Migrations}",
                pendingList.Count, string.Join(", ", pendingList));

            await masterDbContext.Database.MigrateAsync(cancellationToken);

            _logger.LogInformation("Master migrations applied successfully");

            return new ApplyMigrationResultDto
            {
                TenantId = Guid.Empty,
                TenantName = "Master",
                Success = true,
                Message = $"{pendingList.Count} migration başarıyla uygulandı",
                AppliedMigrations = pendingList
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying master migrations");
            return new ApplyMigrationResultDto
            {
                TenantId = Guid.Empty,
                TenantName = "Master",
                Success = false,
                Message = "Migration uygulanamadı",
                Error = ex.Message
            };
        }
    }

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

                // Check Inventory module migrations if tenant has Inventory access
                List<string> inventoryPendingMigrations = new();
                List<string> inventoryAppliedMigrations = new();

                try
                {
                    var hasInventoryAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "Inventory", cancellationToken);

                    if (hasInventoryAccess)
                    {
                        var inventoryOptionsBuilder = new DbContextOptionsBuilder<InventoryDbContext>();
                        inventoryOptionsBuilder.UseNpgsql(tenant.ConnectionString);
                        inventoryOptionsBuilder.ConfigureWarnings(warnings =>
                            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                        var mockTenantService = new MockTenantService(tenant.Id, tenant.ConnectionString);

                        using var inventoryDbContext = new InventoryDbContext(
                            inventoryOptionsBuilder.Options,
                            mockTenantService);

                        var inventoryPending = await inventoryDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                        var inventoryApplied = await inventoryDbContext.Database.GetAppliedMigrationsAsync(cancellationToken);

                        inventoryPendingMigrations = inventoryPending.ToList();
                        inventoryAppliedMigrations = inventoryApplied.ToList();
                    }
                }
                catch (Exception inventoryEx)
                {
                    _logger.LogWarning(inventoryEx, "Failed to check Inventory migrations for tenant {TenantId}", tenant.Id);
                }

                // Check HR module migrations if tenant has HR access
                List<string> hrPendingMigrations = new();
                List<string> hrAppliedMigrations = new();

                try
                {
                    var hasHRAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "HR", cancellationToken);

                    if (hasHRAccess)
                    {
                        var hrOptionsBuilder = new DbContextOptionsBuilder<HRDbContext>();
                        hrOptionsBuilder.UseNpgsql(tenant.ConnectionString);
                        hrOptionsBuilder.ConfigureWarnings(warnings =>
                            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                        var mockTenantService = new MockTenantService(tenant.Id, tenant.ConnectionString);

                        using var hrDbContext = new HRDbContext(
                            hrOptionsBuilder.Options,
                            mockTenantService);

                        var hrPending = await hrDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                        var hrApplied = await hrDbContext.Database.GetAppliedMigrationsAsync(cancellationToken);

                        hrPendingMigrations = hrPending.ToList();
                        hrAppliedMigrations = hrApplied.ToList();
                    }
                }
                catch (Exception hrEx)
                {
                    _logger.LogWarning(hrEx, "Failed to check HR migrations for tenant {TenantId}", tenant.Id);
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
                if (inventoryPendingMigrations.Any())
                {
                    allPendingMigrations.Add(new MigrationModuleDto
                    {
                        Module = "Inventory",
                        Migrations = inventoryPendingMigrations
                    });
                }
                if (hrPendingMigrations.Any())
                {
                    allPendingMigrations.Add(new MigrationModuleDto
                    {
                        Module = "HR",
                        Migrations = hrPendingMigrations
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
                if (inventoryAppliedMigrations.Any())
                {
                    allAppliedMigrations.Add(new MigrationModuleDto
                    {
                        Module = "Inventory",
                        Migrations = inventoryAppliedMigrations
                    });
                }
                if (hrAppliedMigrations.Any())
                {
                    allAppliedMigrations.Add(new MigrationModuleDto
                    {
                        Module = "HR",
                        Migrations = hrAppliedMigrations
                    });
                }

                // Check Sales module migrations if tenant has Sales access
                List<string> salesPendingMigrations = new();
                List<string> salesAppliedMigrations = new();

                try
                {
                    var hasSalesAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "Sales", cancellationToken);

                    if (hasSalesAccess)
                    {
                        var salesOptionsBuilder = new DbContextOptionsBuilder<SalesDbContext>();
                        salesOptionsBuilder.UseNpgsql(tenant.ConnectionString);
                        salesOptionsBuilder.ConfigureWarnings(warnings =>
                            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                        var mockTenantService = new MockTenantService(tenant.Id, tenant.ConnectionString);

                        using var salesDbContext = new SalesDbContext(
                            salesOptionsBuilder.Options,
                            mockTenantService);

                        var salesPending = await salesDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                        var salesApplied = await salesDbContext.Database.GetAppliedMigrationsAsync(cancellationToken);

                        salesPendingMigrations = salesPending.ToList();
                        salesAppliedMigrations = salesApplied.ToList();
                    }
                }
                catch (Exception salesEx)
                {
                    _logger.LogWarning(salesEx, "Failed to check Sales migrations for tenant {TenantId}", tenant.Id);
                }

                if (salesPendingMigrations.Any())
                {
                    allPendingMigrations.Add(new MigrationModuleDto
                    {
                        Module = "Sales",
                        Migrations = salesPendingMigrations
                    });
                }
                if (salesAppliedMigrations.Any())
                {
                    allAppliedMigrations.Add(new MigrationModuleDto
                    {
                        Module = "Sales",
                        Migrations = salesAppliedMigrations
                    });
                }

                results.Add(new TenantMigrationStatusDto
                {
                    TenantId = tenant.Id,
                    TenantName = tenant.Name,
                    TenantCode = tenant.Code,
                    PendingMigrations = allPendingMigrations,
                    AppliedMigrations = allAppliedMigrations,
                    HasPendingMigrations = pendingList.Any() || crmPendingMigrations.Any() || inventoryPendingMigrations.Any() || hrPendingMigrations.Any() || salesPendingMigrations.Any()
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

        // Check Inventory module migrations if tenant has Inventory access
        List<string> inventoryPendingMigrations = new();
        try
        {
            var hasInventoryAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "Inventory", cancellationToken);
            _logger.LogWarning("DEBUG ApplyMigration: Tenant {TenantId} has Inventory access: {HasInventoryAccess}", tenant.Id, hasInventoryAccess);

            if (hasInventoryAccess)
            {
                _logger.LogInformation("Tenant {TenantId} has Inventory module access. Checking Inventory migrations...", tenant.Id);

                var inventoryOptionsBuilder = new DbContextOptionsBuilder<InventoryDbContext>();
                inventoryOptionsBuilder.UseNpgsql(tenant.ConnectionString.Value, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(InventoryDbContext).Assembly.FullName);
                    sqlOptions.CommandTimeout(30);
                    sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                });
                inventoryOptionsBuilder.ConfigureWarnings(warnings =>
                    warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                var mockTenantServiceInventory = new MockTenantService(tenant.Id, tenant.ConnectionString.Value);

                using var inventoryDbContext = new InventoryDbContext(
                    inventoryOptionsBuilder.Options,
                    mockTenantServiceInventory);

                var inventoryPending = await inventoryDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                inventoryPendingMigrations = inventoryPending.ToList();

                _logger.LogWarning("DEBUG ApplyMigration: Inventory pending migrations count: {Count}, Migrations: {Migrations}",
                    inventoryPendingMigrations.Count, string.Join(", ", inventoryPendingMigrations));

                if (inventoryPendingMigrations.Any())
                {
                    _logger.LogInformation("Applying {Count} Inventory migrations to tenant {TenantId}", inventoryPendingMigrations.Count, tenant.Id);
                    await inventoryDbContext.Database.MigrateAsync(cancellationToken);
                    allAppliedMigrations.AddRange(inventoryPendingMigrations.Select(m => $"Inventory:{m}"));
                    _logger.LogInformation("Inventory migrations applied successfully. Applied: {Migrations}", string.Join(", ", inventoryPendingMigrations));
                }
                else
                {
                    _logger.LogInformation("No Inventory migrations to apply for tenant {TenantId}", tenant.Id);
                }
            }
            else
            {
                _logger.LogInformation("Tenant {TenantId} does not have Inventory module access. Inventory migrations skipped.", tenant.Id);
            }
        }
        catch (Exception inventoryEx)
        {
            _logger.LogError(inventoryEx, "Error applying Inventory migrations for tenant {TenantId}. Continuing...", tenant.Id);
            // Don't fail the overall migration if Inventory migrations fail
        }

        // Check HR module migrations if tenant has HR access
        List<string> hrPendingMigrations = new();
        try
        {
            var hasHRAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "HR", cancellationToken);
            _logger.LogWarning("DEBUG ApplyMigration: Tenant {TenantId} has HR access: {HasHRAccess}", tenant.Id, hasHRAccess);

            if (hasHRAccess)
            {
                _logger.LogInformation("Tenant {TenantId} has HR module access. Checking HR migrations...", tenant.Id);

                var hrOptionsBuilder = new DbContextOptionsBuilder<HRDbContext>();
                hrOptionsBuilder.UseNpgsql(tenant.ConnectionString.Value, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(HRDbContext).Assembly.FullName);
                    sqlOptions.CommandTimeout(30);
                    sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                });
                hrOptionsBuilder.ConfigureWarnings(warnings =>
                    warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                var mockTenantServiceHR = new MockTenantService(tenant.Id, tenant.ConnectionString.Value);

                using var hrDbContext = new HRDbContext(
                    hrOptionsBuilder.Options,
                    mockTenantServiceHR);

                var hrPending = await hrDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                hrPendingMigrations = hrPending.ToList();

                _logger.LogWarning("DEBUG ApplyMigration: HR pending migrations count: {Count}, Migrations: {Migrations}",
                    hrPendingMigrations.Count, string.Join(", ", hrPendingMigrations));

                if (hrPendingMigrations.Any())
                {
                    _logger.LogInformation("Applying {Count} HR migrations to tenant {TenantId}", hrPendingMigrations.Count, tenant.Id);
                    await hrDbContext.Database.MigrateAsync(cancellationToken);
                    allAppliedMigrations.AddRange(hrPendingMigrations.Select(m => $"HR:{m}"));
                    _logger.LogInformation("HR migrations applied successfully. Applied: {Migrations}", string.Join(", ", hrPendingMigrations));
                }
                else
                {
                    _logger.LogInformation("No HR migrations to apply for tenant {TenantId}", tenant.Id);
                }
            }
            else
            {
                _logger.LogInformation("Tenant {TenantId} does not have HR module access. HR migrations skipped.", tenant.Id);
            }
        }
        catch (Exception hrEx)
        {
            _logger.LogError(hrEx, "Error applying HR migrations for tenant {TenantId}. Continuing...", tenant.Id);
            // Don't fail the overall migration if HR migrations fail
        }

        // Check Sales module migrations if tenant has Sales access
        List<string> salesPendingMigrations = new();
        try
        {
            var hasSalesAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "Sales", cancellationToken);
            _logger.LogWarning("DEBUG ApplyMigration: Tenant {TenantId} has Sales access: {HasSalesAccess}", tenant.Id, hasSalesAccess);

            if (hasSalesAccess)
            {
                _logger.LogInformation("Tenant {TenantId} has Sales module access. Checking Sales migrations...", tenant.Id);

                var salesOptionsBuilder = new DbContextOptionsBuilder<SalesDbContext>();
                salesOptionsBuilder.UseNpgsql(tenant.ConnectionString.Value, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(SalesDbContext).Assembly.FullName);
                    sqlOptions.CommandTimeout(30);
                    sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                });
                salesOptionsBuilder.ConfigureWarnings(warnings =>
                    warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                var mockTenantServiceSales = new MockTenantService(tenant.Id, tenant.ConnectionString.Value);

                using var salesDbContext = new SalesDbContext(
                    salesOptionsBuilder.Options,
                    mockTenantServiceSales);

                var salesPending = await salesDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                salesPendingMigrations = salesPending.ToList();

                _logger.LogWarning("DEBUG ApplyMigration: Sales pending migrations count: {Count}, Migrations: {Migrations}",
                    salesPendingMigrations.Count, string.Join(", ", salesPendingMigrations));

                if (salesPendingMigrations.Any())
                {
                    _logger.LogInformation("Applying {Count} Sales migrations to tenant {TenantId}", salesPendingMigrations.Count, tenant.Id);
                    await salesDbContext.Database.MigrateAsync(cancellationToken);
                    allAppliedMigrations.AddRange(salesPendingMigrations.Select(m => $"Sales:{m}"));
                    _logger.LogInformation("Sales migrations applied successfully. Applied: {Migrations}", string.Join(", ", salesPendingMigrations));
                }
                else
                {
                    _logger.LogInformation("No Sales migrations to apply for tenant {TenantId}", tenant.Id);
                }
            }
            else
            {
                _logger.LogInformation("Tenant {TenantId} does not have Sales module access. Sales migrations skipped.", tenant.Id);
            }
        }
        catch (Exception salesEx)
        {
            _logger.LogError(salesEx, "Error applying Sales migrations for tenant {TenantId}. Continuing...", tenant.Id);
            // Don't fail the overall migration if Sales migrations fail
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

    /// <summary>
    /// Applies only module-specific migrations for a tenant based on their subscription.
    /// This is used when tenant database already exists but modules need to be provisioned.
    /// </summary>
    public async Task<List<string>> ApplyModuleMigrationsAsync(
        Guid tenantId,
        ISetupProgressNotifier? progressNotifier = null,
        CancellationToken cancellationToken = default)
    {
        var appliedMigrations = new List<string>();

        using var scope = _serviceProvider.CreateScope();
        var masterContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
        var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();

        try
        {
            _logger.LogInformation("Starting module migrations for tenant {TenantId}...", tenantId);

            // Get tenant information
            var tenant = await masterContext.Tenants.FindAsync(new object[] { tenantId }, cancellationToken);
            if (tenant == null)
            {
                throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
            }

            // Create the tenant database context
            using var context = await tenantDbContextFactory.CreateDbContextAsync(tenantId);
            var tenantDbContext = (TenantDbContext)context;
            var connectionString = tenantDbContext.Database.GetConnectionString();

            // Get tenant's subscribed modules from SubscriptionModules table
            // This works for both ready packages and custom packages
            var subscribedModules = await masterContext.Subscriptions
                .Include(s => s.Modules)
                .Where(s => s.TenantId == tenantId)
                .SelectMany(s => s.Modules)
                .Select(m => m.ModuleCode.ToUpper())
                .Distinct()
                .ToListAsync(cancellationToken);

            // Fallback: If no modules found in SubscriptionModules, check Package.Modules (for legacy subscriptions)
            if (!subscribedModules.Any())
            {
                subscribedModules = await masterContext.Subscriptions
                    .Include(s => s.Package)
                        .ThenInclude(p => p.Modules)
                    .Where(s => s.TenantId == tenantId && s.Package != null)
                    .SelectMany(s => s.Package!.Modules)
                    .Where(m => m.IsIncluded)
                    .Select(m => m.ModuleCode.ToUpper())
                    .Distinct()
                    .ToListAsync(cancellationToken);
            }

            _logger.LogInformation("Tenant {TenantId} has subscribed modules: {Modules}",
                tenantId, string.Join(", ", subscribedModules));

            var totalModules = subscribedModules.Count;
            var currentModule = 0;

            // Apply CRM module migrations
            if (subscribedModules.Contains("CRM"))
            {
                currentModule++;
                var progressPercent = (int)((currentModule / (double)totalModules) * 100 * 0.7) + 10; // 10-80%

                if (progressNotifier != null)
                {
                    await progressNotifier.NotifyProgressAsync(SetupProgressUpdate.Create(
                        tenantId, SetupStepType.ConfiguringModules,
                        "CRM modülü yapılandırılıyor...", progressPercent));
                }

                try
                {
                    _logger.LogInformation("Applying CRM migrations for tenant {TenantId}...", tenantId);

                    var crmOptionsBuilder = new DbContextOptionsBuilder<Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext>();
                    crmOptionsBuilder.UseNpgsql(connectionString, sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext).Assembly.FullName);
                        sqlOptions.CommandTimeout(60);
                        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                    });
                    // Suppress PendingModelChangesWarning - we're applying existing migrations
                    crmOptionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                    var mockTenantService = new MockTenantService(tenantId, connectionString!);

                    using var crmDbContext = new Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext(
                        crmOptionsBuilder.Options,
                        mockTenantService);

                    var pendingMigrations = await crmDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        await crmDbContext.Database.MigrateAsync(cancellationToken);
                        appliedMigrations.AddRange(pendingList.Select(m => $"CRM:{m}"));
                        _logger.LogInformation("CRM migrations applied: {Migrations}", string.Join(", ", pendingList));
                    }
                    else
                    {
                        _logger.LogInformation("No pending CRM migrations for tenant {TenantId}", tenantId);
                    }
                }
                catch (Exception crmEx)
                {
                    _logger.LogError(crmEx, "Error applying CRM migrations for tenant {TenantId}", tenantId);
                }
            }

            // Apply Inventory module migrations
            if (subscribedModules.Contains("INVENTORY"))
            {
                currentModule++;
                var progressPercent = (int)((currentModule / (double)totalModules) * 100 * 0.7) + 10;

                if (progressNotifier != null)
                {
                    await progressNotifier.NotifyProgressAsync(SetupProgressUpdate.Create(
                        tenantId, SetupStepType.ConfiguringModules,
                        "Envanter modülü yapılandırılıyor...", progressPercent));
                }

                try
                {
                    _logger.LogInformation("Applying Inventory migrations for tenant {TenantId}...", tenantId);

                    var inventoryOptionsBuilder = new DbContextOptionsBuilder<InventoryDbContext>();
                    inventoryOptionsBuilder.UseNpgsql(connectionString, sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(InventoryDbContext).Assembly.FullName);
                        sqlOptions.CommandTimeout(60);
                        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                    });
                    // Suppress PendingModelChangesWarning - we're applying existing migrations
                    inventoryOptionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                    var mockTenantService = new MockTenantService(tenantId, connectionString!);

                    using var inventoryDbContext = new InventoryDbContext(
                        inventoryOptionsBuilder.Options,
                        mockTenantService);

                    var pendingMigrations = await inventoryDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        await inventoryDbContext.Database.MigrateAsync(cancellationToken);
                        appliedMigrations.AddRange(pendingList.Select(m => $"Inventory:{m}"));
                        _logger.LogInformation("Inventory migrations applied: {Migrations}", string.Join(", ", pendingList));
                    }
                    else
                    {
                        _logger.LogInformation("No pending Inventory migrations for tenant {TenantId}", tenantId);
                    }
                }
                catch (Exception invEx)
                {
                    _logger.LogError(invEx, "Error applying Inventory migrations for tenant {TenantId}", tenantId);
                }
            }

            // Apply HR module migrations
            if (subscribedModules.Contains("HR"))
            {
                currentModule++;
                var progressPercent = (int)((currentModule / (double)totalModules) * 100 * 0.7) + 10;

                if (progressNotifier != null)
                {
                    await progressNotifier.NotifyProgressAsync(SetupProgressUpdate.Create(
                        tenantId, SetupStepType.ConfiguringModules,
                        "İK modülü yapılandırılıyor...", progressPercent));
                }

                try
                {
                    _logger.LogInformation("Applying HR migrations for tenant {TenantId}...", tenantId);

                    var hrOptionsBuilder = new DbContextOptionsBuilder<HRDbContext>();
                    hrOptionsBuilder.UseNpgsql(connectionString, sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(HRDbContext).Assembly.FullName);
                        sqlOptions.CommandTimeout(60);
                        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                    });
                    // Suppress PendingModelChangesWarning - we're applying existing migrations
                    hrOptionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                    var mockTenantService = new MockTenantService(tenantId, connectionString!);

                    using var hrDbContext = new HRDbContext(
                        hrOptionsBuilder.Options,
                        mockTenantService);

                    var pendingMigrations = await hrDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        await hrDbContext.Database.MigrateAsync(cancellationToken);
                        appliedMigrations.AddRange(pendingList.Select(m => $"HR:{m}"));
                        _logger.LogInformation("HR migrations applied: {Migrations}", string.Join(", ", pendingList));
                    }
                    else
                    {
                        _logger.LogInformation("No pending HR migrations for tenant {TenantId}", tenantId);
                    }
                }
                catch (Exception hrEx)
                {
                    _logger.LogError(hrEx, "Error applying HR migrations for tenant {TenantId}", tenantId);
                }
            }

            // Apply Sales module migrations
            if (subscribedModules.Contains("SALES"))
            {
                currentModule++;
                var progressPercent = (int)((currentModule / (double)totalModules) * 100 * 0.7) + 10;

                if (progressNotifier != null)
                {
                    await progressNotifier.NotifyProgressAsync(SetupProgressUpdate.Create(
                        tenantId, SetupStepType.ConfiguringModules,
                        "Satış modülü yapılandırılıyor...", progressPercent));
                }

                try
                {
                    _logger.LogInformation("Applying Sales migrations for tenant {TenantId}...", tenantId);

                    var salesOptionsBuilder = new DbContextOptionsBuilder<SalesDbContext>();
                    salesOptionsBuilder.UseNpgsql(connectionString, sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(SalesDbContext).Assembly.FullName);
                        sqlOptions.CommandTimeout(60);
                        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                    });
                    // Suppress PendingModelChangesWarning - we're applying existing migrations
                    salesOptionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                    var mockTenantService = new MockTenantService(tenantId, connectionString!);

                    using var salesDbContext = new SalesDbContext(
                        salesOptionsBuilder.Options,
                        mockTenantService);

                    var pendingMigrations = await salesDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        await salesDbContext.Database.MigrateAsync(cancellationToken);
                        appliedMigrations.AddRange(pendingList.Select(m => $"Sales:{m}"));
                        _logger.LogInformation("Sales migrations applied: {Migrations}", string.Join(", ", pendingList));
                    }
                    else
                    {
                        _logger.LogInformation("No pending Sales migrations for tenant {TenantId}", tenantId);
                    }
                }
                catch (Exception salesEx)
                {
                    _logger.LogError(salesEx, "Error applying Sales migrations for tenant {TenantId}", tenantId);
                }
            }

            // Apply Purchase module migrations
            if (subscribedModules.Contains("PURCHASE"))
            {
                currentModule++;
                var progressPercent = (int)((currentModule / (double)totalModules) * 100 * 0.7) + 10;

                if (progressNotifier != null)
                {
                    await progressNotifier.NotifyProgressAsync(SetupProgressUpdate.Create(
                        tenantId, SetupStepType.ConfiguringModules,
                        "Satın alma modülü yapılandırılıyor...", progressPercent));
                }

                try
                {
                    _logger.LogInformation("Applying Purchase migrations for tenant {TenantId}...", tenantId);

                    var purchaseOptionsBuilder = new DbContextOptionsBuilder<PurchaseDbContext>();
                    purchaseOptionsBuilder.UseNpgsql(connectionString, sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(PurchaseDbContext).Assembly.FullName);
                        sqlOptions.CommandTimeout(60);
                        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                    });
                    // Suppress PendingModelChangesWarning - we're applying existing migrations
                    purchaseOptionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                    var mockTenantService = new MockTenantService(tenantId, connectionString!);

                    using var purchaseDbContext = new PurchaseDbContext(
                        purchaseOptionsBuilder.Options,
                        mockTenantService);

                    var pendingMigrations = await purchaseDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        await purchaseDbContext.Database.MigrateAsync(cancellationToken);
                        appliedMigrations.AddRange(pendingList.Select(m => $"Purchase:{m}"));
                        _logger.LogInformation("Purchase migrations applied: {Migrations}", string.Join(", ", pendingList));
                    }
                    else
                    {
                        _logger.LogInformation("No pending Purchase migrations for tenant {TenantId}", tenantId);
                    }
                }
                catch (Exception purchaseEx)
                {
                    _logger.LogError(purchaseEx, "Error applying Purchase migrations for tenant {TenantId}", tenantId);
                }
            }

            // Apply Finance module migrations
            if (subscribedModules.Contains("FINANCE"))
            {
                currentModule++;
                var progressPercent = (int)((currentModule / (double)totalModules) * 100 * 0.7) + 10;

                if (progressNotifier != null)
                {
                    await progressNotifier.NotifyProgressAsync(SetupProgressUpdate.Create(
                        tenantId, SetupStepType.ConfiguringModules,
                        "Finans modülü yapılandırılıyor...", progressPercent));
                }

                try
                {
                    _logger.LogInformation("Applying Finance migrations for tenant {TenantId}...", tenantId);

                    var financeOptionsBuilder = new DbContextOptionsBuilder<FinanceDbContext>();
                    financeOptionsBuilder.UseNpgsql(connectionString, sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(FinanceDbContext).Assembly.FullName);
                        sqlOptions.CommandTimeout(60);
                        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                    });
                    // Suppress PendingModelChangesWarning - we're applying existing migrations
                    financeOptionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                    var mockTenantService = new MockTenantService(tenantId, connectionString!);

                    using var financeDbContext = new FinanceDbContext(
                        financeOptionsBuilder.Options,
                        mockTenantService);

                    var pendingMigrations = await financeDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        await financeDbContext.Database.MigrateAsync(cancellationToken);
                        appliedMigrations.AddRange(pendingList.Select(m => $"Finance:{m}"));
                        _logger.LogInformation("Finance migrations applied: {Migrations}", string.Join(", ", pendingList));
                    }
                    else
                    {
                        _logger.LogInformation("No pending Finance migrations for tenant {TenantId}", tenantId);
                    }
                }
                catch (Exception financeEx)
                {
                    _logger.LogError(financeEx, "Error applying Finance migrations for tenant {TenantId}", tenantId);
                }
            }

            // Apply Manufacturing module migrations
            if (subscribedModules.Contains("MANUFACTURING"))
            {
                currentModule++;
                var progressPercent = (int)((currentModule / (double)totalModules) * 100 * 0.7) + 10;

                if (progressNotifier != null)
                {
                    await progressNotifier.NotifyProgressAsync(SetupProgressUpdate.Create(
                        tenantId, SetupStepType.ConfiguringModules,
                        "Üretim modülü yapılandırılıyor...", progressPercent));
                }

                try
                {
                    _logger.LogInformation("Applying Manufacturing migrations for tenant {TenantId}...", tenantId);

                    var manufacturingOptionsBuilder = new DbContextOptionsBuilder<ManufacturingDbContext>();
                    manufacturingOptionsBuilder.UseNpgsql(connectionString, sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(ManufacturingDbContext).Assembly.FullName);
                        sqlOptions.CommandTimeout(60);
                        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5);
                    });
                    // Suppress PendingModelChangesWarning - we're applying existing migrations
                    manufacturingOptionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                    var mockTenantService = new MockTenantService(tenantId, connectionString!);

                    using var manufacturingDbContext = new ManufacturingDbContext(
                        manufacturingOptionsBuilder.Options,
                        mockTenantService);

                    var pendingMigrations = await manufacturingDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        await manufacturingDbContext.Database.MigrateAsync(cancellationToken);
                        appliedMigrations.AddRange(pendingList.Select(m => $"Manufacturing:{m}"));
                        _logger.LogInformation("Manufacturing migrations applied: {Migrations}", string.Join(", ", pendingList));
                    }
                    else
                    {
                        _logger.LogInformation("No pending Manufacturing migrations for tenant {TenantId}", tenantId);
                    }
                }
                catch (Exception mfgEx)
                {
                    _logger.LogError(mfgEx, "Error applying Manufacturing migrations for tenant {TenantId}", tenantId);
                }
            }

            _logger.LogInformation("Module migrations completed for tenant {TenantId}. Applied: {Count} migrations",
                tenantId, appliedMigrations.Count);

            // Now activate TenantModules in tenant database
            if (progressNotifier != null)
            {
                await progressNotifier.NotifyProgressAsync(SetupProgressUpdate.Create(
                    tenantId, SetupStepType.ConfiguringModules,
                    "Modüller aktifleştiriliyor...", 80));
            }

            try
            {
                _logger.LogInformation("Activating TenantModules for tenant {TenantId}...", tenantId);

                // Get subscription with modules - PRIORITY: SubscriptionModules first (for custom packages)
                var subscription = await masterContext.Subscriptions
                    .Include(s => s.Modules)
                    .Include(s => s.Package)
                        .ThenInclude(p => p.Modules)
                    .Where(s => s.TenantId == tenantId)
                    .OrderByDescending(s => s.StartDate)
                    .FirstOrDefaultAsync(cancellationToken);

                if (subscription == null)
                {
                    _logger.LogWarning("⚠️ No subscription found for tenant {TenantId}", tenantId);
                    return appliedMigrations;
                }

                // Determine which modules to activate:
                // 1. First check SubscriptionModules (for custom packages or explicitly added modules)
                // 2. Fallback to Package.Modules (for ready packages)
                var modulesToActivate = new List<(string ModuleCode, string ModuleName, int? MaxEntities)>();

                if (subscription.Modules.Any())
                {
                    // Use SubscriptionModules (custom package or explicitly added modules)
                    _logger.LogInformation("Using SubscriptionModules for tenant {TenantId}, found {Count} modules",
                        tenantId, subscription.Modules.Count);

                    foreach (var module in subscription.Modules)
                    {
                        modulesToActivate.Add((module.ModuleCode, module.ModuleName, module.MaxEntities));
                    }
                }
                else if (subscription.Package?.Modules?.Any() == true)
                {
                    // Fallback to Package.Modules (legacy ready packages)
                    _logger.LogInformation("Using Package.Modules for tenant {TenantId}, found {Count} modules",
                        tenantId, subscription.Package.Modules.Count);

                    foreach (var module in subscription.Package.Modules.Where(m => m.IsIncluded))
                    {
                        modulesToActivate.Add((module.ModuleCode, module.ModuleName, module.MaxEntities));
                    }
                }

                var isTrial = subscription.Package?.TrialDays > 0 || subscription.Status == Domain.Master.Enums.SubscriptionStatus.Deneme;
                var packageName = subscription.Package?.Name ?? "Custom";

                if (modulesToActivate.Any())
                {
                    // Create TenantModules in tenant database
                    foreach (var (moduleCode, moduleName, maxEntities) in modulesToActivate)
                    {
                        // Check if module already exists
                        var existingModule = await tenantDbContext.TenantModules
                            .FirstOrDefaultAsync(m => m.ModuleCode == moduleCode, cancellationToken);

                        if (existingModule == null)
                        {
                            var tenantModule = Stocker.Domain.Tenant.Entities.TenantModules.Create(
                                tenantId: tenantId,
                                moduleName: moduleName,
                                moduleCode: moduleCode,
                                description: $"Module from {packageName} package",
                                isEnabled: true,
                                recordLimit: maxEntities,
                                isTrial: isTrial
                            );

                            tenantDbContext.TenantModules.Add(tenantModule);
                            _logger.LogInformation("✅ Created TenantModule {ModuleCode} ({ModuleName}) for tenant {TenantId}",
                                moduleCode, moduleName, tenantId);
                        }
                        else
                        {
                            _logger.LogInformation("TenantModule {ModuleCode} already exists for tenant {TenantId}",
                                moduleCode, tenantId);
                        }
                    }

                    await tenantDbContext.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("🎉 Successfully activated {Count} modules for tenant {TenantId}",
                        modulesToActivate.Count, tenantId);
                }
                else
                {
                    _logger.LogWarning("⚠️ No modules found in subscription (neither SubscriptionModules nor Package.Modules) for tenant {TenantId}", tenantId);
                }
            }
            catch (Exception moduleEx)
            {
                _logger.LogError(moduleEx, "❌ Error activating TenantModules for tenant {TenantId}", tenantId);
                // Don't throw - migrations are already applied, module activation can be retried
            }

            return appliedMigrations;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying module migrations for tenant {TenantId}", tenantId);
            throw;
        }
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

#region Central Migration Management

public partial class MigrationService
{
    /// <inheritdoc />
    public async Task<CentralMigrationStatusDto> GetCentralMigrationStatusAsync(CancellationToken cancellationToken = default)
    {
        var result = new CentralMigrationStatusDto();

        try
        {
            // Get Master status
            var masterStatus = await GetMasterPendingMigrationsAsync(cancellationToken);
            result.Master = new DbContextMigrationStatusDto
            {
                ContextName = "MasterDbContext",
                Schema = "public",
                PendingMigrations = masterStatus.PendingMigrations,
                AppliedMigrations = masterStatus.AppliedMigrations,
                HasPendingMigrations = masterStatus.HasPendingMigrations,
                Error = masterStatus.Error
            };

            // Get Alerts status
            result.Alerts = await GetAlertsPendingMigrationsAsync(cancellationToken);

            // Get Tenants summary
            var tenantStatuses = await GetPendingMigrationsAsync(cancellationToken);
            result.Tenants = new TenantMigrationSummaryDto
            {
                TotalTenants = tenantStatuses.Count,
                TenantsWithPendingMigrations = tenantStatuses.Count(t => t.HasPendingMigrations),
                TenantsUpToDate = tenantStatuses.Count(t => !t.HasPendingMigrations),
                TotalPendingMigrations = tenantStatuses.Sum(t => t.PendingMigrations.Sum(m => m.Migrations.Count)),
                TenantsWithPending = tenantStatuses.Where(t => t.HasPendingMigrations).ToList()
            };

            // Calculate totals
            result.TotalPendingMigrations =
                result.Master.PendingMigrations.Count +
                result.Alerts.PendingMigrations.Count +
                result.Tenants.TotalPendingMigrations;

            result.HasAnyPendingMigrations =
                result.Master.HasPendingMigrations ||
                result.Alerts.HasPendingMigrations ||
                result.Tenants.TenantsWithPendingMigrations > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting central migration status");
            throw;
        }

        return result;
    }

    /// <inheritdoc />
    public async Task<DbContextMigrationStatusDto> GetAlertsPendingMigrationsAsync(CancellationToken cancellationToken = default)
    {
        var result = new DbContextMigrationStatusDto
        {
            ContextName = "AlertDbContext",
            Schema = "alerts"
        };

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var alertDbContext = scope.ServiceProvider.GetService<Stocker.Infrastructure.Alerts.Persistence.AlertDbContext>();

            if (alertDbContext == null)
            {
                result.Error = "AlertDbContext not registered in DI container";
                return result;
            }

            // Get all migrations from assembly (doesn't require DB connection)
            var allMigrations = alertDbContext.Database.GetMigrations().ToList();

            try
            {
                // Try to get applied migrations - this may fail if schema doesn't exist
                var appliedMigrations = await alertDbContext.Database.GetAppliedMigrationsAsync(cancellationToken);
                result.AppliedMigrations = appliedMigrations.ToList();

                // Calculate pending by comparing all vs applied
                result.PendingMigrations = allMigrations.Except(result.AppliedMigrations).ToList();
            }
            catch (Npgsql.PostgresException pgEx) when (pgEx.SqlState == "3F000" || pgEx.SqlState == "42P01")
            {
                // 3F000 = invalid_schema_name, 42P01 = undefined_table
                // Schema or table doesn't exist - all migrations are pending
                _logger.LogInformation("AlertDbContext: Schema or migration history table doesn't exist yet. All migrations are pending.");
                result.PendingMigrations = allMigrations;
                result.AppliedMigrations = new List<string>();
            }

            result.HasPendingMigrations = result.PendingMigrations.Count > 0;

            _logger.LogInformation("AlertDbContext: {PendingCount} pending, {AppliedCount} applied migrations",
                result.PendingMigrations.Count, result.AppliedMigrations.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting AlertDbContext pending migrations");
            result.Error = ex.Message;
        }

        return result;
    }

    /// <inheritdoc />
    public async Task<ApplyMigrationResultDto> ApplyAlertsMigrationAsync(CancellationToken cancellationToken = default)
    {
        var result = new ApplyMigrationResultDto
        {
            TenantId = Guid.Empty, // Not tenant-specific
            TenantName = "Alerts"
        };

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var alertDbContext = scope.ServiceProvider.GetService<Stocker.Infrastructure.Alerts.Persistence.AlertDbContext>();

            if (alertDbContext == null)
            {
                result.Success = false;
                result.Error = "AlertDbContext not registered in DI container";
                return result;
            }

            // Get all migrations from assembly
            var allMigrations = alertDbContext.Database.GetMigrations().ToList();
            List<string> appliedMigrations;

            try
            {
                appliedMigrations = (await alertDbContext.Database.GetAppliedMigrationsAsync(cancellationToken)).ToList();
            }
            catch (Npgsql.PostgresException pgEx) when (pgEx.SqlState == "3F000" || pgEx.SqlState == "42P01")
            {
                // Schema or table doesn't exist - treat all as pending
                appliedMigrations = new List<string>();
            }

            var pendingMigrations = allMigrations.Except(appliedMigrations).ToList();
            var pendingCount = pendingMigrations.Count;

            if (pendingCount == 0)
            {
                result.Success = true;
                result.Message = "No pending migrations for AlertDbContext";
                return result;
            }

            _logger.LogInformation("Applying {Count} migrations to AlertDbContext...", pendingCount);

            await alertDbContext.Database.MigrateAsync(cancellationToken);

            result.Success = true;
            result.AppliedMigrations = pendingMigrations;
            result.Message = $"Successfully applied {pendingCount} migration(s) to AlertDbContext";

            _logger.LogInformation("AlertDbContext migrations applied successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying AlertDbContext migrations");
            result.Success = false;
            result.Error = ex.Message;
        }

        return result;
    }

    /// <inheritdoc />
    public async Task MigrateAlertsDatabaseAsync()
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var alertDbContext = scope.ServiceProvider.GetService<Stocker.Infrastructure.Alerts.Persistence.AlertDbContext>();

            if (alertDbContext == null)
            {
                _logger.LogWarning("AlertDbContext not registered, skipping Alerts migration");
                return;
            }

            _logger.LogInformation("Starting AlertDbContext migration...");

            var pendingMigrations = await alertDbContext.Database.GetPendingMigrationsAsync();
            _logger.LogInformation("AlertDbContext pending migrations: {Migrations}",
                string.Join(", ", pendingMigrations));

            await alertDbContext.Database.MigrateAsync();

            _logger.LogInformation("AlertDbContext migration completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error migrating AlertDbContext");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<CentralMigrationResultDto> ApplyAllMigrationsAsync(CancellationToken cancellationToken = default)
    {
        var result = new CentralMigrationResultDto();
        var allSuccess = true;
        var messages = new List<string>();

        try
        {
            // 1. Apply Master migrations
            _logger.LogInformation("Applying Master database migrations...");
            result.Master = await ApplyMasterMigrationAsync(cancellationToken);
            if (!result.Master.Success)
            {
                allSuccess = false;
                messages.Add($"Master: {result.Master.Error}");
            }
            else if (result.Master.AppliedMigrations.Count > 0)
            {
                messages.Add($"Master: Applied {result.Master.AppliedMigrations.Count} migration(s)");
            }

            // 2. Apply Alerts migrations
            _logger.LogInformation("Applying Alerts database migrations...");
            result.Alerts = await ApplyAlertsMigrationAsync(cancellationToken);
            if (!result.Alerts.Success)
            {
                allSuccess = false;
                messages.Add($"Alerts: {result.Alerts.Error}");
            }
            else if (result.Alerts.AppliedMigrations.Count > 0)
            {
                messages.Add($"Alerts: Applied {result.Alerts.AppliedMigrations.Count} migration(s)");
            }

            // 3. Apply Tenant migrations
            _logger.LogInformation("Applying Tenant database migrations...");
            result.Tenants = await ApplyMigrationsToAllTenantsAsync(cancellationToken);
            var failedTenants = result.Tenants.Count(t => !t.Success);
            var successTenants = result.Tenants.Count(t => t.Success);

            if (failedTenants > 0)
            {
                allSuccess = false;
                messages.Add($"Tenants: {failedTenants} failed, {successTenants} succeeded");
            }
            else if (successTenants > 0)
            {
                var totalApplied = result.Tenants.Sum(t => t.AppliedMigrations.Count);
                messages.Add($"Tenants: Applied {totalApplied} migration(s) across {successTenants} tenant(s)");
            }

            result.Success = allSuccess;
            result.Message = messages.Count > 0
                ? string.Join("; ", messages)
                : "No pending migrations found";

            _logger.LogInformation("Central migration completed. Success: {Success}, Message: {Message}",
                result.Success, result.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during central migration");
            result.Success = false;
            result.Message = ex.Message;
        }

        return result;
    }
}

#endregion