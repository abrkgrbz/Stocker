using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class DeviceTokenConfiguration : BaseEntityTypeConfiguration<DeviceToken>
{
    public override void Configure(EntityTypeBuilder<DeviceToken> builder)
    {
        base.Configure(builder);

        builder.ToTable("DeviceTokens", "master");

        // Properties
        builder.Property(d => d.UserId)
            .IsRequired();

        builder.Property(d => d.TenantId);

        builder.Property(d => d.Token)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.Platform)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(d => d.DeviceId)
            .HasMaxLength(200);

        builder.Property(d => d.DeviceName)
            .HasMaxLength(200);

        builder.Property(d => d.DeviceModel)
            .HasMaxLength(100);

        builder.Property(d => d.OsVersion)
            .HasMaxLength(50);

        builder.Property(d => d.AppVersion)
            .HasMaxLength(50);

        builder.Property(d => d.Provider)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(d => d.ProviderToken)
            .HasMaxLength(500);

        builder.Property(d => d.IsActive)
            .IsRequired();

        builder.Property(d => d.CreatedAt)
            .IsRequired();

        builder.Property(d => d.ReceivePushNotifications)
            .IsRequired();

        builder.Property(d => d.ReceiveMarketingNotifications)
            .IsRequired();

        builder.Property(d => d.ReceiveSystemNotifications)
            .IsRequired();

        builder.Property(d => d.ReceiveCriticalAlerts)
            .IsRequired();

        builder.Property(d => d.SilentMode)
            .IsRequired();

        builder.Property(d => d.SilentModeSchedule)
            .HasMaxLength(100);

        builder.Property(d => d.FailedDeliveryCount)
            .IsRequired();

        builder.Property(d => d.LastFailureReason)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(d => d.UserId)
            .HasDatabaseName("IX_DeviceTokens_UserId");

        builder.HasIndex(d => d.TenantId)
            .HasDatabaseName("IX_DeviceTokens_TenantId");

        builder.HasIndex(d => d.Token)
            .IsUnique()
            .HasDatabaseName("IX_DeviceTokens_Token");

        builder.HasIndex(d => d.DeviceId)
            .HasDatabaseName("IX_DeviceTokens_DeviceId");

        builder.HasIndex(d => d.IsActive)
            .HasDatabaseName("IX_DeviceTokens_IsActive");

        builder.HasIndex(d => d.Platform)
            .HasDatabaseName("IX_DeviceTokens_Platform");

        // Composite index for user + active tokens
        builder.HasIndex(d => new { d.UserId, d.IsActive })
            .HasDatabaseName("IX_DeviceTokens_UserId_IsActive");
    }
}
