using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Services.Workflows;

/// <summary>
/// Service for executing workflow steps and actions
/// </summary>
public interface IWorkflowExecutionService
{
    /// <summary>
    /// Processes a workflow execution asynchronously
    /// </summary>
    Task<Result> ProcessExecutionAsync(int executionId, CancellationToken cancellationToken = default);
}
