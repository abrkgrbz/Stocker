using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantModulesConfiguration : BaseEntityTypeConfiguration<TenantModules>
{
    public override void Configure(EntityTypeBuilder<TenantModules> builder)
    {
        base.Configure(builder);

        builder.ToTable("TenantModules", "tenant");

        // Properties
        builder.Property(m => m.ModuleName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.ModuleCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(m => m.Description)
            .HasMaxLength(500);

        builder.Property(m => m.IsEnabled)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(m => m.IsTrial)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(m => m.Configuration)
            .HasMaxLength(2000);

        builder.Property(m => m.EnabledDate);

        builder.Property(m => m.DisabledDate);

        builder.Property(m => m.ExpiryDate);

        builder.Property(m => m.UserLimit)
            .HasDefaultValue(0);

        builder.Property(m => m.StorageLimit)
            .HasDefaultValue(0);

        builder.Property(m => m.RecordLimit)
            .HasDefaultValue(0);

        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .IsRequired();
            
        builder.Property(m => m.UpdatedAt);

        // Indexes
        builder.HasIndex(m => new { m.TenantId, m.ModuleCode })
            .IsUnique()
            .HasDatabaseName("IX_TenantModules_TenantId_ModuleCode");

        builder.HasIndex(m => new { m.TenantId, m.IsEnabled })
            .HasDatabaseName("IX_TenantModules_TenantId_IsEnabled");

        builder.HasIndex(m => m.ExpiryDate)
            .HasDatabaseName("IX_TenantModules_ExpiryDate");
    }
}