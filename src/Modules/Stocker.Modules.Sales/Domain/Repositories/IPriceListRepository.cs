using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for PriceList entity
/// </summary>
public interface IPriceListRepository : IRepository<PriceList>
{
    Task<PriceList?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<PriceList?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PriceList?> GetWithCustomersAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PriceList?> GetFullAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PriceList>> GetActiveListsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PriceList>> GetByTypeAsync(PriceListType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PriceList>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PriceList>> GetValidAtDateAsync(DateTime date, CancellationToken cancellationToken = default);
}
