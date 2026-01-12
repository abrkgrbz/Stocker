using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

/// <summary>
/// Malzeme Rezervasyonu repository arayüzü
/// </summary>
public interface IMaterialReservationRepository
{
    // Temel CRUD
    Task<MaterialReservation?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<MaterialReservation?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<MaterialReservation?> GetByReservationNumberAsync(string reservationNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(MaterialReservation reservation, CancellationToken cancellationToken = default);
    void Update(MaterialReservation reservation);
    void Delete(MaterialReservation reservation);

    // Durum bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetByStatusAsync(MaterialReservationStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetActiveReservationsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetPendingAllocationsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetPendingIssuesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetExpiredReservationsAsync(CancellationToken cancellationToken = default);

    // Tip bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetByTypeAsync(MaterialReservationType type, CancellationToken cancellationToken = default);

    // Üretim emri bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetByProductionOrderLineAsync(int productionOrderLineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetByBomLineAsync(int bomLineId, CancellationToken cancellationToken = default);

    // Diğer referans bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetBySalesOrderAsync(int salesOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetByProjectAsync(int projectId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetBySubcontractOrderAsync(int subcontractOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetByMrpPlanAsync(int mrpPlanId, CancellationToken cancellationToken = default);

    // Ürün bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalReservedQuantityByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalAllocatedQuantityByProductAsync(int productId, CancellationToken cancellationToken = default);

    // Depo/Lokasyon bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetByLocationAsync(int locationId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalReservedQuantityByWarehouseAsync(int warehouseId, int productId, CancellationToken cancellationToken = default);

    // Lot/Seri bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetByLotNumberAsync(string lotNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default);
    Task<bool> IsLotReservedAsync(int productId, string lotNumber, CancellationToken cancellationToken = default);

    // Tarih bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetByRequiredDateAsync(DateTime date, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetByRequiredDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetDueSoonAsync(int days, CancellationToken cancellationToken = default);

    // Öncelik bazlı sorgular
    Task<IReadOnlyList<MaterialReservation>> GetUrgentReservationsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetByPriorityAsync(int priority, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialReservation>> GetHighPriorityPendingAsync(CancellationToken cancellationToken = default);

    // Onay bekleyen sorgular
    Task<IReadOnlyList<MaterialReservation>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);

    // Toplu işlem sorguları
    Task<IReadOnlyList<MaterialReservation>> GetAutoAllocatableAsync(CancellationToken cancellationToken = default);

    // İstatistik sorguları
    Task<int> GetCountByStatusAsync(MaterialReservationStatus status, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalReservedQuantityAsync(int productId, DateTime? asOfDate, CancellationToken cancellationToken = default);
    Task<Dictionary<MaterialReservationStatus, int>> GetStatusDistributionAsync(CancellationToken cancellationToken = default);

    // Stok kontrolü yardımcı sorguları
    Task<decimal> GetAvailableStockAfterReservationsAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);
    Task<bool> CanAllocateAsync(int productId, int warehouseId, decimal quantity, CancellationToken cancellationToken = default);

    // Numara üretimi
    Task<string> GenerateReservationNumberAsync(CancellationToken cancellationToken = default);
}
