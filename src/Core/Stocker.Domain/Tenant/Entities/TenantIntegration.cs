using Stocker.SharedKernel.Primitives;
using System;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Tenant'a özel 3. parti entegrasyonlar
/// </summary>
public sealed class TenantIntegration : Entity
{
    public string Name { get; private set; }
    public string Type { get; private set; } // e.g., "Slack", "Teams", "Zapier", "GoogleWorkspace"
    public string? Description { get; private set; }
    public string Configuration { get; private set; } // Encrypted JSON configuration
    public bool IsActive { get; private set; }
    public bool IsConnected { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastSyncAt { get; private set; }
    public string? LastSyncStatus { get; private set; }
    public string? LastError { get; private set; }
    public string CreatedBy { get; private set; }
    public string? WebhookUrl { get; private set; }
    public string? ApiKey { get; private set; } // Encrypted
    public string? RefreshToken { get; private set; } // Encrypted
    public DateTime? TokenExpiresAt { get; private set; }
    
    private TenantIntegration() { } // EF Constructor
    
    private TenantIntegration(
        string name,
        string type,
        string configuration,
        string createdBy,
        string? description = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Type = type;
        Description = description;
        Configuration = configuration;
        IsActive = false; // Requires connection first
        IsConnected = false;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
    }
    
    public static TenantIntegration Create(
        string name,
        string type,
        string configuration,
        string createdBy,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Integration name cannot be empty.", nameof(name));
            
        if (string.IsNullOrWhiteSpace(type))
            throw new ArgumentException("Integration type cannot be empty.", nameof(type));
            
        return new TenantIntegration(name, type, configuration, createdBy, description);
    }
    
    public void Connect(string? apiKey = null, string? refreshToken = null, DateTime? tokenExpiresAt = null)
    {
        IsConnected = true;
        IsActive = true;
        ApiKey = apiKey;
        RefreshToken = refreshToken;
        TokenExpiresAt = tokenExpiresAt;
        LastSyncStatus = "Connected";
        LastSyncAt = DateTime.UtcNow;
    }
    
    public void Disconnect()
    {
        IsConnected = false;
        IsActive = false;
        ApiKey = null;
        RefreshToken = null;
        TokenExpiresAt = null;
        LastSyncStatus = "Disconnected";
    }
    
    public void UpdateConfiguration(string configuration)
    {
        Configuration = configuration;
    }
    
    public void UpdateTokens(string? apiKey, string? refreshToken, DateTime? expiresAt)
    {
        ApiKey = apiKey;
        RefreshToken = refreshToken;
        TokenExpiresAt = expiresAt;
    }
    
    public void RecordSync(bool success, string? error = null)
    {
        LastSyncAt = DateTime.UtcNow;
        if (success)
        {
            LastSyncStatus = "Success";
            LastError = null;
        }
        else
        {
            LastSyncStatus = "Failed";
            LastError = error;
            
            // Auto-disconnect after repeated failures
            if (LastError != null && LastError.Contains("Authentication", StringComparison.OrdinalIgnoreCase))
            {
                IsConnected = false;
                IsActive = false;
            }
        }
    }
    
    public void Activate()
    {
        if (!IsConnected)
            throw new InvalidOperationException("Cannot activate a disconnected integration.");
            
        IsActive = true;
    }
    
    public void Deactivate()
    {
        IsActive = false;
    }
    
    public bool IsTokenExpired()
    {
        return TokenExpiresAt.HasValue && TokenExpiresAt.Value < DateTime.UtcNow;
    }
}