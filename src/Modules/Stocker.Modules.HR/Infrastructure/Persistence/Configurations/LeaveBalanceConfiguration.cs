using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for LeaveBalance
/// </summary>
public class LeaveBalanceConfiguration : IEntityTypeConfiguration<LeaveBalance>
{
    public void Configure(EntityTypeBuilder<LeaveBalance> builder)
    {
        builder.ToTable("LeaveBalances", "hr");

        builder.HasKey(lb => lb.Id);

        builder.Property(lb => lb.TenantId)
            .IsRequired();

        builder.Property(lb => lb.Entitled)
            .HasPrecision(5, 2);

        builder.Property(lb => lb.Used)
            .HasPrecision(5, 2);

        builder.Property(lb => lb.Pending)
            .HasPrecision(5, 2);

        builder.Property(lb => lb.CarriedForward)
            .HasPrecision(5, 2);

        builder.Property(lb => lb.Adjustment)
            .HasPrecision(5, 2);

        builder.Property(lb => lb.AdjustmentReason)
            .HasMaxLength(500);

        // Ignore computed property
        builder.Ignore(lb => lb.Available);

        // Relationships
        builder.HasOne(lb => lb.Employee)
            .WithMany(e => e.LeaveBalances)
            .HasForeignKey(lb => lb.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(lb => lb.LeaveType)
            .WithMany()
            .HasForeignKey(lb => lb.LeaveTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(lb => lb.TenantId);
        builder.HasIndex(lb => new { lb.TenantId, lb.EmployeeId, lb.LeaveTypeId, lb.Year }).IsUnique();
        builder.HasIndex(lb => new { lb.TenantId, lb.Year });
    }
}
