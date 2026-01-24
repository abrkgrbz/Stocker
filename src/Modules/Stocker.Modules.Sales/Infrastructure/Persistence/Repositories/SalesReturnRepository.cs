using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for SalesReturn entity
/// </summary>
public class SalesReturnRepository : BaseRepository<SalesReturn>, ISalesReturnRepository
{
    public SalesReturnRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<SalesReturn?> GetByReturnNumberAsync(string returnNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.ReturnNumber == returnNumber, cancellationToken);
    }

    public async Task<SalesReturn?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SalesReturn>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Items)
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.ReturnDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SalesReturn>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Items)
            .Where(r => r.SalesOrderId == salesOrderId)
            .OrderByDescending(r => r.ReturnDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SalesReturn>> GetByStatusAsync(SalesReturnStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Items)
            .Where(r => r.Status == status)
            .OrderByDescending(r => r.ReturnDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateReturnNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"RET-{today:yyyyMMdd}-";

        var lastReturn = await _dbSet
            .Where(r => r.ReturnNumber.StartsWith(prefix))
            .OrderByDescending(r => r.ReturnNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastReturn == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastReturn.ReturnNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
