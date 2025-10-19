using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.ExecuteWorkflow;

public class ExecuteWorkflowCommandHandler : IRequestHandler<ExecuteWorkflowCommand, Result<int>>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly IWorkflowExecutionRepository _executionRepository;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ExecuteWorkflowCommandHandler> _logger;

    public ExecuteWorkflowCommandHandler(
        IWorkflowRepository workflowRepository,
        IWorkflowExecutionRepository executionRepository,
        ITenantService tenantService,
        ILogger<ExecuteWorkflowCommandHandler> logger)
    {
        _workflowRepository = workflowRepository;
        _executionRepository = executionRepository;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<int>> Handle(ExecuteWorkflowCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = _tenantService.GetCurrentTenantId();
            if (!tenantId.HasValue)
                return Result<int>.Failure(Error.Validation("Workflow", "Tenant context is required"));

            var workflow = await _workflowRepository.GetByIdWithStepsAsync(request.WorkflowId, cancellationToken);
            if (workflow == null)
                return Result<int>.Failure(Error.NotFound("Workflow", $"Workflow with ID {request.WorkflowId} not found"));

            if (!workflow.IsActive)
                return Result<int>.Failure(Error.Validation("Workflow", "Cannot execute inactive workflow"));

            var userId = Guid.Empty; // TODO: Get from auth context for manual triggers

            var executionResult = WorkflowExecution.Create(
                workflow.Id,
                tenantId.Value,
                request.EntityId,
                request.EntityType,
                workflow.Steps.Count,
                userId == Guid.Empty ? null : userId,
                request.TriggerData);

            if (!executionResult.IsSuccess)
                return Result<int>.Failure(executionResult.Error);

            var execution = executionResult.Value;
            execution.Start();

            await _executionRepository.AddAsync(execution, cancellationToken);
            await _executionRepository.SaveChangesAsync(cancellationToken);

            workflow.RecordExecution();
            await _workflowRepository.UpdateAsync(workflow, cancellationToken);
            await _workflowRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Workflow execution started. ExecutionId: {ExecutionId}, WorkflowId: {WorkflowId}, EntityId: {EntityId}",
                execution.Id, workflow.Id, request.EntityId);

            // TODO: Queue for background processing (Hangfire)

            return Result<int>.Success(execution.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing workflow {WorkflowId}", request.WorkflowId);
            return Result<int>.Failure(Error.Failure("Workflow.Execute", $"Failed to execute workflow: {ex.Message}"));
        }
    }
}
