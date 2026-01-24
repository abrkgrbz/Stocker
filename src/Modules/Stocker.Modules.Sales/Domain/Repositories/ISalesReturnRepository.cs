using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for SalesReturn entity
/// </summary>
public interface ISalesReturnRepository : IRepository<SalesReturn>
{
    Task<SalesReturn?> GetByReturnNumberAsync(string returnNumber, CancellationToken cancellationToken = default);
    Task<SalesReturn?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesReturn>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesReturn>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesReturn>> GetByStatusAsync(SalesReturnStatus status, CancellationToken cancellationToken = default);
    Task<string> GenerateReturnNumberAsync(CancellationToken cancellationToken = default);
}
