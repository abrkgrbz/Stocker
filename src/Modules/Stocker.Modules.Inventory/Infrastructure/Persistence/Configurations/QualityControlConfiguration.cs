using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for QualityControl
/// </summary>
public class QualityControlConfiguration : IEntityTypeConfiguration<QualityControl>
{
    public void Configure(EntityTypeBuilder<QualityControl> builder)
    {
        builder.ToTable("QualityControls", "inventory");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.TenantId)
            .IsRequired();

        builder.Property(q => q.QcNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(q => q.QcType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(q => q.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(q => q.Result)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(q => q.InspectionDate)
            .IsRequired();

        builder.Property(q => q.LotNumber)
            .HasMaxLength(100);

        builder.Property(q => q.PurchaseOrderNumber)
            .HasMaxLength(100);

        builder.Property(q => q.InspectedQuantity)
            .HasPrecision(18, 4);

        builder.Property(q => q.AcceptedQuantity)
            .HasPrecision(18, 4);

        builder.Property(q => q.RejectedQuantity)
            .HasPrecision(18, 4);

        builder.Property(q => q.SampleQuantity)
            .HasPrecision(18, 4);

        builder.Property(q => q.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(q => q.QualityScore)
            .HasPrecision(5, 2);

        builder.Property(q => q.QualityGrade)
            .HasMaxLength(20);

        builder.Property(q => q.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(q => q.RejectionCategory)
            .HasConversion<int>();

        builder.Property(q => q.InspectorName)
            .HasMaxLength(200);

        builder.Property(q => q.InspectionLocation)
            .HasMaxLength(200);

        builder.Property(q => q.InspectionStandard)
            .HasMaxLength(100);

        builder.Property(q => q.RecommendedAction)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(q => q.AppliedAction)
            .HasConversion<int>();

        builder.Property(q => q.ActionDescription)
            .HasMaxLength(1000);

        builder.Property(q => q.InspectionNotes)
            .HasMaxLength(2000);

        builder.Property(q => q.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(q => q.SupplierNotification)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(q => q.Product)
            .WithMany()
            .HasForeignKey(q => q.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.Supplier)
            .WithMany()
            .HasForeignKey(q => q.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(q => q.Warehouse)
            .WithMany()
            .HasForeignKey(q => q.WarehouseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(q => q.Items)
            .WithOne(i => i.QualityControl)
            .HasForeignKey(i => i.QualityControlId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Attachments)
            .WithOne(a => a.QualityControl)
            .HasForeignKey(a => a.QualityControlId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(q => q.TenantId);
        builder.HasIndex(q => new { q.TenantId, q.QcNumber }).IsUnique();
        builder.HasIndex(q => new { q.TenantId, q.ProductId });
        builder.HasIndex(q => new { q.TenantId, q.SupplierId })
            .HasFilter("\"SupplierId\" IS NOT NULL");
        builder.HasIndex(q => new { q.TenantId, q.Status });
        builder.HasIndex(q => new { q.TenantId, q.Result });
        builder.HasIndex(q => new { q.TenantId, q.InspectionDate });
        builder.HasIndex(q => new { q.TenantId, q.QcType });
        builder.HasIndex(q => new { q.TenantId, q.LotNumber })
            .HasFilter("\"LotNumber\" IS NOT NULL");
    }
}

/// <summary>
/// Entity configuration for QualityControlItem
/// </summary>
public class QualityControlItemConfiguration : IEntityTypeConfiguration<QualityControlItem>
{
    public void Configure(EntityTypeBuilder<QualityControlItem> builder)
    {
        builder.ToTable("QualityControlItems", "inventory");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.CheckName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Specification)
            .HasMaxLength(500);

        builder.Property(i => i.AcceptanceCriteria)
            .HasMaxLength(500);

        builder.Property(i => i.MeasuredValue)
            .HasMaxLength(200);

        builder.Property(i => i.IsPassed);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.QualityControlId });
    }
}

/// <summary>
/// Entity configuration for QualityControlAttachment
/// </summary>
public class QualityControlAttachmentConfiguration : IEntityTypeConfiguration<QualityControlAttachment>
{
    public void Configure(EntityTypeBuilder<QualityControlAttachment> builder)
    {
        builder.ToTable("QualityControlAttachment", "inventory");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.FilePath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.Description)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.TenantId, a.QualityControlId });
    }
}
