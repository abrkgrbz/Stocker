using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantSetupWizardConfiguration : IEntityTypeConfiguration<TenantSetupWizard>
{
    public void Configure(EntityTypeBuilder<TenantSetupWizard> builder)
    {
        builder.ToTable("TenantSetupWizards", "Master");
        
        builder.HasKey(x => x.Id);
        
        // Wizard Information
        builder.Property(x => x.WizardType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        // Progress Tracking
        builder.Property(x => x.TotalSteps)
            .IsRequired();
            
        builder.Property(x => x.CompletedSteps)
            .IsRequired();
            
        builder.Property(x => x.CurrentStep)
            .IsRequired();
            
        builder.Property(x => x.ProgressPercentage)
            .IsRequired()
            .HasPrecision(5, 2);
            
        // Step Details
        builder.Property(x => x.CurrentStepName)
            .HasMaxLength(200);
            
        builder.Property(x => x.CurrentStepDescription)
            .HasMaxLength(1000);
            
        builder.Property(x => x.CurrentStepCategory)
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.IsCurrentStepRequired)
            .IsRequired();
            
        builder.Property(x => x.CanSkipCurrentStep)
            .IsRequired();
            
        // Steps Data
        builder.Property(x => x.CompletedStepsData)
            .HasMaxLength(4000);
            
        builder.Property(x => x.SkippedStepsData)
            .HasMaxLength(4000);
            
        builder.Property(x => x.PendingStepsData)
            .HasMaxLength(4000);
            
        // Time Tracking
        builder.Property(x => x.StartedAt)
            .IsRequired();
            
        builder.Property(x => x.TotalTimeSpent)
            .HasConversion(
                v => v.HasValue ? v.Value.Ticks : (long?)null,
                v => v.HasValue ? new TimeSpan(v.Value) : null);
            
        builder.Property(x => x.AverageStepTime)
            .HasConversion(
                v => v.HasValue ? v.Value.Ticks : (long?)null,
                v => v.HasValue ? new TimeSpan(v.Value) : null);
            
        // User Information
        builder.Property(x => x.StartedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.CompletedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.LastModifiedBy)
            .HasMaxLength(100);
            
        // Help & Support
        builder.Property(x => x.NeedsAssistance)
            .IsRequired();
            
        builder.Property(x => x.AssistanceNotes)
            .HasMaxLength(1000);
            
        builder.Property(x => x.HelpRequestCount)
            .IsRequired();
            
        // Validation
        builder.Property(x => x.HasErrors)
            .IsRequired();
            
        builder.Property(x => x.ErrorMessages)
            .HasMaxLength(4000);
            
        builder.Property(x => x.HasWarnings)
            .IsRequired();
            
        builder.Property(x => x.WarningMessages)
            .HasMaxLength(4000);
            
        // Configuration
        builder.Property(x => x.SavedConfiguration)
            .HasMaxLength(4000);
            
        builder.Property(x => x.DefaultConfiguration)
            .HasMaxLength(4000);
            
        builder.Property(x => x.AutoSaveEnabled)
            .IsRequired();
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.WizardType);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.StartedAt);
        builder.HasIndex(x => new { x.TenantId, x.WizardType, x.Status });
    }
}