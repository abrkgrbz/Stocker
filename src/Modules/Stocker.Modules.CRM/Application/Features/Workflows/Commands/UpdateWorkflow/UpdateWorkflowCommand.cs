using MediatR;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.UpdateWorkflow;

public record UpdateWorkflowCommand(
    int WorkflowId,
    string Name,
    string Description,
    WorkflowTriggerType TriggerType,
    string EntityType,
    string TriggerConditions,
    bool IsActive,
    List<UpdateWorkflowStepDto> Steps
) : IRequest<Result<Unit>>;

public record UpdateWorkflowStepDto(
    int? Id, // Null if new step
    string Name,
    string Description,
    WorkflowActionType ActionType,
    int StepOrder,
    string ActionConfiguration,
    string Conditions,
    int DelayMinutes = 0,
    bool IsEnabled = true,
    bool ContinueOnError = false
);
