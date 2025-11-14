using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.DeleteWorkflow;

public record DeleteWorkflowCommand(int WorkflowId) : IRequest<Result<Unit>>;
