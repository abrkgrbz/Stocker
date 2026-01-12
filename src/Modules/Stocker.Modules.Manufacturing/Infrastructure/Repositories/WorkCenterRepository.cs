using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class WorkCenterRepository : IWorkCenterRepository
{
    private readonly ManufacturingDbContext _context;

    public WorkCenterRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<WorkCenter?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.WorkCenters.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<WorkCenter?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.WorkCenters.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Code == code, cancellationToken);

    public async Task<IReadOnlyList<WorkCenter>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.WorkCenters.Where(x => x.TenantId == tenantId).OrderBy(x => x.Code).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<WorkCenter>> GetActiveAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.WorkCenters.Where(x => x.TenantId == tenantId && x.IsActive).OrderBy(x => x.Code).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<WorkCenter>> GetByTypeAsync(Guid tenantId, string type, CancellationToken cancellationToken = default)
    {
        var workCenterType = Enum.Parse<WorkCenterType>(type, true);
        return await _context.WorkCenters.Where(x => x.TenantId == tenantId && x.Type == workCenterType).OrderBy(x => x.Code).ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.WorkCenters.AnyAsync(x => x.TenantId == tenantId && x.Code == code, cancellationToken);

    public async Task<bool> HasActiveOperationsAsync(int id, CancellationToken cancellationToken = default)
        => await _context.ProductionOperations.AnyAsync(x => x.WorkCenterId == id && x.Status != ProductionOperationStatus.Tamamlandı && x.Status != ProductionOperationStatus.İptal, cancellationToken);

    public async Task AddAsync(WorkCenter workCenter, CancellationToken cancellationToken = default)
        => await _context.WorkCenters.AddAsync(workCenter, cancellationToken);

    public void Update(WorkCenter workCenter)
        => _context.WorkCenters.Update(workCenter);

    public void Delete(WorkCenter workCenter)
        => _context.WorkCenters.Remove(workCenter);
}
