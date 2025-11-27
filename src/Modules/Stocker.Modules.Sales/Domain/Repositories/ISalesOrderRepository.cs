using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for SalesOrder entity
/// </summary>
public interface ISalesOrderRepository : IRepository<SalesOrder>
{
    Task<SalesOrder?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<SalesOrder?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesOrder>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesOrder>> GetByStatusAsync(SalesOrderStatus status, CancellationToken cancellationToken = default);
    Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken = default);
}
