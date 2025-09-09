using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantOnboardingConfiguration : IEntityTypeConfiguration<TenantOnboarding>
{
    public void Configure(EntityTypeBuilder<TenantOnboarding> builder)
    {
        builder.ToTable("TenantOnboardings", "Master");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.OnboardingType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.CurrentStepNumber)
            .IsRequired();
            
        builder.Property(x => x.ProgressPercentage)
            .IsRequired()
            .HasPrecision(5, 2);
            
        // Timeline
        builder.Property(x => x.StartedAt)
            .IsRequired();
            
        builder.Property(x => x.EstimatedCompletionDate)
            .IsRequired();
            
        builder.Property(x => x.TotalDaysExpected)
            .IsRequired();
            
        // Assignment
        builder.Property(x => x.AssignedToUserId)
            .HasMaxLength(100);
            
        builder.Property(x => x.AssignedToName)
            .HasMaxLength(200);
            
        builder.Property(x => x.AssignedToEmail)
            .HasMaxLength(256);
            
        // Contact Person
        builder.Property(x => x.ContactPersonName)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.ContactPersonEmail)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(x => x.ContactPersonPhone)
            .HasMaxLength(50);
            
        builder.Property(x => x.PreferredContactMethod)
            .HasMaxLength(50);
            
        builder.Property(x => x.PreferredContactTime)
            .HasMaxLength(100);
            
        // Meeting & Training
        builder.Property(x => x.KickoffMeetingNotes)
            .HasMaxLength(2000);
            
        // Data Migration
        builder.Property(x => x.DataMigrationStatus)
            .HasMaxLength(50);
            
        // Customization
        builder.Property(x => x.CustomizationRequirements)
            .HasMaxLength(2000);
            
        builder.Property(x => x.CustomizationStatus)
            .HasMaxLength(50);
            
        // Integration
        builder.Property(x => x.IntegrationSystems)
            .HasMaxLength(1000);
            
        builder.Property(x => x.IntegrationStatus)
            .HasMaxLength(50);
            
        // Documents
        builder.Property(x => x.WelcomePackageUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.DocumentationUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.TrainingMaterialsUrl)
            .HasMaxLength(500);
            
        // Feedback
        builder.Property(x => x.FeedbackComments)
            .HasMaxLength(2000);
            
        // Notes & Issues
        builder.Property(x => x.Notes)
            .HasMaxLength(4000);
            
        builder.Property(x => x.Issues)
            .HasMaxLength(2000);
            
        builder.Property(x => x.Blockers)
            .HasMaxLength(2000);
            
        builder.Property(x => x.Priority)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        // Audit
        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithOne(t => t.Onboarding)
            .HasForeignKey<TenantOnboarding>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasMany(x => x.Steps)
            .WithOne()
            .HasForeignKey(s => s.OnboardingId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasMany(x => x.Tasks)
            .WithOne()
            .HasForeignKey(t => t.OnboardingId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(x => x.TenantId)
            .IsUnique();
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.OnboardingType);
        builder.HasIndex(x => x.Priority);
        builder.HasIndex(x => new { x.Status, x.Priority });
    }
}

public class OnboardingStepConfiguration : IEntityTypeConfiguration<OnboardingStep>
{
    public void Configure(EntityTypeBuilder<OnboardingStep> builder)
    {
        builder.ToTable("OnboardingSteps", "Master");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.StepName)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.StepNumber)
            .IsRequired();
            
        builder.Property(x => x.IsCompleted)
            .IsRequired();
            
        builder.Property(x => x.CompletedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.Notes)
            .HasMaxLength(1000);
            
        // Indexes
        builder.HasIndex(x => x.OnboardingId);
        builder.HasIndex(x => new { x.OnboardingId, x.StepNumber })
            .IsUnique();
    }
}

public class OnboardingTaskConfiguration : IEntityTypeConfiguration<OnboardingTask>
{
    public void Configure(EntityTypeBuilder<OnboardingTask> builder)
    {
        builder.ToTable("OnboardingTasks", "Master");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.Description)
            .HasMaxLength(1000);
            
        builder.Property(x => x.IsCompleted)
            .IsRequired();
            
        builder.Property(x => x.CompletedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.Notes)
            .HasMaxLength(1000);
            
        // Indexes
        builder.HasIndex(x => x.OnboardingId);
        builder.HasIndex(x => x.DueDate);
        builder.HasIndex(x => x.IsCompleted);
    }
}