using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Attendance
/// </summary>
public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
{
    public void Configure(EntityTypeBuilder<Attendance> builder)
    {
        builder.ToTable("Attendances", "hr");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(a => a.Notes)
            .HasMaxLength(500);

        builder.Property(a => a.CheckInLocation)
            .HasMaxLength(200);

        builder.Property(a => a.CheckOutLocation)
            .HasMaxLength(200);

        builder.Property(a => a.IpAddress)
            .HasMaxLength(50);

        builder.Property(a => a.DeviceInfo)
            .HasMaxLength(200);

        builder.Property(a => a.CheckInLatitude)
            .HasPrecision(10, 7);

        builder.Property(a => a.CheckInLongitude)
            .HasPrecision(10, 7);

        builder.Property(a => a.CheckOutLatitude)
            .HasPrecision(10, 7);

        builder.Property(a => a.CheckOutLongitude)
            .HasPrecision(10, 7);

        // Relationships
        builder.HasOne(a => a.Employee)
            .WithMany(e => e.Attendances)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Shift)
            .WithMany()
            .HasForeignKey(a => a.ShiftId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(a => a.ApprovedBy)
            .WithMany()
            .HasForeignKey(a => a.ApprovedById)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.TenantId, a.EmployeeId, a.Date }).IsUnique();
        builder.HasIndex(a => new { a.TenantId, a.Date });
        builder.HasIndex(a => new { a.TenantId, a.Status });
    }
}
