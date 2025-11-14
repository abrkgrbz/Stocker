using MediatR;
using Stocker.Modules.CRM.Application.Features.Workflows.Queries.GetWorkflow;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Queries.GetAllWorkflows;

public record GetAllWorkflowsQuery() : IRequest<Result<List<WorkflowResponse>>>;
