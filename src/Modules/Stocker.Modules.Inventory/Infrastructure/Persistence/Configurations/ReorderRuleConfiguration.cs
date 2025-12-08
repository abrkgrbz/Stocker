using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

public class ReorderRuleConfiguration : IEntityTypeConfiguration<ReorderRule>
{
    public void Configure(EntityTypeBuilder<ReorderRule> builder)
    {
        builder.ToTable("reorder_rules", "inventory");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .HasMaxLength(500);

        builder.Property(r => r.CronExpression)
            .HasMaxLength(100);

        builder.Property(r => r.TriggerBelowQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.FixedReorderQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.ReorderUpToQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.MinimumOrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.MaximumOrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.PackSize)
            .HasPrecision(18, 4);

        // Relationships
        builder.HasOne(r => r.Product)
            .WithMany()
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Category)
            .WithMany()
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Warehouse)
            .WithMany()
            .HasForeignKey(r => r.WarehouseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Supplier)
            .WithMany()
            .HasForeignKey(r => r.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.ProductId);
        builder.HasIndex(r => r.CategoryId);
        builder.HasIndex(r => new { r.Status, r.NextScheduledRun });
    }
}
