using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class WorkCenterConfiguration : IEntityTypeConfiguration<WorkCenter>
{
    public void Configure(EntityTypeBuilder<WorkCenter> builder)
    {
        builder.ToTable("WorkCenters");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.CapacityUnit)
            .HasMaxLength(20);

        builder.Property(x => x.CostCenterId)
            .HasMaxLength(50);

        builder.Property(x => x.EfficiencyRate)
            .HasPrecision(5, 2);

        builder.Property(x => x.HourlyLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.HourlyMachineCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.HourlyOverheadCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalHourlyCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.OEETarget)
            .HasPrecision(5, 2);

        builder.Property(x => x.LastOEE)
            .HasPrecision(5, 2);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.IsActive);
    }
}

public class WorkCenterShiftConfiguration : IEntityTypeConfiguration<WorkCenterShift>
{
    public void Configure(EntityTypeBuilder<WorkCenterShift> builder)
    {
        builder.ToTable("WorkCenterShifts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ShiftCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.ShiftName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.PlannedHours)
            .HasPrecision(5, 2);

        builder.Property(x => x.BreakMinutes)
            .HasPrecision(5, 2);

        builder.Property(x => x.EffectiveHours)
            .HasPrecision(5, 2);

        builder.Property(x => x.CapacityUtilization)
            .HasPrecision(5, 2);

        builder.Property(x => x.PlannedEfficiency)
            .HasPrecision(5, 2);

        builder.Property(x => x.HourlyLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ShiftPremiumRate)
            .HasPrecision(5, 2);

        builder.HasOne(x => x.WorkCenter)
            .WithMany(x => x.Shifts)
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.WorkCenterId, x.ShiftCode }).IsUnique();
    }
}

public class WorkCenterCalendarConfiguration : IEntityTypeConfiguration<WorkCenterCalendar>
{
    public void Configure(EntityTypeBuilder<WorkCenterCalendar> builder)
    {
        builder.ToTable("WorkCenterCalendars");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.DayType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.HolidayName)
            .HasMaxLength(100);

        builder.Property(x => x.ShiftDetails)
            .HasColumnType("jsonb");

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.WorkCenterId, x.CalendarDate }).IsUnique();
        builder.HasIndex(x => x.CalendarDate);
    }
}
