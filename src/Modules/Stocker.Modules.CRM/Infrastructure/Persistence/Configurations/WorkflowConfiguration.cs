using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class WorkflowConfiguration : IEntityTypeConfiguration<Workflow>
{
    public void Configure(EntityTypeBuilder<Workflow> builder)
    {
        builder.ToTable("Workflows");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.Description)
            .HasMaxLength(1000);

        builder.Property(w => w.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.TriggerType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(w => w.TriggerConditions)
            .HasMaxLength(4000)
            .HasColumnType("nvarchar(max)");

        builder.Property(w => w.TenantId)
            .IsRequired();

        builder.Property(w => w.CreatedBy)
            .IsRequired();

        builder.Property(w => w.IsActive)
            .IsRequired();

        builder.Property(w => w.ExecutionOrder)
            .IsRequired();

        builder.Property(w => w.ExecutionCount)
            .IsRequired();

        // Indexes
        builder.HasIndex(w => new { w.TenantId, w.IsActive })
            .HasDatabaseName("IX_Workflows_Tenant_Active");

        builder.HasIndex(w => new { w.EntityType, w.TriggerType })
            .HasDatabaseName("IX_Workflows_EntityType_TriggerType");

        builder.HasIndex(w => w.IsActive)
            .HasDatabaseName("IX_Workflows_IsActive");

        // Relationships
        builder.HasMany(w => w.Steps)
            .WithOne(s => s.Workflow)
            .HasForeignKey(s => s.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Executions)
            .WithOne(e => e.Workflow)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filter
        builder.HasQueryFilter(w => !w.IsDeleted);
    }
}
