using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class InvoiceConfiguration : BaseEntityTypeConfiguration<Invoice>
{
    public override void Configure(EntityTypeBuilder<Invoice> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("Invoices", "tenant");
        
        // Properties
        builder.Property(i => i.TenantId).IsRequired();
        builder.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(50);
        builder.Property(i => i.CustomerId).IsRequired();
        builder.Property(i => i.InvoiceDate).IsRequired();
        builder.Property(i => i.DueDate).IsRequired();
        builder.Property(i => i.Status).IsRequired().HasConversion<string>();
        builder.Property(i => i.Notes).HasMaxLength(1000);
        builder.Property(i => i.Terms).HasMaxLength(1000);
        builder.Property(i => i.PaymentMethod).HasMaxLength(100);
        builder.Property(i => i.PaymentReference).HasMaxLength(200);
        
        // Value Objects
        builder.OwnsOne(i => i.SubTotal, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SubTotalAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("SubTotalCurrency").HasMaxLength(3);
        });
        
        builder.OwnsOne(i => i.TaxAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TaxAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TaxCurrency").HasMaxLength(3);
        });
        
        builder.OwnsOne(i => i.DiscountAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DiscountAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("DiscountCurrency").HasMaxLength(3);
        });
        
        builder.OwnsOne(i => i.TotalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalCurrency").HasMaxLength(3);
        });
        
        // Relationships
        builder.HasMany(i => i.Items)
            .WithOne()
            .HasForeignKey(ii => ii.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Indexes
        builder.HasIndex(i => i.InvoiceNumber).IsUnique();
        builder.HasIndex(i => i.CustomerId);
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.Status);
        builder.HasIndex(i => i.DueDate);
    }
}