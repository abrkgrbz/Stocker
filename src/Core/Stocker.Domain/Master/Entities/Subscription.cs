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
    public Guid PackageId { get; private set; }
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
    public IReadOnlyList<SubscriptionModule> Modules => _modules.AsReadOnly();
    public IReadOnlyList<SubscriptionUsage> Usages => _usages.AsReadOnly();

    private Subscription() { } // EF Constructor

    private Subscription(
        Guid tenantId,
        Guid packageId,
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
        Guid packageId,
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

    public bool IsInTrial()
    {
        return Status == SubscriptionStatus.Deneme && TrialEndDate.HasValue && TrialEndDate.Value > DateTime.UtcNow;
    }

    public bool IsExpired()
    {
        return Status == SubscriptionStatus.SuresiDoldu || 
               (Status == SubscriptionStatus.IptalEdildi && CurrentPeriodEnd < DateTime.UtcNow);
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