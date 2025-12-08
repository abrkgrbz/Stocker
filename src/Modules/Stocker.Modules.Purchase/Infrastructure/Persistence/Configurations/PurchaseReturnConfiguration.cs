using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class PurchaseReturnConfiguration : IEntityTypeConfiguration<PurchaseReturn>
{
    public void Configure(EntityTypeBuilder<PurchaseReturn> builder)
    {
        builder.ToTable("PurchaseReturns");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReturnNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.RmaNumber)
            .HasMaxLength(50);

        builder.Property(r => r.SupplierName)
            .HasMaxLength(300);

        builder.Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Reason)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.PurchaseOrderNumber)
            .HasMaxLength(50);

        builder.Property(r => r.GoodsReceiptNumber)
            .HasMaxLength(50);

        builder.Property(r => r.PurchaseInvoiceNumber)
            .HasMaxLength(50);

        builder.Property(r => r.SubTotal)
            .HasPrecision(18, 4);

        builder.Property(r => r.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.Currency)
            .HasMaxLength(10);

        builder.Property(r => r.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(r => r.RefundMethod)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.RefundAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.RefundReference)
            .HasMaxLength(100);

        builder.Property(r => r.ShippingCarrier)
            .HasMaxLength(100);

        builder.Property(r => r.TrackingNumber)
            .HasMaxLength(100);

        builder.Property(r => r.ApprovedByName)
            .HasMaxLength(200);

        builder.Property(r => r.Notes)
            .HasMaxLength(2000);

        builder.Property(r => r.InternalNotes)
            .HasMaxLength(2000);

        builder.HasMany(r => r.Items)
            .WithOne(item => item.PurchaseReturn)
            .HasForeignKey(item => item.PurchaseReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => new { r.TenantId, r.ReturnNumber }).IsUnique();
        builder.HasIndex(r => new { r.TenantId, r.RmaNumber });
        builder.HasIndex(r => new { r.TenantId, r.SupplierId });
        builder.HasIndex(r => new { r.TenantId, r.Status });
        builder.HasIndex(r => new { r.TenantId, r.ReturnDate });
        builder.HasIndex(r => new { r.TenantId, r.PurchaseOrderId });
    }
}

public class PurchaseReturnItemConfiguration : IEntityTypeConfiguration<PurchaseReturnItem>
{
    public void Configure(EntityTypeBuilder<PurchaseReturnItem> builder)
    {
        builder.ToTable("PurchaseReturnItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(i => i.Unit)
            .HasMaxLength(50);

        builder.Property(i => i.Reason)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.VatRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.SubTotal)
            .HasPrecision(18, 4);

        builder.Property(i => i.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.ReasonDescription)
            .HasMaxLength(1000);

        builder.Property(i => i.LotNumber)
            .HasMaxLength(100);

        builder.Property(i => i.SerialNumber)
            .HasMaxLength(100);

        builder.HasIndex(i => new { i.TenantId, i.PurchaseReturnId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}
