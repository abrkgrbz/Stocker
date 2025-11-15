using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.CreateWorkflow;

public class CreateWorkflowCommandHandler : IRequestHandler<CreateWorkflowCommand, Result<int>>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateWorkflowCommandHandler> _logger;

    public CreateWorkflowCommandHandler(
        IWorkflowRepository workflowRepository,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<CreateWorkflowCommandHandler> logger)
    {
        _workflowRepository = workflowRepository;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<int>> Handle(CreateWorkflowCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = _tenantService.GetCurrentTenantId();
            if (!tenantId.HasValue)
                return Result<int>.Failure(Error.Validation("Workflow", "Tenant context is required"));

            var userId = _currentUserService.UserId;
            if (!userId.HasValue)
                return Result<int>.Failure(Error.Validation("Workflow", "User context is required"));

            var workflowResult = Workflow.Create(
                request.Name,
                request.Description,
                request.TriggerType,
                request.EntityType,
                request.TriggerConditions,
                tenantId.Value,
                userId.Value);

            if (!workflowResult.IsSuccess)
                return Result<int>.Failure(workflowResult.Error);

            var workflow = workflowResult.Value;

            // Add steps
            foreach (var stepDto in request.Steps.OrderBy(s => s.StepOrder))
            {
                var stepResult = WorkflowStep.Create(
                    0, // Will be set after workflow is saved
                    stepDto.Name,
                    stepDto.Description,
                    stepDto.ActionType,
                    stepDto.StepOrder,
                    stepDto.ActionConfiguration,
                    stepDto.Conditions);

                if (!stepResult.IsSuccess)
                    return Result<int>.Failure(stepResult.Error);

                var step = stepResult.Value;
                step.SetDelay(stepDto.DelayMinutes);
                step.SetContinueOnError(stepDto.ContinueOnError);

                workflow.AddStep(step);
            }

            await _workflowRepository.AddAsync(workflow, cancellationToken);
            await _workflowRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Workflow created successfully. WorkflowId: {WorkflowId}, Name: {Name}, EntityType: {EntityType}",
                workflow.Id, workflow.Name, workflow.EntityType);

            return Result<int>.Success(workflow.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow: {Name}", request.Name);
            return Result<int>.Failure(Error.Failure("Workflow.Create", $"Failed to create workflow: {ex.Message}"));
        }
    }
}
