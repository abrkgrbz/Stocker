using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

public interface ISalesTargetRepository : IRepository<SalesTarget>
{
    Task<SalesTarget?> GetByCodeAsync(string targetCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesTarget>> GetBySalesRepresentativeAsync(Guid salesRepId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesTarget>> GetByTeamAsync(Guid teamId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesTarget>> GetByYearAsync(int year, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesTarget>> GetByStatusAsync(SalesTargetStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesTarget>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<string> GenerateTargetCodeAsync(CancellationToken cancellationToken = default);
}
