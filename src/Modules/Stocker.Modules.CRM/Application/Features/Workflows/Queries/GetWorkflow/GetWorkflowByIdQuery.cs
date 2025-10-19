using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Queries.GetWorkflow;

public record GetWorkflowByIdQuery(int WorkflowId) : IRequest<Result<WorkflowResponse>>;
