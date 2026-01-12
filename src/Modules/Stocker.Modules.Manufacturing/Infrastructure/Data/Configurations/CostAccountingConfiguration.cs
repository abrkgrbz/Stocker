using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class ProductionCostRecordConfiguration : IEntityTypeConfiguration<ProductionCostRecord>
{
    public void Configure(EntityTypeBuilder<ProductionCostRecord> builder)
    {
        builder.ToTable("ProductionCostRecords");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RecordNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.ProductCode)
            .HasMaxLength(50);

        builder.Property(x => x.ProductName)
            .HasMaxLength(200);

        builder.Property(x => x.ProductionOrderNumber)
            .HasMaxLength(50);

        builder.Property(x => x.Unit)
            .HasMaxLength(20);

        builder.Property(x => x.CostCenterId)
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.FinalizedBy)
            .HasMaxLength(100);

        builder.Property(x => x.Quantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.DirectMaterialCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.DirectLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ManufacturingOverhead)
            .HasPrecision(18, 4);

        builder.Property(x => x.VariableOverhead)
            .HasPrecision(18, 4);

        builder.Property(x => x.FixedOverhead)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalProductionCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.MaterialVariance)
            .HasPrecision(18, 4);

        builder.Property(x => x.LaborVariance)
            .HasPrecision(18, 4);

        builder.Property(x => x.OverheadVariance)
            .HasPrecision(18, 4);

        builder.Property(x => x.UnitDirectMaterialCost)
            .HasPrecision(18, 6);

        builder.Property(x => x.UnitDirectLaborCost)
            .HasPrecision(18, 6);

        builder.Property(x => x.UnitOverheadCost)
            .HasPrecision(18, 6);

        builder.Property(x => x.UnitTotalCost)
            .HasPrecision(18, 6);

        builder.Property(x => x.StandardCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.CostVariance)
            .HasPrecision(18, 4);

        builder.Property(x => x.VariancePercent)
            .HasPrecision(18, 2);

        builder.HasOne(x => x.ProductionOrder)
            .WithMany()
            .HasForeignKey(x => x.ProductionOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.CostAllocations)
            .WithOne(x => x.ProductionCostRecord)
            .HasForeignKey(x => x.ProductionCostRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.JournalEntries)
            .WithOne(x => x.ProductionCostRecord)
            .HasForeignKey(x => x.ProductionCostRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.RecordNumber).IsUnique();
        builder.HasIndex(x => x.ProductionOrderId);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => new { x.Year, x.Month });
        builder.HasIndex(x => x.TenantId);
    }
}

public class ProductionCostAllocationConfiguration : IEntityTypeConfiguration<ProductionCostAllocation>
{
    public void Configure(EntityTypeBuilder<ProductionCostAllocation> builder)
    {
        builder.ToTable("ProductionCostAllocations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AccountCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.AccountName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.AllocationBasis)
            .HasMaxLength(100);

        builder.Property(x => x.SourceCostCenter)
            .HasMaxLength(50);

        builder.Property(x => x.TargetCostCenter)
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.Property(x => x.Amount)
            .HasPrecision(18, 4);

        builder.Property(x => x.AllocationRate)
            .HasPrecision(18, 6);

        builder.HasIndex(x => x.ProductionCostRecordId);
        builder.HasIndex(x => x.AccountCode);
        builder.HasIndex(x => x.TenantId);
    }
}

public class CostJournalEntryConfiguration : IEntityTypeConfiguration<CostJournalEntry>
{
    public void Configure(EntityTypeBuilder<CostJournalEntry> builder)
    {
        builder.ToTable("CostJournalEntries");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AccountCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.AccountName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.DocumentNumber)
            .HasMaxLength(50);

        builder.Property(x => x.DocumentType)
            .HasMaxLength(50);

        builder.Property(x => x.PostedBy)
            .HasMaxLength(100);

        builder.Property(x => x.DebitAmount)
            .HasPrecision(18, 4);

        builder.Property(x => x.CreditAmount)
            .HasPrecision(18, 4);

        builder.HasIndex(x => x.ProductionCostRecordId);
        builder.HasIndex(x => x.AccountCode);
        builder.HasIndex(x => x.EntryDate);
        builder.HasIndex(x => x.TenantId);
    }
}

public class CostCenterConfiguration : IEntityTypeConfiguration<CostCenter>
{
    public void Configure(EntityTypeBuilder<CostCenter> builder)
    {
        builder.ToTable("CostCenters");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.ResponsiblePerson)
            .HasMaxLength(100);

        builder.Property(x => x.BudgetAmount)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualAmount)
            .HasPrecision(18, 4);

        builder.Property(x => x.VarianceAmount)
            .HasPrecision(18, 4);

        builder.HasOne(x => x.ParentCostCenter)
            .WithMany(x => x.ChildCostCenters)
            .HasForeignKey(x => x.ParentCostCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.Code);
        builder.HasIndex(x => x.Type);
        builder.HasIndex(x => x.TenantId);
    }
}

public class StandardCostCardConfiguration : IEntityTypeConfiguration<StandardCostCard>
{
    public void Configure(EntityTypeBuilder<StandardCostCard> builder)
    {
        builder.ToTable("StandardCostCards");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductCode)
            .HasMaxLength(50);

        builder.Property(x => x.ProductName)
            .HasMaxLength(200);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.ApprovedBy)
            .HasMaxLength(100);

        builder.Property(x => x.StandardMaterialCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.StandardLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.StandardOverheadCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.StandardTotalCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.StandardMaterialQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.StandardLaborHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.StandardMachineHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.MaterialUnitPrice)
            .HasPrecision(18, 6);

        builder.Property(x => x.LaborHourlyRate)
            .HasPrecision(18, 6);

        builder.Property(x => x.OverheadRate)
            .HasPrecision(18, 6);

        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.Year);
        builder.HasIndex(x => x.IsCurrent);
        builder.HasIndex(x => x.TenantId);
    }
}
