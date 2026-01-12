using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class BillOfMaterialRepository : IBillOfMaterialRepository
{
    private readonly ManufacturingDbContext _context;

    public BillOfMaterialRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<BillOfMaterial?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<BillOfMaterial?> GetByIdWithLinesAsync(int id, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials
            .Include(x => x.Lines)
            .Include(x => x.CoProducts)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<BillOfMaterial?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Code == code, cancellationToken);

    public async Task<BillOfMaterial?> GetByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials
            .Where(x => x.TenantId == tenantId && x.ProductId == productId)
            .OrderByDescending(x => x.Version)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<BillOfMaterial?> GetActiveByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials
            .Where(x => x.TenantId == tenantId && x.ProductId == productId && x.Status == BomStatus.Aktif && x.IsActive)
            .OrderByDescending(x => x.Version)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<BillOfMaterial>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials.Where(x => x.TenantId == tenantId).OrderBy(x => x.Code).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<BillOfMaterial>> GetByStatusAsync(Guid tenantId, string status, CancellationToken cancellationToken = default)
    {
        if (Enum.TryParse<BomStatus>(status, out var statusEnum))
        {
            return await _context.BillOfMaterials
                .Where(x => x.TenantId == tenantId && x.Status == statusEnum)
                .OrderBy(x => x.Code)
                .ToListAsync(cancellationToken);
        }
        return new List<BillOfMaterial>();
    }

    public async Task<IReadOnlyList<BillOfMaterial>> GetVersionsAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials.Where(x => x.TenantId == tenantId && x.ProductId == productId).OrderByDescending(x => x.Version).ToListAsync(cancellationToken);

    public async Task<int> GetNextVersionAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
    {
        var maxRevision = await _context.BillOfMaterials
            .Where(x => x.TenantId == tenantId && x.ProductId == productId)
            .MaxAsync(x => (int?)x.RevisionNumber, cancellationToken);
        return (maxRevision ?? 0) + 1;
    }

    public async Task<bool> ExistsAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials.AnyAsync(x => x.TenantId == tenantId && x.Code == code, cancellationToken);

    public async Task<bool> HasActiveProductionOrdersAsync(int id, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.AnyAsync(x => x.BomId == id &&
            x.Status != ProductionOrderStatus.Tamamlandı &&
            x.Status != ProductionOrderStatus.Kapatıldı &&
            x.Status != ProductionOrderStatus.İptal, cancellationToken);

    public async Task AddAsync(BillOfMaterial bom, CancellationToken cancellationToken = default)
        => await _context.BillOfMaterials.AddAsync(bom, cancellationToken);

    public void Update(BillOfMaterial bom)
        => _context.BillOfMaterials.Update(bom);

    public void Delete(BillOfMaterial bom)
        => _context.BillOfMaterials.Remove(bom);
}
