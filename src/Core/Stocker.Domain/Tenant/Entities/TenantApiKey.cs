using Stocker.SharedKernel.Primitives;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Tenant'a özel API anahtarları - 3. parti entegrasyonlar ve API erişimi için
/// </summary>
public sealed class TenantApiKey : Entity
{
    // Key Information
    public string Name { get; private set; }
    public string Description { get; private set; }
    public string KeyPrefix { get; private set; } // First 8 chars for identification
    public string HashedKey { get; private set; } // SHA256 hash of the actual key
    public string? EncryptedKey { get; private set; } // Optional encrypted storage
    
    // Permissions & Scopes
    public ApiKeyType KeyType { get; private set; }
    public List<string> Scopes { get; private set; } // JSON array of permissions
    public List<string> AllowedEndpoints { get; private set; } // Specific endpoints this key can access
    public List<string> AllowedMethods { get; private set; } // GET, POST, PUT, DELETE etc.
    
    // Access Control
    public List<string>? AllowedIpAddresses { get; private set; } // IP whitelist
    public List<string>? AllowedDomains { get; private set; } // CORS domains
    public int? RateLimitPerMinute { get; private set; }
    public int? RateLimitPerHour { get; private set; }
    public int? RateLimitPerDay { get; private set; }
    
    // Usage Tracking
    public int UsageCount { get; private set; }
    public DateTime? LastUsedAt { get; private set; }
    public string? LastUsedIp { get; private set; }
    public string? LastUsedUserAgent { get; private set; }
    
    // Lifecycle
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public string? RevokedBy { get; private set; }
    public string? RevocationReason { get; private set; }
    
    // Status
    public ApiKeyStatus Status { get; private set; }
    public bool IsActive { get; private set; }
    public bool RequireHttps { get; private set; }
    
    // Metadata
    public string? Environment { get; private set; } // dev, staging, production
    public string? AssociatedUserId { get; private set; }
    public string? AssociatedApplication { get; private set; }
    public string? Metadata { get; private set; } // JSON for additional data
    
    private TenantApiKey()
    {
        Scopes = new List<string>();
        AllowedEndpoints = new List<string>();
        AllowedMethods = new List<string>();
        AllowedIpAddresses = new List<string>();
        AllowedDomains = new List<string>();
    }
    
    private TenantApiKey(
        string name,
        string description,
        ApiKeyType keyType,
        string createdBy) : this()
    {
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
        KeyType = keyType;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
        Status = ApiKeyStatus.Active;
        IsActive = true;
        RequireHttps = true;
        UsageCount = 0;
    }
    
    public static (TenantApiKey apiKey, string plainKey) Create(
        string name,
        string description,
        ApiKeyType keyType,
        string createdBy,
        DateTime? expiresAt = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("API key name cannot be empty.", nameof(name));
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Created by cannot be empty.", nameof(createdBy));
            
        var apiKey = new TenantApiKey(name, description, keyType, createdBy)
        {
            ExpiresAt = expiresAt
        };
        
        // Generate the actual API key
        var plainKey = GenerateApiKey();
        apiKey.KeyPrefix = plainKey.Substring(0, 8);
        apiKey.HashedKey = HashApiKey(plainKey);
        
        return (apiKey, plainKey);
    }
    
    private static string GenerateApiKey()
    {
        // Generate a secure random API key
        var bytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }
        
        // Convert to URL-safe base64
        var base64 = Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
            
        return $"stk_{base64}"; // Prefix with stk_ for Stocker
    }
    
    private static string HashApiKey(string apiKey)
    {
        using (var sha256 = SHA256.Create())
        {
            var bytes = Encoding.UTF8.GetBytes(apiKey);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
    
    public bool VerifyApiKey(string plainKey)
    {
        if (string.IsNullOrWhiteSpace(plainKey))
            return false;
            
        var hashedInput = HashApiKey(plainKey);
        return HashedKey == hashedInput;
    }
    
    public void SetScopes(List<string> scopes)
    {
        Scopes = scopes ?? new List<string>();
    }
    
    public void AddScope(string scope)
    {
        if (!string.IsNullOrWhiteSpace(scope) && !Scopes.Contains(scope))
        {
            Scopes.Add(scope);
        }
    }
    
    public void RemoveScope(string scope)
    {
        Scopes.Remove(scope);
    }
    
    public void SetAllowedEndpoints(List<string> endpoints)
    {
        AllowedEndpoints = endpoints ?? new List<string>();
    }
    
    public void SetAllowedMethods(List<string> methods)
    {
        AllowedMethods = methods ?? new List<string>();
    }
    
    public void SetIpWhitelist(List<string> ipAddresses)
    {
        AllowedIpAddresses = ipAddresses;
    }
    
    public void SetDomainWhitelist(List<string> domains)
    {
        AllowedDomains = domains;
    }
    
    public void SetRateLimits(int? perMinute, int? perHour, int? perDay)
    {
        RateLimitPerMinute = perMinute;
        RateLimitPerHour = perHour;
        RateLimitPerDay = perDay;
    }
    
    public void SetEnvironment(string environment)
    {
        Environment = environment;
    }
    
    public void AssociateWithUser(string userId)
    {
        AssociatedUserId = userId;
    }
    
    public void AssociateWithApplication(string application)
    {
        AssociatedApplication = application;
    }
    
    public void SetMetadata(string metadata)
    {
        Metadata = metadata;
    }
    
    public void RecordUsage(string ipAddress, string userAgent)
    {
        UsageCount++;
        LastUsedAt = DateTime.UtcNow;
        LastUsedIp = ipAddress;
        LastUsedUserAgent = userAgent;
    }
    
    public void Activate()
    {
        if (Status == ApiKeyStatus.Revoked)
            throw new InvalidOperationException("Cannot activate a revoked API key.");
            
        Status = ApiKeyStatus.Active;
        IsActive = true;
    }
    
    public void Suspend(string reason)
    {
        Status = ApiKeyStatus.Suspended;
        IsActive = false;
        Metadata = UpdateMetadata("suspensionReason", reason);
    }
    
    public void Revoke(string revokedBy, string reason)
    {
        if (Status == ApiKeyStatus.Revoked)
            throw new InvalidOperationException("API key is already revoked.");
            
        Status = ApiKeyStatus.Revoked;
        IsActive = false;
        RevokedAt = DateTime.UtcNow;
        RevokedBy = revokedBy;
        RevocationReason = reason;
    }
    
    public void Expire()
    {
        Status = ApiKeyStatus.Expired;
        IsActive = false;
    }
    
    public bool IsExpired()
    {
        return ExpiresAt.HasValue && ExpiresAt.Value <= DateTime.UtcNow;
    }
    
    public bool IsValidForIp(string ipAddress)
    {
        if (AllowedIpAddresses == null || AllowedIpAddresses.Count == 0)
            return true;
            
        return AllowedIpAddresses.Contains(ipAddress);
    }
    
    public bool IsValidForDomain(string domain)
    {
        if (AllowedDomains == null || AllowedDomains.Count == 0)
            return true;
            
        return AllowedDomains.Contains(domain);
    }
    
    public bool HasScope(string scope)
    {
        return Scopes.Contains(scope) || Scopes.Contains("*"); // * means all scopes
    }
    
    public bool CanAccessEndpoint(string endpoint, string method)
    {
        var endpointAllowed = AllowedEndpoints.Count == 0 || 
                             AllowedEndpoints.Contains("*") || 
                             AllowedEndpoints.Contains(endpoint);
                             
        var methodAllowed = AllowedMethods.Count == 0 || 
                           AllowedMethods.Contains("*") || 
                           AllowedMethods.Contains(method.ToUpper());
                           
        return endpointAllowed && methodAllowed;
    }
    
    private string UpdateMetadata(string key, string value)
    {
        // Simple JSON update logic - in real implementation, use proper JSON handling
        return Metadata ?? $"{{\"{key}\":\"{value}\"}}";
    }
}

public enum ApiKeyType
{
    Personal = 0,        // User's personal API key
    Application = 1,     // Application/service API key
    Integration = 2,     // Third-party integration
    Webhook = 3,         // Webhook signing key
    Admin = 4,          // Administrative access
    ReadOnly = 5,       // Read-only access
    WriteOnly = 6,      // Write-only access
    Testing = 7         // Testing/development key
}

public enum ApiKeyStatus
{
    Active = 0,
    Suspended = 1,
    Revoked = 2,
    Expired = 3,
    Pending = 4
}