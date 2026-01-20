using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for LotBatch entity
/// </summary>
public class LotBatchRepository : BaseRepository<LotBatch>, ILotBatchRepository
{
    public LotBatchRepository(InventoryDbContext context) : base(context)
    {
    }

    public override async Task<IReadOnlyList<LotBatch>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Product)
            .Where(l => !l.IsDeleted)
            .OrderBy(l => l.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<LotBatch?> GetByLotNumberAsync(string lotNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Product)
            .Where(l => !l.IsDeleted && l.LotNumber == lotNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LotBatch>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Product)
            .Where(l => !l.IsDeleted && l.ProductId == productId)
            .OrderBy(l => l.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LotBatch>> GetByStatusAsync(LotBatchStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Product)
            .Where(l => !l.IsDeleted && l.Status == status)
            .OrderBy(l => l.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LotBatch>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Product)
            .Where(l => !l.IsDeleted && l.SupplierId == supplierId)
            .OrderBy(l => l.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LotBatch>> GetExpiredLotsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Include(l => l.Product)
            .Where(l => !l.IsDeleted && l.ExpiryDate.HasValue && l.ExpiryDate.Value < now)
            .OrderBy(l => l.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LotBatch>> GetExpiringLotsAsync(int withinDays, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var expiryDate = now.AddDays(withinDays);
        return await DbSet
            .Include(l => l.Product)
            .Where(l => !l.IsDeleted && l.ExpiryDate.HasValue &&
                   l.ExpiryDate.Value >= now && l.ExpiryDate.Value <= expiryDate)
            .OrderBy(l => l.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LotBatch>> GetQuarantinedLotsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Product)
            .Where(l => !l.IsDeleted && l.Status == LotBatchStatus.Quarantined)
            .OrderBy(l => l.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LotBatch>> GetAvailableLotsAsync(int productId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(l => !l.IsDeleted &&
                   l.ProductId == productId &&
                   l.Status == LotBatchStatus.Approved &&
                   l.AvailableQuantity > 0 &&
                   (!l.ExpiryDate.HasValue || l.ExpiryDate.Value > now))
            .OrderBy(l => l.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LotBatch>> GetByFEFOAsync(int productId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(l => !l.IsDeleted &&
                   l.ProductId == productId &&
                   l.Status == LotBatchStatus.Approved &&
                   l.AvailableQuantity > 0 &&
                   (!l.ExpiryDate.HasValue || l.ExpiryDate.Value > now))
            .OrderBy(l => l.ExpiryDate ?? DateTime.MaxValue)
            .ThenBy(l => l.ReceivedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(string lotNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(l => !l.IsDeleted && l.LotNumber == lotNumber, cancellationToken);
    }
}
