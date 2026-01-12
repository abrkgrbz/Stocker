using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IProductionReceiptRepository
{
    Task<ProductionReceipt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductionReceipt?> GetByReceiptNumberAsync(Guid tenantId, string receiptNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionReceipt>> GetByProductionOrderAsync(Guid productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionReceipt>> GetByOperationAsync(Guid productionOperationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionReceipt>> GetByProductAsync(Guid tenantId, Guid productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionReceipt>> GetByLotAsync(Guid tenantId, string lotNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionReceipt>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionReceipt>> GetPendingQualityCheckAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionReceipt>> GetPendingApprovalAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalReceivedAsync(Guid productionOrderId, CancellationToken cancellationToken = default);
    Task<string> GenerateReceiptNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(ProductionReceipt receipt, CancellationToken cancellationToken = default);
    void Update(ProductionReceipt receipt);
    void Delete(ProductionReceipt receipt);
}
