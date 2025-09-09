using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.Events;
using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class Tenant : AggregateRoot
{
    private readonly List<TenantDomain> _domains = new();
    private readonly List<TenantFeature> _features = new();
    private readonly List<Subscription> _subscriptions = new();

    public string Name { get; private set; }
    public string Code { get; private set; }
    public string DatabaseName { get; private set; }
    public ConnectionString ConnectionString { get; private set; }
    public bool IsActive { get; private set; }
    public string? Description { get; private set; }
    public string? LogoUrl { get; private set; }
    public Email ContactEmail { get; private set; }
    public PhoneNumber? ContactPhone { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? CreatedBy { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation properties
    public IReadOnlyList<TenantDomain> Domains => _domains.AsReadOnly();
    public IReadOnlyList<TenantFeature> Features => _features.AsReadOnly();
    public IReadOnlyList<Subscription> Subscriptions => _subscriptions.AsReadOnly();
    
    // New Navigation Properties for Registration Process
    public TenantRegistration? Registration { get; private set; }
    public TenantContract? ActiveContract { get; private set; }
    public TenantBilling? BillingInfo { get; private set; }
    public TenantOnboarding? Onboarding { get; private set; }
    public TenantLimits? Limits { get; private set; }
    
    // Existing Navigation Properties
    public TenantSettings? Settings { get; private set; }
    public TenantSecuritySettings? SecuritySettings { get; private set; }
    public ICollection<TenantContract> Contracts { get; private set; } = new List<TenantContract>();
    public ICollection<TenantApiKey> ApiKeys { get; private set; } = new List<TenantApiKey>();
    public ICollection<TenantWebhook> Webhooks { get; private set; } = new List<TenantWebhook>();
    public ICollection<TenantIntegration> Integrations { get; private set; } = new List<TenantIntegration>();
    public ICollection<TenantActivityLog> ActivityLogs { get; private set; } = new List<TenantActivityLog>();
    public ICollection<TenantHealthCheck> HealthChecks { get; private set; } = new List<TenantHealthCheck>();
    public ICollection<TenantBackup> Backups { get; private set; } = new List<TenantBackup>();

    private Tenant() { } // EF Constructor

    private Tenant( 
        string name,
        string code,
        string databaseName,
        ConnectionString connectionString,
        Email contactEmail,
        PhoneNumber? contactPhone = null,
        string? description = null,
        string? logoUrl = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Code = code;
        DatabaseName = databaseName;
        ConnectionString = connectionString;
        IsActive = true;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        Description = description;
        LogoUrl = logoUrl;
        CreatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new TenantCreatedDomainEvent(Id, code, name));
    }

    public static Tenant Create(
        string name,
        string code,
        string databaseName,
        ConnectionString connectionString,
        Email contactEmail,
        PhoneNumber? contactPhone = null,
        string? description = null,
        string? logoUrl = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Tenant name cannot be empty.", nameof(name));
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Tenant code cannot be empty.", nameof(code));
        }

        if (string.IsNullOrWhiteSpace(databaseName))
        {
            throw new ArgumentException("Database name cannot be empty.", nameof(databaseName));
        }

        return new Tenant(name, code, databaseName, connectionString, contactEmail, contactPhone, description, logoUrl);
    }

    public void Activate()
    {
        if (IsActive)
        {
            throw new InvalidOperationException("Tenant is already active.");
        }

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new TenantActivatedDomainEvent(Id));
    }

    public void Deactivate()
    {
        if (!IsActive)
        {
            throw new InvalidOperationException("Tenant is already inactive.");
        }

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new TenantDeactivatedDomainEvent(Id));
    }

    public void UpdateInfo(string name, string? description, string? logoUrl, Email contactEmail, PhoneNumber? contactPhone)
    {
        Name = name;
        Description = description;
        LogoUrl = logoUrl;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new TenantInfoUpdatedDomainEvent(Id));
    }

    public void UpdateConnectionString(ConnectionString connectionString)
    {
        ConnectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new TenantConnectionStringUpdatedDomainEvent(Id));
    }

    public void AddDomain(string domainName, bool isPrimary = false)
    {
        if (string.IsNullOrWhiteSpace(domainName))
        {
            throw new ArgumentException("Domain name cannot be empty.", nameof(domainName));
        }

        if (_domains.Any(d => d.DomainName.Equals(domainName, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"Domain '{domainName}' already exists for this tenant.");
        }

        // If this is the first domain or isPrimary is true, make it primary
        if (isPrimary || !_domains.Any())
        {
            // Set all existing domains as non-primary
            foreach (var existingDomain in _domains.Where(d => d.IsPrimary))
            {
                existingDomain.SetAsPrimary(false);
            }
        }

        var domain = TenantDomain.Create(Id, domainName, isPrimary || !_domains.Any());
        _domains.Add(domain);
    }

    public void RemoveDomain(string domainName)
    {
        var tenantDomain = _domains.FirstOrDefault(d => d.DomainName.Equals(domainName, StringComparison.OrdinalIgnoreCase));
        if (tenantDomain == null)
        {
            throw new InvalidOperationException($"Domain '{domainName}' not found for this tenant.");
        }

        _domains.Remove(tenantDomain);
        
        // If removed domain was primary, set the first remaining domain as primary
        if (tenantDomain.IsPrimary && _domains.Any())
        {
            _domains.First().SetAsPrimary(true);
        }
    }

    public void EnableFeature(string featureCode, DateTime? expiresAt = null)
    {
        if (string.IsNullOrWhiteSpace(featureCode))
        {
            throw new ArgumentException("Feature code cannot be empty.", nameof(featureCode));
        }

        var existingFeature = _features.FirstOrDefault(f => f.FeatureCode == featureCode);
        if (existingFeature != null)
        {
            existingFeature.Enable(expiresAt);
        }
        else
        {
            _features.Add(new TenantFeature(Id, featureCode, true, expiresAt));
        }
    }

    public void DisableFeature(string featureCode)
    {
        var feature = _features.FirstOrDefault(f => f.FeatureCode == featureCode);
        if (feature == null)
        {
            throw new InvalidOperationException($"Feature '{featureCode}' not found for this tenant.");
        }

        feature.Disable();
    }

    public bool HasFeature(string featureCode)
    {
        var feature = _features.FirstOrDefault(f => f.FeatureCode == featureCode);
        return feature?.IsActive() ?? false;
    }
    
    // New Methods for Registration Process
    public void SetRegistration(TenantRegistration registration)
    {
        Registration = registration ?? throw new ArgumentNullException(nameof(registration));
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetContract(TenantContract contract)
    {
        ActiveContract = contract ?? throw new ArgumentNullException(nameof(contract));
        Contracts.Add(contract);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetBillingInfo(TenantBilling billingInfo)
    {
        BillingInfo = billingInfo ?? throw new ArgumentNullException(nameof(billingInfo));
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void StartOnboarding(TenantOnboarding onboarding)
    {
        Onboarding = onboarding ?? throw new ArgumentNullException(nameof(onboarding));
        UpdatedAt = DateTime.UtcNow;
        
        RaiseDomainEvent(new TenantOnboardingStartedDomainEvent(Id));
    }
    
    public void SetLimits(TenantLimits limits)
    {
        Limits = limits ?? throw new ArgumentNullException(nameof(limits));
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void CompleteOnboarding()
    {
        if (Onboarding == null)
            throw new InvalidOperationException("No onboarding process found.");
            
        Onboarding.Complete();
        UpdatedAt = DateTime.UtcNow;
        
        RaiseDomainEvent(new TenantOnboardingCompletedDomainEvent(Id));
    }
    
    public bool IsOnboardingComplete()
    {
        return Onboarding?.Status == OnboardingStatus.Completed;
    }
    
    public bool HasActiveContract()
    {
        return ActiveContract != null && 
               ActiveContract.Status == ContractStatus.Active &&
               ActiveContract.EndDate > DateTime.UtcNow;
    }
    
    public bool IsWithinLimits(UsageType usageType)
    {
        return Limits?.IsLimitExceeded(usageType) == false;
    }
}