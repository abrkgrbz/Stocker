using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class ProductionOrderConfiguration : IEntityTypeConfiguration<ProductionOrder>
{
    public void Configure(EntityTypeBuilder<ProductionOrder> builder)
    {
        builder.ToTable("ProductionOrders");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Priority)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.PlannedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.CompletedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ScrapQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ReworkQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.CompletionPercent)
            .HasPrecision(5, 2);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.EstimatedMaterialCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.EstimatedLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.EstimatedMachineCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.EstimatedOverheadCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalEstimatedCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualMaterialCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualMachineCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualOverheadCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalActualCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.LotNumber)
            .HasMaxLength(100);

        builder.Property(x => x.PlannedBy)
            .HasMaxLength(100);

        builder.Property(x => x.ReleasedBy)
            .HasMaxLength(100);

        builder.Property(x => x.ClosedBy)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(x => new { x.TenantId, x.OrderNumber }).IsUnique();
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.PlannedStartDate);
        builder.HasIndex(x => x.SalesOrderId);
    }
}

public class ProductionOrderLineConfiguration : IEntityTypeConfiguration<ProductionOrderLine>
{
    public void Configure(EntityTypeBuilder<ProductionOrderLine> builder)
    {
        builder.ToTable("ProductionOrderLines");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.LineType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.RequiredQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ReservedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.IssuedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ReturnedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ScrapQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.LotNumber)
            .HasMaxLength(100);

        builder.Property(x => x.SerialNumber)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.HasOne(x => x.ProductionOrder)
            .WithMany(x => x.Lines)
            .HasForeignKey(x => x.ProductionOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.BomLine)
            .WithMany()
            .HasForeignKey(x => x.BomLineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Operation)
            .WithMany()
            .HasForeignKey(x => x.OperationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ProductionOrderId, x.Sequence }).IsUnique();
    }
}

public class ProductionOperationConfiguration : IEntityTypeConfiguration<ProductionOperation>
{
    public void Configure(EntityTypeBuilder<ProductionOperation> builder)
    {
        builder.ToTable("ProductionOperations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.PlannedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.CompletedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ScrapQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.ReworkQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.PlannedSetupTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.PlannedRunTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.PlannedQueueTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.PlannedMoveTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.TotalPlannedTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.ActualSetupTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.ActualRunTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.ActualQueueTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.ActualMoveTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.TotalActualTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.PlannedLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.PlannedMachineCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.PlannedOverheadCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualMachineCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualOverheadCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.OperatorId)
            .HasMaxLength(100);

        builder.Property(x => x.OperatorName)
            .HasMaxLength(200);

        builder.Property(x => x.SubcontractPurchaseOrderNumber)
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.HasOne(x => x.ProductionOrder)
            .WithMany(x => x.Operations)
            .HasForeignKey(x => x.ProductionOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Operation)
            .WithMany()
            .HasForeignKey(x => x.OperationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Machine)
            .WithMany()
            .HasForeignKey(x => x.MachineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ProductionOrderId, x.Sequence }).IsUnique();
        builder.HasIndex(x => x.WorkCenterId);
        builder.HasIndex(x => x.Status);
    }
}
