using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for AdvancePayment entity
/// </summary>
public interface IAdvancePaymentRepository : IRepository<AdvancePayment>
{
    Task<AdvancePayment?> GetByPaymentNumberAsync(string paymentNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdvancePayment>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdvancePayment>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdvancePayment>> GetByStatusAsync(AdvancePaymentStatus status, CancellationToken cancellationToken = default);
    Task<string> GeneratePaymentNumberAsync(CancellationToken cancellationToken = default);
}
