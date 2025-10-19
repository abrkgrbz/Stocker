using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.ActivateWorkflow;

public record ActivateWorkflowCommand(int WorkflowId) : IRequest<Result>;
