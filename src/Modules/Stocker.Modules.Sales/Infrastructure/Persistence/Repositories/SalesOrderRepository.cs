using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for SalesOrder entity
/// </summary>
public class SalesOrderRepository : BaseRepository<SalesOrder>, ISalesOrderRepository
{
    public SalesOrderRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<SalesOrder?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, cancellationToken);
    }

    public async Task<SalesOrder?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SalesOrder>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(o => o.Items)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SalesOrder>> GetByStatusAsync(SalesOrderStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(o => o.Items)
            .Where(o => o.Status == status)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(cancellationToken);
    }

    // Advisory lock key - sipariş numarası üretiminde race condition önleme
    private const long OrderNumberLockKey = 7_294_815_361; // Sabit hash - "SalesOrderNumber"

    public async Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken = default)
    {
        // Bu metot CreateSalesOrderHandler tarafından zaten aktif bir transaction içinde çağrılır.
        // Bu yüzden CreateExecutionStrategy kullanmıyoruz - NpgsqlRetryingExecutionStrategy
        // user-initiated transaction'lar ile çakışır.

        // PostgreSQL transaction-scoped advisory lock
        // Aynı anda yalnızca bir sipariş numarası üretilebilir, transaction commit/rollback ile serbest bırakılır
        await _context.Database.ExecuteSqlRawAsync(
            "SELECT pg_advisory_xact_lock({0})", new object[] { OrderNumberLockKey }, cancellationToken);

        var today = DateTime.UtcNow;
        var prefix = $"SO-{today:yyyyMMdd}-";

        var lastOrder = await _dbSet
            .Where(o => o.OrderNumber.StartsWith(prefix))
            .OrderByDescending(o => o.OrderNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastOrder == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastOrder.OrderNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
