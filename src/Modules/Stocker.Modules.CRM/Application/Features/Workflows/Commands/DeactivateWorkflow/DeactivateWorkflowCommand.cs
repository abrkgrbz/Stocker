using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.DeactivateWorkflow;

public record DeactivateWorkflowCommand(int WorkflowId) : IRequest<Result>;
