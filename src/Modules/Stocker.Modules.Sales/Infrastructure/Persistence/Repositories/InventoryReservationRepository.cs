using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

public class InventoryReservationRepository : BaseRepository<InventoryReservation>, IInventoryReservationRepository
{
    public InventoryReservationRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<InventoryReservation?> GetByNumberAsync(string reservationNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(r => r.ReservationNumber == reservationNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryReservation>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.ReservedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryReservation>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.SalesOrderId == salesOrderId)
            .OrderByDescending(r => r.ReservedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryReservation>> GetByStatusAsync(ReservationStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.Status == status)
            .OrderByDescending(r => r.ReservedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryReservation>> GetActiveByProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.ProductId == productId && r.Status == ReservationStatus.Active)
            .OrderBy(r => r.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryReservation>> GetExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(r => r.Status == ReservationStatus.Active && r.ReservedUntil < now)
            .OrderBy(r => r.ReservedUntil)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalReservedQuantityAsync(Guid productId, Guid? warehouseId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(r => r.ProductId == productId && r.Status == ReservationStatus.Active);

        if (warehouseId.HasValue)
            query = query.Where(r => r.WarehouseId == warehouseId.Value);

        return await query.SumAsync(r => r.ReservedQuantity - r.AllocatedQuantity, cancellationToken);
    }

    public async Task<string> GenerateReservationNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"RES{today:yyyyMM}";
        var count = await _dbSet.CountAsync(r => r.ReservationNumber.StartsWith(prefix), cancellationToken);
        return $"{prefix}{(count + 1):D4}";
    }
}
