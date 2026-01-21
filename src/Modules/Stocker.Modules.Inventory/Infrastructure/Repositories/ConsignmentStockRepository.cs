using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ConsignmentStock entity
/// </summary>
public class ConsignmentStockRepository : BaseRepository<ConsignmentStock>, IConsignmentStockRepository
{
    public ConsignmentStockRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<ConsignmentStock?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Include(c => c.Warehouse)
            .Include(c => c.Location)
            .Where(c => !c.IsDeleted && c.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ConsignmentStock?> GetByIdWithMovementsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Include(c => c.Warehouse)
            .Include(c => c.Location)
            .Include(c => c.Movements.OrderByDescending(m => m.MovementDate))
            .Where(c => !c.IsDeleted && c.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ConsignmentStock?> GetByNumberAsync(string consignmentNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.ConsignmentNumber == consignmentNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConsignmentStock>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Product)
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.SupplierId == supplierId)
            .OrderByDescending(c => c.AgreementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConsignmentStock>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.ProductId == productId)
            .OrderByDescending(c => c.AgreementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConsignmentStock>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Where(c => !c.IsDeleted && c.WarehouseId == warehouseId)
            .OrderByDescending(c => c.AgreementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConsignmentStock>> GetByStatusAsync(ConsignmentStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Status == status)
            .OrderByDescending(c => c.AgreementDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConsignmentStock>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Status == ConsignmentStatus.Active)
            .OrderBy(c => c.Supplier.Name)
            .ThenBy(c => c.Product.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConsignmentStock>> GetRequiringReconciliationAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Where(c => !c.IsDeleted && c.Status == ConsignmentStatus.Active &&
                (c.NextReconciliationDate == null || c.NextReconciliationDate <= today))
            .OrderBy(c => c.NextReconciliationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConsignmentStock>> GetExpiringAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Where(c => !c.IsDeleted && c.Status == ConsignmentStatus.Active &&
                c.ExpiryDate.HasValue && c.ExpiryDate <= beforeDate)
            .OrderBy(c => c.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConsignmentStock>> GetWithOutstandingBalanceAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Supplier)
            .Include(c => c.Product)
            .Where(c => !c.IsDeleted && c.TotalSalesAmount > c.PaidAmount)
            .OrderByDescending(c => c.TotalSalesAmount - c.PaidAmount)
            .ToListAsync(cancellationToken);
    }
}
