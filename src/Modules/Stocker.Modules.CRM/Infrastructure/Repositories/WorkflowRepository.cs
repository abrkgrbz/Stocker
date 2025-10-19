using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class WorkflowRepository : IWorkflowRepository
{
    private readonly CRMDbContext _context;
    private readonly DbSet<Workflow> _dbSet;

    public WorkflowRepository(CRMDbContext context)
    {
        _context = context;
        _dbSet = context.Set<Workflow>();
    }

    public async Task<Workflow?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Workflow?> GetByIdWithStepsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(w => w.Steps.OrderBy(s => s.StepOrder))
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task AddAsync(Workflow entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
    }

    public System.Threading.Tasks.Task UpdateAsync(Workflow entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Update(entity);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public System.Threading.Tasks.Task DeleteAsync(Workflow entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Remove(entity);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Workflow>> GetActiveWorkflowsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(w => w.IsActive)
            .OrderBy(w => w.ExecutionOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Workflow>> GetWorkflowsByEntityTypeAsync(string entityType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(w => w.EntityType == entityType && w.IsActive)
            .OrderBy(w => w.ExecutionOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Workflow>> GetWorkflowsByTriggerTypeAsync(WorkflowTriggerType triggerType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(w => w.TriggerType == triggerType && w.IsActive)
            .OrderBy(w => w.ExecutionOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Workflow>> GetTriggeredWorkflowsAsync(
        string entityType,
        WorkflowTriggerType triggerType,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(w => w.Steps.Where(s => s.IsEnabled).OrderBy(s => s.StepOrder))
            .Where(w => w.EntityType == entityType && w.TriggerType == triggerType && w.IsActive)
            .OrderBy(w => w.ExecutionOrder)
            .ToListAsync(cancellationToken);
    }
}
