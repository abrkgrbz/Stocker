using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantSettingsConfiguration : BaseEntityTypeConfiguration<TenantSettings>
{
    public override void Configure(EntityTypeBuilder<TenantSettings> builder)
    {
        base.Configure(builder);

        builder.ToTable("TenantSettings", "tenant");

        // Properties
        builder.Property(s => s.SettingKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.SettingValue)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.Category)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.DataType)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.Description)
            .HasMaxLength(500);

        builder.Property(s => s.IsSystemSetting)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.IsEncrypted)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.IsPublic)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.CreatedAt)
            .IsRequired();
            
        builder.Property(s => s.UpdatedAt);

        // Indexes
        builder.HasIndex(s => new { s.TenantId, s.SettingKey })
            .IsUnique()
            .HasDatabaseName("IX_TenantSettings_TenantId_SettingKey");

        builder.HasIndex(s => new { s.TenantId, s.Category })
            .HasDatabaseName("IX_TenantSettings_TenantId_Category");

        builder.HasIndex(s => s.IsSystemSetting)
            .HasDatabaseName("IX_TenantSettings_IsSystemSetting");
    }
}