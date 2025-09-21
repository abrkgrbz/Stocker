using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class SetupWizardConfiguration : IEntityTypeConfiguration<SetupWizard>
{
    public void Configure(EntityTypeBuilder<SetupWizard> builder)
    {
        // Table name
        builder.ToTable("SetupWizards");
        
        // Primary key
        builder.HasKey(w => w.Id);
        
        // Properties
        builder.Property(w => w.WizardType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(w => w.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(w => w.TotalSteps)
            .IsRequired();
            
        builder.Property(w => w.CompletedSteps)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(w => w.CurrentStepIndex)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(w => w.ProgressPercentage)
            .HasPrecision(5, 2)
            .HasDefaultValue(0);
            
        builder.Property(w => w.StartedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(w => w.CompletedBy)
            .HasMaxLength(100);
            
        builder.Property(w => w.LastModifiedBy)
            .HasMaxLength(100);
            
        builder.Property(w => w.StartedAt)
            .IsRequired();
            
        builder.Property(w => w.CompletedAt);
        
        builder.Property(w => w.LastActivityAt);
        
        // Relationships
        builder.HasMany(w => w.Steps)
            .WithOne(s => s.Wizard)
            .HasForeignKey(s => s.WizardId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(w => w.WizardType)
            .HasDatabaseName("IX_SetupWizards_WizardType");
            
        builder.HasIndex(w => w.Status)
            .HasDatabaseName("IX_SetupWizards_Status");
            
        builder.HasIndex(w => new { w.WizardType, w.Status })
            .HasDatabaseName("IX_SetupWizards_WizardType_Status");
    }
}