using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for StockReservation entity
/// </summary>
public class StockReservationRepository : BaseRepository<StockReservation>, IStockReservationRepository
{
    public StockReservationRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<StockReservation?> GetByReservationNumberAsync(string reservationNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Warehouse)
            .Where(r => !r.IsDeleted && r.ReservationNumber == reservationNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockReservation>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Warehouse)
            .Where(r => !r.IsDeleted && r.ProductId == productId)
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockReservation>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Where(r => !r.IsDeleted && r.WarehouseId == warehouseId)
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockReservation>> GetByStatusAsync(ReservationStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Warehouse)
            .Where(r => !r.IsDeleted && r.Status == status)
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockReservation>> GetByReferenceAsync(ReservationType type, Guid referenceId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Warehouse)
            .Where(r => !r.IsDeleted && r.ReservationType == type && r.ReferenceDocumentId == referenceId)
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockReservation>> GetActiveReservationsAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => !r.IsDeleted &&
                   r.ProductId == productId &&
                   r.WarehouseId == warehouseId &&
                   r.Status == ReservationStatus.Active)
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalReservedQuantityAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => !r.IsDeleted &&
                   r.ProductId == productId &&
                   r.WarehouseId == warehouseId &&
                   r.Status == ReservationStatus.Active)
            .SumAsync(r => r.Quantity - r.FulfilledQuantity, cancellationToken);
    }

    public async Task<IReadOnlyList<StockReservation>> GetExpiredReservationsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Warehouse)
            .Where(r => !r.IsDeleted &&
                   r.Status == ReservationStatus.Active &&
                   r.ExpirationDate.HasValue &&
                   r.ExpirationDate.Value < now)
            .OrderBy(r => r.ExpirationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateReservationNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"RES-{today:yyyyMMdd}-";

        var lastReservation = await DbSet
            .Where(r => r.ReservationNumber.StartsWith(prefix))
            .OrderByDescending(r => r.ReservationNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastReservation == null)
        {
            return $"{prefix}0001";
        }

        var lastNumberStr = lastReservation.ReservationNumber.Substring(prefix.Length);
        if (int.TryParse(lastNumberStr, out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
