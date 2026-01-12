using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class ProductionOrderRepository : IProductionOrderRepository
{
    private readonly ManufacturingDbContext _context;

    public ProductionOrderRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<ProductionOrder?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<ProductionOrder?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders
            .Include(x => x.Lines)
            .Include(x => x.Operations)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<ProductionOrder?> GetByOrderNumberAsync(Guid tenantId, string orderNumber, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.OrderNumber == orderNumber, cancellationToken);

    public async Task<IReadOnlyList<ProductionOrder>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.Where(x => x.TenantId == tenantId).OrderByDescending(x => x.CreatedDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionOrder>> GetByStatusAsync(Guid tenantId, string status, CancellationToken cancellationToken = default)
    {
        // Parse status string to enum
        if (Enum.TryParse<ProductionOrderStatus>(status, out var statusEnum))
        {
            return await _context.ProductionOrders
                .Where(x => x.TenantId == tenantId && x.Status == statusEnum)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync(cancellationToken);
        }
        return new List<ProductionOrder>();
    }

    public async Task<IReadOnlyList<ProductionOrder>> GetByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.Where(x => x.TenantId == tenantId && x.ProductId == productId).OrderByDescending(x => x.CreatedDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionOrder>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders
            .Where(x => x.Operations.Any(o => o.WorkCenterId == workCenterId))
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionOrder>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders
            .Where(x => x.TenantId == tenantId && x.PlannedStartDate >= startDate && x.PlannedEndDate <= endDate)
            .OrderBy(x => x.PlannedStartDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionOrder>> GetActiveAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders
            .Where(x => x.TenantId == tenantId &&
                (x.Status == ProductionOrderStatus.Başladı ||
                 x.Status == ProductionOrderStatus.Serbest ||
                 x.Status == ProductionOrderStatus.Onaylandı))
            .OrderBy(x => x.PlannedStartDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionOrder>> GetOverdueAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders
            .Where(x => x.TenantId == tenantId &&
                x.PlannedEndDate < DateTime.UtcNow &&
                x.Status != ProductionOrderStatus.Tamamlandı &&
                x.Status != ProductionOrderStatus.Kapatıldı &&
                x.Status != ProductionOrderStatus.İptal)
            .OrderBy(x => x.PlannedEndDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionOrder>> GetBySalesOrderAsync(int salesOrderId, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.Where(x => x.SalesOrderId == salesOrderId).OrderByDescending(x => x.CreatedDate).ToListAsync(cancellationToken);

    public async Task<bool> ExistsAsync(Guid tenantId, string orderNumber, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.AnyAsync(x => x.TenantId == tenantId && x.OrderNumber == orderNumber, cancellationToken);

    public async Task<string> GenerateOrderNumberAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var prefix = $"PRD{DateTime.UtcNow:yyMM}";
        var lastOrder = await _context.ProductionOrders
            .Where(x => x.TenantId == tenantId && x.OrderNumber.StartsWith(prefix))
            .OrderByDescending(x => x.OrderNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastOrder != null && int.TryParse(lastOrder.OrderNumber.Substring(prefix.Length), out var lastSequence))
        {
            sequence = lastSequence + 1;
        }

        return $"{prefix}{sequence:D5}";
    }

    public async Task AddAsync(ProductionOrder order, CancellationToken cancellationToken = default)
        => await _context.ProductionOrders.AddAsync(order, cancellationToken);

    public void Update(ProductionOrder order)
        => _context.ProductionOrders.Update(order);

    public void Delete(ProductionOrder order)
        => _context.ProductionOrders.Remove(order);
}
