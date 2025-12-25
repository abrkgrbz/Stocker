using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Shipment entity
/// </summary>
public class ShipmentRepository : BaseRepository<Shipment>, IShipmentRepository
{
    public ShipmentRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<Shipment?> GetByShipmentNumberAsync(
        string shipmentNumber,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.ShipmentNumber == shipmentNumber, cancellationToken);
    }

    public async Task<Shipment?> GetWithItemsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Shipment>> GetByOrderIdAsync(
        Guid orderId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Items)
            .Where(s => s.SalesOrderId == orderId)
            .OrderByDescending(s => s.ShipmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Shipment>> GetByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Items)
            .Where(s => s.CustomerId == customerId)
            .OrderByDescending(s => s.ShipmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Shipment>> GetByStatusAsync(
        ShipmentStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Items)
            .Where(s => s.Status == status)
            .OrderByDescending(s => s.ShipmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Shipment>> GetPendingShipmentsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Items)
            .Where(s => s.Status == ShipmentStatus.Draft || s.Status == ShipmentStatus.Preparing)
            .OrderBy(s => s.ExpectedDeliveryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Shipment>> GetInTransitShipmentsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Items)
            .Where(s => s.Status == ShipmentStatus.Shipped || s.Status == ShipmentStatus.InTransit)
            .OrderBy(s => s.ExpectedDeliveryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Shipment>> GetOverdueShipmentsAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(s => s.Items)
            .Where(s => s.ExpectedDeliveryDate < now &&
                       s.Status != ShipmentStatus.Delivered &&
                       s.Status != ShipmentStatus.Cancelled &&
                       s.Status != ShipmentStatus.Returned)
            .OrderBy(s => s.ExpectedDeliveryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateShipmentNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"SHP-{today:yyyyMMdd}-";

        var lastShipment = await _dbSet
            .Where(s => s.ShipmentNumber.StartsWith(prefix))
            .OrderByDescending(s => s.ShipmentNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastShipment == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastShipment.ShipmentNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
