using System.Text.Json;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;
using CrmTask = Stocker.Modules.CRM.Domain.Entities.Task;

namespace Stocker.Modules.CRM.Application.Features.Workflows.ActionHandlers;

/// <summary>
/// Handles CreateTask workflow actions
/// </summary>
public class CreateTaskActionHandler : IWorkflowActionHandler
{
    private readonly ICRMUnitOfWork _unitOfWork;
    private readonly ILogger<CreateTaskActionHandler> _logger;

    public CreateTaskActionHandler(
        ICRMUnitOfWork unitOfWork,
        ILogger<CreateTaskActionHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public bool CanHandle(string actionType)
    {
        return actionType == WorkflowActionType.CreateTask.ToString() ||
               actionType == nameof(WorkflowActionType.CreateTask);
    }

    public async Task<Result<WorkflowActionResult>> ExecuteAsync(
        WorkflowActionContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = ParseConfiguration(context.ActionConfiguration);

            if (string.IsNullOrEmpty(config.Subject))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("CreateTask", "Task subject is required"));
            }

            // Get tenantId from trigger data or unit of work
            var tenantId = ResolveTenantId(context);
            if (tenantId == Guid.Empty)
            {
                tenantId = _unitOfWork.TenantId;
            }
            if (tenantId == Guid.Empty)
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("CreateTask", "Tenant ID is required for task creation"));
            }

            // Get ownerId from configuration or trigger data
            var ownerId = ResolveOwnerId(config, context);
            if (ownerId == Guid.Empty)
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("CreateTask", "Owner ID is required for task creation"));
            }

            // Replace template variables
            var subject = ReplaceVariables(config.Subject, context);
            var description = config.Description != null ? ReplaceVariables(config.Description, context) : null;

            // Parse priority
            var priority = ParsePriority(config.Priority);

            // Calculate due date
            DateTime? dueDate = null;
            if (config.DueDateDaysFromNow.HasValue)
            {
                dueDate = DateTime.UtcNow.AddDays(config.DueDateDaysFromNow.Value);
            }
            else if (!string.IsNullOrEmpty(config.DueDate))
            {
                if (DateTime.TryParse(config.DueDate, out var parsedDueDate))
                {
                    dueDate = parsedDueDate;
                }
            }

            // Create task
            var taskResult = CrmTask.Create(
                tenantId: tenantId,
                subject: subject,
                ownerId: ownerId,
                priority: priority,
                dueDate: dueDate,
                description: description
            );

            if (!taskResult.IsSuccess)
            {
                _logger.LogError(
                    "Failed to create task for workflow {WorkflowId}, execution {ExecutionId}: {Error}",
                    context.WorkflowId, context.ExecutionId, taskResult.Error?.Description);

                return Result<WorkflowActionResult>.Failure(
                    taskResult.Error ?? Error.Failure("CreateTask", "Failed to create task"));
            }

            var task = taskResult.Value;

            // Set related entity if applicable
            if (!string.IsNullOrEmpty(context.EntityType) && !string.IsNullOrEmpty(context.EntityId))
            {
                var relatedEntityType = ParseRelatedEntityType(context.EntityType);
                if (relatedEntityType.HasValue && Guid.TryParse(context.EntityId, out var relatedEntityId))
                {
                    task.SetRelatedEntity(relatedEntityType.Value, relatedEntityId);
                }
            }

            // Assign additional users if specified
            if (config.AssigneeIds != null && config.AssigneeIds.Length > 0)
            {
                var assigneeGuids = config.AssigneeIds
                    .Select(id => Guid.TryParse(id, out var guid) ? guid : Guid.Empty)
                    .Where(g => g != Guid.Empty)
                    .ToArray();

                if (assigneeGuids.Length > 0)
                {
                    task.AssignTo(assigneeGuids);
                }
            }

            // Save task using the generic repository from base UnitOfWork
            await _unitOfWork.Repository<CrmTask>().AddAsync(task, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Task created successfully for workflow {WorkflowId}, execution {ExecutionId}. TaskId: {TaskId}",
                context.WorkflowId, context.ExecutionId, task.Id);

            var outputData = new Dictionary<string, object>
            {
                ["taskId"] = task.Id.ToString(),
                ["subject"] = subject,
                ["ownerId"] = ownerId.ToString(),
                ["priority"] = priority.ToString(),
                ["createdAt"] = DateTime.UtcNow
            };

            if (dueDate.HasValue)
            {
                outputData["dueDate"] = dueDate.Value;
            }

            return Result<WorkflowActionResult>.Success(
                WorkflowActionResult.Success(outputData));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error executing CreateTask action for workflow {WorkflowId}, execution {ExecutionId}",
                context.WorkflowId, context.ExecutionId);

            return Result<WorkflowActionResult>.Failure(
                Error.Failure("CreateTask", $"Failed to execute CreateTask action: {ex.Message}"));
        }
    }

    private TaskConfiguration ParseConfiguration(string actionConfiguration)
    {
        try
        {
            return JsonSerializer.Deserialize<TaskConfiguration>(actionConfiguration)
                ?? new TaskConfiguration();
        }
        catch
        {
            _logger.LogWarning("Failed to parse task configuration, using defaults");
            return new TaskConfiguration();
        }
    }

    private Guid ResolveTenantId(WorkflowActionContext context)
    {
        if (context.TriggerData != null &&
            context.TriggerData.TryGetValue("TenantId", out var tenantIdValue))
        {
            if (tenantIdValue is Guid guidValue)
                return guidValue;
            if (Guid.TryParse(tenantIdValue?.ToString(), out var parsedGuid))
                return parsedGuid;
        }

        return Guid.Empty;
    }

    private Guid ResolveOwnerId(TaskConfiguration config, WorkflowActionContext context)
    {
        // First try to get from configuration
        if (!string.IsNullOrEmpty(config.OwnerId))
        {
            var resolvedOwnerId = ReplaceVariables(config.OwnerId, context);
            if (Guid.TryParse(resolvedOwnerId, out var configOwnerId))
            {
                return configOwnerId;
            }
        }

        // Try to get from trigger data
        if (context.TriggerData != null)
        {
            var ownerFields = new[] { "OwnerId", "CreatedBy", "AssignedTo", "UserId", "WonBy" };
            foreach (var field in ownerFields)
            {
                if (context.TriggerData.TryGetValue(field, out var value))
                {
                    if (value is Guid guidValue)
                        return guidValue;
                    if (Guid.TryParse(value?.ToString(), out var parsedGuid))
                        return parsedGuid;
                }
            }
        }

        return Guid.Empty;
    }

    private TaskPriority ParsePriority(string? priority)
    {
        if (string.IsNullOrEmpty(priority))
            return TaskPriority.Normal;

        if (Enum.TryParse<TaskPriority>(priority, true, out var taskPriority))
            return taskPriority;

        return TaskPriority.Normal;
    }

    private RelatedEntityType? ParseRelatedEntityType(string entityType)
    {
        return entityType.ToLowerInvariant() switch
        {
            "customer" or "account" => RelatedEntityType.Account,
            "contact" => RelatedEntityType.Contact,
            "lead" => RelatedEntityType.Lead,
            "deal" => RelatedEntityType.Deal,
            "opportunity" => RelatedEntityType.Opportunity,
            _ => null
        };
    }

    private string ReplaceVariables(string template, WorkflowActionContext context)
    {
        if (string.IsNullOrEmpty(template))
            return template;

        var result = template;

        // Replace workflow variables
        result = result.Replace("{{WorkflowId}}", context.WorkflowId.ToString());
        result = result.Replace("{{ExecutionId}}", context.ExecutionId.ToString());
        result = result.Replace("{{EntityId}}", context.EntityId.ToString());
        result = result.Replace("{{EntityType}}", context.EntityType);
        result = result.Replace("{{CurrentDate}}", DateTime.Now.ToString("yyyy-MM-dd"));
        result = result.Replace("{{CurrentTime}}", DateTime.Now.ToString("HH:mm:ss"));
        result = result.Replace("{{CurrentDateTime}}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

        // Replace trigger data variables
        if (context.TriggerData != null)
        {
            foreach (var kvp in context.TriggerData)
            {
                result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value?.ToString() ?? string.Empty);
            }
        }

        return result;
    }

    private class TaskConfiguration
    {
        public string Subject { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? OwnerId { get; set; }
        public string[]? AssigneeIds { get; set; }
        public string? Priority { get; set; }
        public string? DueDate { get; set; }
        public int? DueDateDaysFromNow { get; set; }
    }
}
