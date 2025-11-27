using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for Payment entity
/// </summary>
public interface IPaymentRepository : IRepository<Payment>
{
    Task<Payment?> GetByPaymentNumberAsync(string paymentNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Payment>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Payment>> GetByInvoiceIdAsync(Guid invoiceId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Payment>> GetByStatusAsync(PaymentStatus status, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalPaymentsByInvoiceIdAsync(Guid invoiceId, CancellationToken cancellationToken = default);
    Task<string> GeneratePaymentNumberAsync(CancellationToken cancellationToken = default);
}
