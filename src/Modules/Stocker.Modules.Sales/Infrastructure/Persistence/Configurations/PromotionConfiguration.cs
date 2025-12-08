using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
{
    public void Configure(EntityTypeBuilder<Promotion> builder)
    {
        builder.ToTable("Promotions");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.MinimumOrderAmount)
            .HasPrecision(18, 4);

        builder.Property(p => p.MaximumDiscountAmount)
            .HasPrecision(18, 4);

        builder.Property(p => p.ApplicableChannels)
            .HasMaxLength(500);

        builder.Property(p => p.TargetCustomerSegments)
            .HasMaxLength(4000);

        builder.Property(p => p.TargetProductCategories)
            .HasMaxLength(4000);

        builder.Property(p => p.ExcludedProducts)
            .HasMaxLength(4000);

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.Property(p => p.BannerUrl)
            .HasMaxLength(500);

        builder.Property(p => p.TermsAndConditions)
            .HasMaxLength(4000);

        builder.HasMany(p => p.Rules)
            .WithOne()
            .HasForeignKey(r => r.PromotionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.Code)
            .IsUnique();

        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.IsActive);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.StartDate);
        builder.HasIndex(p => p.EndDate);
    }
}

public class PromotionRuleConfiguration : IEntityTypeConfiguration<PromotionRule>
{
    public void Configure(EntityTypeBuilder<PromotionRule> builder)
    {
        builder.ToTable("PromotionRules");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RuleType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.DiscountType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.DiscountValue)
            .HasPrecision(18, 4);

        builder.Property(r => r.Condition)
            .HasMaxLength(1000);

        builder.Property(r => r.ApplicableProducts)
            .HasMaxLength(4000);

        builder.Property(r => r.ApplicableCategories)
            .HasMaxLength(4000);

        builder.HasIndex(r => r.PromotionId);
    }
}
