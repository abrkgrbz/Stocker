using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface IWorkflowExecutionRepository
{
    Task<WorkflowExecution?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<WorkflowExecution?> GetByIdWithStepsAsync(int id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task AddAsync(WorkflowExecution entity, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(WorkflowExecution entity, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<IEnumerable<WorkflowExecution>> GetExecutionsByWorkflowIdAsync(int workflowId, CancellationToken cancellationToken = default);
    Task<IEnumerable<WorkflowExecution>> GetExecutionsByEntityAsync(int entityId, string entityType, CancellationToken cancellationToken = default);
    Task<IEnumerable<WorkflowExecution>> GetExecutionsByStatusAsync(WorkflowExecutionStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<WorkflowExecution>> GetPendingExecutionsAsync(CancellationToken cancellationToken = default);
}
