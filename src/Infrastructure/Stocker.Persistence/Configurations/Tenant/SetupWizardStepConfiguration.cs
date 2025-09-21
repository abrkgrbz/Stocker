using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class SetupWizardStepConfiguration : IEntityTypeConfiguration<SetupWizardStep>
{
    public void Configure(EntityTypeBuilder<SetupWizardStep> builder)
    {
        // Table name
        builder.ToTable("SetupWizardSteps");
        
        // Primary key
        builder.HasKey(s => s.Id);
        
        // Properties
        builder.Property(s => s.WizardId)
            .IsRequired();
            
        builder.Property(s => s.StepOrder)
            .IsRequired();
            
        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(s => s.Title)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(s => s.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(s => s.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(s => s.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(s => s.IsRequired)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.CanSkip)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.IsSkipped)
            .IsRequired()
            .HasDefaultValue(false);
            
        // JSON Data columns
        builder.Property(s => s.StepData)
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.ValidationErrors)
            .HasColumnType("nvarchar(max)");
            
        // User tracking
        builder.Property(s => s.StartedBy)
            .HasMaxLength(100);
            
        builder.Property(s => s.CompletedBy)
            .HasMaxLength(100);
            
        builder.Property(s => s.SkippedBy)
            .HasMaxLength(100);
            
        builder.Property(s => s.SkipReason)
            .HasMaxLength(500);
            
        // Time tracking
        builder.Property(s => s.StartedAt);
        
        builder.Property(s => s.CompletedAt);
        
        builder.Property(s => s.SkippedAt);
        
        builder.Property(s => s.Duration);
        
        // Relationships
        builder.HasOne(s => s.Wizard)
            .WithMany(w => w.Steps)
            .HasForeignKey(s => s.WizardId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(s => s.WizardId)
            .HasDatabaseName("IX_SetupWizardSteps_WizardId");
            
        builder.HasIndex(s => new { s.WizardId, s.StepOrder })
            .IsUnique()
            .HasDatabaseName("IX_SetupWizardSteps_WizardId_StepOrder");
            
        builder.HasIndex(s => s.Status)
            .HasDatabaseName("IX_SetupWizardSteps_Status");
            
        builder.HasIndex(s => s.Name)
            .HasDatabaseName("IX_SetupWizardSteps_Name");
    }
}