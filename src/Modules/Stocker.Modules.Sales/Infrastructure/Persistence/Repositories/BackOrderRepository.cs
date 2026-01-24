using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

public class BackOrderRepository : BaseRepository<BackOrder>, IBackOrderRepository
{
    public BackOrderRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<BackOrder?> GetByNumberAsync(string backOrderNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.BackOrderNumber == backOrderNumber, cancellationToken);
    }

    public async Task<BackOrder?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<BackOrder>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Items)
            .Where(b => b.SalesOrderId == salesOrderId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BackOrder>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Items)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BackOrder>> GetByStatusAsync(BackOrderStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Items)
            .Where(b => b.Status == status)
            .OrderBy(b => b.Priority)
            .ThenBy(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BackOrder>> GetPendingAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Items)
            .Where(b => b.Status == BackOrderStatus.Pending || b.Status == BackOrderStatus.Processing)
            .OrderBy(b => b.Priority)
            .ThenBy(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateBackOrderNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"BO{today:yyyyMM}";
        var count = await _dbSet.CountAsync(b => b.BackOrderNumber.StartsWith(prefix), cancellationToken);
        return $"{prefix}{(count + 1):D4}";
    }
}
