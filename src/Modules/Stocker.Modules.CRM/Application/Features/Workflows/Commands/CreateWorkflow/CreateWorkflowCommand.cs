using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.CreateWorkflow;

public record CreateWorkflowCommand(
    string Name,
    string Description,
    WorkflowTriggerType TriggerType,
    string EntityType,
    string TriggerConditions,
    List<CreateWorkflowStepDto> Steps
) : IRequest<Result<int>>;

public record CreateWorkflowStepDto(
    string Name,
    string Description,
    WorkflowActionType ActionType,
    int StepOrder,
    string ActionConfiguration,
    string Conditions,
    int DelayMinutes = 0,
    bool ContinueOnError = false
);
