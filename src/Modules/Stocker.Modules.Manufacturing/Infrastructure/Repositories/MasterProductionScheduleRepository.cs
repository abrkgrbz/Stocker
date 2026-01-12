using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class MasterProductionScheduleRepository : IMasterProductionScheduleRepository
{
    private readonly ManufacturingDbContext _context;

    public MasterProductionScheduleRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<MasterProductionSchedule?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.MasterProductionSchedules
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<MasterProductionSchedule?> GetByScheduleNumberAsync(Guid tenantId, string scheduleNumber, CancellationToken cancellationToken = default)
    {
        return await _context.MasterProductionSchedules
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.ScheduleNumber == scheduleNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<MasterProductionSchedule>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.MasterProductionSchedules
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MasterProductionSchedule>> GetByStatusAsync(Guid tenantId, MpsStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.MasterProductionSchedules
            .Where(x => x.TenantId == tenantId && x.Status == status)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<MasterProductionSchedule?> GetActiveAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.MasterProductionSchedules
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Status == MpsStatus.Aktif, cancellationToken);
    }

    public async Task<MasterProductionSchedule?> GetWithLinesAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.MasterProductionSchedules
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<MasterProductionSchedule>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.MasterProductionSchedules
            .Where(x => x.TenantId == tenantId &&
                        x.PeriodStart >= startDate &&
                        x.PeriodEnd <= endDate)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MpsLine>> GetLinesByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
    {
        return await _context.MpsLines
            .Where(x => x.TenantId == tenantId && x.ProductId == productId)
            .OrderBy(x => x.PeriodDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MpsLine>> GetLinesByPeriodAsync(int scheduleId, DateTime periodStart, DateTime periodEnd, CancellationToken cancellationToken = default)
    {
        return await _context.MpsLines
            .Where(x => x.MpsId == scheduleId &&
                        x.PeriodDate >= periodStart &&
                        x.PeriodDate <= periodEnd)
            .OrderBy(x => x.PeriodDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetAvailableToPromiseAsync(Guid tenantId, int productId, DateTime date, CancellationToken cancellationToken = default)
    {
        var line = await _context.MpsLines
            .Where(x => x.TenantId == tenantId &&
                        x.ProductId == productId &&
                        x.PeriodDate <= date)
            .OrderByDescending(x => x.PeriodDate)
            .FirstOrDefaultAsync(cancellationToken);

        return line?.AvailableToPromise ?? 0;
    }

    public void Add(MasterProductionSchedule schedule)
    {
        _context.MasterProductionSchedules.Add(schedule);
    }

    public void Update(MasterProductionSchedule schedule)
    {
        _context.MasterProductionSchedules.Update(schedule);
    }

    public void Delete(MasterProductionSchedule schedule)
    {
        _context.MasterProductionSchedules.Remove(schedule);
    }
}
