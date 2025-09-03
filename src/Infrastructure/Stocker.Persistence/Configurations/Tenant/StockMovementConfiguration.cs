using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("StockMovements", "inventory");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.MovementNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(m => new { m.TenantId, m.MovementNumber })
            .IsUnique();

        builder.Property(m => m.Type)
            .IsRequired();

        builder.Property(m => m.Quantity)
            .HasPrecision(18, 3);

        builder.Property(m => m.UnitPrice)
            .HasPrecision(18, 2);

        builder.Property(m => m.TotalPrice)
            .HasPrecision(18, 2);

        builder.Property(m => m.FromLocation)
            .HasMaxLength(200);

        builder.Property(m => m.ToLocation)
            .HasMaxLength(200);

        builder.Property(m => m.ReferenceType)
            .HasMaxLength(100);

        builder.Property(m => m.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(m => m.Reason)
            .HasMaxLength(500);

        builder.Property(m => m.Notes)
            .HasMaxLength(1000);

        builder.Property(m => m.Status)
            .IsRequired();

        builder.Property(m => m.PerformedBy)
            .HasMaxLength(200);

        builder.Property(m => m.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(m => m.BatchNumber)
            .HasMaxLength(100);

        builder.Property(m => m.SerialNumber)
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(m => m.MovementDate);
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => m.Type);
        builder.HasIndex(m => m.ProductId);
        builder.HasIndex(m => new { m.ReferenceId, m.ReferenceType })
            .HasFilter("[ReferenceId] IS NOT NULL");

        // Relationships
        builder.HasOne(m => m.Product)
            .WithMany(p => p.StockMovements)
            .HasForeignKey(m => m.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.FromWarehouse)
            .WithMany(w => w.OutgoingMovements)
            .HasForeignKey(m => m.FromWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.ToWarehouse)
            .WithMany(w => w.IncomingMovements)
            .HasForeignKey(m => m.ToWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filters
        builder.HasQueryFilter(m => m.TenantId == EF.Property<Guid>(m, "TenantId"));
    }
}