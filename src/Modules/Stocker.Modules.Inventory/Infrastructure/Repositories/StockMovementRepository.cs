using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for StockMovement entity
/// </summary>
public class StockMovementRepository : BaseRepository<StockMovement>, IStockMovementRepository
{
    public StockMovementRepository(InventoryDbContext context) : base(context)
    {
    }

    /// <summary>
    /// Override to include Product and Warehouse for list display
    /// </summary>
    public override async Task<IReadOnlyList<StockMovement>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => !m.IsDeleted)
            .OrderByDescending(m => m.MovementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<StockMovement?> GetWithDetailsAsync(int movementId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Include(m => m.FromLocation)
            .Include(m => m.ToLocation)
            .Where(m => !m.IsDeleted && m.Id == movementId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => !m.IsDeleted && m.DocumentNumber == documentNumber)
            .OrderByDescending(m => m.MovementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Warehouse)
            .Where(m => !m.IsDeleted && m.ProductId == productId)
            .OrderByDescending(m => m.MovementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Product)
            .Where(m => !m.IsDeleted && m.WarehouseId == warehouseId)
            .OrderByDescending(m => m.MovementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByTypeAsync(StockMovementType type, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => !m.IsDeleted && m.MovementType == type)
            .OrderByDescending(m => m.MovementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => !m.IsDeleted && m.MovementDate >= startDate && m.MovementDate <= endDate)
            .OrderByDescending(m => m.MovementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByReferenceAsync(string referenceDocumentType, string referenceDocumentNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => !m.IsDeleted && m.ReferenceDocumentType == referenceDocumentType && m.ReferenceDocumentNumber == referenceDocumentNumber)
            .OrderByDescending(m => m.MovementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<StockMovement?> GetLastMovementAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => !m.IsDeleted && m.ProductId == productId && m.WarehouseId == warehouseId)
            .OrderByDescending(m => m.MovementDate)
            .ThenByDescending(m => m.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<long> GetNextSequenceNumberAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        var maxSequence = await DbSet
            .Where(m => m.ProductId == productId && m.WarehouseId == warehouseId)
            .MaxAsync(m => (long?)m.SequenceNumber, cancellationToken) ?? 0L;

        return maxSequence + 1;
    }

    public async Task<string> GenerateDocumentNumberAsync(StockMovementType movementType, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var typePrefix = movementType switch
        {
            StockMovementType.Purchase => "PUR",
            StockMovementType.Sales => "SAL",
            StockMovementType.PurchaseReturn => "PRR",
            StockMovementType.SalesReturn => "SRR",
            StockMovementType.Transfer => "TRF",
            StockMovementType.Production => "PRD",
            StockMovementType.Consumption => "CON",
            StockMovementType.AdjustmentIncrease => "ADI",
            StockMovementType.AdjustmentDecrease => "ADD",
            StockMovementType.Opening => "OPN",
            StockMovementType.Counting => "CNT",
            StockMovementType.Damage => "DMG",
            StockMovementType.Loss => "LOS",
            StockMovementType.Found => "FND",
            _ => "MOV"
        };
        var prefix = $"{typePrefix}-{today:yyyyMMdd}-";

        var lastMovement = await DbSet
            .Where(m => m.DocumentNumber.StartsWith(prefix))
            .OrderByDescending(m => m.DocumentNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastMovement == null)
        {
            return $"{prefix}0001";
        }

        var lastNumberStr = lastMovement.DocumentNumber.Substring(prefix.Length);
        if (int.TryParse(lastNumberStr, out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
