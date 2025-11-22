using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class WorkflowStepExecutionConfiguration : IEntityTypeConfiguration<WorkflowStepExecution>
{
    public void Configure(EntityTypeBuilder<WorkflowStepExecution> builder)
    {
        builder.ToTable("WorkflowStepExecutions");

        builder.HasKey(se => se.Id);

        builder.Property(se => se.StepName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(se => se.ActionType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(se => se.StepOrder)
            .IsRequired();

        builder.Property(se => se.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(se => se.StartedAt)
            .IsRequired();

        builder.Property(se => se.InputData)
            .HasMaxLength(4000)
            .HasColumnType("text");

        builder.Property(se => se.OutputData)
            .HasMaxLength(4000)
            .HasColumnType("text");

        builder.Property(se => se.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(se => se.RetryCount)
            .IsRequired();

        // Indexes
        builder.HasIndex(se => new { se.WorkflowExecutionId, se.StepOrder })
            .HasDatabaseName("IX_WorkflowStepExecutions_Execution_Order");

        builder.HasIndex(se => se.Status)
            .HasDatabaseName("IX_WorkflowStepExecutions_Status");

        // Relationship to WorkflowStep
        builder.HasOne(se => se.WorkflowStep)
            .WithMany()
            .HasForeignKey(se => se.WorkflowStepId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filter
        builder.HasQueryFilter(se => !se.IsDeleted);
    }
}
