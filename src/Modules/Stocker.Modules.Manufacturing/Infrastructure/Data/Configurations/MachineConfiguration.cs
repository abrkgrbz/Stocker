using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class MachineConfiguration : IEntityTypeConfiguration<Machine>
{
    public void Configure(EntityTypeBuilder<Machine> builder)
    {
        builder.ToTable("Machines");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Manufacturer)
            .HasMaxLength(100);

        builder.Property(x => x.Model)
            .HasMaxLength(100);

        builder.Property(x => x.SerialNumber)
            .HasMaxLength(100);

        builder.Property(x => x.HourlyCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.SetupCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.MaintenanceCostPerHour)
            .HasPrecision(18, 4);

        builder.Property(x => x.HourlyCapacity)
            .HasPrecision(18, 4);

        builder.Property(x => x.EfficiencyRate)
            .HasPrecision(5, 2);

        builder.Property(x => x.PowerConsumptionKw)
            .HasPrecision(10, 2);

        builder.Property(x => x.AvailabilityRate)
            .HasPrecision(5, 2);

        builder.Property(x => x.PerformanceRate)
            .HasPrecision(5, 2);

        builder.Property(x => x.QualityRate)
            .HasPrecision(5, 2);

        builder.Property(x => x.TotalOperatingHours)
            .HasPrecision(18, 2);

        builder.HasOne(x => x.WorkCenter)
            .WithMany(x => x.Machines)
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => x.WorkCenterId);
        builder.HasIndex(x => x.Status);
    }
}

public class MachineDowntimeConfiguration : IEntityTypeConfiguration<MachineDowntime>
{
    public void Configure(EntityTypeBuilder<MachineDowntime> builder)
    {
        builder.ToTable("MachineDowntimes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.DowntimeNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.DowntimeType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.DowntimeCategory)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.DowntimeReason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.DowntimeCode)
            .HasMaxLength(20);

        builder.Property(x => x.DurationMinutes)
            .HasPrecision(10, 2);

        builder.Property(x => x.EstimatedDurationMinutes)
            .HasPrecision(10, 2);

        builder.Property(x => x.FailureMode)
            .HasMaxLength(200);

        builder.Property(x => x.FailureCause)
            .HasMaxLength(500);

        builder.Property(x => x.FailureEffect)
            .HasMaxLength(500);

        builder.Property(x => x.RepairAction)
            .HasMaxLength(1000);

        builder.Property(x => x.PreventiveAction)
            .HasMaxLength(1000);

        builder.Property(x => x.RepairCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.SpareParts)
            .HasColumnType("jsonb");

        builder.Property(x => x.MaintenanceWorkOrderId)
            .HasMaxLength(50);

        builder.Property(x => x.OEECategory)
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.Attachments)
            .HasColumnType("jsonb");

        builder.Property(x => x.LostProductionQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.LostProductionValue)
            .HasPrecision(18, 4);

        builder.HasOne(x => x.Machine)
            .WithMany()
            .HasForeignKey(x => x.MachineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.DowntimeNumber }).IsUnique();
        builder.HasIndex(x => x.MachineId);
        builder.HasIndex(x => x.StartTime);
        builder.HasIndex(x => x.Status);
    }
}
