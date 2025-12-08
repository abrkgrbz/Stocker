using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class QuotationConfiguration : IEntityTypeConfiguration<Quotation>
{
    public void Configure(EntityTypeBuilder<Quotation> builder)
    {
        builder.ToTable("Quotations");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.QuotationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(q => q.Title)
            .HasMaxLength(500);

        builder.Property(q => q.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(q => q.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(q => q.Priority)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(q => q.PurchaseRequestNumber)
            .HasMaxLength(50);

        builder.Property(q => q.WarehouseName)
            .HasMaxLength(200);

        builder.Property(q => q.Currency)
            .HasMaxLength(10);

        builder.Property(q => q.Notes)
            .HasMaxLength(2000);

        builder.Property(q => q.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(q => q.Terms)
            .HasMaxLength(4000);

        builder.Property(q => q.SelectedSupplierName)
            .HasMaxLength(300);

        builder.Property(q => q.SelectionReason)
            .HasMaxLength(1000);

        builder.Property(q => q.SelectionByName)
            .HasMaxLength(200);

        builder.Property(q => q.ConvertedOrderNumber)
            .HasMaxLength(50);

        builder.Property(q => q.CreatedByName)
            .HasMaxLength(200);

        builder.Property(q => q.CancellationReason)
            .HasMaxLength(1000);

        builder.HasMany(q => q.Items)
            .WithOne()
            .HasForeignKey(i => i.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Suppliers)
            .WithOne()
            .HasForeignKey(s => s.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(q => new { q.TenantId, q.QuotationNumber }).IsUnique();
        builder.HasIndex(q => new { q.TenantId, q.Status });
        builder.HasIndex(q => new { q.TenantId, q.QuotationDate });
        builder.HasIndex(q => new { q.TenantId, q.PurchaseRequestId });
    }
}

public class QuotationItemConfiguration : IEntityTypeConfiguration<QuotationItem>
{
    public void Configure(EntityTypeBuilder<QuotationItem> builder)
    {
        builder.ToTable("QuotationItems");

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

        builder.Property(i => i.Specifications)
            .HasMaxLength(2000);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(i => new { i.TenantId, i.QuotationId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}

public class QuotationSupplierConfiguration : IEntityTypeConfiguration<QuotationSupplier>
{
    public void Configure(EntityTypeBuilder<QuotationSupplier> builder)
    {
        builder.ToTable("QuotationSuppliers");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.SupplierCode)
            .HasMaxLength(50);

        builder.Property(s => s.SupplierName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(s => s.ContactPerson)
            .HasMaxLength(200);

        builder.Property(s => s.ContactEmail)
            .HasMaxLength(200);

        builder.Property(s => s.ContactPhone)
            .HasMaxLength(30);

        builder.Property(s => s.ResponseStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(s => s.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(s => s.Currency)
            .HasMaxLength(10);

        builder.Property(s => s.SupplierNotes)
            .HasMaxLength(2000);

        builder.Property(s => s.InternalEvaluation)
            .HasMaxLength(2000);

        builder.Property(s => s.EvaluationScore)
            .HasPrecision(5, 2);

        builder.HasMany(s => s.Items)
            .WithOne()
            .HasForeignKey(i => i.QuotationSupplierId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.TenantId, s.QuotationId });
        builder.HasIndex(s => new { s.TenantId, s.SupplierId });
    }
}

public class QuotationSupplierItemConfiguration : IEntityTypeConfiguration<QuotationSupplierItem>
{
    public void Configure(EntityTypeBuilder<QuotationSupplierItem> builder)
    {
        builder.ToTable("QuotationSupplierItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .HasMaxLength(100);

        builder.Property(i => i.ProductName)
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

        builder.Property(i => i.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.Currency)
            .HasMaxLength(10);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(i => new { i.TenantId, i.QuotationSupplierId });
        builder.HasIndex(i => new { i.TenantId, i.QuotationItemId });
    }
}
