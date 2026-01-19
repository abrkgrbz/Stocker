using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for StockTransfer entity
/// </summary>
public class StockTransferRepository : BaseRepository<StockTransfer>, IStockTransferRepository
{
    public StockTransferRepository(InventoryDbContext context) : base(context)
    {
    }

    /// <summary>
    /// Override to include Warehouses and Items for list display
    /// </summary>
    public override async Task<IReadOnlyList<StockTransfer>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Include(t => t.Items.Where(i => !i.IsDeleted))
            .Where(t => !t.IsDeleted)
            .OrderByDescending(t => t.TransferDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<StockTransfer?> GetWithItemsAsync(int transferId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Items.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.Product)
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Where(t => !t.IsDeleted && t.Id == transferId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<StockTransfer?> GetByTransferNumberAsync(string transferNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Where(t => !t.IsDeleted && t.TransferNumber == transferNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockTransfer>> GetByStatusAsync(TransferStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Where(t => !t.IsDeleted && t.Status == status)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockTransfer>> GetBySourceWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.DestinationWarehouse)
            .Where(t => !t.IsDeleted && t.SourceWarehouseId == warehouseId)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockTransfer>> GetByDestinationWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.SourceWarehouse)
            .Where(t => !t.IsDeleted && t.DestinationWarehouseId == warehouseId)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockTransfer>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Where(t => !t.IsDeleted && t.TransferDate >= startDate && t.TransferDate <= endDate)
            .OrderByDescending(t => t.TransferDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockTransfer>> GetPendingApprovalsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Where(t => !t.IsDeleted && t.Status == TransferStatus.Pending)
            .OrderBy(t => t.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockTransfer>> GetInTransitTransfersAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Include(t => t.Items.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.Product)
            .Where(t => !t.IsDeleted && t.Status == TransferStatus.InTransit)
            .OrderBy(t => t.ShippedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateTransferNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"TRF-{today:yyyyMMdd}-";

        var lastTransfer = await DbSet
            .Where(t => t.TransferNumber.StartsWith(prefix))
            .OrderByDescending(t => t.TransferNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastTransfer == null)
        {
            return $"{prefix}0001";
        }

        var lastNumberStr = lastTransfer.TransferNumber.Substring(prefix.Length);
        if (int.TryParse(lastNumberStr, out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
