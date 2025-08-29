using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class UserTenantConfiguration : BaseEntityTypeConfiguration<UserTenant>
{
    public override void Configure(EntityTypeBuilder<UserTenant> builder)
    {
        base.Configure(builder);

        builder.ToTable("UserTenants", "master");

        // Properties
        builder.Property(ut => ut.UserId)
            .IsRequired();

        builder.Property(ut => ut.TenantId)
            .IsRequired();

        builder.Property(ut => ut.UserType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(ut => ut.AssignedAt)
            .IsRequired();

        builder.Property(ut => ut.IsDefault)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(ut => ut.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Relationships
        builder.HasOne<MasterUser>()
            .WithMany(u => u.UserTenants)
            .HasForeignKey(ut => ut.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Domain.Master.Entities.Tenant>()
            .WithMany()
            .HasForeignKey(ut => ut.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(ut => new { ut.UserId, ut.TenantId })
            .IsUnique()
            .HasDatabaseName("IX_UserTenants_UserId_TenantId");

        builder.HasIndex(ut => ut.TenantId)
            .HasDatabaseName("IX_UserTenants_TenantId");

        builder.HasIndex(ut => ut.UserType)
            .HasDatabaseName("IX_UserTenants_UserType");

        builder.HasIndex(ut => ut.IsActive)
            .HasDatabaseName("IX_UserTenants_IsActive");
    }
}