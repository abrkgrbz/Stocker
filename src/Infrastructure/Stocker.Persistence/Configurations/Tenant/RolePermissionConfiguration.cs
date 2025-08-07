using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class RolePermissionConfiguration : BaseEntityTypeConfiguration<RolePermission>
{
    public override void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        base.Configure(builder);

        builder.ToTable("RolePermissions", "tenant");

        // Properties
        builder.Property(rp => rp.RoleId)
            .IsRequired();

        builder.Property(rp => rp.Resource)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(rp => rp.PermissionType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(rp => rp.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(rp => rp.RoleId)
            .HasDatabaseName("IX_RolePermissions_RoleId");

        builder.HasIndex(rp => new { rp.RoleId, rp.Resource, rp.PermissionType })
            .IsUnique()
            .HasDatabaseName("IX_RolePermissions_RoleId_Resource_PermissionType");
    }
}