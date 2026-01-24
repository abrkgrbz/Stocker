using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for ServiceOrder entity
/// </summary>
public interface IServiceOrderRepository : IRepository<ServiceOrder>
{
    Task<ServiceOrder?> GetByServiceOrderNumberAsync(string serviceOrderNumber, CancellationToken cancellationToken = default);
    Task<ServiceOrder?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServiceOrder>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServiceOrder>> GetByStatusAsync(ServiceOrderStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServiceOrder>> GetByTypeAsync(ServiceOrderType type, CancellationToken cancellationToken = default);
    Task<string> GenerateServiceOrderNumberAsync(CancellationToken cancellationToken = default);
}
