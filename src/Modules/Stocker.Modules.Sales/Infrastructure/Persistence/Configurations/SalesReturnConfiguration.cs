using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesReturnConfiguration : IEntityTypeConfiguration<SalesReturn>
{
    public void Configure(EntityTypeBuilder<SalesReturn> builder)
    {
        builder.ToTable("SalesReturns");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReturnNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.SalesOrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.InvoiceNumber)
            .HasMaxLength(50);

        builder.Property(r => r.CustomerName)
            .HasMaxLength(200);

        builder.Property(r => r.CustomerEmail)
            .HasMaxLength(200);

        builder.Property(r => r.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Reason)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.ReasonDetails)
            .HasMaxLength(1000);

        builder.Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.SubTotal)
            .HasPrecision(18, 4);

        builder.Property(r => r.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.RefundAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.RefundMethod)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.RefundReference)
            .HasMaxLength(100);

        builder.Property(r => r.Notes)
            .HasMaxLength(2000);

        builder.Property(r => r.InternalNotes)
            .HasMaxLength(2000);

        builder.HasMany(r => r.Items)
            .WithOne()
            .HasForeignKey(i => i.SalesReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => r.ReturnNumber)
            .IsUnique();

        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => r.SalesOrderId);
        builder.HasIndex(r => r.CustomerId);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.ReturnDate);
    }
}

public class SalesReturnItemConfiguration : IEntityTypeConfiguration<SalesReturnItem>
{
    public void Configure(EntityTypeBuilder<SalesReturnItem> builder)
    {
        builder.ToTable("SalesReturnItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.ProductCode)
            .HasMaxLength(50);

        builder.Property(i => i.Unit)
            .HasMaxLength(20)
            .HasDefaultValue("Adet");

        builder.Property(i => i.QuantityOrdered)
            .HasPrecision(18, 4);

        builder.Property(i => i.QuantityReturned)
            .HasPrecision(18, 4);

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.VatRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.LineTotal)
            .HasPrecision(18, 4);

        builder.Property(i => i.Condition)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.ConditionNotes)
            .HasMaxLength(500);

        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.SalesReturnId);
        builder.HasIndex(i => i.ProductId);
    }
}
