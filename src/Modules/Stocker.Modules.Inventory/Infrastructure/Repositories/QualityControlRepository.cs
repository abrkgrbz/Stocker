using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for QualityControl entity
/// </summary>
public class QualityControlRepository : BaseRepository<QualityControl>, IQualityControlRepository
{
    public QualityControlRepository(InventoryDbContext context) : base(context)
    {
    }

    public override async Task<IReadOnlyList<QualityControl>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Product)
            .Include(q => q.Supplier)
            .Include(q => q.Warehouse)
            .Where(q => !q.IsDeleted)
            .OrderByDescending(q => q.InspectionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<QualityControl?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Product)
            .Include(q => q.Supplier)
            .Include(q => q.Warehouse)
            .Include(q => q.Items)
            .Include(q => q.Attachments)
            .Where(q => !q.IsDeleted && q.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<QualityControl?> GetByQcNumberAsync(string qcNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Product)
            .Include(q => q.Supplier)
            .Where(q => !q.IsDeleted && q.QcNumber == qcNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QualityControl>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Supplier)
            .Where(q => !q.IsDeleted && q.ProductId == productId)
            .OrderByDescending(q => q.InspectionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QualityControl>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Product)
            .Where(q => !q.IsDeleted && q.SupplierId == supplierId)
            .OrderByDescending(q => q.InspectionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QualityControl>> GetByStatusAsync(QualityControlStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Product)
            .Include(q => q.Supplier)
            .Where(q => !q.IsDeleted && q.Status == status)
            .OrderByDescending(q => q.InspectionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QualityControl>> GetByTypeAsync(QualityControlType qcType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Product)
            .Include(q => q.Supplier)
            .Where(q => !q.IsDeleted && q.QcType == qcType)
            .OrderByDescending(q => q.InspectionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QualityControl>> GetPendingAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Product)
            .Include(q => q.Supplier)
            .Where(q => !q.IsDeleted && q.Status == QualityControlStatus.Pending)
            .OrderBy(q => q.InspectionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QualityControl>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Product)
            .Include(q => q.Supplier)
            .Where(q => !q.IsDeleted && q.InspectionDate >= startDate && q.InspectionDate <= endDate)
            .OrderByDescending(q => q.InspectionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QualityControl>> GetFailedByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Supplier)
            .Where(q => !q.IsDeleted && q.ProductId == productId && q.Result == QualityControlResult.Failed)
            .OrderByDescending(q => q.InspectionDate)
            .ToListAsync(cancellationToken);
    }
}
