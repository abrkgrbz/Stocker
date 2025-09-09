using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantApiKey : Entity
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; }
    public string Key { get; private set; }
    public string? Description { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastUsedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public bool IsActive { get; private set; }
    public string? AllowedIpAddresses { get; private set; } // JSON array of IPs
    public string? Scopes { get; private set; } // JSON array of scopes
    public int? RateLimit { get; private set; } // Requests per minute
    public string CreatedBy { get; private set; }
    
    // Navigation property
    public Tenant Tenant { get; private set; } = null!;
    
    private TenantApiKey() { } // EF Constructor
    
    private TenantApiKey(
        Guid tenantId,
        string name,
        string key,
        string createdBy,
        string? description = null,
        DateTime? expiresAt = null,
        string? allowedIpAddresses = null,
        string? scopes = null,
        int? rateLimit = null)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        Name = name;
        Key = key;
        Description = description;
        CreatedAt = DateTime.UtcNow;
        ExpiresAt = expiresAt;
        IsActive = true;
        AllowedIpAddresses = allowedIpAddresses;
        Scopes = scopes;
        RateLimit = rateLimit;
        CreatedBy = createdBy;
    }
    
    public static TenantApiKey Create(
        Guid tenantId,
        string name,
        string createdBy,
        string? description = null,
        DateTime? expiresAt = null,
        string? allowedIpAddresses = null,
        string? scopes = null,
        int? rateLimit = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("API key name cannot be empty.", nameof(name));
            
        var key = GenerateApiKey();
        return new TenantApiKey(tenantId, name, key, createdBy, description, expiresAt, allowedIpAddresses, scopes, rateLimit);
    }
    
    public void Deactivate()
    {
        IsActive = false;
    }
    
    public void Activate()
    {
        if (ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow)
            throw new InvalidOperationException("Cannot activate an expired API key.");
            
        IsActive = true;
    }
    
    public void RecordUsage()
    {
        LastUsedAt = DateTime.UtcNow;
    }
    
    public void UpdateRateLimit(int? rateLimit)
    {
        RateLimit = rateLimit;
    }
    
    public void UpdateAllowedIpAddresses(string? ipAddresses)
    {
        AllowedIpAddresses = ipAddresses;
    }
    
    public bool IsExpired()
    {
        return ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
    }
    
    private static string GenerateApiKey()
    {
        var bytes = new byte[32];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }
        return Convert.ToBase64String(bytes).Replace("/", "").Replace("+", "").Replace("=", "");
    }
}