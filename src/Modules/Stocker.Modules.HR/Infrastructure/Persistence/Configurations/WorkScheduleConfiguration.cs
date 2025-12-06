using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for WorkSchedule
/// </summary>
public class WorkScheduleConfiguration : IEntityTypeConfiguration<WorkSchedule>
{
    public void Configure(EntityTypeBuilder<WorkSchedule> builder)
    {
        builder.ToTable("WorkSchedules", "hr");

        builder.HasKey(ws => ws.Id);

        builder.Property(ws => ws.TenantId)
            .IsRequired();

        builder.Property(ws => ws.HolidayName)
            .HasMaxLength(100);

        builder.Property(ws => ws.Notes)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(ws => ws.Employee)
            .WithMany()
            .HasForeignKey(ws => ws.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ws => ws.Shift)
            .WithMany(s => s.WorkSchedules)
            .HasForeignKey(ws => ws.ShiftId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ws => ws.TenantId);
        builder.HasIndex(ws => new { ws.TenantId, ws.EmployeeId });
        builder.HasIndex(ws => new { ws.TenantId, ws.ShiftId });
        builder.HasIndex(ws => new { ws.TenantId, ws.Date });
        builder.HasIndex(ws => new { ws.TenantId, ws.EmployeeId, ws.Date }).IsUnique();
    }
}
