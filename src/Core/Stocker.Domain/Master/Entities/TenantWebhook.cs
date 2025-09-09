using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantWebhook : Entity
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; }
    public string Url { get; private set; }
    public string? Description { get; private set; }
    public string Events { get; private set; } // JSON array of events
    public string? Headers { get; private set; } // JSON object of headers
    public string Secret { get; private set; } // For signature verification
    public bool IsActive { get; private set; }
    public int MaxRetries { get; private set; }
    public int TimeoutSeconds { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastTriggeredAt { get; private set; }
    public string? LastStatus { get; private set; }
    public int FailureCount { get; private set; }
    public int SuccessCount { get; private set; }
    public string CreatedBy { get; private set; }
    
    // Navigation property
    public Tenant Tenant { get; private set; } = null!;
    
    private TenantWebhook() { } // EF Constructor
    
    private TenantWebhook(
        Guid tenantId,
        string name,
        string url,
        string events,
        string createdBy,
        string? description = null,
        string? headers = null,
        int maxRetries = 3,
        int timeoutSeconds = 30)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        Name = name;
        Url = url;
        Description = description;
        Events = events;
        Headers = headers;
        Secret = GenerateSecret();
        IsActive = true;
        MaxRetries = maxRetries;
        TimeoutSeconds = timeoutSeconds;
        CreatedAt = DateTime.UtcNow;
        FailureCount = 0;
        SuccessCount = 0;
        CreatedBy = createdBy;
    }
    
    public static TenantWebhook Create(
        Guid tenantId,
        string name,
        string url,
        string events,
        string createdBy,
        string? description = null,
        string? headers = null,
        int maxRetries = 3,
        int timeoutSeconds = 30)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Webhook name cannot be empty.", nameof(name));
            
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Webhook URL cannot be empty.", nameof(url));
            
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || 
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            throw new ArgumentException("Invalid webhook URL.", nameof(url));
            
        return new TenantWebhook(tenantId, name, url, events, createdBy, description, headers, maxRetries, timeoutSeconds);
    }
    
    public void Deactivate()
    {
        IsActive = false;
    }
    
    public void Activate()
    {
        IsActive = true;
        FailureCount = 0; // Reset failure count on reactivation
    }
    
    public void RecordSuccess()
    {
        LastTriggeredAt = DateTime.UtcNow;
        LastStatus = "Success";
        SuccessCount++;
        FailureCount = 0; // Reset consecutive failures
    }
    
    public void RecordFailure(string error)
    {
        LastTriggeredAt = DateTime.UtcNow;
        LastStatus = $"Failed: {error}";
        FailureCount++;
        
        // Auto-deactivate after too many failures
        if (FailureCount >= MaxRetries * 3)
        {
            IsActive = false;
        }
    }
    
    public void UpdateUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || 
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            throw new ArgumentException("Invalid webhook URL.", nameof(url));
            
        Url = url;
    }
    
    public void UpdateEvents(string events)
    {
        Events = events;
    }
    
    public void RegenerateSecret()
    {
        Secret = GenerateSecret();
    }
    
    private static string GenerateSecret()
    {
        var bytes = new byte[32];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }
        return Convert.ToBase64String(bytes);
    }
}