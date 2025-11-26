using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesOrderItemConfiguration : IEntityTypeConfiguration<SalesOrderItem>
{
    public void Configure(EntityTypeBuilder<SalesOrderItem> builder)
    {
        builder.ToTable("SalesOrderItems", "sales");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .ValueGeneratedNever();

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Description)
            .HasMaxLength(500);

        builder.Property(i => i.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.VatRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.VatAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.LineTotal)
            .HasPrecision(18, 2);

        builder.Property(i => i.DeliveredQuantity)
            .HasPrecision(18, 4);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.SalesOrderId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}
