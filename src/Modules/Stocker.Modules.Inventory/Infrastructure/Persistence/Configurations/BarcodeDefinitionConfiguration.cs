using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for BarcodeDefinition
/// </summary>
public class BarcodeDefinitionConfiguration : IEntityTypeConfiguration<BarcodeDefinition>
{
    public void Configure(EntityTypeBuilder<BarcodeDefinition> builder)
    {
        builder.ToTable("BarcodeDefinitions", "inventory");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.TenantId)
            .IsRequired();

        builder.Property(b => b.Barcode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.BarcodeType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(b => b.IsPrimary)
            .IsRequired();

        builder.Property(b => b.IsActive)
            .IsRequired();

        builder.Property(b => b.QuantityPerUnit)
            .HasPrecision(18, 4);

        builder.Property(b => b.ManufacturerCode)
            .HasMaxLength(100);

        builder.Property(b => b.Gtin)
            .HasMaxLength(14);

        builder.Property(b => b.Description)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(b => b.Product)
            .WithMany()
            .HasForeignKey(b => b.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.ProductVariant)
            .WithMany()
            .HasForeignKey(b => b.ProductVariantId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(b => b.Unit)
            .WithMany()
            .HasForeignKey(b => b.UnitId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(b => b.PackagingType)
            .WithMany()
            .HasForeignKey(b => b.PackagingTypeId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(b => b.TenantId);
        builder.HasIndex(b => new { b.TenantId, b.Barcode }).IsUnique();
        builder.HasIndex(b => new { b.TenantId, b.ProductId });
        builder.HasIndex(b => new { b.TenantId, b.ProductId, b.IsPrimary });
        builder.HasIndex(b => new { b.TenantId, b.Gtin })
            .HasFilter("\"Gtin\" IS NOT NULL");
        builder.HasIndex(b => new { b.TenantId, b.IsActive });
    }
}
