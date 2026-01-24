using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for Discount entity
/// </summary>
public interface IDiscountRepository : IRepository<Discount>
{
    Task<Discount?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Discount>> GetActiveDiscountsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Discount>> GetByTypeAsync(DiscountType type, CancellationToken cancellationToken = default);
}
