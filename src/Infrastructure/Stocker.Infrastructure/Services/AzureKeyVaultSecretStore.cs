using Azure;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using System.Runtime.CompilerServices;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Azure Key Vault implementation of ISecretStore.
/// Provides secure, centralized secret management for production environments.
///
/// Configuration:
/// - AzureKeyVault:VaultUri - The URI of the Key Vault (e.g., https://myvault.vault.azure.net/)
/// - AzureKeyVault:TenantId - Azure AD tenant ID (optional, for specific tenant)
/// - AzureKeyVault:ClientId - Service principal client ID (optional, for app auth)
/// - AzureKeyVault:ClientSecret - Service principal client secret (optional, for app auth)
///
/// Authentication priority:
/// 1. Service Principal (if ClientId/ClientSecret configured)
/// 2. Managed Identity (in Azure environment)
/// 3. Azure CLI / Visual Studio (for development)
/// </summary>
public class AzureKeyVaultSecretStore : ISecretStore
{
    private readonly SecretClient? _secretClient;
    private readonly ILogger<AzureKeyVaultSecretStore> _logger;
    private readonly bool _isConfigured;
    private readonly string _vaultUri;

    public string ProviderName => "AzureKeyVault";
    public bool IsAvailable => _isConfigured && _secretClient != null;

    public AzureKeyVaultSecretStore(
        IConfiguration configuration,
        ILogger<AzureKeyVaultSecretStore> logger)
    {
        _logger = logger;
        _vaultUri = configuration["AzureKeyVault:VaultUri"] ?? string.Empty;

        if (string.IsNullOrEmpty(_vaultUri))
        {
            _logger.LogInformation("Azure Key Vault not configured. VaultUri is empty.");
            _isConfigured = false;
            return;
        }

        try
        {
            var credential = CreateCredential(configuration);
            _secretClient = new SecretClient(new Uri(_vaultUri), credential);
            _isConfigured = true;

            _logger.LogInformation(
                "🔐 Azure Key Vault initialized: {VaultUri}",
                _vaultUri);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to initialize Azure Key Vault client for {VaultUri}",
                _vaultUri);
            _isConfigured = false;
        }
    }

    private static Azure.Core.TokenCredential CreateCredential(IConfiguration configuration)
    {
        var tenantId = configuration["AzureKeyVault:TenantId"];
        var clientId = configuration["AzureKeyVault:ClientId"];
        var clientSecret = configuration["AzureKeyVault:ClientSecret"];

        // If service principal credentials are provided, use them
        if (!string.IsNullOrEmpty(clientId) && !string.IsNullOrEmpty(clientSecret))
        {
            return new ClientSecretCredential(tenantId, clientId, clientSecret);
        }

        // Otherwise, use DefaultAzureCredential which tries:
        // 1. Environment variables
        // 2. Managed Identity
        // 3. Visual Studio
        // 4. Azure CLI
        // 5. Azure PowerShell
        var options = new DefaultAzureCredentialOptions
        {
            ExcludeInteractiveBrowserCredential = true
        };

        // Only set TenantId if it's not null or empty
        // Azure SDK throws if TenantId is an empty string
        if (!string.IsNullOrEmpty(tenantId))
        {
            options.TenantId = tenantId;
        }

        return new DefaultAzureCredential(options);
    }

    public async Task<string> SetSecretAsync(
        string secretName,
        string secretValue,
        Dictionary<string, string>? tags = null,
        DateTimeOffset? expiresOn = null,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        try
        {
            // Normalize secret name (Key Vault only allows alphanumeric and hyphens)
            var normalizedName = NormalizeSecretName(secretName);

            var secret = new KeyVaultSecret(normalizedName, secretValue);

            if (expiresOn.HasValue)
            {
                secret.Properties.ExpiresOn = expiresOn;
            }

            if (tags != null)
            {
                foreach (var tag in tags)
                {
                    secret.Properties.Tags[tag.Key] = tag.Value;
                }
            }

            // Add standard metadata
            secret.Properties.Tags["CreatedBy"] = "Stocker";
            secret.Properties.Tags["CreatedAt"] = DateTimeOffset.UtcNow.ToString("O");
            secret.Properties.ContentType = "text/plain";

            var response = await _secretClient!.SetSecretAsync(secret, cancellationToken);

            _logger.LogDebug(
                "Secret '{SecretName}' stored in Key Vault. Version: {Version}",
                normalizedName,
                response.Value.Properties.Version);

            return response.Value.Properties.Version;
        }
        catch (RequestFailedException ex)
        {
            _logger.LogError(ex,
                "Failed to store secret '{SecretName}' in Key Vault. Status: {Status}",
                secretName,
                ex.Status);
            throw new InvalidOperationException($"Failed to store secret in Key Vault: {ex.Message}", ex);
        }
    }

    public async Task<SecretValue?> GetSecretAsync(
        string secretName,
        string? version = null,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        try
        {
            var normalizedName = NormalizeSecretName(secretName);

            Response<KeyVaultSecret> response;
            if (string.IsNullOrEmpty(version))
            {
                response = await _secretClient!.GetSecretAsync(normalizedName, cancellationToken: cancellationToken);
            }
            else
            {
                response = await _secretClient!.GetSecretAsync(normalizedName, version, cancellationToken);
            }

            var kvSecret = response.Value;

            return new SecretValue
            {
                Name = kvSecret.Name,
                Value = kvSecret.Value,
                Version = kvSecret.Properties.Version,
                CreatedOn = kvSecret.Properties.CreatedOn,
                UpdatedOn = kvSecret.Properties.UpdatedOn,
                ExpiresOn = kvSecret.Properties.ExpiresOn,
                Enabled = kvSecret.Properties.Enabled ?? true,
                Tags = kvSecret.Properties.Tags?.ToDictionary(t => t.Key, t => t.Value) ?? new()
            };
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            _logger.LogDebug("Secret '{SecretName}' not found in Key Vault", secretName);
            return null;
        }
        catch (RequestFailedException ex)
        {
            _logger.LogError(ex,
                "Failed to retrieve secret '{SecretName}' from Key Vault. Status: {Status}",
                secretName,
                ex.Status);
            throw new InvalidOperationException($"Failed to retrieve secret from Key Vault: {ex.Message}", ex);
        }
    }

    public async Task DeleteSecretAsync(
        string secretName,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        try
        {
            var normalizedName = NormalizeSecretName(secretName);

            var operation = await _secretClient!.StartDeleteSecretAsync(normalizedName, cancellationToken);

            // Wait for deletion to complete (soft delete)
            await operation.WaitForCompletionAsync(cancellationToken);

            _logger.LogInformation(
                "Secret '{SecretName}' deleted from Key Vault (soft delete)",
                normalizedName);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            _logger.LogDebug("Secret '{SecretName}' not found in Key Vault - already deleted", secretName);
        }
        catch (RequestFailedException ex)
        {
            _logger.LogError(ex,
                "Failed to delete secret '{SecretName}' from Key Vault. Status: {Status}",
                secretName,
                ex.Status);
            throw new InvalidOperationException($"Failed to delete secret from Key Vault: {ex.Message}", ex);
        }
    }

    public async Task<bool> SecretExistsAsync(
        string secretName,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        try
        {
            var normalizedName = NormalizeSecretName(secretName);
            await _secretClient!.GetSecretAsync(normalizedName, cancellationToken: cancellationToken);
            return true;
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return false;
        }
    }

    public async IAsyncEnumerable<string> ListSecretsAsync(
        string? prefix = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var normalizedPrefix = prefix != null ? NormalizeSecretName(prefix) : null;

        await foreach (var secretProperties in _secretClient!.GetPropertiesOfSecretsAsync(cancellationToken))
        {
            if (normalizedPrefix == null || secretProperties.Name.StartsWith(normalizedPrefix, StringComparison.OrdinalIgnoreCase))
            {
                yield return secretProperties.Name;
            }
        }
    }

    private void EnsureConfigured()
    {
        if (!_isConfigured || _secretClient == null)
        {
            throw new InvalidOperationException(
                "Azure Key Vault is not configured. Please set AzureKeyVault:VaultUri in configuration.");
        }
    }

    /// <summary>
    /// Normalizes a secret name to be compatible with Azure Key Vault naming rules.
    /// Key Vault secret names can only contain alphanumeric characters and hyphens.
    /// </summary>
    private static string NormalizeSecretName(string name)
    {
        // Replace underscores and other invalid chars with hyphens
        var normalized = name
            .Replace("_", "-")
            .Replace(".", "-")
            .Replace(" ", "-");

        // Remove consecutive hyphens
        while (normalized.Contains("--"))
        {
            normalized = normalized.Replace("--", "-");
        }

        // Trim hyphens from start and end
        normalized = normalized.Trim('-');

        // Ensure it starts with a letter (Key Vault requirement)
        if (char.IsDigit(normalized[0]))
        {
            normalized = "s-" + normalized;
        }

        return normalized.ToLowerInvariant();
    }
}
