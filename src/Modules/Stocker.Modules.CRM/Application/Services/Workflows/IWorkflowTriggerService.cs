using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Services.Workflows;

/// <summary>
/// Service for triggering workflows based on entity events
/// </summary>
public interface IWorkflowTriggerService
{
    /// <summary>
    /// Triggers all matching workflows for an entity event
    /// </summary>
    /// <param name="entityType">Type of entity (e.g., "Customer", "Deal", "Lead")</param>
    /// <param name="entityId">ID of the entity (string to support both int and Guid IDs)</param>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="triggerType">Type of trigger event</param>
    /// <param name="triggerData">Additional data for the workflow context</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result with count of triggered workflows</returns>
    Task<Result<int>> TriggerWorkflowsAsync(
        string entityType,
        string entityId,
        Guid tenantId,
        WorkflowTriggerType triggerType,
        Dictionary<string, object>? triggerData = null,
        CancellationToken cancellationToken = default);
}
