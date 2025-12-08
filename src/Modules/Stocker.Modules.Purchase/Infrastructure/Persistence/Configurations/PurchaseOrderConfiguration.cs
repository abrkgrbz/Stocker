using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("PurchaseOrders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.SupplierName)
            .HasMaxLength(300);

        builder.Property(o => o.SupplierCode)
            .HasMaxLength(50);

        builder.Property(o => o.WarehouseName)
            .HasMaxLength(200);

        builder.Property(o => o.SupplierOrderNumber)
            .HasMaxLength(100);

        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(o => o.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(o => o.SubTotal)
            .HasPrecision(18, 4);

        builder.Property(o => o.DiscountAmount)
            .HasPrecision(18, 4);

        builder.Property(o => o.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(o => o.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(o => o.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(o => o.Currency)
            .HasMaxLength(10);

        builder.Property(o => o.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(o => o.DeliveryAddress)
            .HasMaxLength(500);

        builder.Property(o => o.DeliveryCity)
            .HasMaxLength(100);

        builder.Property(o => o.DeliveryDistrict)
            .HasMaxLength(100);

        builder.Property(o => o.DeliveryPostalCode)
            .HasMaxLength(20);

        builder.Property(o => o.DeliveryContactPerson)
            .HasMaxLength(200);

        builder.Property(o => o.DeliveryContactPhone)
            .HasMaxLength(30);

        builder.Property(o => o.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(o => o.PurchaseRequestNumber)
            .HasMaxLength(50);

        builder.Property(o => o.PurchaserName)
            .HasMaxLength(200);

        builder.Property(o => o.ApprovedByName)
            .HasMaxLength(200);

        builder.Property(o => o.ApprovalNotes)
            .HasMaxLength(1000);

        builder.Property(o => o.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(o => o.SupplierNotes)
            .HasMaxLength(2000);

        builder.Property(o => o.Terms)
            .HasMaxLength(4000);

        builder.Property(o => o.ReceivedAmount)
            .HasPrecision(18, 4);

        builder.Property(o => o.PaidAmount)
            .HasPrecision(18, 4);

        builder.Property(o => o.CancellationReason)
            .HasMaxLength(1000);

        builder.HasMany(o => o.Items)
            .WithOne(i => i.PurchaseOrder)
            .HasForeignKey(i => i.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => new { o.TenantId, o.OrderNumber }).IsUnique();
        builder.HasIndex(o => new { o.TenantId, o.SupplierId });
        builder.HasIndex(o => new { o.TenantId, o.Status });
        builder.HasIndex(o => new { o.TenantId, o.OrderDate });
        builder.HasIndex(o => new { o.TenantId, o.PurchaseRequestId });
    }
}

public class PurchaseOrderItemConfiguration : IEntityTypeConfiguration<PurchaseOrderItem>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderItem> builder)
    {
        builder.ToTable("PurchaseOrderItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(i => i.Unit)
            .HasMaxLength(50);

        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.ReceivedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.Currency)
            .HasMaxLength(10);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.DiscountAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.VatRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.SubTotal)
            .HasPrecision(18, 4);

        builder.Property(i => i.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.Description)
            .HasMaxLength(1000);

        builder.HasIndex(i => new { i.TenantId, i.PurchaseOrderId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}
