using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class PaymentConfiguration : BaseEntityTypeConfiguration<Payment>
{
    public override void Configure(EntityTypeBuilder<Payment> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("Payments", "tenant");
        
        // Properties
        builder.Property(p => p.TenantId).IsRequired();
        builder.Property(p => p.PaymentNumber).IsRequired().HasMaxLength(50);
        builder.Property(p => p.InvoiceId).IsRequired();
        builder.Property(p => p.CustomerId).IsRequired();
        builder.Property(p => p.PaymentDate).IsRequired();
        builder.Property(p => p.PaymentMethod).IsRequired().HasConversion<string>();
        builder.Property(p => p.Status).IsRequired().HasConversion<string>();
        builder.Property(p => p.ReferenceNumber).HasMaxLength(100);
        builder.Property(p => p.TransactionId).HasMaxLength(200);
        builder.Property(p => p.Notes).HasMaxLength(1000);
        builder.Property(p => p.CardLastFourDigits).HasMaxLength(4);
        builder.Property(p => p.CardType).HasMaxLength(50);
        builder.Property(p => p.BankName).HasMaxLength(200);
        builder.Property(p => p.CheckNumber).HasMaxLength(50);
        builder.Property(p => p.ClearanceDate);
        
        // Value Objects
        builder.OwnsOne(p => p.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("Currency").HasMaxLength(3);
        });
        
        // Relationships
        builder.HasOne<Invoice>()
            .WithMany()
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Indexes
        builder.HasIndex(p => p.InvoiceId);
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.CustomerId);
        builder.HasIndex(p => p.PaymentNumber).IsUnique();
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.PaymentDate);
        builder.HasIndex(p => p.ReferenceNumber);
    }
}