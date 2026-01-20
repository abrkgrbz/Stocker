using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for LotBatch
/// </summary>
public class LotBatchConfiguration : IEntityTypeConfiguration<LotBatch>
{
    public void Configure(EntityTypeBuilder<LotBatch> builder)
    {
        builder.ToTable("LotBatches", "inventory");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.LotNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(l => l.InitialQuantity)
            .HasPrecision(18, 4);

        builder.Property(l => l.CurrentQuantity)
            .HasPrecision(18, 4);

        builder.Property(l => l.ReservedQuantity)
            .HasPrecision(18, 4);

        builder.Property(l => l.SupplierLotNumber)
            .HasMaxLength(100);

        builder.Property(l => l.CertificateNumber)
            .HasMaxLength(100);

        builder.Property(l => l.Notes)
            .HasMaxLength(2000);

        builder.Property(l => l.QuarantineReason)
            .HasMaxLength(1000);

        builder.Property(l => l.InspectionNotes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(l => l.Product)
            .WithMany(p => p.LotBatches)
            .HasForeignKey(l => l.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.Supplier)
            .WithMany()
            .HasForeignKey(l => l.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(l => l.Stocks)
            .WithOne(s => s.LotBatch)
            .HasForeignKey(s => s.LotBatchId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => new { l.TenantId, l.LotNumber });
        builder.HasIndex(l => new { l.TenantId, l.ProductId });
        builder.HasIndex(l => new { l.TenantId, l.ProductId, l.LotNumber }).IsUnique();
        builder.HasIndex(l => new { l.TenantId, l.Status });
        builder.HasIndex(l => new { l.TenantId, l.ExpiryDate });
        builder.HasIndex(l => new { l.TenantId, l.IsQuarantined });
        builder.HasIndex(l => new { l.TenantId, l.SupplierId })
            .HasFilter("[SupplierId] IS NOT NULL");
    }
}
