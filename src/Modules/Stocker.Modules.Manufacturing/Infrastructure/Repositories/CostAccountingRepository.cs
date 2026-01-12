using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class ProductionCostRecordRepository : IProductionCostRecordRepository
{
    private readonly ManufacturingDbContext _context;

    public ProductionCostRecordRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<ProductionCostRecord?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ProductionCostRecord?> GetByRecordNumberAsync(string recordNumber, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .FirstOrDefaultAsync(x => x.RecordNumber == recordNumber, cancellationToken);
    }

    public async Task<ProductionCostRecord?> GetWithAllocationsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Include(x => x.CostAllocations)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ProductionCostRecord?> GetWithJournalEntriesAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Include(x => x.JournalEntries)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ProductionCostRecord?> GetFullRecordAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Include(x => x.CostAllocations)
            .Include(x => x.JournalEntries)
            .Include(x => x.ProductionOrder)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionCostRecord>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionCostRecord>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Where(x => x.ProductionOrderId == productionOrderId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionCostRecord>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Where(x => x.ProductId == productId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionCostRecord>> GetByPeriodAsync(int year, int month, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Where(x => x.Year == year && x.Month == month)
            .OrderBy(x => x.RecordNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionCostRecord>> GetByAccountingMethodAsync(CostAccountingMethod method, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Where(x => x.AccountingMethod == method)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionCostRecord>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Where(x => x.CreatedDate >= startDate && x.CreatedDate <= endDate)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionCostRecord>> GetPendingFinalizationAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Where(x => !x.IsFinalized)
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionCostRecord>> GetByCostCenterAsync(string costCenterId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionCostRecords
            .Where(x => x.CostCenterId == costCenterId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public void Add(ProductionCostRecord record)
    {
        _context.ProductionCostRecords.Add(record);
    }

    public void Update(ProductionCostRecord record)
    {
        _context.ProductionCostRecords.Update(record);
    }

    public void Delete(ProductionCostRecord record)
    {
        _context.ProductionCostRecords.Remove(record);
    }

    public void AddAllocation(ProductionCostAllocation allocation)
    {
        _context.ProductionCostAllocations.Add(allocation);
    }

    public void AddJournalEntry(CostJournalEntry entry)
    {
        _context.CostJournalEntries.Add(entry);
    }
}

public class CostCenterRepository : ICostCenterRepository
{
    private readonly ManufacturingDbContext _context;

    public CostCenterRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<CostCenter?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.CostCenters
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<CostCenter?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.CostCenters
            .FirstOrDefaultAsync(x => x.Code == code, cancellationToken);
    }

    public async Task<CostCenter?> GetWithChildrenAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.CostCenters
            .Include(x => x.ChildCostCenters)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<CostCenter>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CostCenters
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CostCenter>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CostCenters
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CostCenter>> GetByTypeAsync(CostCenterType type, CancellationToken cancellationToken = default)
    {
        return await _context.CostCenters
            .Where(x => x.Type == type)
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CostCenter>> GetRootCostCentersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CostCenters
            .Where(x => x.ParentCostCenterId == null)
            .Include(x => x.ChildCostCenters)
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CostCenter>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default)
    {
        return await _context.CostCenters
            .Where(x => x.WorkCenterId == workCenterId)
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);
    }

    public void Add(CostCenter costCenter)
    {
        _context.CostCenters.Add(costCenter);
    }

    public void Update(CostCenter costCenter)
    {
        _context.CostCenters.Update(costCenter);
    }

    public void Delete(CostCenter costCenter)
    {
        _context.CostCenters.Remove(costCenter);
    }
}

public class StandardCostCardRepository : IStandardCostCardRepository
{
    private readonly ManufacturingDbContext _context;

    public StandardCostCardRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<StandardCostCard?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.StandardCostCards
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<StandardCostCard?> GetCurrentByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await _context.StandardCostCards
            .Where(x => x.ProductId == productId && x.IsCurrent)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StandardCostCard>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.StandardCostCards
            .OrderBy(x => x.ProductCode)
            .ThenByDescending(x => x.Year)
            .ThenByDescending(x => x.Version)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StandardCostCard>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await _context.StandardCostCards
            .Where(x => x.ProductId == productId)
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Version)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StandardCostCard>> GetByYearAsync(int year, CancellationToken cancellationToken = default)
    {
        return await _context.StandardCostCards
            .Where(x => x.Year == year)
            .OrderBy(x => x.ProductCode)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StandardCostCard>> GetCurrentCardsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.StandardCostCards
            .Where(x => x.IsCurrent)
            .OrderBy(x => x.ProductCode)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StandardCostCard>> GetPendingApprovalAsync(CancellationToken cancellationToken = default)
    {
        return await _context.StandardCostCards
            .Where(x => x.ApprovedDate == null)
            .OrderBy(x => x.ProductCode)
            .ToListAsync(cancellationToken);
    }

    public void Add(StandardCostCard card)
    {
        _context.StandardCostCards.Add(card);
    }

    public void Update(StandardCostCard card)
    {
        _context.StandardCostCards.Update(card);
    }

    public void Delete(StandardCostCard card)
    {
        _context.StandardCostCards.Remove(card);
    }
}
