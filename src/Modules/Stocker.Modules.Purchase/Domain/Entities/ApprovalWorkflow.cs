using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Onay İş Akışı Yapılandırması / Approval Workflow Configuration
/// </summary>
public class ApprovalWorkflowConfig : TenantAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ApprovalWorkflowType WorkflowType { get; private set; }
    public ApprovalEntityType EntityType { get; private set; }
    public bool IsActive { get; private set; }

    // Scope
    public Guid? DepartmentId { get; private set; }
    public string? DepartmentName { get; private set; }
    public Guid? CategoryId { get; private set; }
    public string? CategoryName { get; private set; }

    // Priority (lower number = higher priority)
    public int Priority { get; private set; }

    // Amount thresholds (workflow level)
    public decimal? MinAmount { get; private set; }
    public decimal? MaxAmount { get; private set; }
    public string? Currency { get; private set; }

    // Notes
    public string? Notes { get; private set; }

    // Audit
    public Guid? CreatedById { get; private set; }
    public string? CreatedByName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<ApprovalWorkflowRule> _rules = new();
    public IReadOnlyCollection<ApprovalWorkflowRule> Rules => _rules.AsReadOnly();

    private readonly List<ApprovalWorkflowStep> _steps = new();
    public IReadOnlyCollection<ApprovalWorkflowStep> Steps => _steps.AsReadOnly();

    protected ApprovalWorkflowConfig() : base() { }

    public static ApprovalWorkflowConfig Create(
        string name,
        ApprovalEntityType entityType,
        Guid tenantId,
        ApprovalWorkflowType workflowType = ApprovalWorkflowType.Sequential,
        string? description = null,
        int priority = 100,
        decimal? minAmount = null,
        decimal? maxAmount = null,
        string? currency = null)
    {
        var config = new ApprovalWorkflowConfig();
        config.Id = Guid.NewGuid();
        config.SetTenantId(tenantId);
        config.Code = $"WF-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";
        config.Name = name;
        config.Description = description;
        config.WorkflowType = workflowType;
        config.EntityType = entityType;
        config.Priority = priority;
        config.MinAmount = minAmount;
        config.MaxAmount = maxAmount;
        config.Currency = currency;
        config.IsActive = true;
        config.CreatedAt = DateTime.UtcNow;
        return config;
    }

    public void Update(string name, int priority, decimal? minAmount, decimal? maxAmount)
    {
        Name = name;
        Priority = priority;
        MinAmount = minAmount;
        MaxAmount = maxAmount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateFull(
        string name,
        string? description,
        ApprovalWorkflowType workflowType,
        int priority,
        string? notes)
    {
        Name = name;
        Description = description;
        WorkflowType = workflowType;
        Priority = priority;
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDepartment(Guid? departmentId, string? departmentName)
    {
        DepartmentId = departmentId;
        DepartmentName = departmentName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCategory(Guid? categoryId, string? categoryName)
    {
        CategoryId = categoryId;
        CategoryName = categoryName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetScope(Guid? departmentId, string? departmentName, Guid? categoryId, string? categoryName)
    {
        DepartmentId = departmentId;
        DepartmentName = departmentName;
        CategoryId = categoryId;
        CategoryName = categoryName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCreator(Guid createdById, string? createdByName)
    {
        CreatedById = createdById;
        CreatedByName = createdByName;
    }

    public void AddRule(ApprovalWorkflowRule rule)
    {
        _rules.Add(rule);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveRule(Guid ruleId)
    {
        var rule = _rules.FirstOrDefault(r => r.Id == ruleId);
        if (rule != null)
        {
            _rules.Remove(rule);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void AddStep(ApprovalWorkflowStep step)
    {
        _steps.Add(step);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveStep(Guid stepId)
    {
        var step = _steps.FirstOrDefault(s => s.Id == stepId);
        if (step != null)
        {
            _steps.Remove(step);
            // Reorder remaining steps
            var order = 1;
            foreach (var s in _steps.OrderBy(s => s.StepOrder))
            {
                s.SetOrder(order++);
            }
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void ReorderSteps(List<Guid> stepIds)
    {
        var order = 1;
        foreach (var stepId in stepIds)
        {
            var step = _steps.FirstOrDefault(s => s.Id == stepId);
            if (step != null)
            {
                step.SetOrder(order++);
            }
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool Matches(decimal amount, Guid? departmentId, Guid? categoryId)
    {
        if (!IsActive) return false;

        // Check workflow-level amount thresholds
        if (MinAmount.HasValue && amount < MinAmount.Value) return false;
        if (MaxAmount.HasValue && amount > MaxAmount.Value) return false;

        // Check scope
        if (DepartmentId.HasValue && DepartmentId != departmentId) return false;
        if (CategoryId.HasValue && CategoryId != categoryId) return false;

        // Check rules
        foreach (var rule in _rules.Where(r => r.IsActive))
        {
            if (!rule.Evaluate(amount, departmentId, categoryId))
                return false;
        }

        return true;
    }

    public List<ApprovalWorkflowStep> GetApplicableSteps(decimal amount)
    {
        return _steps
            .Where(s => s.IsActive && s.IsApplicable(amount))
            .OrderBy(s => s.StepOrder)
            .ToList();
    }
}

public class ApprovalWorkflowRule : TenantEntity
{
    public Guid WorkflowConfigId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public ApprovalRuleType RuleType { get; private set; }
    public string? Field { get; private set; }
    public ApprovalRuleOperator Operator { get; private set; }
    public string? Value { get; private set; }
    public decimal? NumericValue { get; private set; }
    public int Order { get; private set; }
    public bool IsActive { get; private set; }

    // For DTO mapping compatibility
    public Guid WorkflowId => WorkflowConfigId;

    protected ApprovalWorkflowRule() : base() { }

    public static ApprovalWorkflowRule Create(
        Guid workflowConfigId,
        Guid tenantId,
        ApprovalRuleType ruleType,
        string? field,
        ApprovalRuleOperator @operator,
        string? value = null,
        int order = 0)
    {
        var rule = new ApprovalWorkflowRule();
        rule.Id = Guid.NewGuid();
        rule.SetTenantId(tenantId);
        rule.WorkflowConfigId = workflowConfigId;
        rule.Name = $"{ruleType} Rule";
        rule.RuleType = ruleType;
        rule.Field = field;
        rule.Operator = @operator;
        rule.Value = value;
        rule.Order = order;
        rule.IsActive = true;

        // Parse numeric value from string if applicable
        if (!string.IsNullOrEmpty(value) && decimal.TryParse(value, out var numericVal))
        {
            rule.NumericValue = numericVal;
        }

        return rule;
    }

    public static ApprovalWorkflowRule CreateWithName(
        Guid workflowConfigId,
        Guid tenantId,
        string name,
        ApprovalRuleType ruleType,
        ApprovalRuleOperator @operator,
        string? value = null,
        decimal? numericValue = null)
    {
        var rule = new ApprovalWorkflowRule();
        rule.Id = Guid.NewGuid();
        rule.SetTenantId(tenantId);
        rule.WorkflowConfigId = workflowConfigId;
        rule.Name = name;
        rule.RuleType = ruleType;
        rule.Operator = @operator;
        rule.Value = value;
        rule.NumericValue = numericValue;
        rule.IsActive = true;
        return rule;
    }

    public bool Evaluate(decimal amount, Guid? departmentId, Guid? categoryId)
    {
        switch (RuleType)
        {
            case ApprovalRuleType.Amount:
                return EvaluateAmount(amount);
            case ApprovalRuleType.Department:
                return EvaluateDepartment(departmentId);
            case ApprovalRuleType.Category:
                return EvaluateCategory(categoryId);
            default:
                return true;
        }
    }

    private bool EvaluateAmount(decimal amount)
    {
        if (!NumericValue.HasValue) return true;

        return Operator switch
        {
            ApprovalRuleOperator.GreaterThan => amount > NumericValue.Value,
            ApprovalRuleOperator.GreaterThanOrEqual => amount >= NumericValue.Value,
            ApprovalRuleOperator.LessThan => amount < NumericValue.Value,
            ApprovalRuleOperator.LessThanOrEqual => amount <= NumericValue.Value,
            ApprovalRuleOperator.Equal => amount == NumericValue.Value,
            ApprovalRuleOperator.NotEqual => amount != NumericValue.Value,
            ApprovalRuleOperator.Between => EvaluateBetween(amount),
            _ => true
        };
    }

    private bool EvaluateBetween(decimal amount)
    {
        if (string.IsNullOrEmpty(Value) || !NumericValue.HasValue) return true;
        if (decimal.TryParse(Value, out var maxValue))
        {
            return amount >= NumericValue.Value && amount <= maxValue;
        }
        return true;
    }

    private bool EvaluateDepartment(Guid? departmentId)
    {
        if (string.IsNullOrEmpty(Value)) return true;
        if (!departmentId.HasValue) return Operator == ApprovalRuleOperator.NotEqual;
        return Operator == ApprovalRuleOperator.Equal
            ? departmentId.Value.ToString() == Value
            : departmentId.Value.ToString() != Value;
    }

    private bool EvaluateCategory(Guid? categoryId)
    {
        if (string.IsNullOrEmpty(Value)) return true;
        if (!categoryId.HasValue) return Operator == ApprovalRuleOperator.NotEqual;
        return Operator == ApprovalRuleOperator.Equal
            ? categoryId.Value.ToString() == Value
            : categoryId.Value.ToString() != Value;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

public class ApprovalWorkflowStep : TenantEntity
{
    public Guid WorkflowConfigId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int StepOrder { get; private set; }
    public ApprovalStepType StepType { get; private set; }
    public bool IsActive { get; private set; }

    // Amount thresholds
    public decimal? MinAmount { get; private set; }
    public decimal? MaxAmount { get; private set; }

    // Approver configuration
    public Guid? ApproverId { get; private set; }
    public string? ApproverName { get; private set; }
    public string? ApproverRole { get; private set; }
    public Guid? ApproverRoleId { get; private set; }
    public string? ApproverRoleName { get; private set; }
    public Guid? ApproverGroupId { get; private set; }
    public string? ApprovalGroupName { get; private set; }

    // Approval rules
    public int RequiredApprovals { get; private set; }
    public bool RequireAllGroupMembers { get; private set; }
    public int? MinApproversRequired { get; private set; }
    public bool AllowSelfApproval { get; private set; }
    public bool AllowDelegation { get; private set; }

    // Fallback
    public Guid? FallbackApproverId { get; private set; }
    public string? FallbackApproverName { get; private set; }

    // SLA
    public int? SLAHours { get; private set; }
    public bool AutoEscalate { get; private set; }
    public Guid? EscalateToId { get; private set; }
    public string? EscalateToName { get; private set; }

    // Notes
    public string? Instructions { get; private set; }

    // For DTO mapping compatibility
    public Guid WorkflowId => WorkflowConfigId;
    public string? ApproverGroupName => ApprovalGroupName;

    protected ApprovalWorkflowStep() : base() { }

    public static ApprovalWorkflowStep Create(
        Guid workflowConfigId,
        Guid tenantId,
        string name,
        int stepOrder,
        ApprovalStepType stepType,
        Guid? approverId = null,
        string? approverName = null,
        string? approverRole = null,
        Guid? approvalGroupId = null,
        string? approvalGroupName = null,
        int requiredApprovals = 1,
        string? description = null,
        decimal? minAmount = null,
        decimal? maxAmount = null,
        bool allowDelegation = false,
        Guid? fallbackApproverId = null,
        string? fallbackApproverName = null,
        int? slaHours = null,
        bool autoEscalate = false)
    {
        var step = new ApprovalWorkflowStep();
        step.Id = Guid.NewGuid();
        step.SetTenantId(tenantId);
        step.WorkflowConfigId = workflowConfigId;
        step.Name = name;
        step.Description = description;
        step.StepOrder = stepOrder;
        step.StepType = stepType;
        step.MinAmount = minAmount;
        step.MaxAmount = maxAmount;
        step.ApproverId = approverId;
        step.ApproverName = approverName;
        step.ApproverRole = approverRole;
        step.ApproverGroupId = approvalGroupId;
        step.ApprovalGroupName = approvalGroupName;
        step.RequiredApprovals = requiredApprovals;
        step.AllowDelegation = allowDelegation;
        step.FallbackApproverId = fallbackApproverId;
        step.FallbackApproverName = fallbackApproverName;
        step.SLAHours = slaHours;
        step.AutoEscalate = autoEscalate;
        step.IsActive = true;
        return step;
    }

    public void Update(
        string name,
        ApprovalStepType stepType,
        decimal? minAmount,
        decimal? maxAmount,
        string? instructions)
    {
        Name = name;
        StepType = stepType;
        MinAmount = minAmount;
        MaxAmount = maxAmount;
        Instructions = instructions;
    }

    public void SetApprover(Guid approverId, string approverName)
    {
        StepType = ApprovalStepType.SpecificUser;
        ApproverId = approverId;
        ApproverName = approverName;
        ApproverRoleId = null;
        ApproverRoleName = null;
        ApproverGroupId = null;
        ApprovalGroupName = null;
    }

    public void SetApproverRole(Guid roleId, string roleName)
    {
        StepType = ApprovalStepType.Role;
        ApproverRoleId = roleId;
        ApproverRoleName = roleName;
        ApproverRole = roleName;
        ApproverId = null;
        ApproverName = null;
        ApproverGroupId = null;
        ApprovalGroupName = null;
    }

    public void SetApproverGroup(Guid groupId, string groupName, bool requireAll = false, int? minApprovers = null)
    {
        StepType = ApprovalStepType.Group;
        ApproverGroupId = groupId;
        ApprovalGroupName = groupName;
        RequireAllGroupMembers = requireAll;
        MinApproversRequired = minApprovers;
        ApproverId = null;
        ApproverName = null;
        ApproverRoleId = null;
        ApproverRoleName = null;
    }

    public void SetSLA(int slaHours, bool autoEscalate = false, Guid? escalateToId = null, string? escalateToName = null)
    {
        SLAHours = slaHours;
        AutoEscalate = autoEscalate;
        EscalateToId = escalateToId;
        EscalateToName = escalateToName;
    }

    public void SetApprovalRules(bool allowSelfApproval, bool allowDelegation)
    {
        AllowSelfApproval = allowSelfApproval;
        AllowDelegation = allowDelegation;
    }

    public void SetOrder(int order)
    {
        StepOrder = order;
    }

    public bool IsApplicable(decimal amount)
    {
        if (!IsActive) return false;
        if (MinAmount.HasValue && amount < MinAmount.Value) return false;
        if (MaxAmount.HasValue && amount > MaxAmount.Value) return false;
        return true;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Onay Grubu / Approval Group
/// </summary>
public class ApprovalGroup : TenantAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ApprovalGroupType ApprovalType { get; private set; }
    public int RequiredApprovals { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<ApprovalGroupMember> _members = new();
    public IReadOnlyCollection<ApprovalGroupMember> Members => _members.AsReadOnly();

    protected ApprovalGroup() : base() { }

    public static ApprovalGroup Create(
        string name,
        Guid tenantId,
        ApprovalGroupType approvalType = ApprovalGroupType.Any,
        int requiredApprovals = 1,
        string? description = null)
    {
        var group = new ApprovalGroup();
        group.Id = Guid.NewGuid();
        group.SetTenantId(tenantId);
        group.Code = $"GRP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";
        group.Name = name;
        group.Description = description;
        group.ApprovalType = approvalType;
        group.RequiredApprovals = requiredApprovals;
        group.IsActive = true;
        group.CreatedAt = DateTime.UtcNow;
        return group;
    }

    public void Update(string name, string? description, int requiredApprovals)
    {
        Name = name;
        Description = description;
        RequiredApprovals = requiredApprovals;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddMember(ApprovalGroupMember member)
    {
        if (!_members.Any(m => m.UserId == member.UserId))
        {
            _members.Add(member);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void RemoveMember(Guid memberId)
    {
        var member = _members.FirstOrDefault(m => m.Id == memberId);
        if (member != null)
        {
            _members.Remove(member);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void RemoveMemberByUserId(Guid userId)
    {
        var member = _members.FirstOrDefault(m => m.UserId == userId);
        if (member != null)
        {
            _members.Remove(member);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
}

public class ApprovalGroupMember : TenantEntity
{
    public Guid GroupId { get; private set; }
    public Guid UserId { get; private set; }
    public string UserName { get; private set; } = string.Empty;
    public string? UserEmail { get; private set; }
    public string? Role { get; private set; }
    public bool IsActive { get; private set; }
    public bool CanDelegate { get; private set; }
    public Guid? DelegateToId { get; private set; }
    public string? DelegateToName { get; private set; }
    public DateTime? DelegationStartDate { get; private set; }
    public DateTime? DelegationEndDate { get; private set; }
    public DateTime AddedAt { get; private set; }

    protected ApprovalGroupMember() : base() { }

    public static ApprovalGroupMember Create(
        Guid groupId,
        Guid tenantId,
        Guid userId,
        string userName,
        string? userEmail = null,
        string? role = null,
        bool canDelegate = false)
    {
        var member = new ApprovalGroupMember();
        member.Id = Guid.NewGuid();
        member.SetTenantId(tenantId);
        member.GroupId = groupId;
        member.UserId = userId;
        member.UserName = userName;
        member.UserEmail = userEmail;
        member.Role = role;
        member.CanDelegate = canDelegate;
        member.IsActive = true;
        member.AddedAt = DateTime.UtcNow;
        return member;
    }

    public void SetDelegation(Guid delegateToId, string delegateToName, DateTime startDate, DateTime endDate)
    {
        DelegateToId = delegateToId;
        DelegateToName = delegateToName;
        DelegationStartDate = startDate;
        DelegationEndDate = endDate;
    }

    public void ClearDelegation()
    {
        DelegateToId = null;
        DelegateToName = null;
        DelegationStartDate = null;
        DelegationEndDate = null;
    }

    public Guid GetEffectiveApproverId()
    {
        if (DelegateToId.HasValue &&
            DelegationStartDate.HasValue &&
            DelegationEndDate.HasValue &&
            DateTime.UtcNow >= DelegationStartDate.Value &&
            DateTime.UtcNow <= DelegationEndDate.Value)
        {
            return DelegateToId.Value;
        }
        return UserId;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

// Enums
public enum ApprovalWorkflowType
{
    Sequential,
    Parallel,
    Mixed
}

public enum ApprovalEntityType
{
    PurchaseRequest,
    PurchaseOrder,
    PurchaseInvoice,
    SupplierPayment,
    PurchaseReturn,
    PurchaseContract,
    PurchaseBudget,
    Quotation
}

public enum ApprovalRuleType
{
    Amount,
    Department,
    Category,
    Supplier,
    Custom
}

public enum ApprovalRuleOperator
{
    Equal,
    NotEqual,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Between,
    Contains,
    NotContains
}

public enum ApprovalStepType
{
    SpecificUser,
    Role,
    Group,
    Manager,
    DepartmentHead,
    AnyApprover  // Any user from a pool can approve
}

public enum ApprovalGroupType
{
    Any,        // Any member can approve
    All,        // All members must approve
    Majority,   // Majority must approve
    Minimum     // Minimum number must approve
}
