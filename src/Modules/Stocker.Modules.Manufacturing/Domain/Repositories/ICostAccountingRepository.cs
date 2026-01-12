using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IProductionCostRecordRepository
{
    Task<ProductionCostRecord?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionCostRecord?> GetByRecordNumberAsync(string recordNumber, CancellationToken cancellationToken = default);
    Task<ProductionCostRecord?> GetWithAllocationsAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionCostRecord?> GetWithJournalEntriesAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionCostRecord?> GetFullRecordAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionCostRecord>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionCostRecord>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionCostRecord>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionCostRecord>> GetByPeriodAsync(int year, int month, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionCostRecord>> GetByAccountingMethodAsync(CostAccountingMethod method, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionCostRecord>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionCostRecord>> GetPendingFinalizationAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionCostRecord>> GetByCostCenterAsync(string costCenterId, CancellationToken cancellationToken = default);

    void Add(ProductionCostRecord record);
    void Update(ProductionCostRecord record);
    void Delete(ProductionCostRecord record);
    void AddAllocation(ProductionCostAllocation allocation);
    void AddJournalEntry(CostJournalEntry entry);
}

public interface ICostCenterRepository
{
    Task<CostCenter?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CostCenter?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<CostCenter?> GetWithChildrenAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostCenter>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostCenter>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostCenter>> GetByTypeAsync(CostCenterType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostCenter>> GetRootCostCentersAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostCenter>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default);

    void Add(CostCenter costCenter);
    void Update(CostCenter costCenter);
    void Delete(CostCenter costCenter);
}

public interface IStandardCostCardRepository
{
    Task<StandardCostCard?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<StandardCostCard?> GetCurrentByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StandardCostCard>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StandardCostCard>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StandardCostCard>> GetByYearAsync(int year, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StandardCostCard>> GetCurrentCardsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StandardCostCard>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);

    void Add(StandardCostCard card);
    void Update(StandardCostCard card);
    void Delete(StandardCostCard card);
}
