using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

/// <summary>
/// Uygunsuzluk Raporu (NCR) repository implementasyonu
/// </summary>
public class NonConformanceReportRepository : INonConformanceReportRepository
{
    private readonly ManufacturingDbContext _context;

    public NonConformanceReportRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    #region Basic CRUD

    public async Task<NonConformanceReport?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<NonConformanceReport?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Include(x => x.CapaActions).ThenInclude(c => c.Tasks)
            .Include(x => x.ContainmentActions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<NonConformanceReport?> GetByNcrNumberAsync(string ncrNumber, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports.FirstOrDefaultAsync(x => x.NcrNumber == ncrNumber, cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports.OrderByDescending(x => x.DetectionDate).ToListAsync(cancellationToken);

    public async Task AddAsync(NonConformanceReport ncr, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports.AddAsync(ncr, cancellationToken);

    public void Update(NonConformanceReport ncr)
        => _context.NonConformanceReports.Update(ncr);

    public void Delete(NonConformanceReport ncr)
        => _context.NonConformanceReports.Remove(ncr);

    #endregion

    #region Status-Based Queries

    public async Task<IReadOnlyList<NonConformanceReport>> GetByStatusAsync(NcrStatus status, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.Status == status)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetOpenNcrsAsync(CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.Status != NcrStatus.Kapatıldı && x.Status != NcrStatus.İptal)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetClosedNcrsAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.NonConformanceReports.Where(x => x.Status == NcrStatus.Kapatıldı);

        if (fromDate.HasValue)
            query = query.Where(x => x.ClosedDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.ClosedDate <= toDate.Value);

        return await query.OrderByDescending(x => x.ClosedDate).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<NonConformanceReport>> GetOverdueNcrsAsync(CancellationToken cancellationToken = default)
    {
        // NCRs open for more than 30 days
        var overdueDate = DateTime.UtcNow.AddDays(-30);
        return await _context.NonConformanceReports
            .Where(x => x.Status != NcrStatus.Kapatıldı && x.Status != NcrStatus.İptal && x.DetectionDate < overdueDate)
            .OrderBy(x => x.DetectionDate)
            .ToListAsync(cancellationToken);
    }

    #endregion

    #region Reference-Based Queries

    public async Task<IReadOnlyList<NonConformanceReport>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.ProductionOrderId == productionOrderId)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.ProductId == productId)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.WorkCenterId == workCenterId)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetByQualityInspectionAsync(int qualityInspectionId, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.QualityInspectionId == qualityInspectionId)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Source-Based Queries

    public async Task<IReadOnlyList<NonConformanceReport>> GetBySourceAsync(NcrSource source, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.Source == source)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetBySeverityAsync(NcrSeverity severity, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.Severity == severity)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Customer/Supplier Queries

    public async Task<IReadOnlyList<NonConformanceReport>> GetByCustomerAsync(int customerId, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.SupplierId == supplierId)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetPendingCustomerNotificationAsync(CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.CustomerNotificationRequired && !x.CustomerNotified)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Date-Based Queries

    public async Task<IReadOnlyList<NonConformanceReport>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.DetectionDate >= startDate && x.DetectionDate <= endDate)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetByDetectionDateAsync(DateTime date, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.DetectionDate.Date == date.Date)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Lot/Serial Queries

    public async Task<IReadOnlyList<NonConformanceReport>> GetByLotNumberAsync(string lotNumber, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.LotNumber == lotNumber)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NonConformanceReport>> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports
            .Where(x => x.SerialNumber == serialNumber)
            .OrderByDescending(x => x.DetectionDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Statistics Queries

    public async Task<int> GetCountByStatusAsync(NcrStatus status, CancellationToken cancellationToken = default)
        => await _context.NonConformanceReports.CountAsync(x => x.Status == status, cancellationToken);

    public async Task<int> GetCountBySeverityAsync(NcrSeverity severity, DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.NonConformanceReports.Where(x => x.Severity == severity);

        if (fromDate.HasValue)
            query = query.Where(x => x.DetectionDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.DetectionDate <= toDate.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalCostAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.NonConformanceReports.AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(x => x.DetectionDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.DetectionDate <= toDate.Value);

        return await query.SumAsync(x => x.ActualCost ?? 0, cancellationToken);
    }

    public async Task<Dictionary<NcrSource, int>> GetCountBySourceAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.NonConformanceReports.AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(x => x.DetectionDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.DetectionDate <= toDate.Value);

        return await query
            .GroupBy(x => x.Source)
            .Select(g => new { Source = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Source, x => x.Count, cancellationToken);
    }

    public async Task<Dictionary<RootCauseCategory, int>> GetCountByRootCauseAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.NonConformanceReports.Where(x => x.RootCauseCategory.HasValue);

        if (fromDate.HasValue)
            query = query.Where(x => x.DetectionDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.DetectionDate <= toDate.Value);

        return await query
            .GroupBy(x => x.RootCauseCategory!.Value)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Category, x => x.Count, cancellationToken);
    }

    #endregion

    #region Number Generation

    public async Task<string> GenerateNcrNumberAsync(CancellationToken cancellationToken = default)
    {
        var prefix = $"NCR{DateTime.UtcNow:yyMM}";
        var lastNcr = await _context.NonConformanceReports
            .Where(x => x.NcrNumber.StartsWith(prefix))
            .OrderByDescending(x => x.NcrNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastNcr != null && int.TryParse(lastNcr.NcrNumber.Substring(prefix.Length), out var lastSequence))
        {
            sequence = lastSequence + 1;
        }

        return $"{prefix}{sequence:D5}";
    }

    #endregion
}

/// <summary>
/// Düzeltici/Önleyici Faaliyet (CAPA) repository implementasyonu
/// </summary>
public class CorrectivePreventiveActionRepository : ICorrectivePreventiveActionRepository
{
    private readonly ManufacturingDbContext _context;

    public CorrectivePreventiveActionRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    #region Basic CRUD

    public async Task<CorrectivePreventiveAction?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<CorrectivePreventiveAction?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Include(x => x.Tasks)
            .Include(x => x.NonConformanceReport)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<CorrectivePreventiveAction?> GetByCapaNumberAsync(string capaNumber, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions.FirstOrDefaultAsync(x => x.CapaNumber == capaNumber, cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions.OrderByDescending(x => x.CreatedDate).ToListAsync(cancellationToken);

    public async Task AddAsync(CorrectivePreventiveAction capa, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions.AddAsync(capa, cancellationToken);

    public void Update(CorrectivePreventiveAction capa)
        => _context.CorrectivePreventiveActions.Update(capa);

    public void Delete(CorrectivePreventiveAction capa)
        => _context.CorrectivePreventiveActions.Remove(capa);

    #endregion

    #region Status-Based Queries

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetByStatusAsync(CapaStatus status, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.Status == status)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetOpenCapasAsync(CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.Status != CapaStatus.Kapatıldı && x.Status != CapaStatus.İptal)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetClosedCapasAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.CorrectivePreventiveActions.Where(x => x.Status == CapaStatus.Kapatıldı);

        if (fromDate.HasValue)
            query = query.Where(x => x.ClosedDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.ClosedDate <= toDate.Value);

        return await query.OrderByDescending(x => x.ClosedDate).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetOverdueCapasAsync(CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.Status != CapaStatus.Kapatıldı && x.Status != CapaStatus.İptal && x.DueDate < DateTime.UtcNow)
            .OrderBy(x => x.DueDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Type-Based Queries

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetByTypeAsync(CapaType type, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.Type == type)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetCorrectiveActionsAsync(CancellationToken cancellationToken = default)
        => await GetByTypeAsync(CapaType.DüzelticiAksiyon, cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetPreventiveActionsAsync(CancellationToken cancellationToken = default)
        => await GetByTypeAsync(CapaType.ÖnleyiciAksiyon, cancellationToken);

    #endregion

    #region Priority-Based Queries

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetByPriorityAsync(CapaPriority priority, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.Priority == priority)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetHighPriorityCapasAsync(CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => (x.Priority == CapaPriority.Yüksek || x.Priority == CapaPriority.Acil)
                        && x.Status != CapaStatus.Kapatıldı && x.Status != CapaStatus.İptal)
            .OrderBy(x => x.DueDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region NCR-Based Queries

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetByNcrIdAsync(int ncrId, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.NonConformanceReportId == ncrId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetStandaloneCapasAsync(CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.NonConformanceReportId == null)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Responsibility-Based Queries

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetByResponsibleUserAsync(int userId, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.ResponsibleUserId == userId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetByDepartmentAsync(string department, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.ResponsibleDepartment == department)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Date-Based Queries

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetByDueDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.DueDate >= startDate && x.DueDate <= endDate)
            .OrderBy(x => x.DueDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetDueSoonAsync(int days, CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(days);
        return await _context.CorrectivePreventiveActions
            .Where(x => x.Status != CapaStatus.Kapatıldı && x.Status != CapaStatus.İptal
                        && x.DueDate <= cutoffDate && x.DueDate >= DateTime.UtcNow)
            .OrderBy(x => x.DueDate)
            .ToListAsync(cancellationToken);
    }

    #endregion

    #region Effectiveness Queries

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetPendingEffectivenessReviewAsync(CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.Status == CapaStatus.EtkinlikDeğerlendirme)
            .OrderBy(x => x.DueDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CorrectivePreventiveAction>> GetIneffectiveCapasAsync(CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions
            .Where(x => x.IsEffective == false)
            .OrderByDescending(x => x.ClosedDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Statistics Queries

    public async Task<int> GetCountByStatusAsync(CapaStatus status, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions.CountAsync(x => x.Status == status, cancellationToken);

    public async Task<int> GetCountByTypeAsync(CapaType type, CancellationToken cancellationToken = default)
        => await _context.CorrectivePreventiveActions.CountAsync(x => x.Type == type, cancellationToken);

    public async Task<decimal> GetAverageCompletionDaysAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.CorrectivePreventiveActions.Where(x => x.Status == CapaStatus.Kapatıldı && x.ClosedDate.HasValue);

        if (fromDate.HasValue)
            query = query.Where(x => x.ClosedDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.ClosedDate <= toDate.Value);

        var completedCapas = await query.ToListAsync(cancellationToken);

        if (!completedCapas.Any())
            return 0;

        return (decimal)completedCapas.Average(x => (x.ClosedDate!.Value - x.CreatedDate).TotalDays);
    }

    public async Task<decimal> GetOnTimeCompletionRateAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.CorrectivePreventiveActions.Where(x => x.Status == CapaStatus.Kapatıldı && x.ClosedDate.HasValue);

        if (fromDate.HasValue)
            query = query.Where(x => x.ClosedDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.ClosedDate <= toDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        if (totalCount == 0)
            return 0;

        var onTimeCount = await query.CountAsync(x => x.ClosedDate <= x.DueDate, cancellationToken);
        return (decimal)onTimeCount / totalCount * 100;
    }

    public async Task<Dictionary<RootCauseCategory, int>> GetCountByRootCauseAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var query = _context.CorrectivePreventiveActions.Where(x => x.RootCauseCategory.HasValue);

        if (fromDate.HasValue)
            query = query.Where(x => x.CreatedDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.CreatedDate <= toDate.Value);

        return await query
            .GroupBy(x => x.RootCauseCategory!.Value)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Category, x => x.Count, cancellationToken);
    }

    #endregion

    #region Number Generation

    public async Task<string> GenerateCapaNumberAsync(CancellationToken cancellationToken = default)
    {
        var prefix = $"CAPA{DateTime.UtcNow:yyMM}";
        var lastCapa = await _context.CorrectivePreventiveActions
            .Where(x => x.CapaNumber.StartsWith(prefix))
            .OrderByDescending(x => x.CapaNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastCapa != null && int.TryParse(lastCapa.CapaNumber.Substring(prefix.Length), out var lastSequence))
        {
            sequence = lastSequence + 1;
        }

        return $"{prefix}{sequence:D5}";
    }

    #endregion
}
