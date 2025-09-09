using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantNotificationConfiguration : IEntityTypeConfiguration<TenantNotification>
{
    public void Configure(EntityTypeBuilder<TenantNotification> builder)
    {
        builder.ToTable("TenantNotifications", "Master");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.Channel)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        // Recipients
        builder.Property(x => x.Recipients)
            .IsRequired()
            .HasMaxLength(2000);
            
        builder.Property(x => x.CCRecipients)
            .HasMaxLength(2000);
            
        builder.Property(x => x.BCCRecipients)
            .HasMaxLength(2000);
            
        // Template
        builder.Property(x => x.EmailTemplateId)
            .HasMaxLength(100);
            
        builder.Property(x => x.SMSTemplateId)
            .HasMaxLength(100);
            
        builder.Property(x => x.Subject)
            .HasMaxLength(500);
            
        builder.Property(x => x.Body)
            .HasMaxLength(4000);
            
        // Schedule
        builder.Property(x => x.Schedule)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.CronExpression)
            .HasMaxLength(100);
            
        // Conditions
        builder.Property(x => x.TriggerConditions)
            .HasMaxLength(2000);
            
        builder.Property(x => x.ThresholdValue)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.ThresholdUnit)
            .HasMaxLength(50);
            
        // Status
        builder.Property(x => x.PausedReason)
            .HasMaxLength(500);
            
        // Audit
        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.Type);
        builder.HasIndex(x => x.Channel);
        builder.HasIndex(x => x.IsEnabled);
        builder.HasIndex(x => new { x.TenantId, x.Type, x.IsEnabled });
    }
}