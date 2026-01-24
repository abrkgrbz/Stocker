using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

public interface IBackOrderRepository : IRepository<BackOrder>
{
    Task<BackOrder?> GetByNumberAsync(string backOrderNumber, CancellationToken cancellationToken = default);
    Task<BackOrder?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BackOrder>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BackOrder>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BackOrder>> GetByStatusAsync(BackOrderStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BackOrder>> GetPendingAsync(CancellationToken cancellationToken = default);
    Task<string> GenerateBackOrderNumberAsync(CancellationToken cancellationToken = default);
}
