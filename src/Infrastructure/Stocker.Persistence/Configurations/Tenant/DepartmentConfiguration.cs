using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class DepartmentConfiguration : BaseEntityTypeConfiguration<Department>
{
    public override void Configure(EntityTypeBuilder<Department> builder)
    {
        base.Configure(builder);

        builder.ToTable("Departments", "tenant");

        // Properties
        builder.Property(d => d.TenantId)
            .IsRequired();

        builder.Property(d => d.CompanyId)
            .IsRequired(false); // Nullable - departments can exist without company

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Code)
            .HasMaxLength(50);

        builder.Property(d => d.Description)
            .HasMaxLength(500);

        builder.Property(d => d.IsActive)
            .IsRequired();

        builder.Property(d => d.CreatedAt)
            .IsRequired();

        // Self-referencing relationship for hierarchy
        builder.HasOne<Department>()
            .WithMany()
            .HasForeignKey(d => d.ParentDepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(d => d.TenantId)
            .HasDatabaseName("IX_Departments_TenantId");

        builder.HasIndex(d => d.CompanyId)
            .HasDatabaseName("IX_Departments_CompanyId");

        builder.HasIndex(d => new { d.CompanyId, d.Code })
            .IsUnique()
            .HasFilter("\"Code\" IS NOT NULL")
            .HasDatabaseName("IX_Departments_CompanyId_Code");

        builder.HasIndex(d => d.IsActive)
            .HasDatabaseName("IX_Departments_IsActive");
    }
}