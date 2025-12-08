using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class CommissionPlanConfiguration : IEntityTypeConfiguration<CommissionPlan>
{
    public void Configure(EntityTypeBuilder<CommissionPlan> builder)
    {
        builder.ToTable("CommissionPlans");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .HasMaxLength(1000);

        builder.Property(c => c.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(c => c.CalculationType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(c => c.BaseRate)
            .HasPrecision(5, 2);

        builder.Property(c => c.BaseAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.MinimumSaleAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.MaximumCommissionAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.ApplicableProductCategories)
            .HasMaxLength(4000);

        builder.Property(c => c.ApplicableProducts)
            .HasMaxLength(4000);

        builder.Property(c => c.ExcludedProducts)
            .HasMaxLength(4000);

        builder.Property(c => c.ApplicableSalesPersons)
            .HasMaxLength(4000);

        builder.Property(c => c.ApplicableRoles)
            .HasMaxLength(500);

        builder.HasMany(c => c.Tiers)
            .WithOne()
            .HasForeignKey(t => t.CommissionPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => c.IsActive);
        builder.HasIndex(c => c.Type);
    }
}

public class CommissionTierConfiguration : IEntityTypeConfiguration<CommissionTier>
{
    public void Configure(EntityTypeBuilder<CommissionTier> builder)
    {
        builder.ToTable("CommissionTiers");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .HasMaxLength(100);

        builder.Property(t => t.FromAmount)
            .HasPrecision(18, 4);

        builder.Property(t => t.ToAmount)
            .HasPrecision(18, 4);

        builder.Property(t => t.CalculationType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(t => t.Rate)
            .HasPrecision(5, 2);

        builder.Property(t => t.FixedAmount)
            .HasPrecision(18, 4);

        builder.HasIndex(t => t.CommissionPlanId);
    }
}

public class SalesCommissionConfiguration : IEntityTypeConfiguration<SalesCommission>
{
    public void Configure(EntityTypeBuilder<SalesCommission> builder)
    {
        builder.ToTable("SalesCommissions");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.SalesPersonName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.CommissionPlanName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.SaleAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.CommissionAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.CommissionRate)
            .HasPrecision(5, 2);

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(c => c.PaymentReference)
            .HasMaxLength(100);

        builder.Property(c => c.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => c.SalesOrderId);
        builder.HasIndex(c => c.SalesPersonId);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.CalculatedDate);
    }
}
