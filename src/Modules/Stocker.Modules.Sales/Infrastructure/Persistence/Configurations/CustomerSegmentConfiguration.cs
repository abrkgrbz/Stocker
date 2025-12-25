using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class CustomerSegmentConfiguration : IEntityTypeConfiguration<CustomerSegment>
{
    public void Configure(EntityTypeBuilder<CustomerSegment> builder)
    {
        builder.ToTable("CustomerSegments", "sales");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .HasMaxLength(2000);

        // Pricing
        builder.Property(c => c.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.Property(c => c.MinimumOrderAmount)
            .HasPrecision(18, 2);

        builder.Property(c => c.MaximumOrderAmount)
            .HasPrecision(18, 2);

        // Credit
        builder.Property(c => c.DefaultCreditLimit)
            .HasPrecision(18, 2);

        builder.Property(c => c.AdvancePaymentPercentage)
            .HasPrecision(5, 2);

        // Priority
        builder.Property(c => c.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.ServiceLevel)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Eligibility
        builder.Property(c => c.MinimumAnnualRevenue)
            .HasPrecision(18, 2);

        // Benefits
        builder.Property(c => c.FreeShippingThreshold)
            .HasPrecision(18, 2);

        builder.Property(c => c.BenefitsDescription)
            .HasMaxLength(2000);

        // Visual
        builder.Property(c => c.Color)
            .HasMaxLength(20);

        builder.Property(c => c.BadgeIcon)
            .HasMaxLength(50);

        // Metrics
        builder.Property(c => c.TotalRevenue)
            .HasPrecision(18, 2);

        builder.Property(c => c.AverageOrderValue)
            .HasPrecision(18, 2);

        // Customer IDs - Ignore this property for EF Core mapping
        // Customer segment membership is managed separately, not stored in segment table
        builder.Ignore(c => c.CustomerIds);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => c.Code);
        builder.HasIndex(c => new { c.TenantId, c.Code }).IsUnique();
        builder.HasIndex(c => c.IsDefault);
        builder.HasIndex(c => c.IsActive);
        builder.HasIndex(c => c.Priority);
        builder.HasIndex(c => new { c.TenantId, c.IsActive });
        builder.HasIndex(c => new { c.TenantId, c.IsDefault });
    }
}
