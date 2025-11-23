using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantNotificationConfiguration : IEntityTypeConfiguration<TenantNotification>
{
    public void Configure(EntityTypeBuilder<TenantNotification> builder)
    {
        // Table name
        builder.ToTable("TenantNotifications");
        
        // Primary key
        builder.HasKey(n => n.Id);
        
        // Notification Information
        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(1000);
            
        builder.Property(n => n.Description)
            .HasMaxLength(2000);
            
        builder.Property(n => n.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(n => n.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(n => n.Priority)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(n => n.Severity)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        // Target Information
        builder.Property(n => n.TargetType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(n => n.TargetUserId);
        
        builder.Property(n => n.TargetRole)
            .HasMaxLength(50);
            
        builder.Property(n => n.TargetDepartment)
            .HasMaxLength(100);
            
        builder.Property(n => n.TargetUserIds)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<Guid>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        builder.Property(n => n.IsGlobal)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Content & Actions
        builder.Property(n => n.IconName)
            .HasMaxLength(50);
            
        builder.Property(n => n.IconColor)
            .HasMaxLength(50);
            
        builder.Property(n => n.ImageUrl)
            .HasMaxLength(500);
            
        builder.Property(n => n.ActionUrl)
            .HasMaxLength(500);
            
        builder.Property(n => n.ActionText)
            .HasMaxLength(100);
            
        builder.Property(n => n.ActionType)
            .HasMaxLength(50);
            
        builder.Property(n => n.ActionData)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<Dictionary<string, string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        // Configure Actions as owned entity collection
        builder.OwnsMany(n => n.Actions, actions =>
        {
            actions.ToJson();
        });
            
        // Delivery Channels
        builder.Property(n => n.SendInApp)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(n => n.SendEmail)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.SendSms)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.SendPushNotification)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.SendWebhook)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.WebhookUrl)
            .HasMaxLength(500);
            
        builder.Property(n => n.EmailTemplateId)
            .HasMaxLength(100);
            
        builder.Property(n => n.SmsTemplateId)
            .HasMaxLength(100);
            
        // Scheduling
        builder.Property(n => n.CreatedAt)
            .IsRequired();
            
        builder.Property(n => n.ScheduledAt);
        
        builder.Property(n => n.SentAt);
        
        builder.Property(n => n.ExpiresAt);
        
        builder.Property(n => n.IsScheduled)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.IsRecurring)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.RecurrencePattern)
            .HasMaxLength(100);
            
        builder.Property(n => n.RecurrenceEndDate);
        
        // Status & Tracking
        builder.Property(n => n.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(n => n.IsRead)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.ReadAt);
        
        builder.Property(n => n.IsDismissed)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.DismissedAt);
        
        builder.Property(n => n.IsArchived)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.ArchivedAt);
        
        builder.Property(n => n.DeliveryAttempts)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(n => n.LastDeliveryAttempt);
        
        builder.Property(n => n.DeliveryError)
            .HasMaxLength(1000);
            
        // User Interaction
        builder.Property(n => n.RequiresAcknowledgment)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.IsAcknowledged)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(n => n.AcknowledgedAt);
        
        builder.Property(n => n.AcknowledgedBy)
            .HasMaxLength(100);
            
        builder.Property(n => n.AllowDismiss)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(n => n.ShowUntilRead)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(n => n.Persistent)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Source Information
        builder.Property(n => n.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(n => n.Source)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(n => n.SourceEntityType)
            .HasMaxLength(100);
            
        builder.Property(n => n.SourceEntityId);
        
        builder.Property(n => n.SourceEventType)
            .HasMaxLength(100);
            
        // Additional Data
        builder.Property(n => n.Metadata)
            .HasColumnType("text");
            
        builder.Property(n => n.Data)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<Dictionary<string, string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        builder.Property(n => n.Tags)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        builder.Property(n => n.GroupKey)
            .HasMaxLength(100);
            
        builder.Property(n => n.GroupCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        // Indexes
        builder.HasIndex(n => n.CreatedAt)
            .HasDatabaseName("IX_TenantNotifications_CreatedAt")
            .IsDescending();
            
        builder.HasIndex(n => n.TargetUserId)
            .HasDatabaseName("IX_TenantNotifications_TargetUserId");
            
        builder.HasIndex(n => n.TargetRole)
            .HasDatabaseName("IX_TenantNotifications_TargetRole");
            
        builder.HasIndex(n => n.Status)
            .HasDatabaseName("IX_TenantNotifications_Status");
            
        builder.HasIndex(n => n.Type)
            .HasDatabaseName("IX_TenantNotifications_Type");
            
        builder.HasIndex(n => n.Category)
            .HasDatabaseName("IX_TenantNotifications_Category");
            
        builder.HasIndex(n => n.Priority)
            .HasDatabaseName("IX_TenantNotifications_Priority");
            
        builder.HasIndex(n => n.IsRead)
            .HasDatabaseName("IX_TenantNotifications_IsRead");
            
        builder.HasIndex(n => n.IsArchived)
            .HasDatabaseName("IX_TenantNotifications_IsArchived");
            
        builder.HasIndex(n => n.ScheduledAt)
            .HasDatabaseName("IX_TenantNotifications_ScheduledAt");
            
        builder.HasIndex(n => n.ExpiresAt)
            .HasDatabaseName("IX_TenantNotifications_ExpiresAt");
            
        builder.HasIndex(n => n.GroupKey)
            .HasDatabaseName("IX_TenantNotifications_GroupKey");
            
        builder.HasIndex(n => new { n.TargetUserId, n.IsRead, n.IsArchived })
            .HasDatabaseName("IX_TenantNotifications_TargetUserId_IsRead_IsArchived");
            
        builder.HasIndex(n => new { n.Status, n.IsScheduled, n.ScheduledAt })
            .HasDatabaseName("IX_TenantNotifications_Status_IsScheduled_ScheduledAt");
    }
}