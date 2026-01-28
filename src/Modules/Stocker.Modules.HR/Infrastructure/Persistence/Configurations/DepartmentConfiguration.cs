using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Department
/// </summary>
public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments", "hr");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.TenantId)
            .IsRequired();

        // Link to Tenant.Department for synchronization when HR module is active
        builder.Property(d => d.TenantDepartmentId)
            .IsRequired(false);

        builder.HasIndex(d => new { d.TenantId, d.TenantDepartmentId })
            .HasFilter("\"TenantDepartmentId\" IS NOT NULL")
            .IsUnique();

        builder.Property(d => d.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.Description)
            .HasMaxLength(500);

        builder.Property(d => d.CostCenter)
            .HasMaxLength(50);

        builder.Property(d => d.Location)
            .HasMaxLength(200);

        // Self-referencing relationship for hierarchy
        builder.HasOne(d => d.ParentDepartment)
            .WithMany(d => d.SubDepartments)
            .HasForeignKey(d => d.ParentDepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(d => d.TenantId);
        builder.HasIndex(d => new { d.TenantId, d.Code }).IsUnique();
        builder.HasIndex(d => new { d.TenantId, d.ParentDepartmentId });
        builder.HasIndex(d => new { d.TenantId, d.IsActive });
    }
}
