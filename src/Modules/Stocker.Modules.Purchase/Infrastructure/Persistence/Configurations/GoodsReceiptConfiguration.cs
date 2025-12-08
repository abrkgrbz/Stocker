using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class GoodsReceiptConfiguration : IEntityTypeConfiguration<GoodsReceipt>
{
    public void Configure(EntityTypeBuilder<GoodsReceipt> builder)
    {
        builder.ToTable("GoodsReceipts");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReceiptNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.PurchaseOrderNumber)
            .HasMaxLength(50);

        builder.Property(r => r.SupplierName)
            .HasMaxLength(300);

        builder.Property(r => r.WarehouseName)
            .HasMaxLength(200);

        builder.Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.DeliveryNoteNumber)
            .HasMaxLength(100);

        builder.Property(r => r.VehiclePlate)
            .HasMaxLength(20);

        builder.Property(r => r.DriverName)
            .HasMaxLength(200);

        builder.Property(r => r.TotalQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.AcceptedQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.RejectedQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.Currency)
            .HasMaxLength(10);

        builder.Property(r => r.QualityCheckedByName)
            .HasMaxLength(200);

        builder.Property(r => r.QualityNotes)
            .HasMaxLength(2000);

        builder.Property(r => r.ReceivedByName)
            .HasMaxLength(200);

        builder.Property(r => r.Notes)
            .HasMaxLength(2000);

        builder.HasMany(r => r.Items)
            .WithOne(i => i.GoodsReceipt)
            .HasForeignKey(i => i.GoodsReceiptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => new { r.TenantId, r.ReceiptNumber }).IsUnique();
        builder.HasIndex(r => new { r.TenantId, r.PurchaseOrderId });
        builder.HasIndex(r => new { r.TenantId, r.SupplierId });
        builder.HasIndex(r => new { r.TenantId, r.Status });
        builder.HasIndex(r => new { r.TenantId, r.ReceiptDate });
    }
}

public class GoodsReceiptItemConfiguration : IEntityTypeConfiguration<GoodsReceiptItem>
{
    public void Configure(EntityTypeBuilder<GoodsReceiptItem> builder)
    {
        builder.ToTable("GoodsReceiptItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(i => i.Unit)
            .HasMaxLength(50);

        builder.Property(i => i.OrderedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.ReceivedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.AcceptedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.RejectedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.BatchNumber)
            .HasMaxLength(100);

        builder.Property(i => i.SerialNumbers)
            .HasMaxLength(4000);

        builder.Property(i => i.StorageLocation)
            .HasMaxLength(200);

        builder.Property(i => i.Condition)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(i => new { i.TenantId, i.GoodsReceiptId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
        builder.HasIndex(i => new { i.TenantId, i.PurchaseOrderItemId });
    }
}
