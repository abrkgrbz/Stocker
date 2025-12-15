namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for managing per-tenant PostgreSQL users and secure connection strings.
/// Implements security best practices:
/// - Each tenant gets a dedicated PostgreSQL user (isolation)
/// - Connection strings are encrypted at rest
/// - Users have minimum required privileges
/// - Passwords are securely generated and stored
/// </summary>
public interface ITenantDatabaseSecurityService
{
    /// <summary>
    /// Creates a dedicated PostgreSQL user for a tenant database.
    /// The user will have full access only to their specific database.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="databaseName">The tenant's database name</param>
    /// <returns>Secure connection string with tenant-specific credentials</returns>
    Task<TenantDatabaseCredentials> CreateTenantDatabaseUserAsync(Guid tenantId, string databaseName);

    /// <summary>
    /// Revokes access and drops the PostgreSQL user for a tenant.
    /// Called when a tenant is deleted or deactivated.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="databaseName">The tenant's database name</param>
    Task RevokeTenantDatabaseUserAsync(Guid tenantId, string databaseName);

    /// <summary>
    /// Rotates the password for a tenant's PostgreSQL user.
    /// Should be called periodically for security compliance.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="databaseName">The tenant's database name</param>
    /// <returns>New secure connection string with rotated credentials</returns>
    Task<TenantDatabaseCredentials> RotateTenantCredentialsAsync(Guid tenantId, string databaseName);

    /// <summary>
    /// Encrypts a connection string for secure storage.
    /// </summary>
    /// <param name="connectionString">Plain text connection string</param>
    /// <returns>Encrypted connection string</returns>
    string EncryptConnectionString(string connectionString);

    /// <summary>
    /// Decrypts a stored connection string for runtime use.
    /// </summary>
    /// <param name="encryptedConnectionString">Encrypted connection string</param>
    /// <returns>Decrypted connection string</returns>
    string DecryptConnectionString(string encryptedConnectionString);

    /// <summary>
    /// Validates that a tenant's database user has correct permissions.
    /// Used for health checks and security audits.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="connectionString">Connection string to validate</param>
    /// <returns>True if permissions are correctly configured</returns>
    Task<bool> ValidateTenantPermissionsAsync(Guid tenantId, string connectionString);
}

/// <summary>
/// Contains the credentials and connection information for a tenant database.
/// </summary>
public class TenantDatabaseCredentials
{
    /// <summary>
    /// The tenant-specific PostgreSQL username (e.g., tenant_abc123)
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// The generated secure password (not stored, only returned once)
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// The complete connection string with tenant credentials
    /// </summary>
    public string ConnectionString { get; set; } = string.Empty;

    /// <summary>
    /// The encrypted version of the connection string for storage
    /// </summary>
    public string EncryptedConnectionString { get; set; } = string.Empty;

    /// <summary>
    /// The database name this user has access to
    /// </summary>
    public string DatabaseName { get; set; } = string.Empty;

    /// <summary>
    /// When the credentials were created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the credentials should be rotated
    /// </summary>
    public DateTime? RotateAfter { get; set; }
}
