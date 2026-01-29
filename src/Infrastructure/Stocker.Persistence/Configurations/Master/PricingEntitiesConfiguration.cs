using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

/// <summary>
/// AddOn entity configuration
/// </summary>
public class AddOnConfiguration : IEntityTypeConfiguration<AddOn>
{
    public void Configure(EntityTypeBuilder<AddOn> builder)
    {
        builder.ToTable("AddOns", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Icon)
            .HasMaxLength(100);

        // Add-on type
        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(Domain.Master.Enums.AddOnType.Feature);

        // Money value object - MonthlyPrice
        builder.OwnsOne(x => x.MonthlyPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("MonthlyPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("MonthlyPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        // Money value object - YearlyPrice (optional)
        builder.OwnsOne(x => x.YearlyPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("YearlyPriceAmount")
                .HasPrecision(18, 2);

            price.Property(p => p.Currency)
                .HasColumnName("YearlyPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY");
        });

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(x => x.Category)
            .HasMaxLength(50);

        // New fields for module-specific add-ons
        builder.Property(x => x.RequiredModuleCode)
            .HasMaxLength(50);

        builder.Property(x => x.Quantity);

        builder.Property(x => x.QuantityUnit)
            .HasMaxLength(20);

        builder.HasIndex(x => x.Code)
            .IsUnique();

        builder.HasIndex(x => x.Type)
            .HasDatabaseName("IX_AddOns_Type");

        builder.HasIndex(x => x.RequiredModuleCode)
            .HasDatabaseName("IX_AddOns_RequiredModuleCode");

        // Navigation property for features
        builder.HasMany(x => x.Features)
            .WithOne()
            .HasForeignKey(x => x.AddOnId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

/// <summary>
/// AddOnFeature entity configuration
/// </summary>
public class AddOnFeatureConfiguration : IEntityTypeConfiguration<AddOnFeature>
{
    public void Configure(EntityTypeBuilder<AddOnFeature> builder)
    {
        builder.ToTable("AddOnFeatures", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FeatureName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.HasIndex(x => x.AddOnId);
    }
}

/// <summary>
/// StoragePlan entity configuration
/// </summary>
public class StoragePlanConfiguration : IEntityTypeConfiguration<StoragePlan>
{
    public void Configure(EntityTypeBuilder<StoragePlan> builder)
    {
        builder.ToTable("StoragePlans", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.StorageGB)
            .IsRequired();

        // Money value object
        builder.OwnsOne(x => x.MonthlyPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("MonthlyPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("MonthlyPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.IsDefault)
            .HasDefaultValue(false);

        builder.Property(x => x.DisplayOrder)
            .HasDefaultValue(0);

        builder.HasIndex(x => x.Code)
            .IsUnique();
    }
}

/// <summary>
/// Industry entity configuration
/// </summary>
public class IndustryConfiguration : IEntityTypeConfiguration<Industry>
{
    public void Configure(EntityTypeBuilder<Industry> builder)
    {
        builder.ToTable("Industries", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Icon)
            .HasMaxLength(100);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.DisplayOrder)
            .HasDefaultValue(0);

        builder.HasIndex(x => x.Code)
            .IsUnique();

        // Navigation property for recommended modules
        builder.HasMany(x => x.RecommendedModules)
            .WithOne()
            .HasForeignKey(x => x.IndustryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

/// <summary>
/// IndustryRecommendedModule entity configuration
/// </summary>
public class IndustryRecommendedModuleConfiguration : IEntityTypeConfiguration<IndustryRecommendedModule>
{
    public void Configure(EntityTypeBuilder<IndustryRecommendedModule> builder)
    {
        builder.ToTable("IndustryRecommendedModules", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ModuleCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(x => new { x.IndustryId, x.ModuleCode })
            .IsUnique();
    }
}

/// <summary>
/// UserTier entity configuration
/// </summary>
public class UserTierConfiguration : IEntityTypeConfiguration<UserTier>
{
    public void Configure(EntityTypeBuilder<UserTier> builder)
    {
        builder.ToTable("UserTiers", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.MinUsers)
            .IsRequired();

        builder.Property(x => x.MaxUsers)
            .IsRequired();

        // Price per user - Money value object
        builder.OwnsOne(x => x.PricePerUser, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("PricePerUserAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("PricePerUserCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        // Base price - Money value object (optional)
        builder.OwnsOne(x => x.BasePrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("BasePriceAmount")
                .HasPrecision(18, 2);

            price.Property(p => p.Currency)
                .HasColumnName("BasePriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY");
        });

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.DisplayOrder)
            .HasDefaultValue(0);

        builder.HasIndex(x => x.Code)
            .IsUnique();
    }
}

/// <summary>
/// ModulePricing entity configuration
/// </summary>
public class ModulePricingConfiguration : IEntityTypeConfiguration<ModulePricing>
{
    public void Configure(EntityTypeBuilder<ModulePricing> builder)
    {
        builder.ToTable("ModulePricing", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ModuleCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.ModuleName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Icon)
            .HasMaxLength(100);

        // Money value object - MonthlyPrice
        builder.OwnsOne(x => x.MonthlyPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("MonthlyPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("MonthlyPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        // Money value object - YearlyPrice
        builder.OwnsOne(x => x.YearlyPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("YearlyPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("YearlyPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.Property(x => x.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.IsCore)
            .HasDefaultValue(false);

        builder.Property(x => x.TrialDays);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt);

        builder.HasIndex(x => x.ModuleCode)
            .IsUnique()
            .HasDatabaseName("IX_ModulePricing_ModuleCode");

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_ModulePricing_IsActive");
    }
}

/// <summary>
/// ModuleBundle entity configuration
/// </summary>
public class ModuleBundleConfiguration : IEntityTypeConfiguration<ModuleBundle>
{
    public void Configure(EntityTypeBuilder<ModuleBundle> builder)
    {
        builder.ToTable("ModuleBundles", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.BundleCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.BundleName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        // Money value object - MonthlyPrice
        builder.OwnsOne(x => x.MonthlyPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("MonthlyPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("MonthlyPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        // Money value object - YearlyPrice
        builder.OwnsOne(x => x.YearlyPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("YearlyPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("YearlyPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.Property(x => x.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.DiscountPercent)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt);

        builder.HasIndex(x => x.BundleCode)
            .IsUnique()
            .HasDatabaseName("IX_ModuleBundles_BundleCode");

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_ModuleBundles_IsActive");

        // Navigation property for modules
        builder.HasMany(x => x.Modules)
            .WithOne()
            .HasForeignKey(x => x.ModuleBundleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

/// <summary>
/// ModuleBundleItem entity configuration
/// </summary>
public class ModuleBundleItemConfiguration : IEntityTypeConfiguration<ModuleBundleItem>
{
    public void Configure(EntityTypeBuilder<ModuleBundleItem> builder)
    {
        builder.ToTable("ModuleBundleItems", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ModuleCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(x => new { x.ModuleBundleId, x.ModuleCode })
            .IsUnique()
            .HasDatabaseName("IX_ModuleBundleItems_BundleId_ModuleCode");
    }
}

/// <summary>
/// SubscriptionAddOn entity configuration
/// </summary>
public class SubscriptionAddOnConfiguration : IEntityTypeConfiguration<SubscriptionAddOn>
{
    public void Configure(EntityTypeBuilder<SubscriptionAddOn> builder)
    {
        builder.ToTable("SubscriptionAddOns", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SubscriptionId)
            .IsRequired();

        builder.Property(x => x.AddOnId)
            .IsRequired();

        // AddOn denormalized fields for historical tracking
        builder.Property(x => x.AddOnCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.AddOnName)
            .IsRequired()
            .HasMaxLength(100);

        // Money value object - Price
        builder.OwnsOne(x => x.Price, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("PriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("PriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.Property(x => x.Quantity)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(x => x.AddedAt)
            .IsRequired();

        builder.Property(x => x.ExpiresAt);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.CancellationReason)
            .HasMaxLength(500);

        builder.Property(x => x.CancelledAt);

        builder.HasIndex(x => x.SubscriptionId)
            .HasDatabaseName("IX_SubscriptionAddOns_SubscriptionId");

        builder.HasIndex(x => x.AddOnId)
            .HasDatabaseName("IX_SubscriptionAddOns_AddOnId");

        builder.HasIndex(x => new { x.SubscriptionId, x.AddOnId })
            .HasDatabaseName("IX_SubscriptionAddOns_SubscriptionId_AddOnId");

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_SubscriptionAddOns_IsActive");

        builder.HasIndex(x => x.AddOnCode)
            .HasDatabaseName("IX_SubscriptionAddOns_AddOnCode");

        // Relationship with AddOn
        builder.HasOne(x => x.AddOn)
            .WithMany()
            .HasForeignKey(x => x.AddOnId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationship with Subscription
        builder.HasOne(x => x.Subscription)
            .WithMany()
            .HasForeignKey(x => x.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
