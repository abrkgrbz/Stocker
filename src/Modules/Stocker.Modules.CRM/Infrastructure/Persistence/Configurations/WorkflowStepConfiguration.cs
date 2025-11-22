using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class WorkflowStepConfiguration : IEntityTypeConfiguration<WorkflowStep>
{
    public void Configure(EntityTypeBuilder<WorkflowStep> builder)
    {
        builder.ToTable("WorkflowSteps");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasMaxLength(1000);

        builder.Property(s => s.ActionType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.StepOrder)
            .IsRequired();

        builder.Property(s => s.ActionConfiguration)
            .HasMaxLength(4000)
            .HasColumnType("text");

        builder.Property(s => s.Conditions)
            .HasMaxLength(4000)
            .HasColumnType("text");

        builder.Property(s => s.DelayMinutes)
            .IsRequired();

        builder.Property(s => s.IsEnabled)
            .IsRequired();

        builder.Property(s => s.ContinueOnError)
            .IsRequired();

        // Indexes
        builder.HasIndex(s => new { s.WorkflowId, s.StepOrder })
            .HasDatabaseName("IX_WorkflowSteps_Workflow_Order");

        builder.HasIndex(s => s.IsEnabled)
            .HasDatabaseName("IX_WorkflowSteps_IsEnabled");

        // Query filter
        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}
