using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Master;

public class MasterNotificationConfiguration : BaseEntityTypeConfiguration<MasterNotification>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public override void Configure(EntityTypeBuilder<MasterNotification> builder)
    {
        base.Configure(builder);

        builder.ToTable("MasterNotifications", "master");

        // Content Properties
        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(n => n.Description)
            .HasMaxLength(5000);

        builder.Property(n => n.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(n => n.Priority)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        // Target Configuration
        builder.Property(n => n.TargetType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(n => n.TargetTenantIds)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<Guid>>(v, JsonOptions) ?? new List<Guid>());

        builder.Property(n => n.TargetPackages)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>());

        builder.Property(n => n.TargetCountries)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>());

        builder.Property(n => n.IsGlobal)
            .IsRequired();

        // Delivery Channels
        builder.Property(n => n.SendInApp)
            .IsRequired();

        builder.Property(n => n.SendEmail)
            .IsRequired();

        builder.Property(n => n.SendPush)
            .IsRequired();

        builder.Property(n => n.SendSms)
            .IsRequired();

        // Visual Content
        builder.Property(n => n.IconName)
            .HasMaxLength(100);

        builder.Property(n => n.IconColor)
            .HasMaxLength(20);

        builder.Property(n => n.ImageUrl)
            .HasMaxLength(500);

        builder.Property(n => n.BannerUrl)
            .HasMaxLength(500);

        // Action Configuration
        builder.Property(n => n.ActionUrl)
            .HasMaxLength(500);

        builder.Property(n => n.ActionText)
            .HasMaxLength(100);

        builder.Property(n => n.ActionType)
            .HasMaxLength(30);

        builder.Property(n => n.Actions)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<NotificationActionItem>>(v, JsonOptions) ?? new List<NotificationActionItem>());

        // Scheduling
        builder.Property(n => n.CreatedAt)
            .IsRequired();

        builder.Property(n => n.IsScheduled)
            .IsRequired();

        // Status & Tracking
        builder.Property(n => n.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(n => n.TotalRecipients)
            .IsRequired();

        builder.Property(n => n.DeliveredCount)
            .IsRequired();

        builder.Property(n => n.ReadCount)
            .IsRequired();

        builder.Property(n => n.FailedCount)
            .IsRequired();

        // Metadata
        builder.Property(n => n.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(n => n.UpdatedBy)
            .HasMaxLength(100);

        builder.Property(n => n.Metadata)
            .HasMaxLength(5000);

        builder.Property(n => n.Tags)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>());

        // Indexes
        builder.HasIndex(n => n.Status)
            .HasDatabaseName("IX_MasterNotifications_Status");

        builder.HasIndex(n => n.Type)
            .HasDatabaseName("IX_MasterNotifications_Type");

        builder.HasIndex(n => n.CreatedAt)
            .HasDatabaseName("IX_MasterNotifications_CreatedAt");

        builder.HasIndex(n => n.ScheduledAt)
            .HasDatabaseName("IX_MasterNotifications_ScheduledAt");

        builder.HasIndex(n => n.IsGlobal)
            .HasDatabaseName("IX_MasterNotifications_IsGlobal");

        // Composite index for scheduled notifications
        builder.HasIndex(n => new { n.Status, n.ScheduledAt })
            .HasDatabaseName("IX_MasterNotifications_Status_ScheduledAt");
    }
}
