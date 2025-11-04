using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.DeactivateWorkflow;

public class DeactivateWorkflowCommandHandler : IRequestHandler<DeactivateWorkflowCommand, Result>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ILogger<DeactivateWorkflowCommandHandler> _logger;

    public DeactivateWorkflowCommandHandler(
        IWorkflowRepository workflowRepository,
        ILogger<DeactivateWorkflowCommandHandler> logger)
    {
        _workflowRepository = workflowRepository;
        _logger = logger;
    }

    public async Task<Result> Handle(DeactivateWorkflowCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _workflowRepository.GetByIdWithStepsAsync(request.WorkflowId, cancellationToken);
            if (workflow == null)
                return Result.Failure(Error.NotFound("Workflow", $"Workflow with ID {request.WorkflowId} not found"));

            var deactivateResult = workflow.Deactivate();
            if (!deactivateResult.IsSuccess)
                return deactivateResult;

            await _workflowRepository.UpdateAsync(workflow, cancellationToken);
            await _workflowRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Workflow deactivated successfully. WorkflowId: {WorkflowId}", request.WorkflowId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating workflow {WorkflowId}", request.WorkflowId);
            return Result.Failure(Error.Failure("Workflow.Deactivate", $"Failed to deactivate workflow: {ex.Message}"));
        }
    }
}
