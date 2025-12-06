using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Position
/// </summary>
public class PositionConfiguration : IEntityTypeConfiguration<Position>
{
    public void Configure(EntityTypeBuilder<Position> builder)
    {
        builder.ToTable("Positions", "hr");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.MinSalary)
            .HasPrecision(18, 2);

        builder.Property(p => p.MaxSalary)
            .HasPrecision(18, 2);

        builder.Property(p => p.Currency)
            .HasMaxLength(10)
            .HasDefaultValue("TRY");

        builder.Property(p => p.Requirements)
            .HasMaxLength(2000);

        builder.Property(p => p.Responsibilities)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(p => p.Department)
            .WithMany(d => d.Positions)
            .HasForeignKey(p => p.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.TenantId, p.Code }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.DepartmentId });
        builder.HasIndex(p => new { p.TenantId, p.Level });
        builder.HasIndex(p => new { p.TenantId, p.IsActive });
    }
}
