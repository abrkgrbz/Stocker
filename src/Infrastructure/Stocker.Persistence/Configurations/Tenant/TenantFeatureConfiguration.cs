using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantFeatureConfiguration : BaseEntityTypeConfiguration<TenantFeature>
{
    public override void Configure(EntityTypeBuilder<TenantFeature> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("TenantFeatures", "tenant");
        
        // Basic Properties
        builder.Property(x => x.FeatureKey)
            .HasMaxLength(100)
            .IsRequired();
            
        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();
            
        builder.Property(x => x.Description)
            .HasMaxLength(1000);
            
        builder.Property(x => x.Type)
            .IsRequired();
            
        builder.Property(x => x.Status)
            .IsRequired();
            
        // Feature Details
        builder.Property(x => x.Category)
            .HasMaxLength(100);
            
        builder.Property(x => x.Module)
            .HasMaxLength(100);
            
        builder.Property(x => x.Icon)
            .HasMaxLength(100);
            
        builder.Property(x => x.DisplayOrder)
            .IsRequired();
            
        builder.Property(x => x.IsCore)
            .IsRequired();
            
        builder.Property(x => x.IsBeta)
            .IsRequired();
            
        builder.Property(x => x.IsNew)
            .IsRequired();
            
        // Access Control
        builder.Property(x => x.IsEnabled)
            .IsRequired();
            
        builder.Property(x => x.RequiresSubscription)
            .IsRequired();
            
        builder.Property(x => x.RequiredPlan)
            .HasMaxLength(100);
            
        builder.Property(x => x.RequiredRole)
            .HasMaxLength(100);
            
        builder.Property(x => x.RequiredPermission)
            .HasMaxLength(100);
            
        builder.Property(x => x.MinimumUserCount);
        
        builder.Property(x => x.MaximumUserCount);
        
        // Configuration
        builder.Property(x => x.Configuration)
            .HasColumnType("text");
            
        builder.Property(x => x.DefaultSettings)
            .HasColumnType("text");
            
        builder.Property(x => x.CurrentSettings)
            .HasColumnType("text");
            
        builder.Property(x => x.Metadata)
            .HasColumnType("text");
            
        // Usage Limits
        builder.Property(x => x.HasUsageLimit)
            .IsRequired();
            
        builder.Property(x => x.UsageLimit);
        
        builder.Property(x => x.CurrentUsage)
            .IsRequired();
            
        builder.Property(x => x.UsagePeriod);
        
        builder.Property(x => x.UsageResetDate);
        
        builder.Property(x => x.LastUsedAt);
        
        // Trial Information
        builder.Property(x => x.IsTrialAvailable)
            .IsRequired();
            
        builder.Property(x => x.TrialDays);
        
        builder.Property(x => x.TrialStartDate);
        
        builder.Property(x => x.TrialEndDate);
        
        builder.Property(x => x.IsInTrial)
            .IsRequired();
            
        builder.Property(x => x.TrialUsed)
            .IsRequired();
            
        // Pricing
        builder.Property(x => x.IsPaid)
            .IsRequired();
            
        builder.Property(x => x.BasePrice)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.PricingModel)
            .HasMaxLength(50);
            
        builder.Property(x => x.PricePerUnit)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Currency)
            .HasMaxLength(3);
            
        builder.Property(x => x.BillingCycle);
        
        // Dependencies
        builder.Property(x => x.RequiredFeatures)
            .HasColumnType("text");
            
        builder.Property(x => x.ConflictingFeatures)
            .HasColumnType("text");
            
        builder.Property(x => x.IncludedFeatures)
            .HasColumnType("text");
            
        // Activation
        builder.Property(x => x.ActivatedAt);
        
        builder.Property(x => x.ActivatedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.DeactivatedAt);
        
        builder.Property(x => x.DeactivatedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.DeactivationReason)
            .HasMaxLength(500);
            
        // Expiration
        builder.Property(x => x.HasExpiration)
            .IsRequired();
            
        builder.Property(x => x.ExpirationDate);
        
        builder.Property(x => x.AutoRenew)
            .IsRequired();
            
        builder.Property(x => x.RenewalNoticeDays);
        
        builder.Property(x => x.LastRenewalDate);
        
        builder.Property(x => x.NextRenewalDate);
        
        // Statistics
        builder.Property(x => x.ActivationCount)
            .IsRequired();
            
        builder.Property(x => x.DeactivationCount)
            .IsRequired();
            
        builder.Property(x => x.TotalUsageCount)
            .IsRequired();
            
        builder.Property(x => x.AverageUsagePerDay)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.PeakUsage)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.PeakUsageDate);
        
        // Notifications
        builder.Property(x => x.SendActivationNotification)
            .IsRequired();
            
        builder.Property(x => x.SendExpirationNotification)
            .IsRequired();
            
        builder.Property(x => x.SendUsageLimitNotification)
            .IsRequired();
            
        builder.Property(x => x.NotificationEmails)
            .HasMaxLength(500);
            
        builder.Property(x => x.LastNotificationSent);
        
        // Audit
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100)
            .IsRequired();
            
        builder.Property(x => x.ModifiedAt);
        
        builder.Property(x => x.ModifiedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.Version)
            .IsRequired();
            
        // Indexes
        builder.HasIndex(x => x.FeatureKey)
            .IsUnique();
        builder.HasIndex(x => x.Type);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.IsEnabled);
        builder.HasIndex(x => x.IsCore);
        builder.HasIndex(x => x.IsBeta);
        builder.HasIndex(x => x.ExpirationDate);
        builder.HasIndex(x => x.TrialEndDate);
        builder.HasIndex(x => new { x.FeatureKey, x.IsEnabled });
    }
}