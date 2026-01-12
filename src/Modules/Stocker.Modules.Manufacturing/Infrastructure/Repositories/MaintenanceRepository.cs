using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

/// <summary>
/// Bakım planı repository implementasyonu
/// </summary>
public class MaintenancePlanRepository : IMaintenancePlanRepository
{
    private readonly ManufacturingDbContext _context;

    public MaintenancePlanRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<MaintenancePlan?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<MaintenancePlan?> GetByIdWithDetailsAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Include(x => x.Tasks.Where(t => t.IsActive))
            .Include(x => x.RequiredSpareParts)
                .ThenInclude(x => x.SparePart)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<MaintenancePlan?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .FirstOrDefaultAsync(x => x.Code == code && x.TenantId == tenantId, cancellationToken);

    public async Task<IReadOnlyList<MaintenancePlan>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenancePlan>> GetByMachineIdAsync(Guid tenantId, int machineId, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Where(x => x.MachineId == machineId && x.TenantId == tenantId && x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenancePlan>> GetByWorkCenterIdAsync(Guid tenantId, int workCenterId, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Where(x => x.WorkCenterId == workCenterId && x.TenantId == tenantId && x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenancePlan>> GetActivePlansAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Where(x => x.TenantId == tenantId && x.IsActive && x.Status == MaintenancePlanStatus.Aktif)
            .OrderBy(x => x.NextScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenancePlan>> GetDuePlansAsync(Guid tenantId, DateTime asOfDate, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Where(x => x.TenantId == tenantId && x.IsActive && x.Status == MaintenancePlanStatus.Aktif
                && x.NextScheduledDate.HasValue && x.NextScheduledDate.Value.Date == asOfDate.Date)
            .OrderBy(x => x.Priority)
            .ThenBy(x => x.NextScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenancePlan>> GetOverduePlansAsync(Guid tenantId, DateTime asOfDate, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Where(x => x.TenantId == tenantId && x.IsActive && x.Status == MaintenancePlanStatus.Aktif
                && x.NextScheduledDate.HasValue && x.NextScheduledDate.Value < asOfDate)
            .OrderBy(x => x.Priority)
            .ThenBy(x => x.NextScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenancePlan>> GetByTypeAsync(Guid tenantId, MaintenanceType maintenanceType, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Where(x => x.TenantId == tenantId && x.MaintenanceType == maintenanceType && x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenancePlan>> GetUpcomingPlansAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Where(x => x.TenantId == tenantId && x.IsActive && x.Status == MaintenancePlanStatus.Aktif
                && x.NextScheduledDate.HasValue
                && x.NextScheduledDate.Value >= startDate
                && x.NextScheduledDate.Value <= endDate)
            .OrderBy(x => x.NextScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<bool> ExistsWithCodeAsync(Guid tenantId, string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.MaintenancePlans.Where(x => x.Code == code && x.TenantId == tenantId);
        if (excludeId.HasValue)
            query = query.Where(x => x.Id != excludeId.Value);
        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(MaintenancePlan entity, CancellationToken cancellationToken = default)
        => await _context.MaintenancePlans.AddAsync(entity, cancellationToken);

    public Task DeleteAsync(MaintenancePlan entity, CancellationToken cancellationToken = default)
    {
        _context.MaintenancePlans.Remove(entity);
        return Task.CompletedTask;
    }
}

/// <summary>
/// Bakım görevi repository implementasyonu
/// </summary>
public class MaintenanceTaskRepository : IMaintenanceTaskRepository
{
    private readonly ManufacturingDbContext _context;

    public MaintenanceTaskRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<MaintenanceTask?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.MaintenanceTasks
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<MaintenanceTask?> GetByIdWithPlanAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.MaintenanceTasks
            .Include(x => x.MaintenancePlan)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<IReadOnlyList<MaintenanceTask>> GetByPlanIdAsync(Guid tenantId, int maintenancePlanId, CancellationToken cancellationToken = default)
        => await _context.MaintenanceTasks
            .Where(x => x.MaintenancePlanId == maintenancePlanId && x.TenantId == tenantId)
            .OrderBy(x => x.SequenceNumber)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenanceTask>> GetActiveTasksByPlanAsync(Guid tenantId, int maintenancePlanId, CancellationToken cancellationToken = default)
        => await _context.MaintenanceTasks
            .Where(x => x.MaintenancePlanId == maintenancePlanId && x.TenantId == tenantId && x.IsActive)
            .OrderBy(x => x.SequenceNumber)
            .ToListAsync(cancellationToken);

    public async Task<int> GetMaxSequenceAsync(Guid tenantId, int maintenancePlanId, CancellationToken cancellationToken = default)
    {
        var maxSeq = await _context.MaintenanceTasks
            .Where(x => x.MaintenancePlanId == maintenancePlanId && x.TenantId == tenantId)
            .MaxAsync(x => (int?)x.SequenceNumber, cancellationToken);
        return maxSeq ?? 0;
    }

    public async Task AddAsync(MaintenanceTask entity, CancellationToken cancellationToken = default)
        => await _context.MaintenanceTasks.AddAsync(entity, cancellationToken);

    public Task DeleteAsync(MaintenanceTask entity, CancellationToken cancellationToken = default)
    {
        _context.MaintenanceTasks.Remove(entity);
        return Task.CompletedTask;
    }
}

/// <summary>
/// Bakım kaydı repository implementasyonu
/// </summary>
public class MaintenanceRecordRepository : IMaintenanceRecordRepository
{
    private readonly ManufacturingDbContext _context;

    public MaintenanceRecordRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<MaintenanceRecord?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<MaintenanceRecord?> GetByIdWithDetailsAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Include(x => x.MaintenancePlan)
            .Include(x => x.RecordTasks)
                .ThenInclude(x => x.MaintenanceTask)
            .Include(x => x.UsedSpareParts)
                .ThenInclude(x => x.SparePart)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<MaintenanceRecord?> GetByRecordNumberAsync(Guid tenantId, string recordNumber, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .FirstOrDefaultAsync(x => x.RecordNumber == recordNumber && x.TenantId == tenantId, cancellationToken);

    public async Task<IReadOnlyList<MaintenanceRecord>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.ScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenanceRecord>> GetByPlanIdAsync(Guid tenantId, int maintenancePlanId, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .Where(x => x.MaintenancePlanId == maintenancePlanId && x.TenantId == tenantId)
            .OrderByDescending(x => x.ScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenanceRecord>> GetByMachineIdAsync(Guid tenantId, int machineId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = _context.MaintenanceRecords
            .Where(x => x.MachineId == machineId && x.TenantId == tenantId);

        if (startDate.HasValue)
            query = query.Where(x => x.ScheduledDate >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(x => x.ScheduledDate <= endDate.Value);

        return await query.OrderByDescending(x => x.ScheduledDate).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MaintenanceRecord>> GetByWorkCenterIdAsync(Guid tenantId, int workCenterId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = _context.MaintenanceRecords
            .Where(x => x.WorkCenterId == workCenterId && x.TenantId == tenantId);

        if (startDate.HasValue)
            query = query.Where(x => x.ScheduledDate >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(x => x.ScheduledDate <= endDate.Value);

        return await query.OrderByDescending(x => x.ScheduledDate).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MaintenanceRecord>> GetByStatusAsync(Guid tenantId, MaintenanceRecordStatus status, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Where(x => x.Status == status && x.TenantId == tenantId)
            .OrderBy(x => x.ScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenanceRecord>> GetPendingRecordsAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Where(x => x.TenantId == tenantId && (x.Status == MaintenanceRecordStatus.Açık || x.Status == MaintenanceRecordStatus.DevamEdiyor))
            .OrderBy(x => x.Priority)
            .ThenBy(x => x.ScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenanceRecord>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .Include(x => x.Machine)
            .Include(x => x.WorkCenter)
            .Where(x => x.TenantId == tenantId && x.ScheduledDate >= startDate && x.ScheduledDate <= endDate)
            .OrderBy(x => x.ScheduledDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaintenanceRecord>> GetByTypeAsync(Guid tenantId, MaintenanceType maintenanceType, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = _context.MaintenanceRecords
            .Where(x => x.MaintenanceType == maintenanceType && x.TenantId == tenantId);

        if (startDate.HasValue)
            query = query.Where(x => x.ScheduledDate >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(x => x.ScheduledDate <= endDate.Value);

        return await query.OrderByDescending(x => x.ScheduledDate).ToListAsync(cancellationToken);
    }

    public async Task<MaintenanceRecord?> GetLastRecordForMachineAsync(Guid tenantId, int machineId, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords
            .Where(x => x.MachineId == machineId && x.TenantId == tenantId && x.Status == MaintenanceRecordStatus.Onaylandı)
            .OrderByDescending(x => x.EndDate)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<decimal> GetTotalCostByMachineAsync(Guid tenantId, int machineId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = _context.MaintenanceRecords
            .Where(x => x.MachineId == machineId && x.TenantId == tenantId && x.Status == MaintenanceRecordStatus.Onaylandı);

        if (startDate.HasValue)
            query = query.Where(x => x.EndDate >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(x => x.EndDate <= endDate.Value);

        return await query.SumAsync(x => x.LaborCost + x.MaterialCost + x.ExternalServiceCost, cancellationToken);
    }

    public async Task<string> GenerateRecordNumberAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"MNT-{year}-";

        var lastNumber = await _context.MaintenanceRecords
            .Where(x => x.TenantId == tenantId && x.RecordNumber.StartsWith(prefix))
            .OrderByDescending(x => x.RecordNumber)
            .Select(x => x.RecordNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastNumber == null)
            return $"{prefix}00001";

        var numericPart = lastNumber.Replace(prefix, "");
        if (int.TryParse(numericPart, out int lastSeq))
            return $"{prefix}{(lastSeq + 1):D5}";

        return $"{prefix}00001";
    }

    public async Task<bool> ExistsWithRecordNumberAsync(Guid tenantId, string recordNumber, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.MaintenanceRecords.Where(x => x.RecordNumber == recordNumber && x.TenantId == tenantId);
        if (excludeId.HasValue)
            query = query.Where(x => x.Id != excludeId.Value);
        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(MaintenanceRecord entity, CancellationToken cancellationToken = default)
        => await _context.MaintenanceRecords.AddAsync(entity, cancellationToken);

    public Task DeleteAsync(MaintenanceRecord entity, CancellationToken cancellationToken = default)
    {
        _context.MaintenanceRecords.Remove(entity);
        return Task.CompletedTask;
    }
}

/// <summary>
/// Yedek parça repository implementasyonu
/// </summary>
public class SparePartRepository : ISparePartRepository
{
    private readonly ManufacturingDbContext _context;

    public SparePartRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<SparePart?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.SpareParts
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<SparePart?> GetByIdWithDetailsAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.SpareParts
            .Include(x => x.MaintenancePlans)
                .ThenInclude(x => x.MaintenancePlan)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<SparePart?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.SpareParts
            .FirstOrDefaultAsync(x => x.Code == code && x.TenantId == tenantId, cancellationToken);

    public async Task<IReadOnlyList<SparePart>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.SpareParts
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SparePart>> GetActivePartsAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.SpareParts
            .Where(x => x.TenantId == tenantId && x.IsActive && x.Status == SparePartStatus.Aktif)
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SparePart>> GetByCategoryAsync(Guid tenantId, string category, CancellationToken cancellationToken = default)
        => await _context.SpareParts
            .Where(x => x.TenantId == tenantId && x.Category == category && x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SparePart>> GetByCriticalityAsync(Guid tenantId, SparePartCriticality criticality, CancellationToken cancellationToken = default)
        => await _context.SpareParts
            .Where(x => x.TenantId == tenantId && x.Criticality == criticality && x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SparePart>> GetLowStockPartsAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.SpareParts
            .Where(x => x.TenantId == tenantId && x.IsActive && x.ReorderPoint > 0)
            .OrderBy(x => x.Criticality)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SparePart>> GetByMachineCompatibilityAsync(Guid tenantId, int machineId, CancellationToken cancellationToken = default)
    {
        var machineIdStr = machineId.ToString();
        return await _context.SpareParts
            .Where(x => x.TenantId == tenantId && x.IsActive
                && x.CompatibleMachines != null && x.CompatibleMachines.Contains(machineIdStr))
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SparePart>> SearchAsync(Guid tenantId, string searchTerm, CancellationToken cancellationToken = default)
    {
        var term = searchTerm.ToLower();
        return await _context.SpareParts
            .Where(x => x.TenantId == tenantId && x.IsActive
                && (x.Code.ToLower().Contains(term)
                    || x.Name.ToLower().Contains(term)
                    || (x.PartNumber != null && x.PartNumber.ToLower().Contains(term))
                    || (x.ManufacturerPartNo != null && x.ManufacturerPartNo.ToLower().Contains(term))))
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(Guid tenantId, string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.SpareParts.Where(x => x.Code == code && x.TenantId == tenantId);
        if (excludeId.HasValue)
            query = query.Where(x => x.Id != excludeId.Value);
        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(SparePart entity, CancellationToken cancellationToken = default)
        => await _context.SpareParts.AddAsync(entity, cancellationToken);

    public Task DeleteAsync(SparePart entity, CancellationToken cancellationToken = default)
    {
        _context.SpareParts.Remove(entity);
        return Task.CompletedTask;
    }
}

/// <summary>
/// Makine sayaç repository implementasyonu
/// </summary>
public class MachineCounterRepository : IMachineCounterRepository
{
    private readonly ManufacturingDbContext _context;

    public MachineCounterRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<MachineCounter?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.MachineCounters
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

    public async Task<MachineCounter?> GetByMachineAndNameAsync(Guid tenantId, int machineId, string counterName, CancellationToken cancellationToken = default)
        => await _context.MachineCounters
            .FirstOrDefaultAsync(x => x.MachineId == machineId && x.CounterName == counterName && x.TenantId == tenantId, cancellationToken);

    public async Task<IReadOnlyList<MachineCounter>> GetByMachineIdAsync(Guid tenantId, int machineId, CancellationToken cancellationToken = default)
        => await _context.MachineCounters
            .Where(x => x.MachineId == machineId && x.TenantId == tenantId)
            .OrderBy(x => x.CounterName)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MachineCounter>> GetCountersNeedingMaintenanceAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.MachineCounters
            .Include(x => x.Machine)
            .Where(x => x.TenantId == tenantId
                && ((x.WarningThreshold.HasValue && x.CurrentValue >= x.WarningThreshold.Value)
                    || (x.CriticalThreshold.HasValue && x.CurrentValue >= x.CriticalThreshold.Value)))
            .OrderByDescending(x => x.CriticalThreshold.HasValue && x.CurrentValue >= x.CriticalThreshold.Value)
            .ThenBy(x => x.Machine.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MachineCounter>> GetCountersAtWarningLevelAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.MachineCounters
            .Include(x => x.Machine)
            .Where(x => x.TenantId == tenantId
                && x.WarningThreshold.HasValue
                && x.CurrentValue >= x.WarningThreshold.Value
                && (!x.CriticalThreshold.HasValue || x.CurrentValue < x.CriticalThreshold.Value))
            .OrderBy(x => x.Machine.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MachineCounter>> GetCountersAtCriticalLevelAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.MachineCounters
            .Include(x => x.Machine)
            .Where(x => x.TenantId == tenantId
                && x.CriticalThreshold.HasValue
                && x.CurrentValue >= x.CriticalThreshold.Value)
            .OrderBy(x => x.Machine.Name)
            .ToListAsync(cancellationToken);

    public async Task AddAsync(MachineCounter entity, CancellationToken cancellationToken = default)
        => await _context.MachineCounters.AddAsync(entity, cancellationToken);

    public Task DeleteAsync(MachineCounter entity, CancellationToken cancellationToken = default)
    {
        _context.MachineCounters.Remove(entity);
        return Task.CompletedTask;
    }
}
