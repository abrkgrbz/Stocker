using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

public interface IInventoryReservationRepository : IRepository<InventoryReservation>
{
    Task<InventoryReservation?> GetByNumberAsync(string reservationNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InventoryReservation>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InventoryReservation>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InventoryReservation>> GetByStatusAsync(ReservationStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InventoryReservation>> GetActiveByProductAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InventoryReservation>> GetExpiredAsync(CancellationToken cancellationToken = default);
    Task<decimal> GetTotalReservedQuantityAsync(Guid productId, Guid? warehouseId = null, CancellationToken cancellationToken = default);
    Task<string> GenerateReservationNumberAsync(CancellationToken cancellationToken = default);
}
