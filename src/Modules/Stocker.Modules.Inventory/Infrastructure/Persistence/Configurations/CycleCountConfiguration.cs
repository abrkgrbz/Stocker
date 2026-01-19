using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for CycleCount
/// </summary>
public class CycleCountConfiguration : IEntityTypeConfiguration<CycleCount>
{
    public void Configure(EntityTypeBuilder<CycleCount> builder)
    {
        builder.ToTable("CycleCounts", "inventory");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.PlanNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.PlanName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .HasMaxLength(1000);

        builder.Property(c => c.CountType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.ScheduledStartDate)
            .IsRequired();

        builder.Property(c => c.ScheduledEndDate)
            .IsRequired();

        builder.Property(c => c.Frequency)
            .HasConversion<int>();

        builder.Property(c => c.AbcClassFilter)
            .HasConversion<int>();

        builder.Property(c => c.QuantityTolerancePercent)
            .HasPrecision(5, 2);

        builder.Property(c => c.ValueTolerance)
            .HasPrecision(18, 4);

        builder.Property(c => c.AccuracyPercent)
            .HasPrecision(5, 2);

        builder.Property(c => c.AssignedTo)
            .HasMaxLength(200);

        builder.Property(c => c.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(c => c.PlanningNotes)
            .HasMaxLength(2000);

        builder.Property(c => c.CountNotes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(c => c.Warehouse)
            .WithMany()
            .HasForeignKey(c => c.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Zone)
            .WithMany()
            .HasForeignKey(c => c.ZoneId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.Category)
            .WithMany()
            .HasForeignKey(c => c.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Items)
            .WithOne(i => i.CycleCount)
            .HasForeignKey(i => i.CycleCountId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.PlanNumber }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.WarehouseId });
        builder.HasIndex(c => new { c.TenantId, c.Status });
        builder.HasIndex(c => new { c.TenantId, c.ScheduledStartDate });
        builder.HasIndex(c => new { c.TenantId, c.NextScheduledDate });
        builder.HasIndex(c => new { c.TenantId, c.AssignedUserId });
    }
}

/// <summary>
/// Entity configuration for CycleCountItem
/// </summary>
public class CycleCountItemConfiguration : IEntityTypeConfiguration<CycleCountItem>
{
    public void Configure(EntityTypeBuilder<CycleCountItem> builder)
    {
        builder.ToTable("CycleCountItems", "inventory");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.SystemQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.CountedQuantity)
            .HasPrecision(18, 4);

        // VarianceQuantity is a computed property
        builder.Ignore(i => i.VarianceQuantity);

        // VariancePercent is a computed property
        builder.Ignore(i => i.VariancePercent);

        // HasVariance is a computed property
        builder.Ignore(i => i.HasVariance);

        builder.Property(i => i.UnitCost)
            .HasPrecision(18, 4);

        // VarianceValue is a computed property
        builder.Ignore(i => i.VarianceValue);

        builder.Property(i => i.LotNumber)
            .HasMaxLength(100);

        builder.Property(i => i.CountedBy)
            .HasMaxLength(200);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Location)
            .WithMany()
            .HasForeignKey(i => i.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.CycleCountId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
        builder.HasIndex(i => new { i.TenantId, i.IsCounted });
    }
}
