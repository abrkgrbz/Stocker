using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for Shipment entity
/// </summary>
public interface IShipmentRepository : IRepository<Shipment>
{
    /// <summary>
    /// Gets a shipment by its number
    /// </summary>
    Task<Shipment?> GetByShipmentNumberAsync(
        string shipmentNumber,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a shipment with all items loaded
    /// </summary>
    Task<Shipment?> GetWithItemsAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all shipments for a sales order
    /// </summary>
    Task<IReadOnlyList<Shipment>> GetByOrderIdAsync(
        Guid orderId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all shipments for a customer
    /// </summary>
    Task<IReadOnlyList<Shipment>> GetByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets shipments by status
    /// </summary>
    Task<IReadOnlyList<Shipment>> GetByStatusAsync(
        ShipmentStatus status,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending shipments that need processing
    /// </summary>
    Task<IReadOnlyList<Shipment>> GetPendingShipmentsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets shipments currently in transit
    /// </summary>
    Task<IReadOnlyList<Shipment>> GetInTransitShipmentsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets overdue shipments (expected delivery passed but not delivered)
    /// </summary>
    Task<IReadOnlyList<Shipment>> GetOverdueShipmentsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a unique shipment number
    /// </summary>
    Task<string> GenerateShipmentNumberAsync(CancellationToken cancellationToken = default);
}
