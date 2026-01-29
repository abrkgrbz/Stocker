using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class QualityInspectionRepository : IQualityInspectionRepository
{
    private readonly ManufacturingDbContext _context;

    public QualityInspectionRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<QualityInspection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<QualityInspection?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.QualityInspections
            .Include(x => x.Details)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<QualityInspection?> GetByInspectionNumberAsync(Guid tenantId, string inspectionNumber, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.InspectionNumber == inspectionNumber, cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.Where(x => x.TenantId == tenantId).OrderByDescending(x => x.InspectionDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.Where(x => x.ProductionOrderId == productionOrderId).OrderByDescending(x => x.InspectionDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetByProductAsync(Guid tenantId, Guid productId, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.Where(x => x.TenantId == tenantId && x.ProductId == productId).OrderByDescending(x => x.InspectionDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetByTypeAsync(Guid tenantId, string inspectionType, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.Where(x => x.TenantId == tenantId && x.InspectionType == inspectionType).OrderByDescending(x => x.InspectionDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetByResultAsync(Guid tenantId, string result, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.Where(x => x.TenantId == tenantId && x.Result == result).OrderByDescending(x => x.InspectionDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetByInspectorAsync(Guid inspectorId, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.Where(x => x.InspectorId == inspectorId).OrderByDescending(x => x.InspectionDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => await _context.QualityInspections
            .Where(x => x.TenantId == tenantId && x.InspectionDate >= startDate && x.InspectionDate <= endDate)
            .OrderByDescending(x => x.InspectionDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetOpenAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.Where(x => x.TenantId == tenantId && x.Status == "Açık").OrderByDescending(x => x.InspectionDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<QualityInspection>> GetWithNonConformanceAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.Where(x => x.TenantId == tenantId && x.HasNonConformance).OrderByDescending(x => x.InspectionDate).ToListAsync(cancellationToken);

    public async Task<string> GenerateInspectionNumberAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var prefix = $"QI{DateTime.UtcNow:yyMM}";
        var lastInspection = await _context.QualityInspections
            .Where(x => x.TenantId == tenantId && x.InspectionNumber.StartsWith(prefix))
            .OrderByDescending(x => x.InspectionNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastInspection != null && int.TryParse(lastInspection.InspectionNumber.Substring(prefix.Length), out var lastSequence))
        {
            sequence = lastSequence + 1;
        }

        return $"{prefix}{sequence:D5}";
    }

    public async Task AddAsync(QualityInspection inspection, CancellationToken cancellationToken = default)
        => await _context.QualityInspections.AddAsync(inspection, cancellationToken);

    public void Update(QualityInspection inspection)
        => _context.QualityInspections.Update(inspection);

    public void Delete(QualityInspection inspection)
        => _context.QualityInspections.Remove(inspection);
}
