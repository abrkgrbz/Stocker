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

        builder.Property(x => x.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(x => x.Category)
            .HasMaxLength(50);

        builder.HasIndex(x => x.Code)
            .IsUnique();

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
