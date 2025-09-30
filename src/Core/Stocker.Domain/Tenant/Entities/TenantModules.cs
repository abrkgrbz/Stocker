using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public sealed class TenantModules : TenantAggregateRoot
{
    public string ModuleName { get; private set; }
    public string ModuleCode { get; private set; }
    public string? Description { get; private set; }
    public bool IsEnabled { get; private set; }
    public DateTime? EnabledDate { get; private set; }
    public DateTime? DisabledDate { get; private set; }
    public string? Configuration { get; private set; }
    public int? UserLimit { get; private set; }
    public int? StorageLimit { get; private set; }
    public int? RecordLimit { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public bool IsTrial { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private TenantModules() { } // EF Constructor

    private TenantModules(
        Guid tenantId,
        string moduleName,
        string moduleCode,
        string? description = null,
        bool isEnabled = true,
        string? configuration = null,
        int? userLimit = null,
        int? storageLimit = null,
        int? recordLimit = null,
        DateTime? expiryDate = null,
        bool isTrial = false)
    {
        Id = Guid.NewGuid();
        SetTenantId(tenantId);
        ModuleName = moduleName;
        ModuleCode = moduleCode;
        Description = description;
        IsEnabled = isEnabled;
        EnabledDate = isEnabled ? DateTime.UtcNow : null;
        Configuration = configuration;
        UserLimit = userLimit;
        StorageLimit = storageLimit;
        RecordLimit = recordLimit;
        ExpiryDate = expiryDate;
        IsTrial = isTrial;
        CreatedAt = DateTime.UtcNow;
    }

    public static TenantModules Create(
        Guid tenantId,
        string moduleName,
        string moduleCode,
        string? description = null,
        bool isEnabled = true,
        string? configuration = null,
        int? userLimit = null,
        int? storageLimit = null,
        int? recordLimit = null,
        DateTime? expiryDate = null,
        bool isTrial = false)
    {
        if (tenantId == Guid.Empty)
        {
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
        }
        
        if (string.IsNullOrWhiteSpace(moduleName))
        {
            throw new ArgumentException("Module name cannot be empty.", nameof(moduleName));
        }

        if (string.IsNullOrWhiteSpace(moduleCode))
        {
            throw new ArgumentException("Module code cannot be empty.", nameof(moduleCode));
        }

        return new TenantModules(
            tenantId,
            moduleName,
            moduleCode,
            description,
            isEnabled,
            configuration,
            userLimit,
            storageLimit,
            recordLimit,
            expiryDate,
            isTrial);
    }

    public void Enable()
    {
        if (IsEnabled)
        {
            throw new InvalidOperationException("Module is already enabled.");
        }

        if (ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow)
        {
            throw new InvalidOperationException("Cannot enable expired module.");
        }

        IsEnabled = true;
        EnabledDate = DateTime.UtcNow;
        DisabledDate = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Disable()
    {
        if (!IsEnabled)
        {
            throw new InvalidOperationException("Module is already disabled.");
        }

        IsEnabled = false;
        DisabledDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateConfiguration(string? configuration)
    {
        Configuration = configuration;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateLimits(int? userLimit, int? storageLimit, int? recordLimit)
    {
        UserLimit = userLimit;
        StorageLimit = storageLimit;
        RecordLimit = recordLimit;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ExtendExpiry(DateTime newExpiryDate)
    {
        if (newExpiryDate <= DateTime.UtcNow)
        {
            throw new ArgumentException("Expiry date must be in the future.", nameof(newExpiryDate));
        }

        ExpiryDate = newExpiryDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ConvertToPaid()
    {
        IsTrial = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsExpired()
    {
        return ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    }

    public bool IsUserLimitReached(int currentUserCount)
    {
        return UserLimit.HasValue && currentUserCount >= UserLimit.Value;
    }

    public bool IsStorageLimitReached(int currentStorageInMB)
    {
        return StorageLimit.HasValue && currentStorageInMB >= StorageLimit.Value;
    }

    public bool IsRecordLimitReached(int currentRecordCount)
    {
        return RecordLimit.HasValue && currentRecordCount >= RecordLimit.Value;
    }
}