using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Services;

/// <summary>
/// Service for handling complete tenant deletion including database cleanup.
/// DANGER: This service performs irreversible operations.
/// </summary>
public class TenantDeletionService : ITenantDeletionService
{
    private readonly MasterDbContext _masterContext;
    private readonly ITenantDatabaseSecurityService _securityService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TenantDeletionService> _logger;

    public TenantDeletionService(
        MasterDbContext masterContext,
        ITenantDatabaseSecurityService securityService,
        IConfiguration configuration,
        ILogger<TenantDeletionService> logger)
    {
        _masterContext = masterContext;
        _securityService = securityService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<bool> IsUserTenantOwnerAsync(Guid userId, Guid tenantId)
    {
        // Check if user created the tenant registration (owner)
        var registration = await _masterContext.TenantRegistrations
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.TenantId == tenantId);

        if (registration == null)
        {
            // Fallback: Check if the user is the first user or has admin role
            // This could be extended based on your role system
            return false;
        }

        // Check if the user email matches the registration contact email
        var user = await _masterContext.MasterUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return false;

        // User is owner if they registered the tenant
        return string.Equals(user.Email.Value, registration.ContactEmail.Value, StringComparison.OrdinalIgnoreCase);
    }

    /// <inheritdoc />
    public async Task<TenantDeletionSummary> GetDeletionSummaryAsync(Guid tenantId)
    {
        var tenant = await _masterContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
        {
            return new TenantDeletionSummary
            {
                TenantId = tenantId,
                Warnings = new List<string> { "Tenant bulunamadı" }
            };
        }

        var summary = new TenantDeletionSummary
        {
            TenantId = tenantId,
            TenantName = tenant.Name,
            DatabaseName = tenant.DatabaseName,
            CreatedAt = tenant.CreatedAt,
            Warnings = new List<string>()
        };

        // Try to get counts from tenant database
        try
        {
            var connectionString = tenant.ConnectionString?.Value;
            if (!string.IsNullOrEmpty(connectionString))
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();

                // Get user count
                summary.UserCount = await GetTableCountAsync(connection, "TenantUsers");

                // Get product count (if table exists)
                summary.ProductCount = await GetTableCountAsync(connection, "Products");

                // Get order count (if table exists)
                summary.OrderCount = await GetTableCountAsync(connection, "Orders");

                // Get customer count (if table exists)
                summary.CustomerCount = await GetTableCountAsync(connection, "Customers");

                // Get estimated database size
                summary.EstimatedDataSizeMB = await GetDatabaseSizeMBAsync(connection, tenant.DatabaseName);

                // Get last activity
                summary.LastActivityAt = await GetLastActivityAsync(connection);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not retrieve tenant data summary for {TenantId}", tenantId);
            summary.Warnings.Add("Veritabanı istatistikleri alınamadı");
        }

        // Add warnings based on data
        if (summary.UserCount > 1)
        {
            summary.Warnings.Add($"{summary.UserCount} kullanıcı hesabı silinecek");
        }

        if (summary.ProductCount > 0)
        {
            summary.Warnings.Add($"{summary.ProductCount} ürün kaydı silinecek");
        }

        if (summary.OrderCount > 0)
        {
            summary.Warnings.Add($"{summary.OrderCount} sipariş kaydı silinecek");
        }

        if (summary.EstimatedDataSizeMB > 100)
        {
            summary.Warnings.Add($"Yaklaşık {summary.EstimatedDataSizeMB} MB veri silinecek");
        }

        return summary;
    }

    /// <inheritdoc />
    public async Task<TenantDeletionResult> DeleteTenantAsync(Guid tenantId, Guid requestingUserId)
    {
        _logger.LogWarning(
            "🚨 TENANT DELETION STARTED: TenantId={TenantId}, RequestedBy={UserId}",
            tenantId, requestingUserId);

        try
        {
            // 1. Verify the requesting user is the owner
            var isOwner = await IsUserTenantOwnerAsync(requestingUserId, tenantId);
            if (!isOwner)
            {
                _logger.LogWarning(
                    "User {UserId} is not authorized to delete tenant {TenantId}",
                    requestingUserId, tenantId);
                return TenantDeletionResult.Failed("Bu işlem için yetkiniz yok. Sadece firma sahibi silme işlemi yapabilir.");
            }

            // 2. Get tenant info
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                return TenantDeletionResult.Failed("Firma bulunamadı");
            }

            var databaseName = tenant.DatabaseName;

            // 3. Revoke database user access
            try
            {
                await _securityService.RevokeTenantDatabaseUserAsync(tenantId, databaseName);
                _logger.LogInformation("Database user revoked for tenant {TenantId}", tenantId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to revoke database user for tenant {TenantId}", tenantId);
            }

            // 4. Drop the tenant database
            var databaseDropped = await DropTenantDatabaseAsync(databaseName);

            // 5. Delete related records from master database
            // Delete subscriptions
            var subscriptions = await _masterContext.Subscriptions
                .Where(s => s.TenantId == tenantId)
                .ToListAsync();
            _masterContext.Subscriptions.RemoveRange(subscriptions);

            // Delete contracts
            var contracts = await _masterContext.TenantContracts
                .Where(c => c.TenantId == tenantId)
                .ToListAsync();
            _masterContext.TenantContracts.RemoveRange(contracts);

            // Delete registration
            var registrations = await _masterContext.TenantRegistrations
                .Where(r => r.TenantId == tenantId)
                .ToListAsync();
            _masterContext.TenantRegistrations.RemoveRange(registrations);

            // Delete billing info
            var billings = await _masterContext.TenantBillings
                .Where(b => b.TenantId == tenantId)
                .ToListAsync();
            _masterContext.TenantBillings.RemoveRange(billings);

            // Delete tenant domains
            var domains = await _masterContext.TenantDomains
                .Where(d => d.TenantId == tenantId)
                .ToListAsync();
            _masterContext.TenantDomains.RemoveRange(domains);

            // Delete health checks
            var healthChecks = await _masterContext.TenantHealthChecks
                .Where(h => h.TenantId == tenantId)
                .ToListAsync();
            _masterContext.TenantHealthChecks.RemoveRange(healthChecks);

            // Delete backups
            var backups = await _masterContext.TenantBackups
                .Where(b => b.TenantId == tenantId)
                .ToListAsync();
            _masterContext.TenantBackups.RemoveRange(backups);

            // Finally, delete the tenant itself
            _masterContext.Tenants.Remove(tenant);

            await _masterContext.SaveChangesAsync();

            _logger.LogWarning(
                "🗑️ TENANT DELETED: TenantId={TenantId}, Database={DatabaseName}, DeletedBy={UserId}",
                tenantId, databaseName, requestingUserId);

            return new TenantDeletionResult
            {
                Success = true,
                DeletedAt = DateTime.UtcNow,
                DatabaseDropped = databaseDropped,
                UsersDeleted = true,
                TenantRecordDeleted = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to delete tenant {TenantId}",
                tenantId);
            return TenantDeletionResult.Failed($"Silme işlemi başarısız: {ex.Message}");
        }
    }

    /// <inheritdoc />
    public async Task<DateTime> ScheduleTenantDeletionAsync(Guid tenantId, int gracePeriodDays = 30)
    {
        var tenant = await _masterContext.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
        {
            throw new InvalidOperationException("Tenant not found");
        }

        // Deactivate the tenant immediately
        if (tenant.IsActive)
        {
            tenant.Deactivate();
        }

        var scheduledDeletionDate = DateTime.UtcNow.AddDays(gracePeriodDays);

        // You could add a ScheduledForDeletion field to Tenant entity
        // For now, we'll just log and return the date
        _logger.LogWarning(
            "Tenant {TenantId} scheduled for deletion on {DeletionDate}",
            tenantId, scheduledDeletionDate);

        await _masterContext.SaveChangesAsync();

        return scheduledDeletionDate;
    }

    /// <inheritdoc />
    public async Task<bool> CancelScheduledDeletionAsync(Guid tenantId)
    {
        var tenant = await _masterContext.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
        {
            return false;
        }

        // Reactivate the tenant
        if (!tenant.IsActive)
        {
            tenant.Activate();
            await _masterContext.SaveChangesAsync();
        }

        _logger.LogInformation(
            "Scheduled deletion cancelled for tenant {TenantId}",
            tenantId);

        return true;
    }

    #region Private Methods

    private async Task<bool> DropTenantDatabaseAsync(string databaseName)
    {
        try
        {
            var masterConnectionString = _configuration.GetConnectionString("MasterConnection");
            if (string.IsNullOrEmpty(masterConnectionString))
            {
                _logger.LogError("MasterConnection string not configured");
                return false;
            }

            var builder = new NpgsqlConnectionStringBuilder(masterConnectionString)
            {
                Database = "postgres" // Connect to postgres for admin operations
            };

            await using var connection = new NpgsqlConnection(builder.ConnectionString);
            await connection.OpenAsync();

            // Terminate all connections to the database
            await using (var cmd = connection.CreateCommand())
            {
                cmd.CommandText = $@"
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = '{databaseName}'
                    AND pid <> pg_backend_pid();
                ";
                await cmd.ExecuteNonQueryAsync();
            }

            // Wait a moment for connections to close
            await Task.Delay(500);

            // Drop the database
            await using (var cmd = connection.CreateCommand())
            {
                cmd.CommandText = $@"DROP DATABASE IF EXISTS ""{databaseName}"";";
                await cmd.ExecuteNonQueryAsync();
            }

            _logger.LogInformation("Database {DatabaseName} dropped successfully", databaseName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to drop database {DatabaseName}", databaseName);
            return false;
        }
    }

    private static async Task<int> GetTableCountAsync(NpgsqlConnection connection, string tableName)
    {
        try
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = $@"
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_name = '{tableName}'
                AND table_schema = 'public';
            ";
            var exists = Convert.ToInt32(await cmd.ExecuteScalarAsync()) > 0;

            if (!exists) return 0;

            cmd.CommandText = $@"SELECT COUNT(*) FROM ""{tableName}"";";
            return Convert.ToInt32(await cmd.ExecuteScalarAsync());
        }
        catch
        {
            return 0;
        }
    }

    private static async Task<long> GetDatabaseSizeMBAsync(NpgsqlConnection connection, string databaseName)
    {
        try
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = $@"SELECT pg_database_size('{databaseName}') / (1024 * 1024);";
            return Convert.ToInt64(await cmd.ExecuteScalarAsync());
        }
        catch
        {
            return 0;
        }
    }

    private static async Task<DateTime?> GetLastActivityAsync(NpgsqlConnection connection)
    {
        try
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                SELECT MAX(""Timestamp"")
                FROM ""AuditLogs""
                WHERE ""Timestamp"" IS NOT NULL;
            ";
            var result = await cmd.ExecuteScalarAsync();
            return result as DateTime?;
        }
        catch
        {
            return null;
        }
    }

    #endregion
}
