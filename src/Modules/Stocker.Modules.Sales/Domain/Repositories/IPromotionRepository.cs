using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for Promotion entity
/// </summary>
public interface IPromotionRepository : IRepository<Promotion>
{
    Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Promotion>> GetActivePromotionsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Promotion>> GetByStatusAsync(PromotionStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Promotion>> GetByTypeAsync(PromotionType type, CancellationToken cancellationToken = default);
}
