using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantUserConfiguration : BaseEntityTypeConfiguration<TenantUser>
{
    public override void Configure(EntityTypeBuilder<TenantUser> builder)
    {
        base.Configure(builder);

        builder.ToTable("TenantUsers", "tenant");

        // Properties
        builder.Property(u => u.TenantId)
            .IsRequired();

        builder.Property(u => u.MasterUserId)
            .IsRequired();

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.EmployeeCode)
            .HasMaxLength(50);

        builder.Property(u => u.Title)
            .HasMaxLength(100);

        builder.Property(u => u.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(u => u.ProfilePictureUrl)
            .HasMaxLength(500);

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        // Value Objects
        builder.OwnsOne(u => u.Email, email =>
        {
            email.Property(e => e.Value)
                .IsRequired()
                .HasMaxLength(256)
                .HasColumnName("Email");

            email.HasIndex(e => e.Value)
                .HasDatabaseName("IX_TenantUsers_Email");
        });

        builder.OwnsOne(u => u.Phone, phone =>
        {
            phone.Property(p => p.Value)
                .HasMaxLength(20)
                .HasColumnName("Phone");
        });

        builder.OwnsOne(u => u.Mobile, mobile =>
        {
            mobile.Property(m => m.Value)
                .HasMaxLength(20)
                .HasColumnName("Mobile");
        });

        // Relationships
        builder.HasMany(u => u.UserRoles)
            .WithOne()
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.UserPermissions)
            .WithOne()
            .HasForeignKey(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign Keys
        builder.HasOne<Department>()
            .WithMany()
            .HasForeignKey(u => u.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(u => u.BranchId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<TenantUser>()
            .WithMany()
            .HasForeignKey(u => u.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(u => u.TenantId)
            .HasDatabaseName("IX_TenantUsers_TenantId");

        builder.HasIndex(u => u.MasterUserId)
            .HasDatabaseName("IX_TenantUsers_MasterUserId");

        builder.HasIndex(u => new { u.TenantId, u.Username })
            .IsUnique()
            .HasDatabaseName("IX_TenantUsers_TenantId_Username");

        builder.HasIndex(u => new { u.TenantId, u.EmployeeCode })
            .IsUnique()
            .HasFilter("[EmployeeCode] IS NOT NULL")
            .HasDatabaseName("IX_TenantUsers_TenantId_EmployeeCode");

        builder.HasIndex(u => u.Status)
            .HasDatabaseName("IX_TenantUsers_Status");
    }
}