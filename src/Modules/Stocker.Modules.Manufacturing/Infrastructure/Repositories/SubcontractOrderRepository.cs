using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class SubcontractOrderRepository : ISubcontractOrderRepository
{
    private readonly ManufacturingDbContext _context;

    public SubcontractOrderRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<SubcontractOrder?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<SubcontractOrder?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .FirstOrDefaultAsync(x => x.OrderNumber == orderNumber, cancellationToken);
    }

    public async Task<SubcontractOrder?> GetWithShipmentsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .Include(x => x.Shipments)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<SubcontractOrder?> GetWithMaterialsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .Include(x => x.Materials)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<SubcontractOrder?> GetFullOrderAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .Include(x => x.Shipments)
            .Include(x => x.Materials)
            .Include(x => x.ProductionOrder)
            .Include(x => x.Operation)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractOrder>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractOrder>> GetBySubcontractorAsync(int subcontractorId, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .Where(x => x.SubcontractorId == subcontractorId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractOrder>> GetByStatusAsync(SubcontractOrderStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .Where(x => x.Status == status)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractOrder>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .Where(x => x.ProductionOrderId == productionOrderId)
            .OrderBy(x => x.OrderDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractOrder>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractOrders
            .Where(x => x.OrderDate >= startDate && x.OrderDate <= endDate)
            .OrderByDescending(x => x.OrderDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractOrder>> GetPendingDeliveriesAsync(CancellationToken cancellationToken = default)
    {
        var activeStatuses = new[]
        {
            SubcontractOrderStatus.Onaylandı,
            SubcontractOrderStatus.MalzemeGönderildi,
            SubcontractOrderStatus.ÜretimdeGönderildi
        };

        return await _context.SubcontractOrders
            .Where(x => activeStatuses.Contains(x.Status))
            .OrderBy(x => x.ExpectedDeliveryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractOrder>> GetOverdueOrdersAsync(CancellationToken cancellationToken = default)
    {
        var activeStatuses = new[]
        {
            SubcontractOrderStatus.Onaylandı,
            SubcontractOrderStatus.MalzemeGönderildi,
            SubcontractOrderStatus.ÜretimdeGönderildi
        };

        return await _context.SubcontractOrders
            .Where(x => activeStatuses.Contains(x.Status) && x.ExpectedDeliveryDate < DateTime.UtcNow)
            .OrderBy(x => x.ExpectedDeliveryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractShipment>> GetShipmentsByOrderAsync(int orderId, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractShipments
            .Where(x => x.SubcontractOrderId == orderId)
            .OrderByDescending(x => x.ShipmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractMaterial>> GetMaterialsByOrderAsync(int orderId, CancellationToken cancellationToken = default)
    {
        return await _context.SubcontractMaterials
            .Where(x => x.SubcontractOrderId == orderId)
            .ToListAsync(cancellationToken);
    }

    public void Add(SubcontractOrder order)
    {
        _context.SubcontractOrders.Add(order);
    }

    public void Update(SubcontractOrder order)
    {
        _context.SubcontractOrders.Update(order);
    }

    public void Delete(SubcontractOrder order)
    {
        _context.SubcontractOrders.Remove(order);
    }

    public void AddShipment(SubcontractShipment shipment)
    {
        _context.SubcontractShipments.Add(shipment);
    }

    public void AddMaterial(SubcontractMaterial material)
    {
        _context.SubcontractMaterials.Add(material);
    }
}
