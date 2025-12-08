using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class ApprovalWorkflowsController : ControllerBase
{
    private readonly PurchaseDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public ApprovalWorkflowsController(
        PurchaseDbContext context,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWorkflows(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] ApprovalEntityType? entityType = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = _context.ApprovalWorkflowConfigs
            .Include(w => w.Rules)
            .Include(w => w.Steps)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(w => w.Name.Contains(searchTerm));

        if (entityType.HasValue)
            query = query.Where(w => w.EntityType == entityType.Value);

        if (isActive.HasValue)
            query = query.Where(w => w.IsActive == isActive.Value);

        query = sortBy?.ToLower() switch
        {
            "name" => sortDescending ? query.OrderByDescending(w => w.Name) : query.OrderBy(w => w.Name),
            "priority" => sortDescending ? query.OrderByDescending(w => w.Priority) : query.OrderBy(w => w.Priority),
            "entitytype" => sortDescending ? query.OrderByDescending(w => w.EntityType) : query.OrderBy(w => w.EntityType),
            _ => sortDescending ? query.OrderByDescending(w => w.CreatedAt) : query.OrderBy(w => w.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(w => new ApprovalWorkflowListDto
            {
                Id = w.Id,
                Name = w.Name,
                WorkflowType = w.WorkflowType.ToString(),
                EntityType = w.EntityType.ToString(),
                IsActive = w.IsActive,
                Priority = w.Priority,
                MinAmount = w.MinAmount,
                MaxAmount = w.MaxAmount,
                DepartmentName = w.DepartmentName,
                StepCount = w.Steps.Count,
                RuleCount = w.Rules.Count,
                CreatedAt = w.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetWorkflow(Guid id)
    {
        var workflow = await _context.ApprovalWorkflowConfigs
            .Include(w => w.Rules)
            .Include(w => w.Steps)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow == null)
            return NotFound("Workflow not found");

        return Ok(MapToDto(workflow));
    }

    [HttpGet("check")]
    public async Task<IActionResult> CheckApproval([FromQuery] ApprovalEntityType entityType, [FromQuery] decimal amount, [FromQuery] Guid? departmentId = null, [FromQuery] Guid? categoryId = null)
    {
        var workflows = await _context.ApprovalWorkflowConfigs
            .Include(w => w.Steps)
            .Where(w => w.IsActive && w.EntityType == entityType)
            .OrderBy(w => w.Priority)
            .ToListAsync();

        var matchingWorkflow = workflows.FirstOrDefault(w => w.Matches(amount, departmentId, categoryId));

        if (matchingWorkflow == null)
            return Ok(new ApprovalCheckResultDto { RequiresApproval = false, Message = "No approval required" });

        var applicableSteps = matchingWorkflow.GetApplicableSteps(amount);

        return Ok(new ApprovalCheckResultDto
        {
            RequiresApproval = applicableSteps.Any(),
            WorkflowId = matchingWorkflow.Id,
            WorkflowName = matchingWorkflow.Name,
            TotalSteps = applicableSteps.Count,
            Steps = applicableSteps.Select(s => new ApprovalStepInfoDto
            {
                StepOrder = s.StepOrder,
                StepName = s.Name,
                StepType = s.StepType.ToString(),
                ApproverName = s.ApproverName,
                ApprovalGroupName = s.ApprovalGroupName,
                SLAHours = s.SLAHours
            }).ToList(),
            Message = $"Approval required: {applicableSteps.Count} step(s)"
        });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var workflows = await _context.ApprovalWorkflowConfigs.ToListAsync();
        var groups = await _context.ApprovalGroups.ToListAsync();

        return Ok(new ApprovalWorkflowSummaryDto
        {
            TotalWorkflows = workflows.Count,
            ActiveWorkflows = workflows.Count(w => w.IsActive),
            TotalApprovalGroups = groups.Count,
            ActiveApprovalGroups = groups.Count(g => g.IsActive),
            WorkflowsByEntityType = workflows.GroupBy(w => w.EntityType.ToString()).ToDictionary(g => g.Key, g => g.Count()),
            WorkflowsByType = workflows.GroupBy(w => w.WorkflowType.ToString()).ToDictionary(g => g.Key, g => g.Count())
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateWorkflow([FromBody] CreateApprovalWorkflowDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var workflow = ApprovalWorkflowConfig.Create(dto.Name, dto.EntityType, tenantId.Value, dto.WorkflowType, dto.Description, dto.Priority, dto.MinAmount, dto.MaxAmount, dto.Currency);

        if (dto.DepartmentId.HasValue)
            workflow.SetDepartment(dto.DepartmentId, dto.DepartmentName);

        if (dto.CategoryId.HasValue)
            workflow.SetCategory(dto.CategoryId, dto.CategoryName);

        var currentUser = _currentUserService.GetCurrentUser();
        if (currentUser != null)
            workflow.SetCreator(currentUser.Id, currentUser.Name ?? currentUser.Email);

        foreach (var ruleDto in dto.Rules)
        {
            var rule = ApprovalWorkflowRule.Create(workflow.Id, tenantId.Value, ruleDto.RuleType, ruleDto.Field, ruleDto.Operator, ruleDto.Value, ruleDto.Order);
            workflow.AddRule(rule);
        }

        foreach (var stepDto in dto.Steps)
        {
            var step = ApprovalWorkflowStep.Create(
                workflow.Id, tenantId.Value, stepDto.Name, stepDto.StepOrder, stepDto.StepType,
                stepDto.ApproverId, stepDto.ApproverName, stepDto.ApproverRole,
                stepDto.ApprovalGroupId, stepDto.ApprovalGroupName, stepDto.RequiredApprovals,
                stepDto.Description, stepDto.MinAmount, stepDto.MaxAmount,
                stepDto.AllowDelegation, stepDto.FallbackApproverId, stepDto.FallbackApproverName,
                stepDto.SLAHours, stepDto.AutoEscalate);
            workflow.AddStep(step);
        }

        _context.ApprovalWorkflowConfigs.Add(workflow);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWorkflow), new { id = workflow.Id }, MapToDto(workflow));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateWorkflow(Guid id, [FromBody] UpdateApprovalWorkflowDto dto)
    {
        var workflow = await _context.ApprovalWorkflowConfigs.FindAsync(id);
        if (workflow == null)
            return NotFound("Workflow not found");

        workflow.Update(
            dto.Name ?? workflow.Name,
            dto.Priority ?? workflow.Priority,
            dto.MinAmount ?? workflow.MinAmount,
            dto.MaxAmount ?? workflow.MaxAmount);

        if (dto.DepartmentId.HasValue || dto.DepartmentName != null)
            workflow.SetDepartment(dto.DepartmentId ?? workflow.DepartmentId, dto.DepartmentName ?? workflow.DepartmentName);

        if (dto.CategoryId.HasValue || dto.CategoryName != null)
            workflow.SetCategory(dto.CategoryId ?? workflow.CategoryId, dto.CategoryName ?? workflow.CategoryName);

        await _context.SaveChangesAsync();
        return Ok(MapToDto(workflow));
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var workflow = await _context.ApprovalWorkflowConfigs.FindAsync(id);
        if (workflow == null)
            return NotFound("Workflow not found");

        workflow.Activate();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(workflow));
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var workflow = await _context.ApprovalWorkflowConfigs.FindAsync(id);
        if (workflow == null)
            return NotFound("Workflow not found");

        workflow.Deactivate();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(workflow));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var workflow = await _context.ApprovalWorkflowConfigs.FindAsync(id);
        if (workflow == null)
            return NotFound("Workflow not found");

        _context.ApprovalWorkflowConfigs.Remove(workflow);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Approval Groups endpoints
    [HttpGet("groups")]
    public async Task<IActionResult> GetGroups(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool? isActive = null)
    {
        var query = _context.ApprovalGroups.Include(g => g.Members).AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(g => g.Name.Contains(searchTerm));

        if (isActive.HasValue)
            query = query.Where(g => g.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(g => new ApprovalGroupListDto
            {
                Id = g.Id,
                Name = g.Name,
                ApprovalType = g.ApprovalType.ToString(),
                RequiredApprovals = g.RequiredApprovals,
                MemberCount = g.Members.Count,
                IsActive = g.IsActive,
                CreatedAt = g.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpGet("groups/{id:guid}")]
    public async Task<IActionResult> GetGroup(Guid id)
    {
        var group = await _context.ApprovalGroups
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (group == null)
            return NotFound("Approval group not found");

        return Ok(MapGroupToDto(group));
    }

    [HttpPost("groups")]
    public async Task<IActionResult> CreateGroup([FromBody] CreateApprovalGroupDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var group = ApprovalGroup.Create(dto.Name, tenantId.Value, dto.ApprovalType, dto.RequiredApprovals, dto.Description);

        foreach (var memberDto in dto.Members)
        {
            var member = ApprovalGroupMember.Create(group.Id, tenantId.Value, memberDto.UserId, memberDto.UserName, memberDto.UserEmail, memberDto.Role, memberDto.CanDelegate);
            group.AddMember(member);
        }

        _context.ApprovalGroups.Add(group);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, MapGroupToDto(group));
    }

    [HttpPut("groups/{id:guid}")]
    public async Task<IActionResult> UpdateGroup(Guid id, [FromBody] UpdateApprovalGroupDto dto)
    {
        var group = await _context.ApprovalGroups.FindAsync(id);
        if (group == null)
            return NotFound("Approval group not found");

        group.Update(dto.Name ?? group.Name, dto.Description, dto.RequiredApprovals ?? group.RequiredApprovals);
        await _context.SaveChangesAsync();
        return Ok(MapGroupToDto(group));
    }

    [HttpPost("groups/{id:guid}/members")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] CreateApprovalGroupMemberDto dto)
    {
        var group = await _context.ApprovalGroups.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == id);
        if (group == null)
            return NotFound("Approval group not found");

        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var member = ApprovalGroupMember.Create(group.Id, tenantId.Value, dto.UserId, dto.UserName, dto.UserEmail, dto.Role, dto.CanDelegate);
        group.AddMember(member);
        await _context.SaveChangesAsync();

        return Ok(MapGroupToDto(group));
    }

    [HttpDelete("groups/{groupId:guid}/members/{memberId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid groupId, Guid memberId)
    {
        var group = await _context.ApprovalGroups.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == groupId);
        if (group == null)
            return NotFound("Approval group not found");

        group.RemoveMember(memberId);
        await _context.SaveChangesAsync();

        return Ok(MapGroupToDto(group));
    }

    [HttpPost("groups/{id:guid}/activate")]
    public async Task<IActionResult> ActivateGroup(Guid id)
    {
        var group = await _context.ApprovalGroups.FindAsync(id);
        if (group == null)
            return NotFound("Approval group not found");

        group.Activate();
        await _context.SaveChangesAsync();
        return Ok(MapGroupToDto(group));
    }

    [HttpPost("groups/{id:guid}/deactivate")]
    public async Task<IActionResult> DeactivateGroup(Guid id)
    {
        var group = await _context.ApprovalGroups.FindAsync(id);
        if (group == null)
            return NotFound("Approval group not found");

        group.Deactivate();
        await _context.SaveChangesAsync();
        return Ok(MapGroupToDto(group));
    }

    [HttpDelete("groups/{id:guid}")]
    public async Task<IActionResult> DeleteGroup(Guid id)
    {
        var group = await _context.ApprovalGroups.FindAsync(id);
        if (group == null)
            return NotFound("Approval group not found");

        _context.ApprovalGroups.Remove(group);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static ApprovalWorkflowConfigDto MapToDto(ApprovalWorkflowConfig w)
    {
        return new ApprovalWorkflowConfigDto
        {
            Id = w.Id,
            Name = w.Name,
            Description = w.Description,
            WorkflowType = w.WorkflowType.ToString(),
            EntityType = w.EntityType.ToString(),
            IsActive = w.IsActive,
            Priority = w.Priority,
            MinAmount = w.MinAmount,
            MaxAmount = w.MaxAmount,
            Currency = w.Currency,
            DepartmentId = w.DepartmentId,
            DepartmentName = w.DepartmentName,
            CategoryId = w.CategoryId,
            CategoryName = w.CategoryName,
            CreatedById = w.CreatedById,
            CreatedByName = w.CreatedByName,
            CreatedAt = w.CreatedAt,
            UpdatedAt = w.UpdatedAt,
            Rules = w.Rules.Select(r => new ApprovalWorkflowRuleDto
            {
                Id = r.Id,
                WorkflowId = r.WorkflowId,
                RuleType = r.RuleType.ToString(),
                Field = r.Field,
                Operator = r.Operator.ToString(),
                Value = r.Value,
                Order = r.Order,
                IsActive = r.IsActive
            }).ToList(),
            Steps = w.Steps.OrderBy(s => s.StepOrder).Select(s => new ApprovalWorkflowStepDto
            {
                Id = s.Id,
                WorkflowId = s.WorkflowId,
                Name = s.Name,
                Description = s.Description,
                StepOrder = s.StepOrder,
                StepType = s.StepType.ToString(),
                MinAmount = s.MinAmount,
                MaxAmount = s.MaxAmount,
                ApproverId = s.ApproverId,
                ApproverName = s.ApproverName,
                ApproverRole = s.ApproverRole,
                ApprovalGroupId = s.ApprovalGroupId,
                ApprovalGroupName = s.ApprovalGroupName,
                RequiredApprovals = s.RequiredApprovals,
                AllowDelegation = s.AllowDelegation,
                FallbackApproverId = s.FallbackApproverId,
                FallbackApproverName = s.FallbackApproverName,
                SLAHours = s.SLAHours,
                AutoEscalate = s.AutoEscalate,
                IsActive = s.IsActive
            }).ToList()
        };
    }

    private static ApprovalGroupDto MapGroupToDto(ApprovalGroup g)
    {
        return new ApprovalGroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            ApprovalType = g.ApprovalType.ToString(),
            RequiredApprovals = g.RequiredApprovals,
            IsActive = g.IsActive,
            CreatedAt = g.CreatedAt,
            UpdatedAt = g.UpdatedAt,
            Members = g.Members.Select(m => new ApprovalGroupMemberDto
            {
                Id = m.Id,
                GroupId = m.GroupId,
                UserId = m.UserId,
                UserName = m.UserName,
                UserEmail = m.UserEmail,
                Role = m.Role,
                CanDelegate = m.CanDelegate,
                IsActive = m.IsActive,
                AddedAt = m.AddedAt
            }).ToList()
        };
    }
}
