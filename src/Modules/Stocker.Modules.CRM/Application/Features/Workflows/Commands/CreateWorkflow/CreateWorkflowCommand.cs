using System.Text.Json.Serialization;
using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.CreateWorkflow;

public record CreateWorkflowCommand(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("triggerType")] WorkflowTriggerType TriggerType,
    [property: JsonPropertyName("entityType")] string EntityType,
    [property: JsonPropertyName("triggerConditions")] string TriggerConditions,
    [property: JsonPropertyName("steps")] List<CreateWorkflowStepDto> Steps
) : IRequest<Result<int>>;

public record CreateWorkflowStepDto(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("actionType")] WorkflowActionType ActionType,
    [property: JsonPropertyName("stepOrder")] int StepOrder,
    [property: JsonPropertyName("actionConfiguration")] string ActionConfiguration,
    [property: JsonPropertyName("conditions")] string Conditions,
    [property: JsonPropertyName("delayMinutes")] int DelayMinutes = 0,
    [property: JsonPropertyName("continueOnError")] bool ContinueOnError = false
);
