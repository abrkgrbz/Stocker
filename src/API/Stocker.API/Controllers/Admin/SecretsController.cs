using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;
using Stocker.API.Controllers.Base;

namespace Stocker.API.Controllers.Admin;

/// <summary>
/// Manages Azure Key Vault secrets for tenant credentials
/// </summary>
[ApiController]
[Route("api/admin/secrets")]
[Authorize(Roles = "SuperAdmin")]
[Produces("application/json")]
public class SecretsController : ControllerBase
{
    private readonly ISecretStore _secretStore;
    private readonly ILogger<SecretsController> _logger;

    public SecretsController(
        ISecretStore secretStore,
        ILogger<SecretsController> logger)
    {
        _secretStore = secretStore;
        _logger = logger;
    }

    /// <summary>
    /// List all tenant secrets from the secret store
    /// </summary>
    /// <param name="prefix">Optional prefix filter (e.g., "tenant-cs-" for connection strings)</param>
    /// <returns>List of secret names (values are not exposed)</returns>
    [HttpGet]
    [ProducesResponseType(typeof(SecretsListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> ListSecrets([FromQuery] string? prefix = "tenant-")
    {
        if (!_secretStore.IsAvailable)
        {
            return StatusCode(503, ApiResponse<SecretsListResponse>.FailureResponse(
                "Secret store is not available",
                $"Provider: {_secretStore.ProviderName}"));
        }

        try
        {
            var secrets = new List<SecretInfo>();

            await foreach (var secretName in _secretStore.ListSecretsAsync(prefix))
            {
                // Get secret metadata (without value)
                var secret = await _secretStore.GetSecretAsync(secretName);
                if (secret != null)
                {
                    secrets.Add(new SecretInfo
                    {
                        Name = secretName,
                        CreatedOn = secret.CreatedOn,
                        UpdatedOn = secret.UpdatedOn,
                        ExpiresOn = secret.ExpiresOn,
                        Enabled = secret.Enabled,
                        Tags = secret.Tags,
                        // Extract tenant ID from secret name if possible
                        TenantShortId = ExtractTenantIdFromSecretName(secretName),
                        SecretType = DetermineSecretType(secretName)
                    });
                }
            }

            _logger.LogInformation(
                "Listed {Count} secrets from {Provider} with prefix '{Prefix}'",
                secrets.Count, _secretStore.ProviderName, prefix);

            var response = new SecretsListResponse
            {
                Provider = _secretStore.ProviderName,
                TotalCount = secrets.Count,
                Secrets = secrets.OrderByDescending(s => s.CreatedOn).ToList()
            };

            return Ok(ApiResponse<SecretsListResponse>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list secrets from {Provider}", _secretStore.ProviderName);
            return StatusCode(500, ApiResponse<SecretsListResponse>.FailureResponse(ex.Message, "Failed to list secrets"));
        }
    }

    /// <summary>
    /// Get secret metadata (without exposing the value)
    /// </summary>
    [HttpGet("{secretName}")]
    [ProducesResponseType(typeof(SecretInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSecretMetadata(string secretName)
    {
        if (!_secretStore.IsAvailable)
        {
            return StatusCode(503, ApiResponse<SecretInfo>.FailureResponse("Secret store is not available"));
        }

        try
        {
            var secret = await _secretStore.GetSecretAsync(secretName);
            if (secret == null)
            {
                return NotFound(ApiResponse<SecretInfo>.FailureResponse($"Secret '{secretName}' not found"));
            }

            var response = new SecretInfo
            {
                Name = secret.Name,
                CreatedOn = secret.CreatedOn,
                UpdatedOn = secret.UpdatedOn,
                ExpiresOn = secret.ExpiresOn,
                Enabled = secret.Enabled,
                Tags = secret.Tags,
                TenantShortId = ExtractTenantIdFromSecretName(secretName),
                SecretType = DetermineSecretType(secretName)
            };

            return Ok(ApiResponse<SecretInfo>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get secret metadata for {SecretName}", secretName);
            return StatusCode(500, ApiResponse<SecretInfo>.FailureResponse(ex.Message, "Failed to get secret"));
        }
    }

    /// <summary>
    /// Delete a secret from the secret store
    /// </summary>
    [HttpDelete("{secretName}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSecret(string secretName)
    {
        if (!_secretStore.IsAvailable)
        {
            return StatusCode(503, ApiResponse<DeleteSecretResponse>.FailureResponse("Secret store is not available"));
        }

        try
        {
            // Check if secret exists
            var exists = await _secretStore.SecretExistsAsync(secretName);
            if (!exists)
            {
                return NotFound(ApiResponse<DeleteSecretResponse>.FailureResponse($"Secret '{secretName}' not found"));
            }

            await _secretStore.DeleteSecretAsync(secretName);

            _logger.LogInformation(
                "Deleted secret '{SecretName}' from {Provider}",
                secretName, _secretStore.ProviderName);

            var response = new DeleteSecretResponse
            {
                Message = $"Secret '{secretName}' deleted successfully",
                Provider = _secretStore.ProviderName
            };

            return Ok(ApiResponse<DeleteSecretResponse>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete secret {SecretName}", secretName);
            return StatusCode(500, ApiResponse<DeleteSecretResponse>.FailureResponse(ex.Message, "Failed to delete secret"));
        }
    }

    /// <summary>
    /// Delete all secrets for a specific tenant
    /// </summary>
    [HttpDelete("tenant/{tenantShortId}")]
    [ProducesResponseType(typeof(BulkDeleteResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteTenantSecrets(string tenantShortId)
    {
        if (!_secretStore.IsAvailable)
        {
            return StatusCode(503, ApiResponse<BulkDeleteResponse>.FailureResponse("Secret store is not available"));
        }

        try
        {
            var deletedSecrets = new List<string>();
            var failedSecrets = new List<string>();

            // Find all secrets for this tenant
            var secretsToDelete = new List<string>();
            await foreach (var secretName in _secretStore.ListSecretsAsync($"tenant-"))
            {
                if (secretName.Contains(tenantShortId))
                {
                    secretsToDelete.Add(secretName);
                }
            }

            // Delete each secret
            foreach (var secretName in secretsToDelete)
            {
                try
                {
                    await _secretStore.DeleteSecretAsync(secretName);
                    deletedSecrets.Add(secretName);
                    _logger.LogInformation("Deleted secret '{SecretName}' for tenant {TenantShortId}",
                        secretName, tenantShortId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete secret '{SecretName}'", secretName);
                    failedSecrets.Add(secretName);
                }
            }

            var response = new BulkDeleteResponse
            {
                TenantShortId = tenantShortId,
                DeletedCount = deletedSecrets.Count,
                FailedCount = failedSecrets.Count,
                DeletedSecrets = deletedSecrets,
                FailedSecrets = failedSecrets
            };

            return Ok(ApiResponse<BulkDeleteResponse>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete secrets for tenant {TenantShortId}", tenantShortId);
            return StatusCode(500, ApiResponse<BulkDeleteResponse>.FailureResponse(ex.Message, "Failed to delete tenant secrets"));
        }
    }

    /// <summary>
    /// Get secret store status
    /// </summary>
    [HttpGet("status")]
    [ProducesResponseType(typeof(SecretStoreStatus), StatusCodes.Status200OK)]
    public IActionResult GetStatus()
    {
        var response = new SecretStoreStatus
        {
            Provider = _secretStore.ProviderName,
            IsAvailable = _secretStore.IsAvailable
        };

        return Ok(ApiResponse<SecretStoreStatus>.SuccessResponse(response));
    }

    private static string? ExtractTenantIdFromSecretName(string secretName)
    {
        // Pattern: tenant-cs-{shortId} or tenant-pwd-{shortId}
        var parts = secretName.Split('-');
        if (parts.Length >= 3)
        {
            return parts[2]; // e.g., "4f6556fefa58"
        }
        return null;
    }

    private static string DetermineSecretType(string secretName)
    {
        if (secretName.Contains("-cs-")) return "ConnectionString";
        if (secretName.Contains("-pwd-")) return "Password";
        return "Unknown";
    }
}

#region DTOs

public class SecretsListResponse
{
    public string Provider { get; set; } = string.Empty;
    public int TotalCount { get; set; }
    public List<SecretInfo> Secrets { get; set; } = new();
}

public class SecretInfo
{
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset? CreatedOn { get; set; }
    public DateTimeOffset? UpdatedOn { get; set; }
    public DateTimeOffset? ExpiresOn { get; set; }
    public bool Enabled { get; set; }
    public Dictionary<string, string> Tags { get; set; } = new();
    public string? TenantShortId { get; set; }
    public string SecretType { get; set; } = string.Empty;
}

public class BulkDeleteResponse
{
    public string TenantShortId { get; set; } = string.Empty;
    public int DeletedCount { get; set; }
    public int FailedCount { get; set; }
    public List<string> DeletedSecrets { get; set; } = new();
    public List<string> FailedSecrets { get; set; } = new();
}

public class SecretStoreStatus
{
    public string Provider { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
}

public class DeleteSecretResponse
{
    public string Message { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
}

#endregion
