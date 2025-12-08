using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record ApprovalWorkflowConfigDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string WorkflowType { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public int Priority { get; init; }
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public Guid? CategoryId { get; init; }
    public string? CategoryName { get; init; }
    public Guid? CreatedById { get; init; }
    public string? CreatedByName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<ApprovalWorkflowRuleDto> Rules { get; init; } = new();
    public List<ApprovalWorkflowStepDto> Steps { get; init; } = new();
}

public record ApprovalWorkflowRuleDto
{
    public Guid Id { get; init; }
    public Guid WorkflowId { get; init; }
    public string RuleType { get; init; } = string.Empty;
    public string Field { get; init; } = string.Empty;
    public string Operator { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
    public int Order { get; init; }
    public bool IsActive { get; init; }
}

public record ApprovalWorkflowStepDto
{
    public Guid Id { get; init; }
    public Guid WorkflowId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int StepOrder { get; init; }
    public string StepType { get; init; } = string.Empty;
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public Guid? ApproverId { get; init; }
    public string? ApproverName { get; init; }
    public string? ApproverRole { get; init; }
    public Guid? ApprovalGroupId { get; init; }
    public string? ApprovalGroupName { get; init; }
    public int RequiredApprovals { get; init; }
    public bool AllowDelegation { get; init; }
    public Guid? FallbackApproverId { get; init; }
    public string? FallbackApproverName { get; init; }
    public int? SLAHours { get; init; }
    public bool AutoEscalate { get; init; }
    public bool IsActive { get; init; }
}

public record ApprovalGroupDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string ApprovalType { get; init; } = string.Empty;
    public int RequiredApprovals { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<ApprovalGroupMemberDto> Members { get; init; } = new();
}

public record ApprovalGroupMemberDto
{
    public Guid Id { get; init; }
    public Guid GroupId { get; init; }
    public Guid UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string? UserEmail { get; init; }
    public string? Role { get; init; }
    public bool CanDelegate { get; init; }
    public bool IsActive { get; init; }
    public DateTime AddedAt { get; init; }
}

public record ApprovalWorkflowListDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string WorkflowType { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public int Priority { get; init; }
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public string? DepartmentName { get; init; }
    public int StepCount { get; init; }
    public int RuleCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record ApprovalGroupListDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string ApprovalType { get; init; } = string.Empty;
    public int RequiredApprovals { get; init; }
    public int MemberCount { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateApprovalWorkflowDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public ApprovalWorkflowType WorkflowType { get; init; } = ApprovalWorkflowType.Sequential;
    public ApprovalEntityType EntityType { get; init; }
    public int Priority { get; init; } = 100;
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public Guid? CategoryId { get; init; }
    public string? CategoryName { get; init; }
    public List<CreateApprovalWorkflowRuleDto> Rules { get; init; } = new();
    public List<CreateApprovalWorkflowStepDto> Steps { get; init; } = new();
}

public record CreateApprovalWorkflowRuleDto
{
    public ApprovalRuleType RuleType { get; init; }
    public string Field { get; init; } = string.Empty;
    public ApprovalRuleOperator Operator { get; init; }
    public string Value { get; init; } = string.Empty;
    public int Order { get; init; }
}

public record CreateApprovalWorkflowStepDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int StepOrder { get; init; }
    public ApprovalStepType StepType { get; init; } = ApprovalStepType.SpecificUser;
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public Guid? ApproverId { get; init; }
    public string? ApproverName { get; init; }
    public string? ApproverRole { get; init; }
    public Guid? ApprovalGroupId { get; init; }
    public string? ApprovalGroupName { get; init; }
    public int RequiredApprovals { get; init; } = 1;
    public bool AllowDelegation { get; init; }
    public Guid? FallbackApproverId { get; init; }
    public string? FallbackApproverName { get; init; }
    public int? SLAHours { get; init; }
    public bool AutoEscalate { get; init; }
}

public record UpdateApprovalWorkflowDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public int? Priority { get; init; }
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public Guid? CategoryId { get; init; }
    public string? CategoryName { get; init; }
}

public record CreateApprovalGroupDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public ApprovalGroupType ApprovalType { get; init; } = ApprovalGroupType.Any;
    public int RequiredApprovals { get; init; } = 1;
    public List<CreateApprovalGroupMemberDto> Members { get; init; } = new();
}

public record CreateApprovalGroupMemberDto
{
    public Guid UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string? UserEmail { get; init; }
    public string? Role { get; init; }
    public bool CanDelegate { get; init; }
}

public record UpdateApprovalGroupDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public int? RequiredApprovals { get; init; }
}

public record ApprovalCheckRequestDto
{
    public ApprovalEntityType EntityType { get; init; }
    public decimal Amount { get; init; }
    public Guid? DepartmentId { get; init; }
    public Guid? CategoryId { get; init; }
}

public record ApprovalCheckResultDto
{
    public bool RequiresApproval { get; init; }
    public Guid? WorkflowId { get; init; }
    public string? WorkflowName { get; init; }
    public List<ApprovalStepInfoDto> Steps { get; init; } = new();
    public int TotalSteps { get; init; }
    public string? Message { get; init; }
}

public record ApprovalStepInfoDto
{
    public int StepOrder { get; init; }
    public string StepName { get; init; } = string.Empty;
    public string StepType { get; init; } = string.Empty;
    public string? ApproverName { get; init; }
    public string? ApprovalGroupName { get; init; }
    public int? SLAHours { get; init; }
}

public record ApprovalWorkflowSummaryDto
{
    public int TotalWorkflows { get; init; }
    public int ActiveWorkflows { get; init; }
    public int TotalApprovalGroups { get; init; }
    public int ActiveApprovalGroups { get; init; }
    public Dictionary<string, int> WorkflowsByEntityType { get; init; } = new();
    public Dictionary<string, int> WorkflowsByType { get; init; } = new();
}
