using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using Stocker.Application.Common.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace Stocker.Persistence.Services;

/// <summary>
/// Implements per-tenant PostgreSQL user management and secure connection string handling.
///
/// Security Features:
/// - Each tenant gets a dedicated PostgreSQL user (tenant_user_{shortId})
/// - Users are restricted to their specific database only
/// - Passwords are cryptographically secure (32 bytes of randomness)
/// - Connection strings are encrypted using ASP.NET Core Data Protection
/// - Users have minimal required privileges (no SUPERUSER, no CREATEDB)
/// </summary>
public class TenantDatabaseSecurityService : ITenantDatabaseSecurityService
{
    private readonly IConfiguration _configuration;
    private readonly IEncryptionService _encryptionService;
    private readonly ILogger<TenantDatabaseSecurityService> _logger;

    // Password rotation policy (90 days recommended for compliance)
    private static readonly TimeSpan PasswordRotationPeriod = TimeSpan.FromDays(90);

    public TenantDatabaseSecurityService(
        IConfiguration configuration,
        IEncryptionService encryptionService,
        ILogger<TenantDatabaseSecurityService> logger)
    {
        _configuration = configuration;
        _encryptionService = encryptionService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<TenantDatabaseCredentials> CreateTenantDatabaseUserAsync(Guid tenantId, string databaseName)
    {
        var username = GenerateTenantUsername(tenantId);
        var password = GenerateSecurePassword();

        _logger.LogInformation(
            "Creating PostgreSQL user {Username} for tenant {TenantId}, database {DatabaseName}",
            username, tenantId, databaseName);

        try
        {
            await using var masterConnection = await GetMasterConnectionAsync();

            // 1. Create the user with login privilege
            await ExecuteNonQueryAsync(masterConnection, $@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{username}') THEN
                        CREATE USER ""{username}"" WITH LOGIN PASSWORD '{EscapeSqlString(password)}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
                    END IF;
                END
                $$;
            ");

            // 2. Grant connect privilege to the specific database only
            await ExecuteNonQueryAsync(masterConnection, $@"
                GRANT CONNECT ON DATABASE ""{databaseName}"" TO ""{username}"";
            ");

            // 3. Connect to the tenant database to grant schema permissions
            await using var tenantConnection = await GetTenantConnectionAsync(databaseName);

            // 4. Grant schema usage and all privileges on the public schema
            await ExecuteNonQueryAsync(tenantConnection, $@"
                GRANT USAGE ON SCHEMA public TO ""{username}"";
                GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ""{username}"";
                GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ""{username}"";
                GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ""{username}"";

                -- Also grant for future tables/sequences created by migrations
                ALTER DEFAULT PRIVILEGES IN SCHEMA public
                    GRANT ALL PRIVILEGES ON TABLES TO ""{username}"";
                ALTER DEFAULT PRIVILEGES IN SCHEMA public
                    GRANT ALL PRIVILEGES ON SEQUENCES TO ""{username}"";
            ");

            // 5. Revoke access to other databases (security hardening)
            // Note: By default, PUBLIC has CONNECT on all databases, we revoke it for this user
            await ExecuteNonQueryAsync(masterConnection, $@"
                REVOKE CONNECT ON DATABASE postgres FROM ""{username}"";
            ");

            _logger.LogInformation(
                "Successfully created PostgreSQL user {Username} for tenant {TenantId}",
                username, tenantId);

            // Build the connection string with tenant credentials
            var connectionString = BuildTenantConnectionString(databaseName, username, password);
            var encryptedConnectionString = EncryptConnectionString(connectionString);

            return new TenantDatabaseCredentials
            {
                Username = username,
                Password = password, // Only returned once, not stored
                ConnectionString = connectionString,
                EncryptedConnectionString = encryptedConnectionString,
                DatabaseName = databaseName,
                CreatedAt = DateTime.UtcNow,
                RotateAfter = DateTime.UtcNow.Add(PasswordRotationPeriod)
            };
        }
        catch (PostgresException ex)
        {
            _logger.LogError(ex,
                "PostgreSQL error creating user {Username} for tenant {TenantId}: {ErrorMessage}",
                username, tenantId, ex.Message);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unexpected error creating database user for tenant {TenantId}",
                tenantId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task RevokeTenantDatabaseUserAsync(Guid tenantId, string databaseName)
    {
        var username = GenerateTenantUsername(tenantId);

        _logger.LogInformation(
            "Revoking PostgreSQL user {Username} for tenant {TenantId}",
            username, tenantId);

        try
        {
            await using var masterConnection = await GetMasterConnectionAsync();

            // 1. First, revoke all privileges
            await ExecuteNonQuerySafeAsync(masterConnection, $@"
                REVOKE ALL PRIVILEGES ON DATABASE ""{databaseName}"" FROM ""{username}"";
            ");

            // 2. Connect to tenant database to revoke schema permissions
            try
            {
                await using var tenantConnection = await GetTenantConnectionAsync(databaseName);
                await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                    REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ""{username}"";
                    REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM ""{username}"";
                    REVOKE USAGE ON SCHEMA public FROM ""{username}"";
                ");
            }
            catch (PostgresException ex) when (ex.SqlState == "3D000") // Database does not exist
            {
                _logger.LogWarning(
                    "Database {DatabaseName} does not exist, skipping schema revocation",
                    databaseName);
            }

            // 3. Terminate any active connections from this user
            await ExecuteNonQuerySafeAsync(masterConnection, $@"
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE usename = '{username}';
            ");

            // 4. Drop the user
            await ExecuteNonQuerySafeAsync(masterConnection, $@"
                DROP USER IF EXISTS ""{username}"";
            ");

            _logger.LogInformation(
                "Successfully revoked and dropped PostgreSQL user {Username}",
                username);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error revoking database user for tenant {TenantId}",
                tenantId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<TenantDatabaseCredentials> RotateTenantCredentialsAsync(Guid tenantId, string databaseName)
    {
        var username = GenerateTenantUsername(tenantId);
        var newPassword = GenerateSecurePassword();

        _logger.LogInformation(
            "Rotating password for PostgreSQL user {Username}, tenant {TenantId}",
            username, tenantId);

        try
        {
            await using var masterConnection = await GetMasterConnectionAsync();

            // Update password
            await ExecuteNonQueryAsync(masterConnection, $@"
                ALTER USER ""{username}"" WITH PASSWORD '{EscapeSqlString(newPassword)}';
            ");

            _logger.LogInformation(
                "Successfully rotated password for PostgreSQL user {Username}",
                username);

            var connectionString = BuildTenantConnectionString(databaseName, username, newPassword);
            var encryptedConnectionString = EncryptConnectionString(connectionString);

            return new TenantDatabaseCredentials
            {
                Username = username,
                Password = newPassword,
                ConnectionString = connectionString,
                EncryptedConnectionString = encryptedConnectionString,
                DatabaseName = databaseName,
                CreatedAt = DateTime.UtcNow,
                RotateAfter = DateTime.UtcNow.Add(PasswordRotationPeriod)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error rotating credentials for tenant {TenantId}",
                tenantId);
            throw;
        }
    }

    /// <inheritdoc />
    public string EncryptConnectionString(string connectionString)
    {
        if (string.IsNullOrEmpty(connectionString))
            return connectionString;

        return _encryptionService.Encrypt(connectionString);
    }

    /// <inheritdoc />
    public string DecryptConnectionString(string encryptedConnectionString)
    {
        if (string.IsNullOrEmpty(encryptedConnectionString))
            return encryptedConnectionString;

        // Check if it's already decrypted (starts with "Host=" for PostgreSQL)
        if (encryptedConnectionString.StartsWith("Host=", StringComparison.OrdinalIgnoreCase))
            return encryptedConnectionString;

        return _encryptionService.Decrypt(encryptedConnectionString);
    }

    /// <inheritdoc />
    public async Task<bool> ValidateTenantPermissionsAsync(Guid tenantId, string connectionString)
    {
        var username = GenerateTenantUsername(tenantId);

        try
        {
            var decrypted = DecryptConnectionString(connectionString);
            await using var connection = new NpgsqlConnection(decrypted);
            await connection.OpenAsync();

            // Test basic operations
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT current_user, current_database()";
            await using var reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                var currentUser = reader.GetString(0);
                var currentDb = reader.GetString(1);

                _logger.LogDebug(
                    "Validated tenant {TenantId}: User={User}, Database={Database}",
                    tenantId, currentUser, currentDb);

                return currentUser == username;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Permission validation failed for tenant {TenantId}",
                tenantId);
            return false;
        }
    }

    #region Private Helper Methods

    /// <summary>
    /// Generates a unique username for a tenant: tenant_user_{shortId}
    /// Uses first 12 characters of GUID for readability while maintaining uniqueness
    /// </summary>
    private static string GenerateTenantUsername(Guid tenantId)
    {
        var shortId = tenantId.ToString("N")[..12].ToLowerInvariant();
        return $"tenant_user_{shortId}";
    }

    /// <summary>
    /// Generates a cryptographically secure password.
    /// 32 bytes of randomness = 256 bits of entropy
    /// </summary>
    private static string GenerateSecurePassword()
    {
        var passwordBytes = new byte[32];
        RandomNumberGenerator.Fill(passwordBytes);

        // Convert to base64 and make it SQL-safe (remove special chars that might cause issues)
        var password = Convert.ToBase64String(passwordBytes)
            .Replace("+", "x")
            .Replace("/", "y")
            .Replace("=", "z");

        return password;
    }

    /// <summary>
    /// Escapes single quotes in SQL strings to prevent injection
    /// </summary>
    private static string EscapeSqlString(string value)
    {
        return value.Replace("'", "''");
    }

    /// <summary>
    /// Gets a connection to the master PostgreSQL database for admin operations
    /// </summary>
    private async Task<NpgsqlConnection> GetMasterConnectionAsync()
    {
        var masterConnectionString = _configuration.GetConnectionString("MasterConnection");
        if (string.IsNullOrEmpty(masterConnectionString))
            throw new InvalidOperationException("MasterConnection string not configured");

        var builder = new NpgsqlConnectionStringBuilder(masterConnectionString)
        {
            Database = "postgres" // Connect to postgres for admin operations
        };

        var connection = new NpgsqlConnection(builder.ConnectionString);
        await connection.OpenAsync();
        return connection;
    }

    /// <summary>
    /// Gets a connection to a specific tenant database using master credentials
    /// </summary>
    private async Task<NpgsqlConnection> GetTenantConnectionAsync(string databaseName)
    {
        var masterConnectionString = _configuration.GetConnectionString("MasterConnection");
        if (string.IsNullOrEmpty(masterConnectionString))
            throw new InvalidOperationException("MasterConnection string not configured");

        var builder = new NpgsqlConnectionStringBuilder(masterConnectionString)
        {
            Database = databaseName
        };

        var connection = new NpgsqlConnection(builder.ConnectionString);
        await connection.OpenAsync();
        return connection;
    }

    /// <summary>
    /// Builds a connection string for a tenant using their dedicated credentials
    /// </summary>
    private string BuildTenantConnectionString(string databaseName, string username, string password)
    {
        var masterConnectionString = _configuration.GetConnectionString("MasterConnection");
        if (string.IsNullOrEmpty(masterConnectionString))
            throw new InvalidOperationException("MasterConnection string not configured");

        var builder = new NpgsqlConnectionStringBuilder(masterConnectionString)
        {
            Database = databaseName,
            Username = username,
            Password = password
        };

        return builder.ConnectionString;
    }

    /// <summary>
    /// Executes a SQL command that doesn't return results
    /// </summary>
    private static async Task ExecuteNonQueryAsync(NpgsqlConnection connection, string sql)
    {
        await using var cmd = connection.CreateCommand();
        cmd.CommandText = sql;
        await cmd.ExecuteNonQueryAsync();
    }

    /// <summary>
    /// Executes a SQL command, ignoring errors (for cleanup operations)
    /// </summary>
    private async Task ExecuteNonQuerySafeAsync(NpgsqlConnection connection, string sql)
    {
        try
        {
            await ExecuteNonQueryAsync(connection, sql);
        }
        catch (PostgresException ex)
        {
            _logger.LogWarning(
                "SQL command failed (non-critical): {ErrorMessage}",
                ex.Message);
        }
    }

    #endregion
}
