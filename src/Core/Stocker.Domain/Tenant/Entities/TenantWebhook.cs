using System;
using System.Collections.Generic;
using System.Linq;
using Stocker.Domain.Constants;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public class TenantWebhook : AggregateRoot<Guid>
{
    private TenantWebhook() { }
    
    public string Name { get; private set; } = string.Empty;
    public string Url { get; private set; } = string.Empty;
    public string Secret { get; private set; } = string.Empty;
    public WebhookEventType EventType { get; private set; }
    public bool IsActive { get; private set; }
    public string? Description { get; private set; }
    
    // Webhook Configuration
    public string HttpMethod { get; private set; } = "POST";
    public string? ContentType { get; private set; } = "application/json";
    public string? Headers { get; private set; } // JSON serialized headers
    public int TimeoutSeconds { get; private set; } = 30;
    public int MaxRetries { get; private set; } = 3;
    public int RetryDelaySeconds { get; private set; } = 60;
    
    // Authentication
    public WebhookAuthType AuthType { get; private set; } = WebhookAuthType.None;
    public string? AuthToken { get; private set; }
    public string? AuthHeaderName { get; private set; }
    public string? BasicAuthUsername { get; private set; }
    public string? BasicAuthPassword { get; private set; }
    
    // Filtering & Conditions
    public string? EventFilters { get; private set; } // JSON serialized filters
    public string? PayloadTemplate { get; private set; } // Custom payload template
    public bool OnlyOnSuccess { get; private set; }
    public bool IncludePayload { get; private set; } = true;
    
    // Rate Limiting
    public int? RateLimitPerMinute { get; private set; }
    public DateTime? LastTriggeredAt { get; private set; }
    public int TriggerCount { get; private set; }
    
    // Statistics
    public int SuccessCount { get; private set; }
    public int FailureCount { get; private set; }
    public DateTime? LastSuccessAt { get; private set; }
    public DateTime? LastFailureAt { get; private set; }
    public string? LastError { get; private set; }
    public double AverageResponseTime { get; private set; } // milliseconds
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;
    public DateTime? ModifiedAt { get; private set; }
    public string? ModifiedBy { get; private set; }
    public DateTime? DeactivatedAt { get; private set; }
    public string? DeactivatedBy { get; private set; }
    
    public static TenantWebhook Create(
        string name,
        string url,
        WebhookEventType eventType,
        string createdBy,
        string? secret = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Webhook name is required", nameof(name));
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Webhook URL is required", nameof(url));
        if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
            throw new ArgumentException("Invalid webhook URL format", nameof(url));
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Creator is required", nameof(createdBy));
            
        return new TenantWebhook
        {
            Id = Guid.NewGuid(),
            Name = name,
            Url = url,
            Secret = secret ?? GenerateSecret(),
            EventType = eventType,
            Description = description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
    }
    
    public void UpdateConfiguration(
        string? httpMethod = null,
        string? contentType = null,
        string? headers = null,
        int? timeoutSeconds = null,
        int? maxRetries = null,
        int? retryDelaySeconds = null,
        string modifiedBy = null)
    {
        if (!string.IsNullOrWhiteSpace(httpMethod))
        {
            var validMethods = new[] { "GET", "POST", "PUT", "PATCH", "DELETE" };
            if (!validMethods.Contains(httpMethod.ToUpper()))
                throw new ArgumentException("Invalid HTTP method", nameof(httpMethod));
            HttpMethod = httpMethod.ToUpper();
        }
        
        if (!string.IsNullOrWhiteSpace(contentType))
            ContentType = contentType;
            
        if (headers != null)
            Headers = headers;
            
        if (timeoutSeconds.HasValue)
        {
            if (timeoutSeconds.Value < 1 || timeoutSeconds.Value > 300)
                throw new ArgumentException("Timeout must be between 1 and 300 seconds", nameof(timeoutSeconds));
            TimeoutSeconds = timeoutSeconds.Value;
        }
        
        if (maxRetries.HasValue)
        {
            if (maxRetries.Value < 0 || maxRetries.Value > 10)
                throw new ArgumentException("Max retries must be between 0 and 10", nameof(maxRetries));
            MaxRetries = maxRetries.Value;
        }
        
        if (retryDelaySeconds.HasValue)
        {
            if (retryDelaySeconds.Value < 1 || retryDelaySeconds.Value > 3600)
                throw new ArgumentException("Retry delay must be between 1 and 3600 seconds", nameof(retryDelaySeconds));
            RetryDelaySeconds = retryDelaySeconds.Value;
        }
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy ?? DomainConstants.SystemUser;
    }
    
    public void SetAuthentication(
        WebhookAuthType authType,
        string? authToken = null,
        string? authHeaderName = null,
        string? basicAuthUsername = null,
        string? basicAuthPassword = null,
        string modifiedBy = null)
    {
        AuthType = authType;
        
        switch (authType)
        {
            case WebhookAuthType.Bearer:
                if (string.IsNullOrWhiteSpace(authToken))
                    throw new ArgumentException("Auth token is required for Bearer authentication");
                AuthToken = authToken;
                AuthHeaderName = "Authorization";
                BasicAuthUsername = null;
                BasicAuthPassword = null;
                break;
                
            case WebhookAuthType.ApiKey:
                if (string.IsNullOrWhiteSpace(authToken) || string.IsNullOrWhiteSpace(authHeaderName))
                    throw new ArgumentException("API key and header name are required for API key authentication");
                AuthToken = authToken;
                AuthHeaderName = authHeaderName;
                BasicAuthUsername = null;
                BasicAuthPassword = null;
                break;
                
            case WebhookAuthType.Basic:
                if (string.IsNullOrWhiteSpace(basicAuthUsername) || string.IsNullOrWhiteSpace(basicAuthPassword))
                    throw new ArgumentException("Username and password are required for Basic authentication");
                BasicAuthUsername = basicAuthUsername;
                BasicAuthPassword = basicAuthPassword;
                AuthToken = null;
                AuthHeaderName = "Authorization";
                break;
                
            case WebhookAuthType.None:
            default:
                AuthToken = null;
                AuthHeaderName = null;
                BasicAuthUsername = null;
                BasicAuthPassword = null;
                break;
        }
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy ?? DomainConstants.SystemUser;
    }
    
    public void SetFilters(string? eventFilters, string? payloadTemplate, bool onlyOnSuccess, bool includePayload, string modifiedBy)
    {
        EventFilters = eventFilters;
        PayloadTemplate = payloadTemplate;
        OnlyOnSuccess = onlyOnSuccess;
        IncludePayload = includePayload;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void SetRateLimit(int? rateLimitPerMinute, string modifiedBy)
    {
        if (rateLimitPerMinute.HasValue && (rateLimitPerMinute.Value < 1 || rateLimitPerMinute.Value > 1000))
            throw new ArgumentException("Rate limit must be between 1 and 1000 per minute", nameof(rateLimitPerMinute));
            
        RateLimitPerMinute = rateLimitPerMinute;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void RecordTrigger()
    {
        LastTriggeredAt = DateTime.UtcNow;
        TriggerCount++;
    }
    
    public void RecordSuccess(double responseTimeMs)
    {
        SuccessCount++;
        LastSuccessAt = DateTime.UtcNow;
        LastError = null;
        
        // Update average response time
        if (AverageResponseTime == 0)
            AverageResponseTime = responseTimeMs;
        else
            AverageResponseTime = ((AverageResponseTime * (SuccessCount - 1)) + responseTimeMs) / SuccessCount;
    }
    
    public void RecordFailure(string error)
    {
        FailureCount++;
        LastFailureAt = DateTime.UtcNow;
        LastError = error;
    }
    
    public void Activate(string activatedBy)
    {
        if (IsActive)
            return;
            
        IsActive = true;
        DeactivatedAt = null;
        DeactivatedBy = null;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = activatedBy;
    }
    
    public void Deactivate(string deactivatedBy)
    {
        if (!IsActive)
            return;
            
        IsActive = false;
        DeactivatedAt = DateTime.UtcNow;
        DeactivatedBy = deactivatedBy;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = deactivatedBy;
    }
    
    public void UpdateUrl(string url, string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Webhook URL is required", nameof(url));
        if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
            throw new ArgumentException("Invalid webhook URL format", nameof(url));
            
        Url = url;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void RegenerateSecret(string modifiedBy)
    {
        Secret = GenerateSecret();
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public bool IsRateLimited()
    {
        if (!RateLimitPerMinute.HasValue || !LastTriggeredAt.HasValue)
            return false;
            
        var timeSinceLastTrigger = DateTime.UtcNow - LastTriggeredAt.Value;
        if (timeSinceLastTrigger.TotalMinutes >= 1)
            return false;
            
        // Count triggers in the last minute
        // This is simplified - in production you'd want a sliding window
        return TriggerCount >= RateLimitPerMinute.Value;
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

public enum WebhookEventType
{
    All,
    UserCreated,
    UserUpdated,
    UserDeleted,
    UserLoggedIn,
    UserLoggedOut,
    OrderCreated,
    OrderUpdated,
    OrderCancelled,
    OrderCompleted,
    PaymentReceived,
    PaymentFailed,
    InventoryLow,
    InventoryUpdated,
    CustomerCreated,
    CustomerUpdated,
    InvoiceCreated,
    InvoicePaid,
    SubscriptionCreated,
    SubscriptionCancelled,
    SubscriptionRenewed,
    DataExported,
    DataImported,
    ReportGenerated,
    AlertTriggered,
    SystemError,
    Custom
}

public enum WebhookAuthType
{
    None,
    Bearer,
    ApiKey,
    Basic,
    OAuth2
}