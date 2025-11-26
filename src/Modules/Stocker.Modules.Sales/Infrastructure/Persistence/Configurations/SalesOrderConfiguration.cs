using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesOrderConfiguration : IEntityTypeConfiguration<SalesOrder>
{
    public void Configure(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.ToTable("SalesOrders", "sales");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .ValueGeneratedNever();

        builder.Property(o => o.TenantId)
            .IsRequired();

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.CustomerName)
            .HasMaxLength(200);

        builder.Property(o => o.CustomerEmail)
            .HasMaxLength(255);

        builder.Property(o => o.CustomerOrderNumber)
            .HasMaxLength(100);

        builder.Property(o => o.SubTotal)
            .HasPrecision(18, 2);

        builder.Property(o => o.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(o => o.VatAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.TotalAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(o => o.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(o => o.ShippingAddress)
            .HasMaxLength(500);

        builder.Property(o => o.BillingAddress)
            .HasMaxLength(500);

        builder.Property(o => o.Notes)
            .HasMaxLength(2000);

        builder.Property(o => o.SalesPersonName)
            .HasMaxLength(200);

        builder.Property(o => o.CancellationReason)
            .HasMaxLength(500);

        // Relationships
        builder.HasMany(o => o.Items)
            .WithOne(i => i.SalesOrder)
            .HasForeignKey(i => i.SalesOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(o => o.TenantId);
        builder.HasIndex(o => new { o.TenantId, o.OrderNumber }).IsUnique();
        builder.HasIndex(o => new { o.TenantId, o.CustomerId });
        builder.HasIndex(o => new { o.TenantId, o.Status });
        builder.HasIndex(o => new { o.TenantId, o.OrderDate });
        builder.HasIndex(o => new { o.TenantId, o.SalesPersonId });
    }
}
