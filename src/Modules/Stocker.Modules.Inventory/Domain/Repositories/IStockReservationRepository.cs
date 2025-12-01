using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for StockReservation entity
/// </summary>
public interface IStockReservationRepository : IInventoryRepository<StockReservation>
{
    /// <summary>
    /// Gets a reservation by reservation number
    /// </summary>
    Task<StockReservation?> GetByReservationNumberAsync(string reservationNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reservations by product
    /// </summary>
    Task<IReadOnlyList<StockReservation>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reservations by warehouse
    /// </summary>
    Task<IReadOnlyList<StockReservation>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reservations by status
    /// </summary>
    Task<IReadOnlyList<StockReservation>> GetByStatusAsync(ReservationStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reservations by reference document
    /// </summary>
    Task<IReadOnlyList<StockReservation>> GetByReferenceAsync(ReservationType type, Guid referenceId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active reservations for a product in a warehouse
    /// </summary>
    Task<IReadOnlyList<StockReservation>> GetActiveReservationsAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets total reserved quantity for a product in a warehouse
    /// </summary>
    Task<decimal> GetTotalReservedQuantityAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expired reservations
    /// </summary>
    Task<IReadOnlyList<StockReservation>> GetExpiredReservationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a unique reservation number
    /// </summary>
    Task<string> GenerateReservationNumberAsync(CancellationToken cancellationToken = default);
}
