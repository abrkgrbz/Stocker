using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PackagingType
/// </summary>
public class PackagingTypeConfiguration : IEntityTypeConfiguration<PackagingType>
{
    public void Configure(EntityTypeBuilder<PackagingType> builder)
    {
        builder.ToTable("PackagingTypes", "inventory");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Category)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.IsActive)
            .IsRequired();

        builder.Property(p => p.Length)
            .HasPrecision(18, 4);

        builder.Property(p => p.Width)
            .HasPrecision(18, 4);

        builder.Property(p => p.Height)
            .HasPrecision(18, 4);

        builder.Property(p => p.Volume)
            .HasPrecision(18, 6);

        builder.Property(p => p.EmptyWeight)
            .HasPrecision(18, 4);

        builder.Property(p => p.MaxWeightCapacity)
            .HasPrecision(18, 4);

        builder.Property(p => p.DefaultQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.MaxQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.BarcodePrefix)
            .HasMaxLength(20);

        builder.Property(p => p.DefaultBarcodeType)
            .HasConversion<int>();

        builder.Property(p => p.MaterialType)
            .HasMaxLength(100);

        builder.Property(p => p.DepositAmount)
            .HasPrecision(18, 4);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.TenantId, p.Code }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.Name });
        builder.HasIndex(p => new { p.TenantId, p.Category });
        builder.HasIndex(p => new { p.TenantId, p.IsActive });
    }
}
