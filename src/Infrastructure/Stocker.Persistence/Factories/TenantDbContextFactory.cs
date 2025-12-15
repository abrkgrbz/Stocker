using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;
using Stocker.Domain.Master.Entities;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace Stocker.Persistence.Factories;

public class TenantDbContextFactory : ITenantDbContextFactory
{
    private readonly IMasterDbContext _masterContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TenantDbContextFactory> _logger;
    private readonly ITenantDatabaseSecurityService? _securityService;

    public TenantDbContextFactory(
        IMasterDbContext masterContext,
        IConfiguration configuration,
        ILogger<TenantDbContextFactory> logger,
        ITenantDatabaseSecurityService? securityService = null)
    {
        _masterContext = masterContext;
        _configuration = configuration;
        _logger = logger;
        _securityService = securityService;
    }

    public async Task<ITenantDbContext> CreateDbContextAsync(Guid tenantId)
    {
        var stopwatch = Stopwatch.StartNew();
        var connectionString = await GetTenantConnectionStringAsync(tenantId);

        // Parse connection string to extract connection details for logging
        var connectionInfo = ParseConnectionStringForLogging(connectionString);

        _logger.LogInformation(
            "🔌 Connecting to tenant database: TenantId={TenantId}, Database={Database}, User={User}, Host={Host}",
            tenantId,
            connectionInfo.Database,
            connectionInfo.Username,
            connectionInfo.Host);

        var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorCodesToAdd: null);
        });

        // Suppress PendingModelChangesWarning for navigation configuration changes that don't affect schema
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

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
            // Test the connection by opening it
            await context.Database.OpenConnectionAsync();
            stopwatch.Stop();

            _logger.LogInformation(
                "✅ Tenant database connection successful: TenantId={TenantId}, Database={Database}, User={User}, ConnectionTime={ElapsedMs}ms",
                tenantId,
                connectionInfo.Database,
                connectionInfo.Username,
                stopwatch.ElapsedMilliseconds);

            // Close and let EF manage the connection
            await context.Database.CloseConnectionAsync();

            // Ensure database exists and is migrated
            _logger.LogDebug("Ensuring database is migrated for tenant {TenantId}", tenantId);
            await context.Database.MigrateAsync();
            _logger.LogInformation("Tenant database ready for tenant {TenantId}", tenantId);
        }
        catch (NpgsqlException npgsqlEx)
        {
            stopwatch.Stop();
            _logger.LogError(npgsqlEx,
                "❌ Tenant database connection FAILED: TenantId={TenantId}, Database={Database}, User={User}, Error={ErrorMessage}, SqlState={SqlState}, ConnectionTime={ElapsedMs}ms",
                tenantId,
                connectionInfo.Database,
                connectionInfo.Username,
                npgsqlEx.Message,
                npgsqlEx.SqlState,
                stopwatch.ElapsedMilliseconds);
            throw;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogWarning(ex,
                "⚠️ Failed to ensure database exists for tenant {TenantId}. Database may need manual migration. ConnectionTime={ElapsedMs}ms",
                tenantId,
                stopwatch.ElapsedMilliseconds);
            // Don't throw - let the application continue and fail on actual database operations
            // This allows for better error messages and retry logic
        }

        _logger.LogDebug("Created TenantDbContext for tenant {TenantId}", tenantId);

        return context;
    }

    /// <summary>
    /// Parses connection string to extract safe logging information (no password)
    /// </summary>
    private static (string Host, string Database, string Username) ParseConnectionStringForLogging(string connectionString)
    {
        try
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString);
            return (
                Host: builder.Host ?? "unknown",
                Database: builder.Database ?? "unknown",
                Username: builder.Username ?? "unknown"
            );
        }
        catch
        {
            return ("unknown", "unknown", "unknown");
        }
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

        _logger.LogInformation(
            "🔍 Resolving connection string for tenant {TenantId}: EncryptedCS={HasEncrypted}, PlainCS={HasPlain}, SecurityService={HasSecurityService}",
            tenantId,
            !string.IsNullOrEmpty(tenant.EncryptedConnectionString),
            tenant.ConnectionString != null && !string.IsNullOrEmpty(tenant.ConnectionString.Value),
            _securityService != null);

        // Priority: Use encrypted connection string if available (more secure)
        if (!string.IsNullOrEmpty(tenant.EncryptedConnectionString) && _securityService != null)
        {
            _logger.LogInformation(
                "🔐 Tenant {TenantId} has encrypted connection string: {EncryptedValue}",
                tenantId,
                tenant.EncryptedConnectionString.Length > 50
                    ? tenant.EncryptedConnectionString.Substring(0, 50) + "..."
                    : tenant.EncryptedConnectionString);

            try
            {
                var decrypted = _securityService.DecryptConnectionString(tenant.EncryptedConnectionString);
                if (!string.IsNullOrEmpty(decrypted))
                {
                    _logger.LogInformation("✅ Using encrypted/decrypted connection string for tenant {TenantId}", tenantId);
                    return decrypted;
                }
                else
                {
                    _logger.LogWarning(
                        "⚠️ Decryption returned empty string for tenant {TenantId}. Encrypted value was: {EncryptedValue}",
                        tenantId,
                        tenant.EncryptedConnectionString);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "❌ Failed to decrypt connection string for tenant {TenantId}. Falling back to plain connection string.",
                    tenantId);
            }
        }

        // Fallback: Use plain connection string
        if (tenant.ConnectionString == null || string.IsNullOrEmpty(tenant.ConnectionString.Value))
        {
            _logger.LogError("❌ Tenant {TenantId} has no connection string configured (neither encrypted nor plain)", tenantId);
            throw new InvalidOperationException($"Tenant {tenantId} has no connection string configured.");
        }

        _logger.LogWarning("⚠️ Using plain (unencrypted) connection string for tenant {TenantId} - consider migrating to encrypted storage", tenantId);
        return tenant.ConnectionString.Value;
    }
}