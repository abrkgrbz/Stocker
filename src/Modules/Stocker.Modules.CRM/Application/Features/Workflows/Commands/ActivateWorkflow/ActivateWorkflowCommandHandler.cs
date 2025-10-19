using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.ActivateWorkflow;

public class ActivateWorkflowCommandHandler : IRequestHandler<ActivateWorkflowCommand, Result>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ILogger<ActivateWorkflowCommandHandler> _logger;

    public ActivateWorkflowCommandHandler(
        IWorkflowRepository workflowRepository,
        ILogger<ActivateWorkflowCommandHandler> logger)
    {
        _workflowRepository = workflowRepository;
        _logger = logger;
    }

    public async Task<Result> Handle(ActivateWorkflowCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _workflowRepository.GetByIdWithStepsAsync(request.WorkflowId, cancellationToken);
            if (workflow == null)
                return Result.Failure(Error.NotFound("Workflow", $"Workflow with ID {request.WorkflowId} not found"));

            var activateResult = workflow.Activate();
            if (!activateResult.IsSuccess)
                return activateResult;

            await _workflowRepository.UpdateAsync(workflow, cancellationToken);
            await _workflowRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Workflow activated successfully. WorkflowId: {WorkflowId}", request.WorkflowId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating workflow {WorkflowId}", request.WorkflowId);
            return Result.Failure(Error.Failure("Workflow.Activate", $"Failed to activate workflow: {ex.Message}"));
        }
    }
}
