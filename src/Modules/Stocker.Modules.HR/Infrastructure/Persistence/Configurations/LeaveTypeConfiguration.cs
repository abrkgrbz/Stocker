using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for LeaveType
/// </summary>
public class LeaveTypeConfiguration : IEntityTypeConfiguration<LeaveType>
{
    public void Configure(EntityTypeBuilder<LeaveType> builder)
    {
        builder.ToTable("LeaveTypes", "hr");

        builder.HasKey(lt => lt.Id);

        builder.Property(lt => lt.TenantId)
            .IsRequired();

        builder.Property(lt => lt.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(lt => lt.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(lt => lt.Description)
            .HasMaxLength(1000);

        builder.Property(lt => lt.DefaultDays)
            .HasPrecision(5, 2);

        builder.Property(lt => lt.MaxDays)
            .HasPrecision(5, 2);

        builder.Property(lt => lt.MaxCarryForwardDays)
            .HasPrecision(5, 2);

        builder.Property(lt => lt.Color)
            .HasMaxLength(20);

        // Relationships
        builder.HasMany(lt => lt.Leaves)
            .WithOne()
            .HasForeignKey("LeaveTypeId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(lt => lt.LeaveBalances)
            .WithOne()
            .HasForeignKey("LeaveTypeId")
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(lt => lt.TenantId);
        builder.HasIndex(lt => new { lt.TenantId, lt.Code }).IsUnique();
        builder.HasIndex(lt => new { lt.TenantId, lt.IsActive });
    }
}
