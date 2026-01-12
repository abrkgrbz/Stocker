using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface ISubcontractOrderRepository
{
    Task<SubcontractOrder?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<SubcontractOrder?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<SubcontractOrder?> GetWithShipmentsAsync(int id, CancellationToken cancellationToken = default);
    Task<SubcontractOrder?> GetWithMaterialsAsync(int id, CancellationToken cancellationToken = default);
    Task<SubcontractOrder?> GetFullOrderAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SubcontractOrder>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubcontractOrder>> GetBySubcontractorAsync(int subcontractorId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubcontractOrder>> GetByStatusAsync(SubcontractOrderStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubcontractOrder>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubcontractOrder>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubcontractOrder>> GetPendingDeliveriesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubcontractOrder>> GetOverdueOrdersAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SubcontractShipment>> GetShipmentsByOrderAsync(int orderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubcontractMaterial>> GetMaterialsByOrderAsync(int orderId, CancellationToken cancellationToken = default);

    void Add(SubcontractOrder order);
    void Update(SubcontractOrder order);
    void Delete(SubcontractOrder order);

    void AddShipment(SubcontractShipment shipment);
    void AddMaterial(SubcontractMaterial material);
}
