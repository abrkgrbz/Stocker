using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class WorkflowExecutionConfiguration : IEntityTypeConfiguration<WorkflowExecution>
{
    public void Configure(EntityTypeBuilder<WorkflowExecution> builder)
    {
        builder.ToTable("WorkflowExecutions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.StartedAt)
            .IsRequired();

        builder.Property(e => e.TriggerData)
            .HasMaxLength(4000)
            .HasColumnType("text");

        builder.Property(e => e.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.EntityId)
            .IsRequired()
            .HasMaxLength(50); // Supports both int (max 10 chars) and Guid (36 chars)

        builder.Property(e => e.CurrentStepOrder)
            .IsRequired();

        builder.Property(e => e.TotalSteps)
            .IsRequired();

        builder.Property(e => e.CompletedSteps)
            .IsRequired();

        builder.Property(e => e.FailedSteps)
            .IsRequired();

        // Indexes
        builder.HasIndex(e => new { e.WorkflowId, e.Status })
            .HasDatabaseName("IX_WorkflowExecutions_Workflow_Status");

        builder.HasIndex(e => new { e.EntityId, e.EntityType })
            .HasDatabaseName("IX_WorkflowExecutions_Entity");

        builder.HasIndex(e => new { e.TenantId, e.StartedAt })
            .HasDatabaseName("IX_WorkflowExecutions_Tenant_StartedAt");

        builder.HasIndex(e => e.Status)
            .HasDatabaseName("IX_WorkflowExecutions_Status");

        // Relationships
        builder.HasMany(e => e.StepExecutions)
            .WithOne(se => se.WorkflowExecution)
            .HasForeignKey(se => se.WorkflowExecutionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Query filter
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
