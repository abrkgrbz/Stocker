using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Leave
/// </summary>
public class LeaveConfiguration : IEntityTypeConfiguration<Leave>
{
    public void Configure(EntityTypeBuilder<Leave> builder)
    {
        builder.ToTable("Leaves", "hr");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(l => l.TotalDays)
            .HasPrecision(5, 2);

        builder.Property(l => l.Reason)
            .HasMaxLength(1000);

        builder.Property(l => l.ApprovalNotes)
            .HasMaxLength(1000);

        builder.Property(l => l.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(l => l.AttachmentUrl)
            .HasMaxLength(500);

        builder.Property(l => l.ContactDuringLeave)
            .HasMaxLength(200);

        builder.Property(l => l.HandoverNotes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(l => l.Employee)
            .WithMany(e => e.Leaves)
            .HasForeignKey(l => l.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.LeaveType)
            .WithMany()
            .HasForeignKey(l => l.LeaveTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.ApprovedBy)
            .WithMany()
            .HasForeignKey(l => l.ApprovedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.SubstituteEmployee)
            .WithMany()
            .HasForeignKey(l => l.SubstituteEmployeeId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => new { l.TenantId, l.EmployeeId });
        builder.HasIndex(l => new { l.TenantId, l.Status });
        builder.HasIndex(l => new { l.TenantId, l.LeaveTypeId });
        builder.HasIndex(l => new { l.TenantId, l.StartDate, l.EndDate });
    }
}
