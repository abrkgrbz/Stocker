using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class SubcontractOrderConfiguration : IEntityTypeConfiguration<SubcontractOrder>
{
    public void Configure(EntityTypeBuilder<SubcontractOrder> builder)
    {
        builder.ToTable("SubcontractOrders", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.SubcontractorName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.ProductCode)
            .HasMaxLength(50);

        builder.Property(x => x.ProductName)
            .HasMaxLength(200);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.OrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ShippedQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ReceivedQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.RejectedQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ScrapQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.CostCenterId)
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.ApprovedBy)
            .HasMaxLength(100);

        builder.HasIndex(x => new { x.TenantId, x.OrderNumber })
            .IsUnique();

        builder.HasIndex(x => new { x.TenantId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.SubcontractorId });
        builder.HasIndex(x => x.ExpectedDeliveryDate);

        builder.HasOne(x => x.ProductionOrder)
            .WithMany()
            .HasForeignKey(x => x.ProductionOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Operation)
            .WithMany()
            .HasForeignKey(x => x.OperationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.Shipments)
            .WithOne(x => x.SubcontractOrder)
            .HasForeignKey(x => x.SubcontractOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Materials)
            .WithOne(x => x.SubcontractOrder)
            .HasForeignKey(x => x.SubcontractOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Shipments).AutoInclude(false);
        builder.Navigation(x => x.Materials).AutoInclude(false);
    }
}

public class SubcontractShipmentConfiguration : IEntityTypeConfiguration<SubcontractShipment>
{
    public void Configure(EntityTypeBuilder<SubcontractShipment> builder)
    {
        builder.ToTable("SubcontractShipments", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Quantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.RejectedQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.BatchNumber)
            .HasMaxLength(100);

        builder.Property(x => x.LotNumber)
            .HasMaxLength(100);

        builder.Property(x => x.InvoiceNumber)
            .HasMaxLength(50);

        builder.Property(x => x.DeliveryNoteNumber)
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(x => x.ShipmentDate);
    }
}

public class SubcontractMaterialConfiguration : IEntityTypeConfiguration<SubcontractMaterial>
{
    public void Configure(EntityTypeBuilder<SubcontractMaterial> builder)
    {
        builder.ToTable("SubcontractMaterials", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MaterialCode)
            .HasMaxLength(50);

        builder.Property(x => x.MaterialName)
            .HasMaxLength(200);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.RequiredQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ShippedQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ReturnedQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ConsumedQuantity)
            .HasPrecision(18, 4);

        builder.HasIndex(x => new { x.SubcontractOrderId, x.MaterialId });
    }
}
