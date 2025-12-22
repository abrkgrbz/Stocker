using System.Text.Json;
using Hangfire;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Workflows;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.BackgroundJobs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Infrastructure.Services.Workflows;

/// <summary>
/// Service for triggering workflows based on entity events
/// </summary>
public class WorkflowTriggerService : IWorkflowTriggerService
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly IWorkflowExecutionRepository _executionRepository;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<WorkflowTriggerService> _logger;

    public WorkflowTriggerService(
        IWorkflowRepository workflowRepository,
        IWorkflowExecutionRepository executionRepository,
        IBackgroundJobClient backgroundJobClient,
        ILogger<WorkflowTriggerService> logger)
    {
        _workflowRepository = workflowRepository;
        _executionRepository = executionRepository;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    public async Task<Result<int>> TriggerWorkflowsAsync(
        string entityType,
        string entityId,
        Guid tenantId,
        WorkflowTriggerType triggerType,
        Dictionary<string, object>? triggerData = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation(
                "Looking for workflows to trigger. EntityType: {EntityType}, EntityId: {EntityId}, TriggerType: {TriggerType}, TenantId: {TenantId}",
                entityType, entityId, triggerType, tenantId);

            // Find all active workflows matching the entity type and trigger type
            var workflows = await _workflowRepository.GetTriggeredWorkflowsAsync(
                entityType, triggerType, cancellationToken);

            var workflowList = workflows.ToList();

            if (!workflowList.Any())
            {
                _logger.LogInformation(
                    "No active workflows found for EntityType: {EntityType}, TriggerType: {TriggerType}",
                    entityType, triggerType);
                return Result<int>.Success(0);
            }

            _logger.LogInformation(
                "Found {WorkflowCount} workflow(s) to trigger for EntityType: {EntityType}, TriggerType: {TriggerType}",
                workflowList.Count, entityType, triggerType);

            var triggeredCount = 0;
            var triggerDataJson = triggerData != null
                ? JsonSerializer.Serialize(triggerData)
                : null;

            foreach (var workflow in workflowList)
            {
                try
                {
                    // Check if workflow should be triggered based on conditions
                    if (!ShouldTriggerWorkflow(workflow, triggerData))
                    {
                        _logger.LogInformation(
                            "Workflow {WorkflowId} ({WorkflowName}) skipped - conditions not met",
                            workflow.Id, workflow.Name);
                        continue;
                    }

                    // Create workflow execution
                    var executionResult = WorkflowExecution.Create(
                        workflow.Id,
                        tenantId,
                        entityId,
                        entityType,
                        workflow.Steps.Count(s => s.IsEnabled),
                        triggeredBy: null,
                        triggerDataJson ?? string.Empty);

                    if (!executionResult.IsSuccess)
                    {
                        _logger.LogWarning(
                            "Failed to create execution for workflow {WorkflowId}: {Error}",
                            workflow.Id, executionResult.Error?.Description);
                        continue;
                    }

                    var execution = executionResult.Value;
                    execution.Start();

                    await _executionRepository.AddAsync(execution, cancellationToken);
                    await _executionRepository.SaveChangesAsync(cancellationToken);

                    // Update workflow last run time
                    workflow.RecordExecution();
                    await _workflowRepository.UpdateAsync(workflow, cancellationToken);
                    await _workflowRepository.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation(
                        "Created workflow execution {ExecutionId} for workflow {WorkflowId} ({WorkflowName})",
                        execution.Id, workflow.Id, workflow.Name);

                    // Queue the workflow execution to Hangfire for background processing
                    // This ensures proper DI scope and tenant context handling
                    var jobId = _backgroundJobClient.Enqueue<WorkflowExecutionJob>(
                        job => job.ProcessExecutionAsync(execution.Id, tenantId));

                    _logger.LogInformation(
                        "Queued workflow execution {ExecutionId} to Hangfire. JobId: {JobId}",
                        execution.Id, jobId);

                    triggeredCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Error triggering workflow {WorkflowId} for entity {EntityType}:{EntityId}",
                        workflow.Id, entityType, entityId);
                }
            }

            _logger.LogInformation(
                "Successfully triggered {TriggeredCount} workflow(s) for EntityType: {EntityType}, EntityId: {EntityId}",
                triggeredCount, entityType, entityId);

            return Result<int>.Success(triggeredCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error triggering workflows for EntityType: {EntityType}, EntityId: {EntityId}",
                entityType, entityId);

            return Result<int>.Failure(
                Error.Failure("WorkflowTrigger", $"Failed to trigger workflows: {ex.Message}"));
        }
    }

    /// <summary>
    /// Evaluates whether a workflow should be triggered based on its conditions
    /// </summary>
    private bool ShouldTriggerWorkflow(Workflow workflow, Dictionary<string, object>? triggerData)
    {
        // If no conditions are specified, always trigger
        if (string.IsNullOrWhiteSpace(workflow.TriggerConditions))
            return true;

        try
        {
            // Parse the trigger conditions as JSON
            var conditions = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(workflow.TriggerConditions);

            if (conditions == null || !conditions.Any())
                return true;

            if (triggerData == null)
            {
                _logger.LogDebug(
                    "Workflow {WorkflowId} has conditions but no trigger data provided",
                    workflow.Id);
                return true; // If no trigger data, allow trigger (conditions may be optional)
            }

            // Simple condition evaluation
            // Future enhancement: Use a proper expression evaluator
            foreach (var condition in conditions)
            {
                var fieldName = condition.Key;
                var expectedValue = condition.Value;

                if (!triggerData.TryGetValue(fieldName, out var actualValue))
                {
                    _logger.LogDebug(
                        "Workflow {WorkflowId}: Field {FieldName} not found in trigger data",
                        workflow.Id, fieldName);
                    continue;
                }

                // Simple equality check
                var actualString = actualValue?.ToString() ?? "";
                var expectedString = expectedValue.ToString();

                if (!string.Equals(actualString, expectedString, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogDebug(
                        "Workflow {WorkflowId}: Condition not met. Field: {FieldName}, Expected: {Expected}, Actual: {Actual}",
                        workflow.Id, fieldName, expectedString, actualString);
                    return false;
                }
            }

            return true;
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex,
                "Failed to parse trigger conditions for workflow {WorkflowId}",
                workflow.Id);
            return true; // On parse error, allow trigger
        }
    }
}
