using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class RoutingConfiguration : IEntityTypeConfiguration<Routing>
{
    public void Configure(EntityTypeBuilder<Routing> builder)
    {
        builder.ToTable("Routings");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Version)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.BaseQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.BaseUnit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.TotalSetupTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.TotalRunTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.TotalQueueTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.TotalMoveTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.TotalLeadTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.EstimatedLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.EstimatedMachineCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.EstimatedOverheadCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalEstimatedCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ApprovedBy)
            .HasMaxLength(100);

        builder.Property(x => x.ApprovalNotes)
            .HasMaxLength(500);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.ProductId });
        builder.HasIndex(x => x.Status);
    }
}

public class OperationConfiguration : IEntityTypeConfiguration<Operation>
{
    public void Configure(EntityTypeBuilder<Operation> builder)
    {
        builder.ToTable("Operations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.SetupTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.RunTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.RunTimePerUnit)
            .HasPrecision(10, 2);

        builder.Property(x => x.QueueTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.MoveTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.WaitTime)
            .HasPrecision(10, 2);

        builder.Property(x => x.UnitsPerHour)
            .HasPrecision(18, 4);

        builder.Property(x => x.LaborCostPerHour)
            .HasPrecision(18, 4);

        builder.Property(x => x.MachineCostPerHour)
            .HasPrecision(18, 4);

        builder.Property(x => x.OverheadCostPerHour)
            .HasPrecision(18, 4);

        builder.Property(x => x.SetupCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.SubcontractCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ScrapRate)
            .HasPrecision(5, 4);

        builder.Property(x => x.ReworkRate)
            .HasPrecision(5, 4);

        builder.Property(x => x.OverlapPercent)
            .HasPrecision(5, 2);

        builder.Property(x => x.PredecessorOperations)
            .HasMaxLength(500);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.HasOne(x => x.Routing)
            .WithMany(x => x.Operations)
            .HasForeignKey(x => x.RoutingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AlternativeOperation)
            .WithMany()
            .HasForeignKey(x => x.AlternativeOperationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.RoutingId, x.Sequence }).IsUnique();
    }
}
