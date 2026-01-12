using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class RoutingRepository : IRoutingRepository
{
    private readonly ManufacturingDbContext _context;

    public RoutingRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<Routing?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.Routings.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Routing?> GetByIdWithOperationsAsync(int id, CancellationToken cancellationToken = default)
        => await _context.Routings
            .Include(x => x.Operations)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Routing?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.Routings.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Code == code, cancellationToken);

    public async Task<Routing?> GetByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
        => await _context.Routings
            .Where(x => x.TenantId == tenantId && x.ProductId == productId)
            .OrderByDescending(x => x.Version)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<Routing?> GetActiveByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
        => await _context.Routings
            .Include(x => x.Operations)
            .Where(x => x.TenantId == tenantId && x.ProductId == productId && x.Status == RoutingStatus.Aktif && x.IsActive)
            .OrderByDescending(x => x.Version)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<Routing>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.Routings.Where(x => x.TenantId == tenantId).OrderBy(x => x.Code).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Routing>> GetByStatusAsync(Guid tenantId, string status, CancellationToken cancellationToken = default)
    {
        var routingStatus = Enum.Parse<RoutingStatus>(status, true);
        return await _context.Routings.Where(x => x.TenantId == tenantId && x.Status == routingStatus).OrderBy(x => x.Code).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Routing>> GetVersionsAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
        => await _context.Routings.Where(x => x.TenantId == tenantId && x.ProductId == productId).OrderByDescending(x => x.Version).ToListAsync(cancellationToken);

    public async Task<int> GetNextVersionAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
    {
        var maxRevision = await _context.Routings
            .Where(x => x.TenantId == tenantId && x.ProductId == productId)
            .MaxAsync(x => (int?)x.RevisionNumber, cancellationToken);
        return (maxRevision ?? 0) + 1;
    }

    public async Task<bool> ExistsAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.Routings.AnyAsync(x => x.TenantId == tenantId && x.Code == code, cancellationToken);

    public async Task<bool> HasActiveProductionOrdersAsync(int id, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.AnyAsync(x => x.RoutingId == id && x.Status != ProductionOrderStatus.Tamamlandı && x.Status != ProductionOrderStatus.Kapatıldı && x.Status != ProductionOrderStatus.İptal, cancellationToken);

    public async Task AddAsync(Routing routing, CancellationToken cancellationToken = default)
        => await _context.Routings.AddAsync(routing, cancellationToken);

    public void Update(Routing routing)
        => _context.Routings.Update(routing);

    public void Delete(Routing routing)
        => _context.Routings.Remove(routing);
}
