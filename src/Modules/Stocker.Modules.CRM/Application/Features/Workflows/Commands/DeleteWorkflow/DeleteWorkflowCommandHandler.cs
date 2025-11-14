using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.DeleteWorkflow;

public class DeleteWorkflowCommandHandler : IRequestHandler<DeleteWorkflowCommand, Result<Unit>>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ILogger<DeleteWorkflowCommandHandler> _logger;

    public DeleteWorkflowCommandHandler(
        IWorkflowRepository workflowRepository,
        ILogger<DeleteWorkflowCommandHandler> logger)
    {
        _workflowRepository = workflowRepository;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(DeleteWorkflowCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _workflowRepository.GetByIdAsync(request.WorkflowId, cancellationToken);

            if (workflow == null)
                return Result<Unit>.Failure(Error.NotFound("Workflow", $"Workflow with ID {request.WorkflowId} not found"));

            await _workflowRepository.DeleteAsync(workflow, cancellationToken);
            await _workflowRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Workflow {WorkflowId} deleted successfully", request.WorkflowId);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting workflow {WorkflowId}", request.WorkflowId);
            return Result<Unit>.Failure(Error.Failure("Workflow.Delete", $"Failed to delete workflow: {ex.Message}"));
        }
    }
}
