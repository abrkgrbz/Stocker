using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

/// <summary>
/// Malzeme Rezervasyonu repository implementasyonu
/// </summary>
public class MaterialReservationRepository : IMaterialReservationRepository
{
    private readonly ManufacturingDbContext _context;

    public MaterialReservationRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    #region Basic CRUD

    public async Task<MaterialReservation?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<MaterialReservation?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Include(x => x.Allocations)
            .Include(x => x.Issues)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<MaterialReservation?> GetByReservationNumberAsync(string reservationNumber, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations.FirstOrDefaultAsync(x => x.ReservationNumber == reservationNumber, cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations.OrderByDescending(x => x.RequestedDate).ToListAsync(cancellationToken);

    public async Task AddAsync(MaterialReservation reservation, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations.AddAsync(reservation, cancellationToken);

    public void Update(MaterialReservation reservation)
        => _context.MaterialReservations.Update(reservation);

    public void Delete(MaterialReservation reservation)
        => _context.MaterialReservations.Remove(reservation);

    #endregion

    #region Status-Based Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetByStatusAsync(MaterialReservationStatus status, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.Status == status)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetActiveReservationsAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.Status == MaterialReservationStatus.Aktif
                     || x.Status == MaterialReservationStatus.KısmenTahsis
                     || x.Status == MaterialReservationStatus.TamTahsis
                     || x.Status == MaterialReservationStatus.KısmenTüketildi)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetPendingAllocationsAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.Status == MaterialReservationStatus.Aktif || x.Status == MaterialReservationStatus.KısmenTahsis)
            .OrderBy(x => x.Priority)
            .ThenBy(x => x.RequiredDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetPendingIssuesAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.Status == MaterialReservationStatus.TamTahsis || x.Status == MaterialReservationStatus.KısmenTahsis)
            .Where(x => x.AllocatedQuantity > x.IssuedQuantity)
            .OrderBy(x => x.RequiredDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetExpiredReservationsAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.ExpiryDate.HasValue && x.ExpiryDate < DateTime.UtcNow
                     && x.Status != MaterialReservationStatus.Tamamlandı
                     && x.Status != MaterialReservationStatus.İptal)
            .OrderBy(x => x.ExpiryDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Type-Based Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetByTypeAsync(MaterialReservationType type, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.Type == type)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Production Order Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.ProductionOrderId == productionOrderId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetByProductionOrderLineAsync(int productionOrderLineId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.ProductionOrderLineId == productionOrderLineId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetByBomLineAsync(int bomLineId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.BomLineId == bomLineId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Other Reference Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetBySalesOrderAsync(int salesOrderId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.SalesOrderId == salesOrderId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetByProjectAsync(int projectId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.ProjectId == projectId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetBySubcontractOrderAsync(int subcontractOrderId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.SubcontractOrderId == subcontractOrderId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetByMrpPlanAsync(int mrpPlanId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.MrpPlanId == mrpPlanId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Product-Based Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.ProductId == productId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<decimal> GetTotalReservedQuantityByProductAsync(int productId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.ProductId == productId && x.IsActive
                     && x.Status != MaterialReservationStatus.Tamamlandı
                     && x.Status != MaterialReservationStatus.İptal
                     && x.Status != MaterialReservationStatus.Süresi_Doldu)
            .SumAsync(x => x.RequiredQuantity - x.IssuedQuantity + x.ReturnedQuantity, cancellationToken);

    public async Task<decimal> GetTotalAllocatedQuantityByProductAsync(int productId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.ProductId == productId && x.IsActive
                     && x.Status != MaterialReservationStatus.Tamamlandı
                     && x.Status != MaterialReservationStatus.İptal)
            .SumAsync(x => x.AllocatedQuantity - x.IssuedQuantity, cancellationToken);

    #endregion

    #region Warehouse/Location Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.WarehouseId == warehouseId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetByLocationAsync(int locationId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.LocationId == locationId)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<decimal> GetTotalReservedQuantityByWarehouseAsync(int warehouseId, int productId, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.WarehouseId == warehouseId && x.ProductId == productId && x.IsActive
                     && x.Status != MaterialReservationStatus.Tamamlandı
                     && x.Status != MaterialReservationStatus.İptal)
            .SumAsync(x => x.AllocatedQuantity - x.IssuedQuantity + x.ReturnedQuantity, cancellationToken);

    #endregion

    #region Lot/Serial Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetByLotNumberAsync(string lotNumber, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.LotNumber == lotNumber)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.SerialNumber == serialNumber)
            .OrderByDescending(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    public async Task<bool> IsLotReservedAsync(int productId, string lotNumber, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .AnyAsync(x => x.ProductId == productId && x.LotNumber == lotNumber && x.IsActive
                        && x.Status != MaterialReservationStatus.Tamamlandı
                        && x.Status != MaterialReservationStatus.İptal, cancellationToken);

    #endregion

    #region Date-Based Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetByRequiredDateAsync(DateTime date, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.RequiredDate.Date == date.Date)
            .OrderBy(x => x.Priority)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetByRequiredDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.RequiredDate >= startDate && x.RequiredDate <= endDate)
            .OrderBy(x => x.RequiredDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetDueSoonAsync(int days, CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(days);
        return await _context.MaterialReservations
            .Where(x => x.RequiredDate <= cutoffDate && x.RequiredDate >= DateTime.UtcNow
                     && x.Status != MaterialReservationStatus.Tamamlandı
                     && x.Status != MaterialReservationStatus.İptal)
            .OrderBy(x => x.RequiredDate)
            .ToListAsync(cancellationToken);
    }

    #endregion

    #region Priority-Based Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetUrgentReservationsAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.IsUrgent && x.IsActive
                     && x.Status != MaterialReservationStatus.Tamamlandı
                     && x.Status != MaterialReservationStatus.İptal)
            .OrderBy(x => x.RequiredDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetByPriorityAsync(int priority, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.Priority == priority)
            .OrderBy(x => x.RequiredDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaterialReservation>> GetHighPriorityPendingAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.Priority <= 3 && x.IsActive
                     && (x.Status == MaterialReservationStatus.Aktif || x.Status == MaterialReservationStatus.KısmenTahsis))
            .OrderBy(x => x.Priority)
            .ThenBy(x => x.RequiredDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Approval Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetPendingApprovalAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.RequiresApproval && !x.ApprovedDate.HasValue
                     && x.Status != MaterialReservationStatus.İptal)
            .OrderBy(x => x.RequestedDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Batch Operations Queries

    public async Task<IReadOnlyList<MaterialReservation>> GetAutoAllocatableAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .Where(x => x.AutoAllocate && x.IsActive
                     && (x.Status == MaterialReservationStatus.Aktif || x.Status == MaterialReservationStatus.KısmenTahsis))
            .OrderBy(x => x.Priority)
            .ThenBy(x => x.RequiredDate)
            .ToListAsync(cancellationToken);

    #endregion

    #region Statistics Queries

    public async Task<int> GetCountByStatusAsync(MaterialReservationStatus status, CancellationToken cancellationToken = default)
        => await _context.MaterialReservations.CountAsync(x => x.Status == status, cancellationToken);

    public async Task<decimal> GetTotalReservedQuantityAsync(int productId, DateTime? asOfDate, CancellationToken cancellationToken = default)
    {
        var query = _context.MaterialReservations
            .Where(x => x.ProductId == productId && x.IsActive
                     && x.Status != MaterialReservationStatus.Tamamlandı
                     && x.Status != MaterialReservationStatus.İptal);

        if (asOfDate.HasValue)
            query = query.Where(x => x.RequestedDate <= asOfDate.Value);

        return await query.SumAsync(x => x.RequiredQuantity - x.IssuedQuantity + x.ReturnedQuantity, cancellationToken);
    }

    public async Task<Dictionary<MaterialReservationStatus, int>> GetStatusDistributionAsync(CancellationToken cancellationToken = default)
        => await _context.MaterialReservations
            .GroupBy(x => x.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);

    #endregion

    #region Stock Control Helper Queries

    public async Task<decimal> GetAvailableStockAfterReservationsAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        // This would typically call inventory service - simplified implementation
        var totalReserved = await GetTotalReservedQuantityByWarehouseAsync(warehouseId, productId, cancellationToken);
        // Available = Current Stock - Reserved (stock would come from inventory module)
        return -totalReserved; // Return negative reserved amount; actual implementation would integrate with inventory
    }

    public async Task<bool> CanAllocateAsync(int productId, int warehouseId, decimal quantity, CancellationToken cancellationToken = default)
    {
        // Simplified check - actual implementation would integrate with inventory module
        var totalReserved = await GetTotalReservedQuantityByWarehouseAsync(warehouseId, productId, cancellationToken);
        // This is a placeholder - actual stock check would come from inventory
        return true; // Would return availableStock >= quantity
    }

    #endregion

    #region Number Generation

    public async Task<string> GenerateReservationNumberAsync(CancellationToken cancellationToken = default)
    {
        var prefix = $"RES{DateTime.UtcNow:yyMM}";
        var lastReservation = await _context.MaterialReservations
            .Where(x => x.ReservationNumber.StartsWith(prefix))
            .OrderByDescending(x => x.ReservationNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastReservation != null && int.TryParse(lastReservation.ReservationNumber.Substring(prefix.Length), out var lastSequence))
        {
            sequence = lastSequence + 1;
        }

        return $"{prefix}{sequence:D5}";
    }

    #endregion
}
