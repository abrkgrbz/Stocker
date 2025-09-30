using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantOnboardingConfiguration : BaseEntityTypeConfiguration<TenantOnboarding>
{
    public override void Configure(EntityTypeBuilder<TenantOnboarding> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("TenantOnboardings", "tenant");
        
        // Basic Properties
        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();
            
        builder.Property(x => x.Description)
            .HasMaxLength(1000);
            
        builder.Property(x => x.Type)
            .IsRequired();
            
        builder.Property(x => x.Status)
            .IsRequired();
            
        // Target Information
        builder.Property(x => x.TargetUserId)
            .HasMaxLength(100);
            
        builder.Property(x => x.TargetUserEmail)
            .HasMaxLength(200);
            
        builder.Property(x => x.TargetUserName)
            .HasMaxLength(200);
            
        builder.Property(x => x.TargetRole)
            .HasMaxLength(100);
            
        builder.Property(x => x.TargetDepartment)
            .HasMaxLength(100);
            
        // Progress Tracking
        builder.Property(x => x.TotalSteps)
            .IsRequired();
            
        builder.Property(x => x.CompletedSteps)
            .IsRequired();
            
        builder.Property(x => x.SkippedSteps)
            .IsRequired();
            
        builder.Property(x => x.ProgressPercentage)
            .HasPrecision(5, 2)
            .IsRequired();
            
        builder.Property(x => x.EstimatedDuration)
            .IsRequired();
            
        builder.Property(x => x.ActualDuration)
            .IsRequired();
            
        // Timeline
        builder.Property(x => x.StartedAt);
        builder.Property(x => x.CompletedAt);
        builder.Property(x => x.DueDate);
        builder.Property(x => x.LastActivityAt);
        builder.Property(x => x.PausedAt);
        builder.Property(x => x.ResumedAt);
        
        // Configuration
        builder.Property(x => x.IsRequired)
            .IsRequired();
            
        builder.Property(x => x.AllowSkip)
            .IsRequired();
            
        builder.Property(x => x.SendReminders)
            .IsRequired();
            
        builder.Property(x => x.ReminderFrequencyDays)
            .IsRequired();
            
        builder.Property(x => x.RequireManagerApproval)
            .IsRequired();
            
        builder.Property(x => x.ManagerId)
            .HasMaxLength(100);
            
        builder.Property(x => x.ManagerEmail)
            .HasMaxLength(200);
            
        // Completion Details
        builder.Property(x => x.CompletionCertificateUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.CompletionScore)
            .HasPrecision(5, 2);
            
        builder.Property(x => x.CompletionFeedback)
            .HasMaxLength(2000);
            
        builder.Property(x => x.SatisfactionRating);
        
        // Analytics
        builder.Property(x => x.LoginCount)
            .IsRequired();
            
        builder.Property(x => x.FirstLoginAt);
        builder.Property(x => x.LastLoginAt);
        builder.Property(x => x.HelpRequestCount)
            .IsRequired();
            
        // Additional Analytics Properties
        builder.Property(x => x.MostVisitedSection)
            .HasMaxLength(200);
            
        builder.Property(x => x.DeviceInfo)
            .HasMaxLength(500);
            
        // Audit
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100)
            .IsRequired();
            
        builder.Property(x => x.ModifiedAt);
        
        builder.Property(x => x.ModifiedBy)
            .HasMaxLength(100);
            
        // Indexes
        builder.HasIndex(x => x.Type);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.TargetUserId);
        builder.HasIndex(x => x.StartedAt);
        builder.HasIndex(x => x.CompletedAt);
        builder.HasIndex(x => x.DueDate);
    }
}