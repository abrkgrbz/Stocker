using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class PurchaseInvoiceConfiguration : IEntityTypeConfiguration<PurchaseInvoice>
{
    public void Configure(EntityTypeBuilder<PurchaseInvoice> builder)
    {
        builder.ToTable("PurchaseInvoices");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.SupplierInvoiceNumber)
            .HasMaxLength(100);

        builder.Property(i => i.SupplierName)
            .HasMaxLength(300);

        builder.Property(i => i.SupplierTaxNumber)
            .HasMaxLength(20);

        builder.Property(i => i.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.PurchaseOrderNumber)
            .HasMaxLength(50);

        builder.Property(i => i.GoodsReceiptNumber)
            .HasMaxLength(50);

        builder.Property(i => i.SubTotal)
            .HasPrecision(18, 4);

        builder.Property(i => i.DiscountAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.WithholdingTaxAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.PaidAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.RemainingAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.Currency)
            .HasMaxLength(10);

        builder.Property(i => i.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(i => i.EInvoiceId)
            .HasMaxLength(100);

        builder.Property(i => i.EInvoiceUUID)
            .HasMaxLength(100);

        builder.Property(i => i.EInvoiceStatus)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.ApprovedByName)
            .HasMaxLength(200);

        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        builder.Property(i => i.InternalNotes)
            .HasMaxLength(2000);

        builder.HasMany(i => i.Items)
            .WithOne(item => item.PurchaseInvoice)
            .HasForeignKey(item => item.PurchaseInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => new { i.TenantId, i.InvoiceNumber }).IsUnique();
        builder.HasIndex(i => new { i.TenantId, i.SupplierId });
        builder.HasIndex(i => new { i.TenantId, i.Status });
        builder.HasIndex(i => new { i.TenantId, i.InvoiceDate });
        builder.HasIndex(i => new { i.TenantId, i.DueDate });
        builder.HasIndex(i => new { i.TenantId, i.PurchaseOrderId });
    }
}

public class PurchaseInvoiceItemConfiguration : IEntityTypeConfiguration<PurchaseInvoiceItem>
{
    public void Configure(EntityTypeBuilder<PurchaseInvoiceItem> builder)
    {
        builder.ToTable("PurchaseInvoiceItems");

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

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

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

        builder.HasIndex(i => new { i.TenantId, i.PurchaseInvoiceId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}
