using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class BackOrderConfiguration : IEntityTypeConfiguration<BackOrder>
{
    public void Configure(EntityTypeBuilder<BackOrder> builder)
    {
        builder.ToTable("BackOrders", "sales");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.BackOrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(b => b.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(b => b.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Source Document
        builder.Property(b => b.SalesOrderNumber)
            .HasMaxLength(50);

        // Customer
        builder.Property(b => b.CustomerName)
            .HasMaxLength(200);

        builder.Property(b => b.CustomerEmail)
            .HasMaxLength(200);

        // Warehouse
        builder.Property(b => b.WarehouseCode)
            .HasMaxLength(50);

        // Cancellation
        builder.Property(b => b.CancellationReason)
            .HasMaxLength(500);

        // Creator
        builder.Property(b => b.CreatedByName)
            .HasMaxLength(200);

        // Metadata
        builder.Property(b => b.Notes)
            .HasMaxLength(2000);

        // Navigation
        builder.HasMany(b => b.Items)
            .WithOne()
            .HasForeignKey(i => i.BackOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(b => b.TenantId);
        builder.HasIndex(b => b.BackOrderNumber);
        builder.HasIndex(b => new { b.TenantId, b.BackOrderNumber }).IsUnique();
        builder.HasIndex(b => b.SalesOrderId);
        builder.HasIndex(b => b.CustomerId);
        builder.HasIndex(b => b.WarehouseId);
        builder.HasIndex(b => b.Status);
        builder.HasIndex(b => b.Priority);
        builder.HasIndex(b => b.EstimatedRestockDate);
        builder.HasIndex(b => new { b.TenantId, b.Status, b.Priority });
    }
}

public class BackOrderItemConfiguration : IEntityTypeConfiguration<BackOrderItem>
{
    public void Configure(EntityTypeBuilder<BackOrderItem> builder)
    {
        builder.ToTable("BackOrderItems", "sales");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Unit)
            .HasMaxLength(20)
            .HasDefaultValue("Adet");

        // Quantities
        builder.Property(i => i.OrderedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.AvailableQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.FulfilledQuantity)
            .HasPrecision(18, 4);

        // Pricing
        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        // Substitution
        builder.Property(i => i.SubstituteProductCode)
            .HasMaxLength(50);

        // Purchase Order
        builder.Property(i => i.PurchaseOrderNumber)
            .HasMaxLength(50);

        // Metadata
        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.BackOrderId);
        builder.HasIndex(i => i.ProductId);
        builder.HasIndex(i => i.SalesOrderItemId);
        builder.HasIndex(i => i.PurchaseOrderId);
    }
}
