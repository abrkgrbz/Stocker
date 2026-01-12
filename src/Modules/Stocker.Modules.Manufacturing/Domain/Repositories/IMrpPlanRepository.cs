using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IMrpPlanRepository
{
    Task<MrpPlan?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<MrpPlan?> GetByPlanNumberAsync(Guid tenantId, string planNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MrpPlan>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MrpPlan>> GetByStatusAsync(Guid tenantId, MrpPlanStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MrpPlan>> GetByTypeAsync(Guid tenantId, MrpPlanType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MrpPlan>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<MrpPlan?> GetLatestCompletedAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<MrpPlan?> GetWithRequirementsAsync(int id, CancellationToken cancellationToken = default);
    Task<MrpPlan?> GetWithPlannedOrdersAsync(int id, CancellationToken cancellationToken = default);
    Task<MrpPlan?> GetWithExceptionsAsync(int id, CancellationToken cancellationToken = default);
    Task<MrpPlan?> GetFullAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PlannedOrder>> GetPlannedOrdersByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PlannedOrder>> GetPlannedOrdersByStatusAsync(Guid tenantId, PlannedOrderStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MrpException>> GetUnresolvedExceptionsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    void Add(MrpPlan plan);
    void Update(MrpPlan plan);
    void Delete(MrpPlan plan);
}
