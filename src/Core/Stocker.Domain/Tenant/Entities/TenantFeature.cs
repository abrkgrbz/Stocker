using System;
using System.Collections.Generic;
using Stocker.Domain.Constants;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public class TenantFeature : AggregateRoot<Guid>
{
    private TenantFeature() { }
    public string FeatureKey { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public FeatureType Type { get; private set; }
    public FeatureStatus Status { get; private set; }
    
    // Feature Details
    public string? Category { get; private set; }
    public string? Module { get; private set; }
    public string? Icon { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsCore { get; private set; }
    public bool IsBeta { get; private set; }
    public bool IsNew { get; private set; }
    
    // Access Control
    public bool IsEnabled { get; private set; }
    public bool RequiresSubscription { get; private set; }
    public string? RequiredPlan { get; private set; }
    public string? RequiredRole { get; private set; }
    public string? RequiredPermission { get; private set; }
    public int? MinimumUserCount { get; private set; }
    public int? MaximumUserCount { get; private set; }
    
    // Configuration
    public string? Configuration { get; private set; } // JSON configuration
    public string? DefaultSettings { get; private set; } // JSON default settings
    public string? CurrentSettings { get; private set; } // JSON current settings
    public string? Metadata { get; private set; } // JSON metadata
    
    // Usage Limits
    public bool HasUsageLimit { get; private set; }
    public int? UsageLimit { get; private set; }
    public int CurrentUsage { get; private set; }
    public UsagePeriod? UsagePeriod { get; private set; }
    public DateTime? UsageResetDate { get; private set; }
    public DateTime? LastUsedAt { get; private set; }
    
    // Trial Information
    public bool IsTrialAvailable { get; private set; }
    public int? TrialDays { get; private set; }
    public DateTime? TrialStartDate { get; private set; }
    public DateTime? TrialEndDate { get; private set; }
    public bool IsInTrial { get; private set; }
    public bool TrialUsed { get; private set; }
    
    // Pricing
    public bool IsPaid { get; private set; }
    public decimal? BasePrice { get; private set; }
    public string? PricingModel { get; private set; } // flat, per-user, usage-based
    public decimal? PricePerUnit { get; private set; }
    public string? Currency { get; private set; } = "TRY";
    public BillingCycle? BillingCycle { get; private set; }
    
    // Dependencies
    public string? RequiredFeatures { get; private set; } // JSON array of feature keys
    public string? ConflictingFeatures { get; private set; } // JSON array of feature keys
    public string? IncludedFeatures { get; private set; } // JSON array of feature keys
    
    // Activation
    public DateTime? ActivatedAt { get; private set; }
    public string? ActivatedBy { get; private set; }
    public DateTime? DeactivatedAt { get; private set; }
    public string? DeactivatedBy { get; private set; }
    public string? DeactivationReason { get; private set; }
    
    // Expiration
    public bool HasExpiration { get; private set; }
    public DateTime? ExpirationDate { get; private set; }
    public bool AutoRenew { get; private set; }
    public int? RenewalNoticeDays { get; private set; }
    public DateTime? LastRenewalDate { get; private set; }
    public DateTime? NextRenewalDate { get; private set; }
    
    // Statistics
    public int ActivationCount { get; private set; }
    public int DeactivationCount { get; private set; }
    public int TotalUsageCount { get; private set; }
    public decimal? AverageUsagePerDay { get; private set; }
    public decimal? PeakUsage { get; private set; }
    public DateTime? PeakUsageDate { get; private set; }
    
    // Notifications
    public bool SendActivationNotification { get; private set; }
    public bool SendExpirationNotification { get; private set; }
    public bool SendUsageLimitNotification { get; private set; }
    public string? NotificationEmails { get; private set; }
    public DateTime? LastNotificationSent { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;
    public DateTime? ModifiedAt { get; private set; }
    public string? ModifiedBy { get; private set; }
    public int Version { get; private set; } = 1;
    
    public static TenantFeature Create(
        string featureKey,
        string name,
        FeatureType type,
        string createdBy,
        string? description = null,
        bool isCore = false)
    {
        if (string.IsNullOrWhiteSpace(featureKey))
            throw new ArgumentException("Feature key is required", nameof(featureKey));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Feature name is required", nameof(name));
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Creator is required", nameof(createdBy));
            
        return new TenantFeature
        {
            Id = Guid.NewGuid(),
            FeatureKey = featureKey.ToUpperInvariant(),
            Name = name,
            Description = description,
            Type = type,
            Status = FeatureStatus.Available,
            IsCore = isCore,
            IsEnabled = isCore, // Core features are enabled by default
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
    }
    
    public void Enable(string? enabledBy = null)
    {
        // Allow enabling from Disabled if trial was already used (for re-subscription scenarios)
        if (Status != FeatureStatus.Available && !(Status == FeatureStatus.Disabled && TrialUsed))
            throw new InvalidOperationException($"Cannot enable feature with status {Status}");
            
        if (!MeetsRequirements())
            throw new InvalidOperationException("Feature requirements not met");
            
        IsEnabled = true;
        Status = FeatureStatus.Active;
        ActivatedAt = DateTime.UtcNow;
        ActivatedBy = enabledBy ?? DomainConstants.SystemUser;
        ActivationCount++;
        
        if (IsTrialAvailable && !TrialUsed)
        {
            StartTrial(enabledBy);
        }
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = enabledBy ?? DomainConstants.SystemUser;
        Version++;
    }
    
    public void Disable(string? reason = null, string? disabledBy = null)
    {
        if (!IsEnabled)
            return;
            
        if (IsCore)
            throw new InvalidOperationException("Cannot disable core feature");
            
        IsEnabled = false;
        Status = FeatureStatus.Disabled;
        DeactivatedAt = DateTime.UtcNow;
        DeactivatedBy = disabledBy ?? DomainConstants.SystemUser;
        DeactivationReason = reason;
        DeactivationCount++;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = disabledBy ?? DomainConstants.SystemUser;
        Version++;
    }
    
    public void SetConfiguration(
        string? configuration,
        string? defaultSettings,
        string? currentSettings,
        string? metadata,
        string modifiedBy)
    {
        Configuration = configuration;
        DefaultSettings = defaultSettings;
        CurrentSettings = currentSettings;
        Metadata = metadata;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
        Version++;
    }
    
    public void SetUsageLimit(
        int usageLimit,
        UsagePeriod period,
        string modifiedBy)
    {
        if (usageLimit <= 0)
            throw new ArgumentException("Usage limit must be greater than zero", nameof(usageLimit));
            
        HasUsageLimit = true;
        UsageLimit = usageLimit;
        UsagePeriod = period;
        
        // Calculate next reset date based on period
        UsageResetDate = CalculateNextResetDate(period);
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
        Version++;
    }
    
    public void RecordUsage(int amount = 1)
    {
        if (HasUsageLimit && CurrentUsage + amount > UsageLimit)
            throw new InvalidOperationException($"Usage limit exceeded. Current: {CurrentUsage}, Limit: {UsageLimit}");
            
        CurrentUsage += amount;
        TotalUsageCount += amount;
        LastUsedAt = DateTime.UtcNow;
        
        // Update peak usage
        if (CurrentUsage > (PeakUsage ?? 0))
        {
            PeakUsage = CurrentUsage;
            PeakUsageDate = DateTime.UtcNow;
        }
        
        // Calculate average usage
        if (ActivatedAt.HasValue)
        {
            var daysSinceActivation = (DateTime.UtcNow - ActivatedAt.Value).TotalDays;
            if (daysSinceActivation > 0)
            {
                AverageUsagePerDay = (decimal)(TotalUsageCount / daysSinceActivation);
            }
        }
    }
    
    public void ResetUsage(string? resetBy = null)
    {
        CurrentUsage = 0;
        UsageResetDate = CalculateNextResetDate(UsagePeriod ?? Tenant.Entities.UsagePeriod.Monthly);
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = resetBy ?? DomainConstants.SystemUser;
    }
    
    public void SetTrial(
        int trialDays,
        string modifiedBy)
    {
        if (trialDays <= 0)
            throw new ArgumentException("Trial days must be greater than zero", nameof(trialDays));
            
        IsTrialAvailable = true;
        TrialDays = trialDays;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
        Version++;
    }
    
    public void StartTrial(string? startedBy = null)
    {
        if (!IsTrialAvailable)
            throw new InvalidOperationException("Trial is not available for this feature");
            
        if (TrialUsed)
            throw new InvalidOperationException("Trial has already been used");
            
        IsInTrial = true;
        TrialUsed = true;
        TrialStartDate = DateTime.UtcNow;
        TrialEndDate = DateTime.UtcNow.AddDays(TrialDays ?? 30);
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = startedBy ?? DomainConstants.SystemUser;
    }
    
    public void EndTrial(string? endedBy = null)
    {
        if (!IsInTrial)
            return;
            
        IsInTrial = false;
        
        // If no subscription, disable the feature
        if (!RequiresSubscription || string.IsNullOrWhiteSpace(RequiredPlan))
        {
            Disable("Trial ended", endedBy);
        }
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = endedBy ?? DomainConstants.SystemUser;
    }
    
    public void SetPricing(
        decimal basePrice,
        string pricingModel,
        BillingCycle billingCycle,
        decimal? pricePerUnit = null,
        string currency = "TRY",
        string? modifiedBy = null)
    {
        if (basePrice < 0)
            throw new ArgumentException("Base price cannot be negative", nameof(basePrice));
            
        IsPaid = basePrice > 0;
        BasePrice = basePrice;
        PricingModel = pricingModel;
        BillingCycle = billingCycle;
        PricePerUnit = pricePerUnit;
        Currency = currency;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy ?? DomainConstants.SystemUser;
        Version++;
    }
    
    public void SetExpiration(
        DateTime expirationDate,
        bool autoRenew,
        int? renewalNoticeDays = null,
        string? modifiedBy = null)
    {
        if (expirationDate <= DateTime.UtcNow)
            throw new ArgumentException("Expiration date must be in the future", nameof(expirationDate));
            
        HasExpiration = true;
        ExpirationDate = expirationDate;
        AutoRenew = autoRenew;
        RenewalNoticeDays = renewalNoticeDays;
        
        if (autoRenew)
        {
            NextRenewalDate = expirationDate;
        }
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy ?? DomainConstants.SystemUser;
        Version++;
    }
    
    public void Renew(int? extensionDays = null, string? renewedBy = null)
    {
        if (!HasExpiration)
            throw new InvalidOperationException("Feature does not have expiration");
            
        var extension = extensionDays ?? GetDefaultExtensionDays();
        
        LastRenewalDate = DateTime.UtcNow;
        ExpirationDate = (ExpirationDate ?? DateTime.UtcNow).AddDays(extension);
        
        if (AutoRenew)
        {
            NextRenewalDate = ExpirationDate;
        }
        
        // Reset trial if it was in trial
        if (IsInTrial)
        {
            EndTrial(renewedBy);
        }
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = renewedBy ?? DomainConstants.SystemUser;
        Version++;
    }
    
    public void SetDependencies(
        string? requiredFeatures,
        string? conflictingFeatures,
        string? includedFeatures,
        string modifiedBy)
    {
        RequiredFeatures = requiredFeatures;
        ConflictingFeatures = conflictingFeatures;
        IncludedFeatures = includedFeatures;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
        Version++;
    }
    
    public void SetNotificationSettings(
        bool sendActivation,
        bool sendExpiration,
        bool sendUsageLimit,
        string? notificationEmails,
        string modifiedBy)
    {
        SendActivationNotification = sendActivation;
        SendExpirationNotification = sendExpiration;
        SendUsageLimitNotification = sendUsageLimit;
        NotificationEmails = notificationEmails;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void RecordNotificationSent()
    {
        LastNotificationSent = DateTime.UtcNow;
    }
    
    public bool IsExpiring()
    {
        if (!HasExpiration || !ExpirationDate.HasValue)
            return false;
            
        var daysUntilExpiration = (ExpirationDate.Value - DateTime.UtcNow).TotalDays;
        return daysUntilExpiration <= (RenewalNoticeDays ?? 7) && daysUntilExpiration > 0;
    }
    
    public bool IsExpired()
    {
        if (!HasExpiration || !ExpirationDate.HasValue)
            return false;
            
        return DateTime.UtcNow > ExpirationDate.Value;
    }
    
    public bool IsTrialExpired()
    {
        if (!IsInTrial || !TrialEndDate.HasValue)
            return false;
            
        return DateTime.UtcNow > TrialEndDate.Value;
    }
    
    public bool IsUsageLimitReached()
    {
        if (!HasUsageLimit || !UsageLimit.HasValue)
            return false;
            
        return CurrentUsage >= UsageLimit.Value;
    }
    
    public bool IsUsageLimitNearlyReached(decimal threshold = 0.8m)
    {
        if (!HasUsageLimit || !UsageLimit.HasValue)
            return false;
            
        return CurrentUsage >= (UsageLimit.Value * threshold);
    }
    
    private bool MeetsRequirements()
    {
        // In a real implementation, this would check:
        // - Required subscription plan
        // - Required role/permission
        // - User count limits
        // - Required features are enabled
        // - No conflicting features are enabled
        return true;
    }
    
    private DateTime CalculateNextResetDate(UsagePeriod period)
    {
        var now = DateTime.UtcNow;
        
        return period switch
        {
            Tenant.Entities.UsagePeriod.Daily => now.AddDays(1).Date,
            Tenant.Entities.UsagePeriod.Weekly => now.AddDays(7 - (int)now.DayOfWeek),
            Tenant.Entities.UsagePeriod.Monthly => new DateTime(now.Year, now.Month, 1).AddMonths(1),
            Tenant.Entities.UsagePeriod.Quarterly => GetNextQuarterStart(now),
            Tenant.Entities.UsagePeriod.Yearly => new DateTime(now.Year + 1, 1, 1),
            _ => now.AddMonths(1)
        };
    }
    
    private DateTime GetNextQuarterStart(DateTime date)
    {
        var quarter = (date.Month - 1) / 3;
        var nextQuarterMonth = ((quarter + 1) * 3) + 1;
        
        if (nextQuarterMonth > 12)
        {
            return new DateTime(date.Year + 1, 1, 1);
        }
        
        return new DateTime(date.Year, nextQuarterMonth, 1);
    }
    
    private int GetDefaultExtensionDays()
    {
        return BillingCycle switch
        {
            Tenant.Entities.BillingCycle.Monthly => 30,
            Tenant.Entities.BillingCycle.Quarterly => 90,
            Tenant.Entities.BillingCycle.SemiAnnual => 180,
            Tenant.Entities.BillingCycle.Annual => 365,
            _ => 30
        };
    }
}

public enum FeatureType
{
    Core,
    Module,
    Integration,
    Report,
    API,
    UI,
    Security,
    Performance,
    Analytics,
    Automation,
    Communication,
    Storage,
    Custom
}

public enum FeatureStatus
{
    Available,
    Active,
    Disabled,
    Deprecated,
    Beta,
    Preview,
    Maintenance,
    Expired,
    Limited
}

public enum UsagePeriod
{
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly
}

public enum BillingCycle
{
    Monthly,
    Quarterly,
    SemiAnnual,
    Annual,
    OneTime
}