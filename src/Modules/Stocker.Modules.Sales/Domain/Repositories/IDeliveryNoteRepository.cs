using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

public interface IDeliveryNoteRepository : IRepository<DeliveryNote>
{
    Task<DeliveryNote?> GetByNumberAsync(string deliveryNoteNumber, CancellationToken cancellationToken = default);
    Task<DeliveryNote?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeliveryNote>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeliveryNote>> GetByReceiverIdAsync(Guid receiverId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeliveryNote>> GetByStatusAsync(DeliveryNoteStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeliveryNote>> GetByShipmentIdAsync(Guid shipmentId, CancellationToken cancellationToken = default);
    Task<int> GetNextSequenceNumberAsync(string series, CancellationToken cancellationToken = default);
}
