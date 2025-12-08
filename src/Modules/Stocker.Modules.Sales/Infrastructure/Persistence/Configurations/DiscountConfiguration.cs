using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class DiscountConfiguration : IEntityTypeConfiguration<Discount>
{
    public void Configure(EntityTypeBuilder<Discount> builder)
    {
        builder.ToTable("Discounts");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Description)
            .HasMaxLength(1000);

        builder.Property(d => d.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(d => d.ValueType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(d => d.Value)
            .HasPrecision(18, 4);

        builder.Property(d => d.MinimumOrderAmount)
            .HasPrecision(18, 4);

        builder.Property(d => d.MaximumDiscountAmount)
            .HasPrecision(18, 4);

        builder.Property(d => d.Applicability)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(d => d.ApplicableProductIds)
            .HasMaxLength(4000);

        builder.Property(d => d.ApplicableCategoryIds)
            .HasMaxLength(4000);

        builder.Property(d => d.ApplicableCustomerIds)
            .HasMaxLength(4000);

        builder.Property(d => d.ApplicableCustomerGroupIds)
            .HasMaxLength(4000);

        builder.Property(d => d.ExcludedProductIds)
            .HasMaxLength(4000);

        builder.Property(d => d.ExcludedCategoryIds)
            .HasMaxLength(4000);

        builder.HasIndex(d => d.Code)
            .IsUnique();

        builder.HasIndex(d => d.TenantId);
        builder.HasIndex(d => d.IsActive);
        builder.HasIndex(d => d.StartDate);
        builder.HasIndex(d => d.EndDate);
        builder.HasIndex(d => d.Type);
    }
}
