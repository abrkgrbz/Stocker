using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for SerialNumber entity
/// </summary>
public class SerialNumberRepository : BaseRepository<SerialNumber>, ISerialNumberRepository
{
    public SerialNumberRepository(InventoryDbContext context) : base(context)
    {
    }

    public override async Task<IReadOnlyList<SerialNumber>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted)
            .OrderBy(s => s.Serial)
            .ToListAsync(cancellationToken);
    }

    public async Task<SerialNumber?> GetBySerialAsync(string serial, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.Serial == serial)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SerialNumber>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.ProductId == productId)
            .OrderBy(s => s.Serial)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SerialNumber>> GetByStatusAsync(SerialNumberStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.Status == status)
            .OrderBy(s => s.Serial)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SerialNumber>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.WarehouseId == warehouseId)
            .OrderBy(s => s.Serial)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SerialNumber>> GetByCustomerAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.CustomerId == customerId)
            .OrderBy(s => s.Serial)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SerialNumber>> GetUnderWarrantyAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.WarrantyEndDate.HasValue && s.WarrantyEndDate.Value > now)
            .OrderBy(s => s.WarrantyEndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SerialNumber>> GetExpiringWarrantyAsync(int withinDays, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var expiryDate = now.AddDays(withinDays);
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.WarrantyEndDate.HasValue &&
                   s.WarrantyEndDate.Value > now && s.WarrantyEndDate.Value <= expiryDate)
            .OrderBy(s => s.WarrantyEndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SerialNumber>> GetAvailableByProductAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted &&
                   s.ProductId == productId &&
                   s.WarehouseId == warehouseId &&
                   s.Status == SerialNumberStatus.Available)
            .OrderBy(s => s.Serial)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(string serial, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(s => !s.IsDeleted && s.Serial == serial, cancellationToken);
    }
}
