using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for Warranty entity
/// </summary>
public interface IWarrantyRepository : IRepository<Warranty>
{
    Task<Warranty?> GetByWarrantyNumberAsync(string warrantyNumber, CancellationToken cancellationToken = default);
    Task<Warranty?> GetWithClaimsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Warranty>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Warranty>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Warranty>> GetByStatusAsync(WarrantyStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Warranty>> GetExpiringWarrantiesAsync(int daysUntilExpiry = 30, CancellationToken cancellationToken = default);
    Task<string> GenerateWarrantyNumberAsync(CancellationToken cancellationToken = default);
}
