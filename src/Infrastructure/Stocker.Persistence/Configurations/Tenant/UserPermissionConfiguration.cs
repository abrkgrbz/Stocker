using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class UserPermissionConfiguration : BaseEntityTypeConfiguration<UserPermission>
{
    public override void Configure(EntityTypeBuilder<UserPermission> builder)
    {
        base.Configure(builder);

        builder.ToTable("UserPermissions", "tenant");

        // Properties
        builder.Property(up => up.UserId)
            .IsRequired();

        builder.Property(up => up.Resource)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(up => up.PermissionType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(up => up.GrantedAt)
            .IsRequired();

        // Foreign Keys
        builder.HasOne<TenantUser>()
            .WithMany(u => u.UserPermissions)
            .HasForeignKey(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(up => up.UserId)
            .HasDatabaseName("IX_UserPermissions_UserId");

        builder.HasIndex(up => new { up.UserId, up.Resource, up.PermissionType })
            .IsUnique()
            .HasDatabaseName("IX_UserPermissions_UserId_Resource_PermissionType");
    }
}