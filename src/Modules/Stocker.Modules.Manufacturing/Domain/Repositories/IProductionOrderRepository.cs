using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IProductionOrderRepository
{
    Task<ProductionOrder?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionOrder?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionOrder?> GetByOrderNumberAsync(Guid tenantId, string orderNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOrder>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOrder>> GetByStatusAsync(Guid tenantId, string status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOrder>> GetByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOrder>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOrder>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOrder>> GetActiveAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOrder>> GetOverdueAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOrder>> GetBySalesOrderAsync(int salesOrderId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid tenantId, string orderNumber, CancellationToken cancellationToken = default);
    Task<string> GenerateOrderNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(ProductionOrder order, CancellationToken cancellationToken = default);
    void Update(ProductionOrder order);
    void Delete(ProductionOrder order);
}
