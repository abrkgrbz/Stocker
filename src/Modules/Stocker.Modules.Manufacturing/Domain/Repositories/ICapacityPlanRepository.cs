using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface ICapacityPlanRepository
{
    Task<CapacityPlan?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CapacityPlan?> GetByPlanNumberAsync(string planNumber, CancellationToken cancellationToken = default);
    Task<CapacityPlan?> GetWithRequirementsAsync(int id, CancellationToken cancellationToken = default);
    Task<CapacityPlan?> GetWithExceptionsAsync(int id, CancellationToken cancellationToken = default);
    Task<CapacityPlan?> GetFullPlanAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CapacityPlan>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CapacityPlan>> GetByMrpPlanAsync(int mrpPlanId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CapacityPlan>> GetByStatusAsync(CapacityPlanStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CapacityPlan>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CapacityRequirement>> GetRequirementsByWorkCenterAsync(int workCenterId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CapacityRequirement>> GetRequirementsByPlanAsync(int capacityPlanId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CapacityRequirement>> GetOverloadedRequirementsAsync(int capacityPlanId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CapacityException>> GetUnresolvedExceptionsAsync(int capacityPlanId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CapacityLoadDetail>> GetLoadDetailsByRequirementAsync(int requirementId, CancellationToken cancellationToken = default);

    void Add(CapacityPlan plan);
    void Update(CapacityPlan plan);
    void Delete(CapacityPlan plan);

    void AddRequirement(CapacityRequirement requirement);
    void AddException(CapacityException exception);
    void AddLoadDetail(CapacityLoadDetail detail);
}
