using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

public class ReorderSuggestionConfiguration : IEntityTypeConfiguration<ReorderSuggestion>
{
    public void Configure(EntityTypeBuilder<ReorderSuggestion> builder)
    {
        builder.ToTable("reorder_suggestions", "inventory");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.TriggerReason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.StatusReason)
            .HasMaxLength(500);

        builder.Property(s => s.CurrentStock)
            .HasPrecision(18, 4);

        builder.Property(s => s.AvailableStock)
            .HasPrecision(18, 4);

        builder.Property(s => s.MinStockLevel)
            .HasPrecision(18, 4);

        builder.Property(s => s.ReorderLevel)
            .HasPrecision(18, 4);

        builder.Property(s => s.SuggestedQuantity)
            .HasPrecision(18, 4);

        // Money type for EstimatedCost
        builder.OwnsOne(s => s.EstimatedCost, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("EstimatedCostAmount")
                .HasPrecision(18, 4)
                .IsRequired();
            money.Property(m => m.Currency)
                .HasColumnName("EstimatedCostCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Relationships
        builder.HasOne(s => s.Product)
            .WithMany()
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Warehouse)
            .WithMany()
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.SuggestedSupplier)
            .WithMany()
            .HasForeignKey(s => s.SuggestedSupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.TriggeredByRule)
            .WithMany(r => r.Suggestions)
            .HasForeignKey(s => s.TriggeredByRuleId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.ProductId);
        builder.HasIndex(s => s.GeneratedAt);
        builder.HasIndex(s => s.ExpiresAt);
        builder.HasIndex(s => new { s.Status, s.ExpiresAt });
    }
}
