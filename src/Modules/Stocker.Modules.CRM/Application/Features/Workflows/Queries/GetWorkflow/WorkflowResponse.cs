using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Queries.GetWorkflow;

public record WorkflowResponse(
    int Id,
    string Name,
    string Description,
    WorkflowTriggerType TriggerType,
    string EntityType,
    bool IsActive,
    int ExecutionCount,
    DateTime? LastExecutedAt,
    List<WorkflowStepResponse> Steps
);

public record WorkflowStepResponse(
    int Id,
    string Name,
    string Description,
    WorkflowActionType ActionType,
    int StepOrder,
    int DelayMinutes,
    bool IsEnabled
);
