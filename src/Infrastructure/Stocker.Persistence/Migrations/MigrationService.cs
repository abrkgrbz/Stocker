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

namespace Stocker.Persistence.Migrations;

// Migration service implementation
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
                optionsBuilder.UseSqlServer(tenant.ConnectionString);

                using var tenantContext = new TenantDbContext(optionsBuilder.Options, null!);

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
                        crmOptionsBuilder.UseSqlServer(tenant.ConnectionString);
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

        var tenant = await masterUnitOfWork.Tenants()
            .AsQueryable()
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive, cancellationToken);

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
        }

        _logger.LogInformation("Applying migrations to tenant {TenantId} - {TenantName}", tenant.Id, tenant.Name);

        var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
        optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

        using var tenantContext = new TenantDbContext(optionsBuilder.Options, null!);

        var pendingMigrations = await tenantContext.Database.GetPendingMigrationsAsync(cancellationToken);
        var pendingList = pendingMigrations.ToList();

        if (!pendingList.Any())
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

        await tenantContext.Database.MigrateAsync(cancellationToken);

        _logger.LogInformation("Migrations applied successfully to tenant {TenantId}. Applied: {Migrations}",
            tenant.Id, string.Join(", ", pendingList));

        return new ApplyMigrationResultDto
        {
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            Success = true,
            Message = $"{pendingList.Count} migration başarıyla uygulandı",
            AppliedMigrations = pendingList
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
                optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);

                using var tenantContext = new TenantDbContext(optionsBuilder.Options, null!);

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
        optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

        using var tenantContext = new TenantDbContext(optionsBuilder.Options, null!);

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

        // For now, return a placeholder. In a real implementation, you would:
        // 1. Parse migration files from the Migrations directory
        // 2. Extract SQL from the Up() method
        // 3. Analyze affected tables
        return new MigrationScriptPreviewDto
        {
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            MigrationName = migrationName,
            ModuleName = moduleName,
            SqlScript = "-- Migration script preview not yet implemented\n-- This would show the actual SQL that will be executed",
            Description = $"Migration {migrationName} from {moduleName} module",
            CreatedAt = DateTime.UtcNow,
            AffectedTables = new List<string>(),
            EstimatedDuration = 10
        };
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
            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

            using var tenantContext = new TenantDbContext(optionsBuilder.Options, null!);

            // Note: EF Core doesn't support automatic rollback of specific migrations
            // This would require manual implementation using migration scripts
            _logger.LogWarning("Migration rollback requested but not yet implemented: {MigrationName}", migrationName);

            return new RollbackMigrationResultDto
            {
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                MigrationName = migrationName,
                ModuleName = moduleName,
                Success = false,
                Message = "Migration rollback is not yet implemented. Please use manual SQL scripts for rollback.",
                Error = "Feature not implemented",
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

        // TODO: Implement with Hangfire background job scheduling
        _logger.LogInformation("Scheduling migration for tenant {TenantId} at {ScheduledTime}", tenantId, scheduledTime);

        return new ScheduleMigrationResultDto
        {
            ScheduleId = Guid.NewGuid(),
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            ScheduledTime = scheduledTime,
            MigrationName = migrationName,
            ModuleName = moduleName,
            Status = "Scheduled",
            Message = $"Migration scheduled for {scheduledTime:yyyy-MM-dd HH:mm} (Feature in development)"
        };
    }

    public async Task<List<ScheduledMigrationDto>> GetScheduledMigrationsAsync(CancellationToken cancellationToken = default)
    {
        // TODO: Implement with database table to store scheduled migrations
        _logger.LogInformation("Getting scheduled migrations");

        return new List<ScheduledMigrationDto>();
    }

    public async Task<bool> CancelScheduledMigrationAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        // TODO: Implement with Hangfire background job cancellation
        _logger.LogInformation("Cancelling scheduled migration {ScheduleId}", scheduleId);

        return await Task.FromResult(false);
    }

    public async Task<MigrationSettingsDto> GetMigrationSettingsAsync(CancellationToken cancellationToken = default)
    {
        // TODO: Implement with configuration storage (database or file)
        _logger.LogInformation("Getting migration settings");

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
        // TODO: Implement with configuration storage (database or file)
        _logger.LogInformation("Updating migration settings");

        return await Task.FromResult(settings);
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