using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for CommissionPlan entity
/// </summary>
public interface ICommissionRepository : IRepository<CommissionPlan>
{
    Task<CommissionPlan?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CommissionPlan>> GetActiveCommissionsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CommissionPlan>> GetByTypeAsync(CommissionType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CommissionPlan>> GetBySalesPersonIdAsync(Guid salesPersonId, CancellationToken cancellationToken = default);
}
