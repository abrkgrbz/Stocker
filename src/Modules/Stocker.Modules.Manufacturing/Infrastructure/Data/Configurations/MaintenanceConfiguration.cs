using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class MaintenancePlanConfiguration : IEntityTypeConfiguration<MaintenancePlan>
{
    public void Configure(EntityTypeBuilder<MaintenancePlan> builder)
    {
        builder.ToTable("MaintenancePlans", ManufacturingDbContext.Schema);

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.Instructions).HasMaxLength(4000);
        builder.Property(x => x.SafetyNotes).HasMaxLength(2000);
        builder.Property(x => x.CreatedByUser).HasMaxLength(100);
        builder.Property(x => x.ApprovedByUser).HasMaxLength(100);

        builder.Property(x => x.EstimatedDurationHours).HasPrecision(10, 2);
        builder.Property(x => x.EstimatedLaborCost).HasPrecision(18, 2);
        builder.Property(x => x.EstimatedMaterialCost).HasPrecision(18, 2);
        builder.Property(x => x.TriggerMeterValue).HasPrecision(18, 2);
        builder.Property(x => x.WarningThreshold).HasPrecision(5, 2);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.MachineId);
        builder.HasIndex(x => x.WorkCenterId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.MaintenanceType);
        builder.HasIndex(x => x.NextScheduledDate);

        builder.HasOne(x => x.Machine)
            .WithMany()
            .HasForeignKey(x => x.MachineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => x.TenantId == x.TenantId);
    }
}

public class MaintenanceTaskConfiguration : IEntityTypeConfiguration<MaintenanceTask>
{
    public void Configure(EntityTypeBuilder<MaintenanceTask> builder)
    {
        builder.ToTable("MaintenanceTasks", ManufacturingDbContext.Schema);

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.TaskName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.RequiredSkills).HasMaxLength(500);
        builder.Property(x => x.RequiredTools).HasMaxLength(500);
        builder.Property(x => x.ChecklistCriteria).HasMaxLength(500);
        builder.Property(x => x.AcceptanceValue).HasMaxLength(100);

        builder.Property(x => x.EstimatedDurationMinutes).HasPrecision(10, 2);

        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.MaintenancePlanId);
        builder.HasIndex(x => new { x.MaintenancePlanId, x.SequenceNumber });

        builder.HasOne(x => x.MaintenancePlan)
            .WithMany(x => x.Tasks)
            .HasForeignKey(x => x.MaintenancePlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(x => x.TenantId == x.TenantId);
    }
}

public class MaintenanceRecordConfiguration : IEntityTypeConfiguration<MaintenanceRecord>
{
    public void Configure(EntityTypeBuilder<MaintenanceRecord> builder)
    {
        builder.ToTable("MaintenanceRecords", ManufacturingDbContext.Schema);

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.RecordNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.FailureCode).HasMaxLength(50);
        builder.Property(x => x.FailureDescription).HasMaxLength(1000);
        builder.Property(x => x.RootCause).HasMaxLength(1000);
        builder.Property(x => x.WorkPerformed).HasMaxLength(4000);
        builder.Property(x => x.PartsReplaced).HasMaxLength(2000);
        builder.Property(x => x.TechnicianNotes).HasMaxLength(2000);
        builder.Property(x => x.AssignedTechnician).HasMaxLength(100);
        builder.Property(x => x.PerformedBy).HasMaxLength(100);
        builder.Property(x => x.ApprovedBy).HasMaxLength(100);
        builder.Property(x => x.NextActionRecommendation).HasMaxLength(1000);

        builder.Property(x => x.ActualDurationHours).HasPrecision(10, 2);
        builder.Property(x => x.LaborCost).HasPrecision(18, 2);
        builder.Property(x => x.MaterialCost).HasPrecision(18, 2);
        builder.Property(x => x.ExternalServiceCost).HasPrecision(18, 2);
        builder.Property(x => x.MeterReadingBefore).HasPrecision(18, 2);
        builder.Property(x => x.MeterReadingAfter).HasPrecision(18, 2);

        builder.HasIndex(x => new { x.TenantId, x.RecordNumber }).IsUnique();
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.MachineId);
        builder.HasIndex(x => x.WorkCenterId);
        builder.HasIndex(x => x.MaintenancePlanId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.MaintenanceType);
        builder.HasIndex(x => x.ScheduledDate);

        builder.HasOne(x => x.MaintenancePlan)
            .WithMany(x => x.Records)
            .HasForeignKey(x => x.MaintenancePlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Machine)
            .WithMany()
            .HasForeignKey(x => x.MachineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => x.TenantId == x.TenantId);
    }
}

public class MaintenanceRecordTaskConfiguration : IEntityTypeConfiguration<MaintenanceRecordTask>
{
    public void Configure(EntityTypeBuilder<MaintenanceRecordTask> builder)
    {
        builder.ToTable("MaintenanceRecordTasks", ManufacturingDbContext.Schema);

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.CompletedBy).HasMaxLength(100);
        builder.Property(x => x.MeasuredValue).HasMaxLength(100);
        builder.Property(x => x.Notes).HasMaxLength(500);

        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.MaintenanceRecordId);
        builder.HasIndex(x => x.MaintenanceTaskId);

        builder.HasOne(x => x.MaintenanceRecord)
            .WithMany(x => x.RecordTasks)
            .HasForeignKey(x => x.MaintenanceRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.MaintenanceTask)
            .WithMany()
            .HasForeignKey(x => x.MaintenanceTaskId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => x.TenantId == x.TenantId);
    }
}

public class SparePartConfiguration : IEntityTypeConfiguration<SparePart>
{
    public void Configure(EntityTypeBuilder<SparePart> builder)
    {
        builder.ToTable("SpareParts", ManufacturingDbContext.Schema);

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.Category).HasMaxLength(100);
        builder.Property(x => x.SubCategory).HasMaxLength(100);
        builder.Property(x => x.PartNumber).HasMaxLength(100);
        builder.Property(x => x.Manufacturer).HasMaxLength(200);
        builder.Property(x => x.ManufacturerPartNo).HasMaxLength(100);
        builder.Property(x => x.AlternativePartNo).HasMaxLength(100);
        builder.Property(x => x.Unit).HasMaxLength(20);
        builder.Property(x => x.CompatibleMachines).HasMaxLength(1000);
        builder.Property(x => x.CompatibleModels).HasMaxLength(500);
        builder.Property(x => x.StorageConditions).HasMaxLength(500);

        builder.Property(x => x.MinimumStock).HasPrecision(18, 4);
        builder.Property(x => x.ReorderPoint).HasPrecision(18, 4);
        builder.Property(x => x.ReorderQuantity).HasPrecision(18, 4);
        builder.Property(x => x.UnitCost).HasPrecision(18, 4);
        builder.Property(x => x.LastPurchasePrice).HasPrecision(18, 4);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.Criticality);
        builder.HasIndex(x => x.Status);

        builder.HasQueryFilter(x => x.TenantId == x.TenantId);
    }
}

public class MaintenancePlanSparePartConfiguration : IEntityTypeConfiguration<MaintenancePlanSparePart>
{
    public void Configure(EntityTypeBuilder<MaintenancePlanSparePart> builder)
    {
        builder.ToTable("MaintenancePlanSpareParts", ManufacturingDbContext.Schema);

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.RequiredQuantity).HasPrecision(18, 4);
        builder.Property(x => x.Notes).HasMaxLength(500);

        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.MaintenancePlanId, x.SparePartId }).IsUnique();

        builder.HasOne(x => x.MaintenancePlan)
            .WithMany(x => x.RequiredSpareParts)
            .HasForeignKey(x => x.MaintenancePlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SparePart)
            .WithMany(x => x.MaintenancePlans)
            .HasForeignKey(x => x.SparePartId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => x.TenantId == x.TenantId);
    }
}

public class MaintenanceRecordSparePartConfiguration : IEntityTypeConfiguration<MaintenanceRecordSparePart>
{
    public void Configure(EntityTypeBuilder<MaintenanceRecordSparePart> builder)
    {
        builder.ToTable("MaintenanceRecordSpareParts", ManufacturingDbContext.Schema);

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.UsedQuantity).HasPrecision(18, 4);
        builder.Property(x => x.UnitCost).HasPrecision(18, 4);
        builder.Property(x => x.TotalCost).HasPrecision(18, 4);
        builder.Property(x => x.LotNumber).HasMaxLength(50);
        builder.Property(x => x.SerialNumber).HasMaxLength(50);
        builder.Property(x => x.Notes).HasMaxLength(500);

        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.MaintenanceRecordId);
        builder.HasIndex(x => x.SparePartId);

        builder.HasOne(x => x.MaintenanceRecord)
            .WithMany(x => x.UsedSpareParts)
            .HasForeignKey(x => x.MaintenanceRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SparePart)
            .WithMany(x => x.MaintenanceRecords)
            .HasForeignKey(x => x.SparePartId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => x.TenantId == x.TenantId);
    }
}

public class MachineCounterConfiguration : IEntityTypeConfiguration<MachineCounter>
{
    public void Configure(EntityTypeBuilder<MachineCounter> builder)
    {
        builder.ToTable("MachineCounters", ManufacturingDbContext.Schema);

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.CounterName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CounterUnit).HasMaxLength(20);

        builder.Property(x => x.CurrentValue).HasPrecision(18, 4);
        builder.Property(x => x.PreviousValue).HasPrecision(18, 4);
        builder.Property(x => x.ResetValue).HasPrecision(18, 4);
        builder.Property(x => x.WarningThreshold).HasPrecision(18, 4);
        builder.Property(x => x.CriticalThreshold).HasPrecision(18, 4);

        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.MachineId, x.CounterName }).IsUnique();

        builder.HasOne(x => x.Machine)
            .WithMany()
            .HasForeignKey(x => x.MachineId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(x => x.TenantId == x.TenantId);
    }
}
