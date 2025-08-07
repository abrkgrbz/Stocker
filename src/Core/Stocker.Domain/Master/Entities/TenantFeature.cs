using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantFeature : Entity
{
    public Guid TenantId { get; private set; }
    public string FeatureCode { get; private set; }
    public bool IsEnabled { get; private set; }
    public DateTime EnabledAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public Dictionary<string, string> Configuration { get; private set; }

    private TenantFeature() { } // EF Constructor

    public TenantFeature(Guid tenantId, string featureCode, bool isEnabled = true, DateTime? expiresAt = null)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        FeatureCode = featureCode ?? throw new ArgumentNullException(nameof(featureCode));
        IsEnabled = isEnabled;
        EnabledAt = DateTime.UtcNow;
        ExpiresAt = expiresAt;
        Configuration = new Dictionary<string, string>();
    }

    public bool IsActive()
    {
        if (!IsEnabled)
            return false;

        if (ExpiresAt.HasValue && ExpiresAt.Value <= DateTime.UtcNow)
            return false;

        return true;
    }

    public void Enable(DateTime? expiresAt = null)
    {
        IsEnabled = true;
        EnabledAt = DateTime.UtcNow;
        ExpiresAt = expiresAt;
    }

    public void Disable()
    {
        IsEnabled = false;
    }

    public void ExtendExpiration(DateTime newExpirationDate)
    {
        if (newExpirationDate <= DateTime.UtcNow)
        {
            throw new ArgumentException("Expiration date must be in the future.", nameof(newExpirationDate));
        }

        ExpiresAt = newExpirationDate;
    }

    public void AddConfiguration(string key, string value)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new ArgumentException("Configuration key cannot be empty.", nameof(key));
        }

        Configuration[key] = value;
    }

    public void RemoveConfiguration(string key)
    {
        Configuration.Remove(key);
    }

    public string? GetConfiguration(string key)
    {
        return Configuration.TryGetValue(key, out var value) ? value : null;
    }
}