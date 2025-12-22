using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class WorkflowExecutionRepository : IWorkflowExecutionRepository
{
    private readonly CRMDbContext _context;
    private readonly DbSet<WorkflowExecution> _dbSet;

    public WorkflowExecutionRepository(CRMDbContext context)
    {
        _context = context;
        _dbSet = context.Set<WorkflowExecution>();
    }

    public async Task<WorkflowExecution?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<WorkflowExecution?> GetByIdWithStepsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(e => e.StepExecutions.OrderBy(se => se.StepOrder))
            .Include(e => e.Workflow)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task AddAsync(WorkflowExecution entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
    }

    public System.Threading.Tasks.Task UpdateAsync(WorkflowExecution entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Update(entity);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<WorkflowExecution>> GetExecutionsByWorkflowIdAsync(
        int workflowId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.WorkflowId == workflowId)
            .OrderByDescending(e => e.StartedAt)
            .Take(100) // Limit to last 100 executions
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<WorkflowExecution>> GetExecutionsByEntityAsync(
        string entityId,
        string entityType,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(e => e.Workflow)
            .Where(e => e.EntityId == entityId && e.EntityType == entityType)
            .OrderByDescending(e => e.StartedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<WorkflowExecution>> GetExecutionsByStatusAsync(
        WorkflowExecutionStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.Status == status)
            .OrderBy(e => e.StartedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<WorkflowExecution>> GetPendingExecutionsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(e => e.Workflow)
                .ThenInclude(w => w.Steps.Where(s => s.IsEnabled).OrderBy(s => s.StepOrder))
            .Where(e => e.Status == WorkflowExecutionStatus.Pending || e.Status == WorkflowExecutionStatus.Waiting)
            .OrderBy(e => e.StartedAt)
            .Take(50) // Process in batches
            .ToListAsync(cancellationToken);
    }
}
