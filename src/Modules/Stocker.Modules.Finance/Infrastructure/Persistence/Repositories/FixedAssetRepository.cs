using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for FixedAsset entity
/// Sabit Kıymet repository implementasyonu
/// </summary>
public class FixedAssetRepository : FinanceGenericRepository<FixedAsset>, IFixedAssetRepository
{
    public FixedAssetRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<FixedAsset?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(f => f.Code == code, cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetByCategoryAsync(FixedAssetCategory category, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.Category == category)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetByTypeAsync(FixedAssetType assetType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.AssetType == assetType)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetByStatusAsync(FixedAssetStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.Status == status)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetByLocationAsync(int locationId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.LocationId == locationId)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.DepartmentId == departmentId)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetByCustodianAsync(int custodianUserId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.CustodianUserId == custodianUserId)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.IsActive && f.Status == FixedAssetStatus.InService)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetDueForDepreciationAsync(DateTime asOfDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.IsActive &&
                        f.Status == FixedAssetStatus.InService &&
                        !f.IsFullyDepreciated &&
                        f.AcquisitionDate <= asOfDate)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetFullyDepreciatedAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.IsFullyDepreciated)
            .OrderBy(f => f.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetWarrantyExpiringAsync(int daysBeforeExpiry = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var expiryDate = today.AddDays(daysBeforeExpiry);

        return await _dbSet
            .Where(f => f.IsActive &&
                        f.WarrantyEndDate.HasValue &&
                        f.WarrantyEndDate.Value >= today &&
                        f.WarrantyEndDate.Value <= expiryDate)
            .OrderBy(f => f.WarrantyEndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FixedAsset>> GetInsuranceExpiringAsync(int daysBeforeExpiry = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var expiryDate = today.AddDays(daysBeforeExpiry);

        return await _dbSet
            .Where(f => f.IsActive &&
                        f.InsuranceEndDate.HasValue &&
                        f.InsuranceEndDate.Value >= today &&
                        f.InsuranceEndDate.Value <= expiryDate)
            .OrderBy(f => f.InsuranceEndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<FixedAsset?> GetWithDepreciationsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Depreciations.OrderByDescending(d => d.PeriodEnd))
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<decimal> GetTotalNetBookValueAsync(string? currency = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(f => f.IsActive && f.Status == FixedAssetStatus.InService);

        if (!string.IsNullOrEmpty(currency))
        {
            query = query.Where(f => f.AcquisitionCost.Currency == currency);
        }

        return await query.SumAsync(f => f.NetBookValue.Amount, cancellationToken);
    }

    public async Task<Dictionary<FixedAssetCategory, decimal>> GetTotalNetBookValueByCategoryAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.IsActive && f.Status == FixedAssetStatus.InService)
            .GroupBy(f => f.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(f => f.NetBookValue.Amount) })
            .ToDictionaryAsync(x => x.Category, x => x.Total, cancellationToken);
    }
}
