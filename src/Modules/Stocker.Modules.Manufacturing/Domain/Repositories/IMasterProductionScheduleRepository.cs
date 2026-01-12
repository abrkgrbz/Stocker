using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IMasterProductionScheduleRepository
{
    Task<MasterProductionSchedule?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<MasterProductionSchedule?> GetByScheduleNumberAsync(Guid tenantId, string scheduleNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MasterProductionSchedule>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MasterProductionSchedule>> GetByStatusAsync(Guid tenantId, MpsStatus status, CancellationToken cancellationToken = default);
    Task<MasterProductionSchedule?> GetActiveAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<MasterProductionSchedule?> GetWithLinesAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MasterProductionSchedule>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MpsLine>> GetLinesByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MpsLine>> GetLinesByPeriodAsync(int scheduleId, DateTime periodStart, DateTime periodEnd, CancellationToken cancellationToken = default);
    Task<decimal> GetAvailableToPromiseAsync(Guid tenantId, int productId, DateTime date, CancellationToken cancellationToken = default);
    void Add(MasterProductionSchedule schedule);
    void Update(MasterProductionSchedule schedule);
    void Delete(MasterProductionSchedule schedule);
}
