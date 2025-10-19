using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface IWorkflowRepository
{
    Task<Workflow?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Workflow?> GetByIdWithStepsAsync(int id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task AddAsync(Workflow entity, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(Workflow entity, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(Workflow entity, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<IEnumerable<Workflow>> GetActiveWorkflowsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Workflow>> GetWorkflowsByEntityTypeAsync(string entityType, CancellationToken cancellationToken = default);
    Task<IEnumerable<Workflow>> GetWorkflowsByTriggerTypeAsync(WorkflowTriggerType triggerType, CancellationToken cancellationToken = default);
    Task<IEnumerable<Workflow>> GetTriggeredWorkflowsAsync(string entityType, WorkflowTriggerType triggerType, CancellationToken cancellationToken = default);
}
