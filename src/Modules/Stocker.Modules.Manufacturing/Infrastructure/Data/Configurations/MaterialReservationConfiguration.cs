using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class MaterialReservationConfiguration : IEntityTypeConfiguration<MaterialReservation>
{
    public void Configure(EntityTypeBuilder<MaterialReservation> builder)
    {
        builder.ToTable("MaterialReservations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ReservationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<int>();

        // Referans kayıt
        builder.Property(x => x.ReferenceType)
            .HasMaxLength(50);

        // Malzeme bilgileri
        builder.Property(x => x.ProductCode)
            .HasMaxLength(50);

        builder.Property(x => x.ProductName)
            .HasMaxLength(200);

        // Miktar bilgileri
        builder.Property(x => x.RequiredQuantity)
            .IsRequired()
            .HasPrecision(18, 6);

        builder.Property(x => x.AllocatedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.IssuedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ReturnedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        // Depo/Lokasyon
        builder.Property(x => x.WarehouseCode)
            .HasMaxLength(50);

        builder.Property(x => x.LocationCode)
            .HasMaxLength(50);

        // Lot/Seri
        builder.Property(x => x.LotNumber)
            .HasMaxLength(100);

        builder.Property(x => x.SerialNumber)
            .HasMaxLength(100);

        // Talep eden
        builder.Property(x => x.RequestedBy)
            .HasMaxLength(100);

        // Onay
        builder.Property(x => x.ApprovedBy)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        // Navigation properties
        builder.HasOne(x => x.ProductionOrder)
            .WithMany()
            .HasForeignKey(x => x.ProductionOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductionOrderLine)
            .WithMany()
            .HasForeignKey(x => x.ProductionOrderLineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.BomLine)
            .WithMany()
            .HasForeignKey(x => x.BomLineId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => new { x.TenantId, x.ReservationNumber }).IsUnique();
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.ProductionOrderId);
        builder.HasIndex(x => x.SalesOrderId);
        builder.HasIndex(x => x.SubcontractOrderId);
        builder.HasIndex(x => x.MrpPlanId);
        builder.HasIndex(x => x.WarehouseId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Type);
        builder.HasIndex(x => x.RequiredDate);
        builder.HasIndex(x => x.Priority);
        builder.HasIndex(x => x.IsUrgent);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => new { x.ProductId, x.Status }); // Ürün bazlı aktif rezervasyonlar için
        builder.HasIndex(x => new { x.WarehouseId, x.Status }); // Depo bazlı aktif rezervasyonlar için
    }
}

public class MaterialReservationAllocationConfiguration : IEntityTypeConfiguration<MaterialReservationAllocation>
{
    public void Configure(EntityTypeBuilder<MaterialReservationAllocation> builder)
    {
        builder.ToTable("MaterialReservationAllocations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Quantity)
            .IsRequired()
            .HasPrecision(18, 6);

        // Depo/Lokasyon
        builder.Property(x => x.WarehouseCode)
            .HasMaxLength(50);

        builder.Property(x => x.LocationCode)
            .HasMaxLength(50);

        // Lot/Seri
        builder.Property(x => x.LotNumber)
            .HasMaxLength(100);

        builder.Property(x => x.SerialNumber)
            .HasMaxLength(100);

        // Tahsis bilgileri
        builder.Property(x => x.AllocatedBy)
            .IsRequired()
            .HasMaxLength(100);

        // İptal bilgileri
        builder.Property(x => x.CancelReason)
            .HasMaxLength(500);

        builder.Property(x => x.CancelledBy)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        // Navigation
        builder.HasOne(x => x.MaterialReservation)
            .WithMany(x => x.Allocations)
            .HasForeignKey(x => x.MaterialReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.MaterialReservationId);
        builder.HasIndex(x => x.WarehouseId);
        builder.HasIndex(x => x.StockId);
        builder.HasIndex(x => x.LotNumber);
        builder.HasIndex(x => x.SerialNumber);
        builder.HasIndex(x => x.AllocationDate);
        builder.HasIndex(x => x.IsCancelled);
    }
}

public class MaterialReservationIssueConfiguration : IEntityTypeConfiguration<MaterialReservationIssue>
{
    public void Configure(EntityTypeBuilder<MaterialReservationIssue> builder)
    {
        builder.ToTable("MaterialReservationIssues");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Quantity)
            .IsRequired()
            .HasPrecision(18, 6);

        // Depo/Lokasyon
        builder.Property(x => x.WarehouseCode)
            .HasMaxLength(50);

        builder.Property(x => x.LocationCode)
            .HasMaxLength(50);

        // Lot/Seri
        builder.Property(x => x.LotNumber)
            .HasMaxLength(100);

        builder.Property(x => x.SerialNumber)
            .HasMaxLength(100);

        // Çıkış bilgileri
        builder.Property(x => x.IssuedBy)
            .IsRequired()
            .HasMaxLength(100);

        // İade bilgileri
        builder.Property(x => x.ReturnedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ReturnReason)
            .HasMaxLength(500);

        builder.Property(x => x.ReturnedBy)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        // Navigation
        builder.HasOne(x => x.MaterialReservation)
            .WithMany(x => x.Issues)
            .HasForeignKey(x => x.MaterialReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.MaterialReservationId);
        builder.HasIndex(x => x.WarehouseId);
        builder.HasIndex(x => x.StockMovementId);
        builder.HasIndex(x => x.LotNumber);
        builder.HasIndex(x => x.SerialNumber);
        builder.HasIndex(x => x.IssueDate);
    }
}
