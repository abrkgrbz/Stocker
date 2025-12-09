using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.Events;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class Subscription : AggregateRoot
{
    private readonly List<SubscriptionModule> _modules = new();
    private readonly List<SubscriptionUsage> _usages = new();

    public Guid TenantId { get; private set; }
    public Guid? PackageId { get; private set; }
    public string SubscriptionNumber { get; private set; }
    
    // Navigation properties
    public Package Package { get; private set; } = null!;
    public Tenant Tenant { get; private set; } = null!;
    public SubscriptionStatus Status { get; private set; }
    public BillingCycle BillingCycle { get; private set; }
    public Money Price { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime CurrentPeriodStart { get; private set; }
    public DateTime CurrentPeriodEnd { get; private set; }
    public DateTime? TrialEndDate { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public string? CancellationReason { get; private set; }
    public bool AutoRenew { get; private set; }
    public int UserCount { get; private set; }

    // Storage quota and usage tracking
    public string? StorageBucketName { get; private set; }
    public long StorageQuotaGB { get; private set; }
    public long StorageUsedBytes { get; private set; }
    public DateTime? StorageLastCheckedAt { get; private set; }

    // Custom package details (JSON serialized)
    public string? CustomModuleCodes { get; private set; }
    public string? CustomStoragePlanCode { get; private set; }
    public string? CustomAddOnCodes { get; private set; }
    public bool IsCustomPackage => !PackageId.HasValue;

    public IReadOnlyList<SubscriptionModule> Modules => _modules.AsReadOnly();
    public IReadOnlyList<SubscriptionUsage> Usages => _usages.AsReadOnly();

    private Subscription() { } // EF Constructor

    private Subscription(
        Guid tenantId,
        Guid? packageId,
        BillingCycle billingCycle,
        Money price,
        DateTime startDate,
        DateTime? trialEndDate = null)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        PackageId = packageId;
        SubscriptionNumber = GenerateSubscriptionNumber();
        Status = trialEndDate.HasValue ? SubscriptionStatus.Deneme : SubscriptionStatus.Aktif;
        BillingCycle = billingCycle;
        Price = price;
        StartDate = startDate;
        CurrentPeriodStart = startDate;
        CurrentPeriodEnd = CalculateNextBillingDate(startDate, billingCycle);
        TrialEndDate = trialEndDate;
        AutoRenew = true;
        UserCount = 1; // Default to 1 user

        RaiseDomainEvent(new SubscriptionCreatedDomainEvent(Id, TenantId, PackageId));
    }

    public static Subscription Create(
        Guid tenantId,
        Guid? packageId,
        BillingCycle billingCycle,
        Money price,
        DateTime startDate,
        DateTime? trialEndDate = null)
    {
        if (trialEndDate.HasValue && trialEndDate.Value <= startDate)
        {
            throw new ArgumentException("Trial end date must be after start date.", nameof(trialEndDate));
        }

        return new Subscription(tenantId, packageId, billingCycle, price, startDate, trialEndDate);
    }

    public void StartTrial(DateTime trialEndDate)
    {
        if (Status != SubscriptionStatus.Askida && Status != SubscriptionStatus.Beklemede)
        {
            throw new InvalidOperationException("Can only start trial from Suspended or Pending status.");
        }

        if (trialEndDate <= DateTime.UtcNow)
        {
            throw new ArgumentException("Trial end date must be in the future.", nameof(trialEndDate));
        }

        Status = SubscriptionStatus.Deneme;
        TrialEndDate = trialEndDate;
        StartDate = DateTime.UtcNow;
        CurrentPeriodStart = DateTime.UtcNow;
        CurrentPeriodEnd = trialEndDate;
    }

    public void Activate()
    {
        if (Status != SubscriptionStatus.Deneme)
        {
            throw new InvalidOperationException("Only trial subscriptions can be activated.");
        }

        Status = SubscriptionStatus.Aktif;
        RaiseDomainEvent(new SubscriptionActivatedDomainEvent(Id, TenantId));
    }

    public void Suspend(string reason)
    {
        if (Status == SubscriptionStatus.IptalEdildi || Status == SubscriptionStatus.SuresiDoldu)
        {
            throw new InvalidOperationException("Cannot suspend cancelled or expired subscriptions.");
        }

        Status = SubscriptionStatus.Askida;
        RaiseDomainEvent(new SubscriptionSuspendedDomainEvent(Id, TenantId, reason));
    }

    public void Reactivate()
    {
        if (Status != SubscriptionStatus.Askida && Status != SubscriptionStatus.OdemesiGecikti)
        {
            throw new InvalidOperationException("Only suspended or past due subscriptions can be reactivated.");
        }

        Status = SubscriptionStatus.Aktif;
        RaiseDomainEvent(new SubscriptionReactivatedDomainEvent(Id, TenantId));
    }

    public void Cancel(string reason)
    {
        if (Status == SubscriptionStatus.IptalEdildi || Status == SubscriptionStatus.SuresiDoldu)
        {
            throw new InvalidOperationException("Subscription is already cancelled or expired.");
        }

        Status = SubscriptionStatus.IptalEdildi;
        CancelledAt = DateTime.UtcNow;
        CancellationReason = reason;
        AutoRenew = false;

        RaiseDomainEvent(new SubscriptionCancelledDomainEvent(Id, TenantId, reason));
    }

    public void MarkAsPastDue()
    {
        if (Status != SubscriptionStatus.Aktif)
        {
            throw new InvalidOperationException("Only active subscriptions can be marked as past due.");
        }

        Status = SubscriptionStatus.OdemesiGecikti;
    }

    public void Expire()
    {
        if (Status == SubscriptionStatus.SuresiDoldu)
        {
            throw new InvalidOperationException("Subscription is already expired.");
        }

        Status = SubscriptionStatus.SuresiDoldu;
        AutoRenew = false;

        RaiseDomainEvent(new SubscriptionExpiredDomainEvent(Id, TenantId));
    }

    public void Renew()
    {
        if (Status != SubscriptionStatus.Aktif && Status != SubscriptionStatus.OdemesiGecikti)
        {
            throw new InvalidOperationException("Only active or past due subscriptions can be renewed.");
        }

        CurrentPeriodStart = CurrentPeriodEnd;
        CurrentPeriodEnd = CalculateNextBillingDate(CurrentPeriodStart, BillingCycle);
        Status = SubscriptionStatus.Aktif;

        RaiseDomainEvent(new SubscriptionRenewedDomainEvent(Id, TenantId, CurrentPeriodEnd));
    }

    public void UpdateBillingCycle(BillingCycle newCycle, Money newPrice)
    {
        BillingCycle = newCycle;
        Price = newPrice;
        CurrentPeriodEnd = CalculateNextBillingDate(CurrentPeriodStart, newCycle);
    }

    public void ChangePackage(Guid newPackageId, Money newPrice)
    {
        if (Status == SubscriptionStatus.IptalEdildi || Status == SubscriptionStatus.SuresiDoldu)
        {
            throw new InvalidOperationException("Cannot change package for cancelled or expired subscriptions.");
        }

        var oldPackageId = PackageId;
        PackageId = newPackageId;
        Price = newPrice;

        RaiseDomainEvent(new SubscriptionPackageChangedDomainEvent(Id, TenantId, oldPackageId, newPackageId));
    }

    public void SetAutoRenew(bool autoRenew)
    {
        AutoRenew = autoRenew;
    }

    public void UpdateUserCount(int userCount)
    {
        if (userCount <= 0)
        {
            throw new ArgumentException("User count must be greater than zero.", nameof(userCount));
        }

        UserCount = userCount;
    }

    public void AddModule(string moduleCode, string moduleName, int? maxEntities = null)
    {
        if (_modules.Any(m => m.ModuleCode == moduleCode))
        {
            throw new InvalidOperationException($"Module '{moduleCode}' already exists in this subscription.");
        }

        _modules.Add(new SubscriptionModule(Id, moduleCode, moduleName, maxEntities));
    }

    public void RemoveModule(string moduleCode)
    {
        var module = _modules.FirstOrDefault(m => m.ModuleCode == moduleCode);
        if (module == null)
        {
            throw new InvalidOperationException($"Module '{moduleCode}' not found in this subscription.");
        }

        _modules.Remove(module);
    }

    public void RecordUsage(string metricName, int value, DateTime recordedAt)
    {
        _usages.Add(new SubscriptionUsage(Id, metricName, value, recordedAt));
    }

    /// <summary>
    /// Set custom package details for subscriptions without a pre-defined package
    /// </summary>
    public void SetCustomPackageDetails(
        List<string> moduleCodes,
        int userCount,
        string? storagePlanCode,
        List<string>? addOnCodes)
    {
        CustomModuleCodes = string.Join(",", moduleCodes);
        UserCount = userCount > 0 ? userCount : 1;
        CustomStoragePlanCode = storagePlanCode;
        CustomAddOnCodes = addOnCodes?.Any() == true ? string.Join(",", addOnCodes) : null;
    }

    /// <summary>
    /// Get the list of custom module codes
    /// </summary>
    public List<string> GetCustomModuleCodes()
    {
        if (string.IsNullOrEmpty(CustomModuleCodes))
            return new List<string>();

        return CustomModuleCodes.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
    }

    /// <summary>
    /// Get the list of custom add-on codes
    /// </summary>
    public List<string> GetCustomAddOnCodes()
    {
        if (string.IsNullOrEmpty(CustomAddOnCodes))
            return new List<string>();

        return CustomAddOnCodes.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
    }

    public bool IsInTrial()
    {
        return Status == SubscriptionStatus.Deneme && TrialEndDate.HasValue && TrialEndDate.Value > DateTime.UtcNow;
    }

    public bool IsExpired()
    {
        return Status == SubscriptionStatus.SuresiDoldu ||
               (Status == SubscriptionStatus.IptalEdildi && CurrentPeriodEnd < DateTime.UtcNow);
    }

    /// <summary>
    /// Sets the storage bucket information for this subscription
    /// </summary>
    public void SetStorageBucket(string bucketName, long quotaGB)
    {
        if (string.IsNullOrWhiteSpace(bucketName))
            throw new ArgumentException("Bucket name cannot be empty.", nameof(bucketName));

        if (quotaGB <= 0)
            throw new ArgumentException("Storage quota must be greater than zero.", nameof(quotaGB));

        StorageBucketName = bucketName;
        StorageQuotaGB = quotaGB;
        StorageLastCheckedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates the storage usage statistics
    /// </summary>
    public void UpdateStorageUsage(long usedBytes)
    {
        if (usedBytes < 0)
            throw new ArgumentException("Used bytes cannot be negative.", nameof(usedBytes));

        StorageUsedBytes = usedBytes;
        StorageLastCheckedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates the storage quota (e.g., when upgrading plan)
    /// </summary>
    public void UpdateStorageQuota(long newQuotaGB)
    {
        if (newQuotaGB <= 0)
            throw new ArgumentException("Storage quota must be greater than zero.", nameof(newQuotaGB));

        StorageQuotaGB = newQuotaGB;
    }

    /// <summary>
    /// Gets the storage usage percentage
    /// </summary>
    public double GetStorageUsagePercentage()
    {
        if (StorageQuotaGB <= 0) return 0;
        var quotaBytes = StorageQuotaGB * 1024 * 1024 * 1024;
        return Math.Round((double)StorageUsedBytes / quotaBytes * 100, 2);
    }

    /// <summary>
    /// Checks if storage quota is exceeded
    /// </summary>
    public bool IsStorageQuotaExceeded()
    {
        if (StorageQuotaGB <= 0) return false;
        var quotaBytes = StorageQuotaGB * 1024 * 1024 * 1024;
        return StorageUsedBytes >= quotaBytes;
    }

    private static DateTime CalculateNextBillingDate(DateTime fromDate, BillingCycle cycle)
    {
        return cycle switch
        {
            BillingCycle.Aylik => fromDate.AddMonths(1),
            BillingCycle.UcAylik => fromDate.AddMonths(3),
            BillingCycle.AltiAylik => fromDate.AddMonths(6),
            BillingCycle.Yillik => fromDate.AddYears(1),
            _ => fromDate.AddMonths(1)
        };
    }

    private static string GenerateSubscriptionNumber()
    {
        return $"SUB-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }
}