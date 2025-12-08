using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class ApprovalWorkflowConfigConfiguration : IEntityTypeConfiguration<ApprovalWorkflowConfig>
{
    public void Configure(EntityTypeBuilder<ApprovalWorkflowConfig> builder)
    {
        builder.ToTable("ApprovalWorkflowConfigs");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.Description)
            .HasMaxLength(1000);

        builder.Property(w => w.WorkflowType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(w => w.EntityType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(w => w.DepartmentName)
            .HasMaxLength(200);

        builder.Property(w => w.CategoryName)
            .HasMaxLength(200);

        builder.Property(w => w.MinAmount)
            .HasPrecision(18, 4);

        builder.Property(w => w.MaxAmount)
            .HasPrecision(18, 4);

        builder.Property(w => w.Currency)
            .HasMaxLength(10);

        builder.Property(w => w.Notes)
            .HasMaxLength(2000);

        builder.Property(w => w.CreatedByName)
            .HasMaxLength(200);

        builder.HasMany(w => w.Rules)
            .WithOne()
            .HasForeignKey(r => r.WorkflowConfigId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Steps)
            .WithOne()
            .HasForeignKey(s => s.WorkflowConfigId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => new { w.TenantId, w.Code }).IsUnique();
        builder.HasIndex(w => new { w.TenantId, w.Name });
        builder.HasIndex(w => new { w.TenantId, w.EntityType });
        builder.HasIndex(w => new { w.TenantId, w.IsActive });
        builder.HasIndex(w => new { w.TenantId, w.DepartmentId });
    }
}

public class ApprovalWorkflowRuleConfiguration : IEntityTypeConfiguration<ApprovalWorkflowRule>
{
    public void Configure(EntityTypeBuilder<ApprovalWorkflowRule> builder)
    {
        builder.ToTable("ApprovalWorkflowRules");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.RuleType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(r => r.Field)
            .HasMaxLength(100);

        builder.Property(r => r.Operator)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(r => r.Value)
            .HasMaxLength(500);

        builder.Property(r => r.NumericValue)
            .HasPrecision(18, 4);

        builder.HasIndex(r => new { r.TenantId, r.WorkflowConfigId });
    }
}

public class ApprovalWorkflowStepConfiguration : IEntityTypeConfiguration<ApprovalWorkflowStep>
{
    public void Configure(EntityTypeBuilder<ApprovalWorkflowStep> builder)
    {
        builder.ToTable("ApprovalWorkflowSteps");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasMaxLength(1000);

        builder.Property(s => s.Instructions)
            .HasMaxLength(2000);

        builder.Property(s => s.StepType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(s => s.MinAmount)
            .HasPrecision(18, 4);

        builder.Property(s => s.MaxAmount)
            .HasPrecision(18, 4);

        builder.Property(s => s.ApproverName)
            .HasMaxLength(200);

        builder.Property(s => s.ApproverRole)
            .HasMaxLength(200);

        builder.Property(s => s.ApproverRoleName)
            .HasMaxLength(200);

        builder.Property(s => s.ApprovalGroupName)
            .HasMaxLength(200);

        builder.Property(s => s.FallbackApproverName)
            .HasMaxLength(200);

        builder.Property(s => s.EscalateToName)
            .HasMaxLength(200);

        builder.HasIndex(s => new { s.TenantId, s.WorkflowConfigId });
        builder.HasIndex(s => new { s.TenantId, s.ApproverId });
        builder.HasIndex(s => new { s.TenantId, s.ApproverGroupId });
    }
}

public class ApprovalGroupConfiguration : IEntityTypeConfiguration<ApprovalGroup>
{
    public void Configure(EntityTypeBuilder<ApprovalGroup> builder)
    {
        builder.ToTable("ApprovalGroups");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(g => g.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(g => g.Description)
            .HasMaxLength(500);

        builder.Property(g => g.ApprovalType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasMany(g => g.Members)
            .WithOne()
            .HasForeignKey(m => m.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(g => new { g.TenantId, g.Code }).IsUnique();
        builder.HasIndex(g => new { g.TenantId, g.Name });
        builder.HasIndex(g => new { g.TenantId, g.IsActive });
    }
}

public class ApprovalGroupMemberConfiguration : IEntityTypeConfiguration<ApprovalGroupMember>
{
    public void Configure(EntityTypeBuilder<ApprovalGroupMember> builder)
    {
        builder.ToTable("ApprovalGroupMembers");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.UserName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.UserEmail)
            .HasMaxLength(200);

        builder.Property(m => m.Role)
            .HasMaxLength(100);

        builder.Property(m => m.DelegateToName)
            .HasMaxLength(200);

        builder.HasIndex(m => new { m.TenantId, m.GroupId });
        builder.HasIndex(m => new { m.TenantId, m.UserId });
        builder.HasIndex(m => new { m.TenantId, m.GroupId, m.UserId }).IsUnique();
    }
}
