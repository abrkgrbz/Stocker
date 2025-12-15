namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Abstraction for secure secret storage.
/// Supports multiple backends: Azure Key Vault, AWS Secrets Manager, local encryption.
/// </summary>
public interface ISecretStore
{
    /// <summary>
    /// Stores a secret with the given name.
    /// If the secret already exists, creates a new version.
    /// </summary>
    /// <param name="secretName">Unique name for the secret (e.g., "tenant-{tenantId}-db-password")</param>
    /// <param name="secretValue">The secret value to store</param>
    /// <param name="tags">Optional metadata tags for the secret</param>
    /// <param name="expiresOn">Optional expiration date</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The version identifier of the stored secret</returns>
    Task<string> SetSecretAsync(
        string secretName,
        string secretValue,
        Dictionary<string, string>? tags = null,
        DateTimeOffset? expiresOn = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a secret by name.
    /// </summary>
    /// <param name="secretName">The name of the secret to retrieve</param>
    /// <param name="version">Optional specific version (null = latest)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The secret value, or null if not found</returns>
    Task<SecretValue?> GetSecretAsync(
        string secretName,
        string? version = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a secret (soft delete if supported by backend).
    /// </summary>
    /// <param name="secretName">The name of the secret to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task DeleteSecretAsync(
        string secretName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a secret exists.
    /// </summary>
    /// <param name="secretName">The name of the secret</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if the secret exists</returns>
    Task<bool> SecretExistsAsync(
        string secretName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Lists all secrets matching the prefix.
    /// </summary>
    /// <param name="prefix">Optional prefix to filter secrets (e.g., "tenant-")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of secret names</returns>
    IAsyncEnumerable<string> ListSecretsAsync(
        string? prefix = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the name of the secret store provider (e.g., "AzureKeyVault", "LocalEncryption").
    /// </summary>
    string ProviderName { get; }

    /// <summary>
    /// Indicates if this provider is available and configured.
    /// </summary>
    bool IsAvailable { get; }
}

/// <summary>
/// Represents a retrieved secret value with metadata.
/// </summary>
public class SecretValue
{
    /// <summary>
    /// The secret name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The actual secret value.
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// The version of this secret.
    /// </summary>
    public string? Version { get; set; }

    /// <summary>
    /// When the secret was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// When the secret was last updated.
    /// </summary>
    public DateTimeOffset? UpdatedOn { get; set; }

    /// <summary>
    /// When the secret expires (if set).
    /// </summary>
    public DateTimeOffset? ExpiresOn { get; set; }

    /// <summary>
    /// Whether the secret is enabled.
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Metadata tags associated with the secret.
    /// </summary>
    public Dictionary<string, string> Tags { get; set; } = new();
}
