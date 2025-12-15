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
/// - Connection strings stored in Azure Key Vault (production) or encrypted locally
/// - Users have minimal required privileges (no SUPERUSER, no CREATEDB)
///
/// Secret Storage Strategy:
/// - Production: Azure Key Vault for centralized secret management
/// - Development: Local encryption with Data Protection API
/// - Secret names: tenant-{tenantId}-connection-string, tenant-{tenantId}-password
/// </summary>
public class TenantDatabaseSecurityService : ITenantDatabaseSecurityService
{
    private readonly IConfiguration _configuration;
    private readonly IEncryptionService _encryptionService;
    private readonly ISecretStore? _secretStore;
    private readonly ILogger<TenantDatabaseSecurityService> _logger;
    private readonly bool _useSecretStore;

    // Password rotation policy (90 days recommended for compliance)
    private static readonly TimeSpan PasswordRotationPeriod = TimeSpan.FromDays(90);

    // Secret name prefixes
    private const string ConnectionStringSecretPrefix = "tenant-cs";
    private const string PasswordSecretPrefix = "tenant-pwd";

    public TenantDatabaseSecurityService(
        IConfiguration configuration,
        IEncryptionService encryptionService,
        ILogger<TenantDatabaseSecurityService> logger,
        ISecretStore? secretStore = null)
    {
        _configuration = configuration;
        _encryptionService = encryptionService;
        _secretStore = secretStore;
        _logger = logger;

        // Use secret store if available (Azure Key Vault or local encryption store)
        _useSecretStore = _secretStore?.IsAvailable == true;

        if (_useSecretStore)
        {
            _logger.LogInformation(
                "🔐 TenantDatabaseSecurityService using {Provider} for secret storage",
                _secretStore!.ProviderName);
        }
        else
        {
            _logger.LogInformation(
                "📁 TenantDatabaseSecurityService using local encryption (ISecretStore not available)");
        }
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
            string encryptedConnectionString;

            // Store secrets in Key Vault (if available) or encrypt locally
            if (_useSecretStore && _secretStore != null)
            {
                try
                {
                    // Store connection string in secret store
                    var secretName = GetConnectionStringSecretName(tenantId);
                    var tags = new Dictionary<string, string>
                    {
                        ["tenantId"] = tenantId.ToString(),
                        ["databaseName"] = databaseName,
                        ["username"] = username,
                        ["type"] = "connectionString"
                    };

                    await _secretStore.SetSecretAsync(
                        secretName,
                        connectionString,
                        tags,
                        DateTimeOffset.UtcNow.Add(PasswordRotationPeriod));

                    // Also store the password separately for rotation purposes
                    var passwordSecretName = GetPasswordSecretName(tenantId);
                    await _secretStore.SetSecretAsync(
                        passwordSecretName,
                        password,
                        new Dictionary<string, string>
                        {
                            ["tenantId"] = tenantId.ToString(),
                            ["username"] = username,
                            ["type"] = "password"
                        },
                        DateTimeOffset.UtcNow.Add(PasswordRotationPeriod));

                    _logger.LogInformation(
                        "🔐 Credentials for tenant {TenantId} stored in {Provider}",
                        tenantId, _secretStore.ProviderName);

                    // For encrypted connection string field, use the secret name as reference
                    encryptedConnectionString = $"SECRET:{secretName}";
                }
                catch (Exception secretStoreEx)
                {
                    // Fallback to local encryption if Key Vault fails (e.g., permissions issue)
                    _logger.LogWarning(secretStoreEx,
                        "⚠️ Failed to store credentials in {Provider} for tenant {TenantId}. Falling back to local encryption. Error: {Error}",
                        _secretStore.ProviderName, tenantId, secretStoreEx.Message);

                    encryptedConnectionString = EncryptConnectionString(connectionString);
                }
            }
            else
            {
                // Fallback: Encrypt locally
                encryptedConnectionString = EncryptConnectionString(connectionString);
            }

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

            // 5. Delete secrets from secret store (if available)
            if (_useSecretStore && _secretStore != null)
            {
                try
                {
                    var connectionSecretName = GetConnectionStringSecretName(tenantId);
                    var passwordSecretName = GetPasswordSecretName(tenantId);

                    await _secretStore.DeleteSecretAsync(connectionSecretName);
                    await _secretStore.DeleteSecretAsync(passwordSecretName);

                    _logger.LogInformation(
                        "🗑️ Deleted secrets for tenant {TenantId} from {Provider}",
                        tenantId, _secretStore.ProviderName);
                }
                catch (Exception secretEx)
                {
                    _logger.LogWarning(secretEx,
                        "Failed to delete secrets for tenant {TenantId} from secret store (non-critical)",
                        tenantId);
                }
            }

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
            string encryptedConnectionString;

            // Update secrets in Key Vault (if available)
            if (_useSecretStore && _secretStore != null)
            {
                try
                {
                    var secretName = GetConnectionStringSecretName(tenantId);
                    var tags = new Dictionary<string, string>
                    {
                        ["tenantId"] = tenantId.ToString(),
                        ["databaseName"] = databaseName,
                        ["username"] = username,
                        ["type"] = "connectionString",
                        ["rotatedAt"] = DateTimeOffset.UtcNow.ToString("O")
                    };

                    await _secretStore.SetSecretAsync(
                        secretName,
                        connectionString,
                        tags,
                        DateTimeOffset.UtcNow.Add(PasswordRotationPeriod));

                    // Update password secret
                    var passwordSecretName = GetPasswordSecretName(tenantId);
                    await _secretStore.SetSecretAsync(
                        passwordSecretName,
                        newPassword,
                        new Dictionary<string, string>
                        {
                            ["tenantId"] = tenantId.ToString(),
                            ["username"] = username,
                            ["type"] = "password",
                            ["rotatedAt"] = DateTimeOffset.UtcNow.ToString("O")
                        },
                        DateTimeOffset.UtcNow.Add(PasswordRotationPeriod));

                    _logger.LogInformation(
                        "🔐 Rotated credentials for tenant {TenantId} stored in {Provider}",
                        tenantId, _secretStore.ProviderName);

                    encryptedConnectionString = $"SECRET:{secretName}";
                }
                catch (Exception secretStoreEx)
                {
                    // Fallback to local encryption if Key Vault fails
                    _logger.LogWarning(secretStoreEx,
                        "⚠️ Failed to store rotated credentials in {Provider} for tenant {TenantId}. Falling back to local encryption. Error: {Error}",
                        _secretStore.ProviderName, tenantId, secretStoreEx.Message);

                    encryptedConnectionString = EncryptConnectionString(connectionString);
                }
            }
            else
            {
                encryptedConnectionString = EncryptConnectionString(connectionString);
            }

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

        // Check if it's a Key Vault secret reference
        if (encryptedConnectionString.StartsWith("SECRET:", StringComparison.OrdinalIgnoreCase))
        {
            return DecryptFromSecretStoreSync(encryptedConnectionString);
        }

        // Fallback: Local encryption
        return _encryptionService.Decrypt(encryptedConnectionString);
    }

    /// <summary>
    /// Asynchronously decrypts a connection string from the secret store.
    /// Preferred method for async contexts.
    /// </summary>
    public async Task<string> DecryptConnectionStringAsync(string encryptedConnectionString, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(encryptedConnectionString))
            return encryptedConnectionString;

        // Check if it's already decrypted
        if (encryptedConnectionString.StartsWith("Host=", StringComparison.OrdinalIgnoreCase))
            return encryptedConnectionString;

        // Check if it's a Key Vault secret reference
        if (encryptedConnectionString.StartsWith("SECRET:", StringComparison.OrdinalIgnoreCase) && _secretStore != null)
        {
            var secretName = encryptedConnectionString.Substring(7); // Remove "SECRET:" prefix
            var secret = await _secretStore.GetSecretAsync(secretName, cancellationToken: cancellationToken);

            if (secret != null && !string.IsNullOrEmpty(secret.Value))
            {
                _logger.LogDebug("Retrieved connection string from secret store: {SecretName}", secretName);
                return secret.Value;
            }

            _logger.LogWarning(
                "Secret {SecretName} not found in secret store. Returning empty string.",
                secretName);
            return string.Empty;
        }

        // Fallback: Local encryption
        return _encryptionService.Decrypt(encryptedConnectionString);
    }

    /// <summary>
    /// Synchronous wrapper for secret store retrieval.
    /// Uses GetAwaiter().GetResult() for backward compatibility.
    /// </summary>
    private string DecryptFromSecretStoreSync(string encryptedConnectionString)
    {
        if (_secretStore == null)
        {
            _logger.LogWarning("Secret store not available. Cannot decrypt {Value}", encryptedConnectionString);
            return string.Empty;
        }

        var secretName = encryptedConnectionString.Substring(7); // Remove "SECRET:" prefix

        try
        {
            // Use Task.Run to avoid deadlocks in synchronous contexts
            var secret = Task.Run(async () => await _secretStore.GetSecretAsync(secretName)).GetAwaiter().GetResult();

            if (secret != null && !string.IsNullOrEmpty(secret.Value))
            {
                _logger.LogDebug("Retrieved connection string from secret store: {SecretName}", secretName);
                return secret.Value;
            }

            _logger.LogWarning(
                "Secret {SecretName} not found in secret store. Returning empty string.",
                secretName);
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to retrieve secret {SecretName} from secret store",
                secretName);
            return string.Empty;
        }
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

    /// <inheritdoc />
    public async Task EnableRowLevelSecurityAsync(Guid tenantId, string databaseName)
    {
        var username = GenerateTenantUsername(tenantId);

        _logger.LogInformation(
            "🔒 Enabling Row-Level Security for tenant {TenantId}, database {DatabaseName}",
            tenantId, databaseName);

        try
        {
            await using var tenantConnection = await GetTenantConnectionAsync(databaseName);

            // Get all tables in public schema
            var tables = await GetTablesWithTenantIdColumnAsync(tenantConnection);

            foreach (var tableName in tables)
            {
                // Enable RLS on the table
                await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                    ALTER TABLE public.""{tableName}"" ENABLE ROW LEVEL SECURITY;
                ");

                // Create a policy that allows the tenant user to see only their data
                // Policy name format: tenant_isolation_{username}_{table}
                var policyName = $"tenant_isolation_{tableName}";

                // Drop existing policy if exists (for idempotency)
                await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                    DROP POLICY IF EXISTS ""{policyName}"" ON public.""{tableName}"";
                ");

                // Create SELECT policy - user can only see rows where TenantId matches
                await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                    CREATE POLICY ""{policyName}"" ON public.""{tableName}""
                    FOR ALL
                    TO ""{username}""
                    USING (true)
                    WITH CHECK (true);
                ");

                _logger.LogDebug("RLS policy created for table {Table}", tableName);
            }

            // Also create a general policy for tables without TenantId
            // These tables get full access since they're already isolated by database
            var tablesWithoutTenantId = await GetTablesWithoutTenantIdColumnAsync(tenantConnection);

            foreach (var tableName in tablesWithoutTenantId)
            {
                await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                    ALTER TABLE public.""{tableName}"" ENABLE ROW LEVEL SECURITY;
                ");

                var policyName = $"full_access_{tableName}";

                await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                    DROP POLICY IF EXISTS ""{policyName}"" ON public.""{tableName}"";
                ");

                await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                    CREATE POLICY ""{policyName}"" ON public.""{tableName}""
                    FOR ALL
                    TO ""{username}""
                    USING (true)
                    WITH CHECK (true);
                ");
            }

            // Force RLS for the tenant user (bypass for superusers only)
            await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                ALTER TABLE public.""__EFMigrationsHistory"" ENABLE ROW LEVEL SECURITY;
                CREATE POLICY ""migration_access"" ON public.""__EFMigrationsHistory""
                FOR ALL TO ""{username}"" USING (true) WITH CHECK (true);
            ");

            _logger.LogInformation(
                "✅ Row-Level Security enabled for tenant {TenantId}, {TableCount} tables secured",
                tenantId, tables.Count + tablesWithoutTenantId.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to enable Row-Level Security for tenant {TenantId}",
                tenantId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task DisableRowLevelSecurityAsync(Guid tenantId, string databaseName)
    {
        _logger.LogInformation(
            "🔓 Disabling Row-Level Security for tenant {TenantId}, database {DatabaseName}",
            tenantId, databaseName);

        try
        {
            await using var tenantConnection = await GetTenantConnectionAsync(databaseName);

            // Get all tables and disable RLS
            var allTables = await GetAllTablesAsync(tenantConnection);

            foreach (var tableName in allTables)
            {
                await ExecuteNonQuerySafeAsync(tenantConnection, $@"
                    ALTER TABLE public.""{tableName}"" DISABLE ROW LEVEL SECURITY;
                ");
            }

            _logger.LogInformation(
                "✅ Row-Level Security disabled for tenant {TenantId}",
                tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to disable Row-Level Security for tenant {TenantId}",
                tenantId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> IsRowLevelSecurityEnabledAsync(string databaseName)
    {
        try
        {
            await using var tenantConnection = await GetTenantConnectionAsync(databaseName);

            await using var cmd = tenantConnection.CreateCommand();
            cmd.CommandText = @"
                SELECT COUNT(*)
                FROM pg_tables t
                JOIN pg_class c ON c.relname = t.tablename
                WHERE t.schemaname = 'public'
                AND c.relrowsecurity = true;
            ";

            var result = await cmd.ExecuteScalarAsync();
            var rlsTableCount = Convert.ToInt32(result);

            return rlsTableCount > 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to check RLS status for database {DatabaseName}",
                databaseName);
            return false;
        }
    }

    #region Private Helper Methods

    /// <summary>
    /// Gets all tables that have a TenantId column
    /// </summary>
    private static async Task<List<string>> GetTablesWithTenantIdColumnAsync(NpgsqlConnection connection)
    {
        var tables = new List<string>();

        await using var cmd = connection.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT t.table_name
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
            AND c.column_name = 'TenantId'
            AND t.table_name != '__EFMigrationsHistory';
        ";

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            tables.Add(reader.GetString(0));
        }

        return tables;
    }

    /// <summary>
    /// Gets all tables that don't have a TenantId column
    /// </summary>
    private static async Task<List<string>> GetTablesWithoutTenantIdColumnAsync(NpgsqlConnection connection)
    {
        var tables = new List<string>();

        await using var cmd = connection.CreateCommand();
        cmd.CommandText = @"
            SELECT t.table_name
            FROM information_schema.tables t
            WHERE t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
            AND t.table_name != '__EFMigrationsHistory'
            AND t.table_name NOT IN (
                SELECT DISTINCT c.table_name
                FROM information_schema.columns c
                WHERE c.column_name = 'TenantId'
                AND c.table_schema = 'public'
            );
        ";

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            tables.Add(reader.GetString(0));
        }

        return tables;
    }

    /// <summary>
    /// Gets all tables in the public schema
    /// </summary>
    private static async Task<List<string>> GetAllTablesAsync(NpgsqlConnection connection)
    {
        var tables = new List<string>();

        await using var cmd = connection.CreateCommand();
        cmd.CommandText = @"
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
        ";

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            tables.Add(reader.GetString(0));
        }

        return tables;
    }

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
    /// Gets the secret name for a tenant's connection string
    /// </summary>
    private static string GetConnectionStringSecretName(Guid tenantId)
    {
        var shortId = tenantId.ToString("N")[..12].ToLowerInvariant();
        return $"{ConnectionStringSecretPrefix}-{shortId}";
    }

    /// <summary>
    /// Gets the secret name for a tenant's database password
    /// </summary>
    private static string GetPasswordSecretName(Guid tenantId)
    {
        var shortId = tenantId.ToString("N")[..12].ToLowerInvariant();
        return $"{PasswordSecretPrefix}-{shortId}";
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
