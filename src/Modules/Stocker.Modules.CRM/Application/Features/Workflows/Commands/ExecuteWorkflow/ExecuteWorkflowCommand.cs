using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.ExecuteWorkflow;

public record ExecuteWorkflowCommand(
    int WorkflowId,
    int EntityId,
    string EntityType,
    string TriggerData
) : IRequest<Result<int>>;
