using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using System.Collections.Concurrent;
using System.Runtime.CompilerServices;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Local encryption-based implementation of ISecretStore.
/// Uses ASP.NET Core Data Protection for encryption.
/// Suitable for development and single-server deployments.
///
/// Note: Secrets are stored encrypted in memory and optionally persisted.
/// For production multi-server deployments, use AzureKeyVaultSecretStore.
/// </summary>
public class LocalEncryptionSecretStore : ISecretStore
{
    private readonly IEncryptionService _encryptionService;
    private readonly ILogger<LocalEncryptionSecretStore> _logger;

    // In-memory storage for secrets (encrypted values)
    private readonly ConcurrentDictionary<string, LocalSecretEntry> _secrets = new();

    public string ProviderName => "LocalEncryption";
    public bool IsAvailable => true; // Always available as fallback

    public LocalEncryptionSecretStore(
        IEncryptionService encryptionService,
        ILogger<LocalEncryptionSecretStore> logger)
    {
        _encryptionService = encryptionService;
        _logger = logger;

        _logger.LogInformation(
            "📁 Local encryption secret store initialized (Development/Single-server mode)");
    }

    public Task<string> SetSecretAsync(
        string secretName,
        string secretValue,
        Dictionary<string, string>? tags = null,
        DateTimeOffset? expiresOn = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = NormalizeSecretName(secretName);
        var version = Guid.NewGuid().ToString("N")[..8];
        var now = DateTimeOffset.UtcNow;

        // Encrypt the value
        var encryptedValue = _encryptionService.Encrypt(secretValue);

        var entry = new LocalSecretEntry
        {
            Name = normalizedName,
            EncryptedValue = encryptedValue,
            Version = version,
            CreatedOn = now,
            UpdatedOn = now,
            ExpiresOn = expiresOn,
            Enabled = true,
            Tags = tags ?? new Dictionary<string, string>()
        };

        _secrets[normalizedName] = entry;

        _logger.LogDebug(
            "Secret '{SecretName}' stored locally. Version: {Version}",
            normalizedName,
            version);

        return Task.FromResult(version);
    }

    public Task<SecretValue?> GetSecretAsync(
        string secretName,
        string? version = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = NormalizeSecretName(secretName);

        if (!_secrets.TryGetValue(normalizedName, out var entry))
        {
            _logger.LogDebug("Secret '{SecretName}' not found in local store", secretName);
            return Task.FromResult<SecretValue?>(null);
        }

        // Check expiration
        if (entry.ExpiresOn.HasValue && entry.ExpiresOn.Value < DateTimeOffset.UtcNow)
        {
            _logger.LogWarning(
                "Secret '{SecretName}' has expired at {ExpiresOn}",
                secretName,
                entry.ExpiresOn);
            // Still return it but mark as disabled
        }

        // Decrypt the value
        var decryptedValue = _encryptionService.Decrypt(entry.EncryptedValue);

        if (string.IsNullOrEmpty(decryptedValue))
        {
            _logger.LogWarning(
                "Failed to decrypt secret '{SecretName}' - encryption key may have changed",
                secretName);
            return Task.FromResult<SecretValue?>(null);
        }

        return Task.FromResult<SecretValue?>(new SecretValue
        {
            Name = entry.Name,
            Value = decryptedValue,
            Version = entry.Version,
            CreatedOn = entry.CreatedOn,
            UpdatedOn = entry.UpdatedOn,
            ExpiresOn = entry.ExpiresOn,
            Enabled = entry.Enabled && (!entry.ExpiresOn.HasValue || entry.ExpiresOn.Value > DateTimeOffset.UtcNow),
            Tags = entry.Tags
        });
    }

    public Task DeleteSecretAsync(
        string secretName,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = NormalizeSecretName(secretName);

        if (_secrets.TryRemove(normalizedName, out _))
        {
            _logger.LogInformation("Secret '{SecretName}' deleted from local store", normalizedName);
        }
        else
        {
            _logger.LogDebug("Secret '{SecretName}' not found in local store - already deleted", secretName);
        }

        return Task.CompletedTask;
    }

    public Task<bool> SecretExistsAsync(
        string secretName,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = NormalizeSecretName(secretName);
        return Task.FromResult(_secrets.ContainsKey(normalizedName));
    }

    public async IAsyncEnumerable<string> ListSecretsAsync(
        string? prefix = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var normalizedPrefix = prefix != null ? NormalizeSecretName(prefix) : null;

        foreach (var key in _secrets.Keys)
        {
            if (cancellationToken.IsCancellationRequested)
                yield break;

            if (normalizedPrefix == null || key.StartsWith(normalizedPrefix, StringComparison.OrdinalIgnoreCase))
            {
                yield return key;
            }
        }

        await Task.CompletedTask; // Satisfy async requirement
    }

    private static string NormalizeSecretName(string name)
    {
        // Use same normalization as Azure Key Vault for consistency
        var normalized = name
            .Replace("_", "-")
            .Replace(".", "-")
            .Replace(" ", "-");

        while (normalized.Contains("--"))
        {
            normalized = normalized.Replace("--", "-");
        }

        return normalized.Trim('-').ToLowerInvariant();
    }

    private class LocalSecretEntry
    {
        public string Name { get; set; } = string.Empty;
        public string EncryptedValue { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset UpdatedOn { get; set; }
        public DateTimeOffset? ExpiresOn { get; set; }
        public bool Enabled { get; set; }
        public Dictionary<string, string> Tags { get; set; } = new();
    }
}
