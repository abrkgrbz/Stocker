using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using System.Runtime.CompilerServices;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Hybrid secret store that prioritizes Azure Key Vault but falls back to local encryption.
/// This provides a seamless experience across development and production environments.
///
/// Priority:
/// 1. Azure Key Vault (if configured and available)
/// 2. Local Encryption (always available as fallback)
///
/// Features:
/// - Automatic failover if Key Vault is unavailable
/// - Consistent API regardless of backend
/// - Migration support (can read from both stores)
/// </summary>
public class HybridSecretStore : ISecretStore
{
    private readonly AzureKeyVaultSecretStore? _keyVaultStore;
    private readonly LocalEncryptionSecretStore _localStore;
    private readonly ILogger<HybridSecretStore> _logger;

    public string ProviderName => _keyVaultStore?.IsAvailable == true
        ? $"Hybrid({_keyVaultStore.ProviderName}+{_localStore.ProviderName})"
        : _localStore.ProviderName;

    public bool IsAvailable => true; // Always available (local store is always available)

    public HybridSecretStore(
        AzureKeyVaultSecretStore? keyVaultStore,
        LocalEncryptionSecretStore localStore,
        ILogger<HybridSecretStore> logger)
    {
        _keyVaultStore = keyVaultStore;
        _localStore = localStore;
        _logger = logger;

        if (_keyVaultStore?.IsAvailable == true)
        {
            _logger.LogInformation(
                "🔐 Hybrid secret store initialized with Azure Key Vault as primary");
        }
        else
        {
            _logger.LogInformation(
                "📁 Hybrid secret store initialized with Local Encryption (Key Vault not configured)");
        }
    }

    private ISecretStore GetPrimaryStore()
    {
        if (_keyVaultStore?.IsAvailable == true)
        {
            return _keyVaultStore;
        }

        return _localStore;
    }

    public async Task<string> SetSecretAsync(
        string secretName,
        string secretValue,
        Dictionary<string, string>? tags = null,
        DateTimeOffset? expiresOn = null,
        CancellationToken cancellationToken = default)
    {
        var primaryStore = GetPrimaryStore();

        try
        {
            return await primaryStore.SetSecretAsync(
                secretName,
                secretValue,
                tags,
                expiresOn,
                cancellationToken);
        }
        catch (Exception ex) when (primaryStore == _keyVaultStore && _keyVaultStore != null)
        {
            _logger.LogWarning(ex,
                "Failed to store secret '{SecretName}' in Key Vault. Falling back to local storage.",
                secretName);

            return await _localStore.SetSecretAsync(
                secretName,
                secretValue,
                tags,
                expiresOn,
                cancellationToken);
        }
    }

    public async Task<SecretValue?> GetSecretAsync(
        string secretName,
        string? version = null,
        CancellationToken cancellationToken = default)
    {
        var primaryStore = GetPrimaryStore();

        try
        {
            var secret = await primaryStore.GetSecretAsync(secretName, version, cancellationToken);
            if (secret != null)
            {
                return secret;
            }
        }
        catch (Exception ex) when (primaryStore == _keyVaultStore)
        {
            _logger.LogWarning(ex,
                "Failed to retrieve secret '{SecretName}' from Key Vault. Trying local storage.",
                secretName);
        }

        // If not found in primary or primary failed, try secondary
        if (primaryStore == _keyVaultStore)
        {
            var localSecret = await _localStore.GetSecretAsync(secretName, version, cancellationToken);
            if (localSecret != null)
            {
                _logger.LogDebug(
                    "Secret '{SecretName}' found in local storage (not in Key Vault)",
                    secretName);
            }
            return localSecret;
        }

        return null;
    }

    public async Task DeleteSecretAsync(
        string secretName,
        CancellationToken cancellationToken = default)
    {
        var errors = new List<Exception>();

        // Delete from both stores to ensure complete removal
        if (_keyVaultStore?.IsAvailable == true)
        {
            try
            {
                await _keyVaultStore.DeleteSecretAsync(secretName, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Failed to delete secret '{SecretName}' from Key Vault",
                    secretName);
                errors.Add(ex);
            }
        }

        try
        {
            await _localStore.DeleteSecretAsync(secretName, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to delete secret '{SecretName}' from local storage",
                secretName);
            errors.Add(ex);
        }

        // If both failed, throw
        if (errors.Count == 2)
        {
            throw new AggregateException("Failed to delete secret from all stores", errors);
        }
    }

    public async Task<bool> SecretExistsAsync(
        string secretName,
        CancellationToken cancellationToken = default)
    {
        var primaryStore = GetPrimaryStore();

        try
        {
            if (await primaryStore.SecretExistsAsync(secretName, cancellationToken))
            {
                return true;
            }
        }
        catch (Exception ex) when (primaryStore == _keyVaultStore)
        {
            _logger.LogWarning(ex,
                "Failed to check secret '{SecretName}' existence in Key Vault. Checking local storage.",
                secretName);
        }

        // Check secondary if primary is Key Vault
        if (primaryStore == _keyVaultStore)
        {
            return await _localStore.SecretExistsAsync(secretName, cancellationToken);
        }

        return false;
    }

    public async IAsyncEnumerable<string> ListSecretsAsync(
        string? prefix = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var seenSecrets = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // List from Key Vault first
        if (_keyVaultStore?.IsAvailable == true)
        {
            await foreach (var secretName in _keyVaultStore.ListSecretsAsync(prefix, cancellationToken))
            {
                if (seenSecrets.Add(secretName))
                {
                    yield return secretName;
                }
            }
        }

        // Then list from local store
        await foreach (var secretName in _localStore.ListSecretsAsync(prefix, cancellationToken))
        {
            if (seenSecrets.Add(secretName))
            {
                yield return secretName;
            }
        }
    }

    /// <summary>
    /// Migrates a secret from local storage to Azure Key Vault.
    /// Useful when transitioning from development to production.
    /// </summary>
    public async Task<bool> MigrateToKeyVaultAsync(
        string secretName,
        CancellationToken cancellationToken = default)
    {
        if (_keyVaultStore?.IsAvailable != true)
        {
            _logger.LogWarning("Cannot migrate secret - Key Vault is not available");
            return false;
        }

        var localSecret = await _localStore.GetSecretAsync(secretName, cancellationToken: cancellationToken);
        if (localSecret == null)
        {
            _logger.LogWarning("Secret '{SecretName}' not found in local storage", secretName);
            return false;
        }

        await _keyVaultStore.SetSecretAsync(
            secretName,
            localSecret.Value,
            localSecret.Tags,
            localSecret.ExpiresOn,
            cancellationToken);

        _logger.LogInformation(
            "Secret '{SecretName}' migrated from local storage to Key Vault",
            secretName);

        return true;
    }
}
