using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.Events;
using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class Tenant : AggregateRoot
{
    private readonly List<TenantDomain> _domains = new();
    // TenantFeature moved to Tenant domain
    // private readonly List<TenantFeature> _features = new();
    private readonly List<Subscription> _subscriptions = new();

    public string Name { get; private set; }
    public string Code { get; private set; }
    public string DatabaseName { get; private set; }
    public ConnectionString ConnectionString { get; private set; }

    /// <summary>
    /// Encrypted connection string for secure storage.
    /// Use ITenantDatabaseSecurityService to decrypt at runtime.
    /// </summary>
    public string? EncryptedConnectionString { get; private set; }

    /// <summary>
    /// The dedicated PostgreSQL username for this tenant (e.g., tenant_user_abc123)
    /// </summary>
    public string? DatabaseUsername { get; private set; }

    /// <summary>
    /// When the database credentials should be rotated (90-day policy)
    /// </summary>
    public DateTime? CredentialsRotateAfter { get; private set; }

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
    // TenantFeature moved to Tenant domain
    // public IReadOnlyList<TenantFeature> Features => _features.AsReadOnly();
    public IReadOnlyList<Subscription> Subscriptions => _subscriptions.AsReadOnly();
    
    // New Navigation Properties for Registration Process
    public TenantRegistration? Registration { get; private set; }
    public TenantContract? ActiveContract { get; private set; }
    public TenantBilling? BillingInfo { get; private set; }
    // TenantOnboarding moved to Tenant domain
    // public TenantOnboarding? Onboarding { get; private set; }
    public TenantLimits? Limits { get; private set; }
    
    // Entities moved to Tenant domain - relationships managed differently
    // public TenantSettings? Settings { get; private set; }
    // public TenantSecuritySettings? SecuritySettings { get; private set; }
    public ICollection<TenantContract> Contracts { get; private set; } = new List<TenantContract>();
    // public ICollection<TenantApiKey> ApiKeys { get; private set; } = new List<TenantApiKey>();
    // public ICollection<TenantWebhook> Webhooks { get; private set; } = new List<TenantWebhook>();
    // public ICollection<TenantIntegration> Integrations { get; private set; } = new List<TenantIntegration>();
    // public ICollection<TenantActivityLog> ActivityLogs { get; private set; } = new List<TenantActivityLog>();
    public ICollection<TenantHealthCheck> HealthChecks { get; private set; } = new List<TenantHealthCheck>();
    public ICollection<TenantBackup> Backups { get; private set; } = new List<TenantBackup>();

    /// <summary>
    /// Comma-separated list of enabled module codes for this tenant.
    /// Managed by subscription activation/cancellation handlers.
    /// </summary>
    public string? EnabledModuleCodes { get; private set; }

    /// <summary>
    /// Maximum number of users allowed for this tenant based on subscription.
    /// </summary>
    public int MaxUsers { get; private set; } = 1;

    /// <summary>
    /// Current number of active users for this tenant.
    /// </summary>
    public int CurrentUserCount { get; private set; } = 0;

    private Tenant() { } // EF Constructor

    private Tenant(
        string name,
        string code,
        string databaseName,
        ConnectionString connectionString,
        Email contactEmail,
        bool isActive,
        PhoneNumber? contactPhone = null,
        string? description = null,
        string? logoUrl = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Code = code;
        DatabaseName = databaseName;
        ConnectionString = connectionString;
        IsActive = isActive;
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
        string? logoUrl = null,
        bool isActive = false)
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

        return new Tenant(name, code, databaseName, connectionString, contactEmail, isActive, contactPhone, description, logoUrl);
    }

    public void Activate()
    {
        if (IsActive)
        {
            throw new InvalidOperationException("Tenant is already active.");
        }

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;

        // Note: TenantActivatedDomainEvent is raised in the command handler
        // where we have access to registration contact email for SignalR notification
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

    public bool ToggleStatus()
    {
        if (IsActive)
        {
            Deactivate();
        }
        else
        {
            Activate();
        }
        return IsActive;
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

    /// <summary>
    /// Updates the database name. Should only be called during initial setup
    /// when the database name needs to be derived from the tenant ID.
    /// </summary>
    public void UpdateDatabaseName(string databaseName)
    {
        if (string.IsNullOrWhiteSpace(databaseName))
        {
            throw new ArgumentException("Database name cannot be empty.", nameof(databaseName));
        }

        DatabaseName = databaseName;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates the secure connection string with encrypted storage and dedicated credentials.
    /// </summary>
    /// <param name="connectionString">The ValueObject connection string</param>
    /// <param name="encryptedConnectionString">The encrypted version for storage</param>
    /// <param name="databaseUsername">The dedicated PostgreSQL username</param>
    /// <param name="credentialsRotateAfter">When credentials should be rotated</param>
    public void UpdateSecureConnectionString(
        ConnectionString connectionString,
        string encryptedConnectionString,
        string databaseUsername,
        DateTime? credentialsRotateAfter = null)
    {
        ConnectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        EncryptedConnectionString = encryptedConnectionString ?? throw new ArgumentNullException(nameof(encryptedConnectionString));
        DatabaseUsername = databaseUsername ?? throw new ArgumentNullException(nameof(databaseUsername));
        CredentialsRotateAfter = credentialsRotateAfter ?? DateTime.UtcNow.AddDays(90);
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new TenantConnectionStringUpdatedDomainEvent(Id));
    }

    /// <summary>
    /// Updates only the encrypted connection string and rotation date (used during credential rotation).
    /// </summary>
    public void RotateCredentials(string encryptedConnectionString, DateTime rotateAfter)
    {
        EncryptedConnectionString = encryptedConnectionString ?? throw new ArgumentNullException(nameof(encryptedConnectionString));
        CredentialsRotateAfter = rotateAfter;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new TenantConnectionStringUpdatedDomainEvent(Id));
    }

    /// <summary>
    /// Checks if credentials need rotation based on the rotation policy.
    /// </summary>
    public bool NeedsCredentialRotation()
    {
        return CredentialsRotateAfter.HasValue && DateTime.UtcNow >= CredentialsRotateAfter.Value;
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
    
    public void StartOnboarding()
    {
        // TenantOnboarding has been moved to Tenant domain
        // Onboarding should now be handled through the Tenant database context
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
        // TenantOnboarding has been moved to Tenant domain
        // Onboarding completion should be tracked through the Tenant database context
        UpdatedAt = DateTime.UtcNow;
        
        RaiseDomainEvent(new TenantOnboardingCompletedDomainEvent(Id));
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

    #region Module Management

    /// <summary>
    /// Updates the list of enabled modules for this tenant.
    /// Called by subscription activation/cancellation handlers.
    /// </summary>
    public void UpdateEnabledModules(IEnumerable<string> moduleCodes)
    {
        var codes = moduleCodes?.Distinct().ToList() ?? new List<string>();
        EnabledModuleCodes = codes.Any() ? string.Join(",", codes) : null;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Gets the list of enabled module codes for this tenant.
    /// </summary>
    public List<string> GetEnabledModuleCodes()
    {
        if (string.IsNullOrEmpty(EnabledModuleCodes))
            return new List<string>();

        return EnabledModuleCodes.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
    }

    /// <summary>
    /// Checks if a specific module is enabled for this tenant.
    /// </summary>
    public bool IsModuleEnabled(string moduleCode)
    {
        if (string.IsNullOrEmpty(EnabledModuleCodes))
            return false;

        return GetEnabledModuleCodes().Contains(moduleCode, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Adds a module to the enabled modules list.
    /// </summary>
    public void EnableModule(string moduleCode)
    {
        if (string.IsNullOrWhiteSpace(moduleCode))
            throw new ArgumentException("Module code cannot be empty.", nameof(moduleCode));

        var codes = GetEnabledModuleCodes();
        if (!codes.Contains(moduleCode, StringComparer.OrdinalIgnoreCase))
        {
            codes.Add(moduleCode);
            UpdateEnabledModules(codes);
        }
    }

    /// <summary>
    /// Removes a module from the enabled modules list.
    /// </summary>
    public void DisableModule(string moduleCode)
    {
        if (string.IsNullOrWhiteSpace(moduleCode))
            throw new ArgumentException("Module code cannot be empty.", nameof(moduleCode));

        var codes = GetEnabledModuleCodes();
        codes.RemoveAll(c => c.Equals(moduleCode, StringComparison.OrdinalIgnoreCase));
        UpdateEnabledModules(codes);
    }

    #endregion

    #region User Management

    /// <summary>
    /// Updates the maximum number of users allowed for this tenant.
    /// Called by subscription activation handlers.
    /// </summary>
    public void UpdateMaxUsers(int maxUsers)
    {
        if (maxUsers <= 0)
            throw new ArgumentException("Max users must be greater than zero.", nameof(maxUsers));

        MaxUsers = maxUsers;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates the current user count for this tenant.
    /// </summary>
    public void UpdateCurrentUserCount(int count)
    {
        if (count < 0)
            throw new ArgumentException("User count cannot be negative.", nameof(count));

        CurrentUserCount = count;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Checks if the tenant can add more users.
    /// </summary>
    public bool CanAddMoreUsers()
    {
        return CurrentUserCount < MaxUsers;
    }

    /// <summary>
    /// Gets the number of additional users that can be added.
    /// </summary>
    public int GetRemainingUserSlots()
    {
        return Math.Max(0, MaxUsers - CurrentUserCount);
    }

    #endregion
}