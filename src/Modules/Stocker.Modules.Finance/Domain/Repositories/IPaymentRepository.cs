using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for Payment entity
/// </summary>
public interface IPaymentRepository : IFinanceRepository<Payment>
{
    /// <summary>
    /// Get payment with allocations
    /// </summary>
    Task<Payment?> GetWithAllocationsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payment by payment number
    /// </summary>
    Task<Payment?> GetByPaymentNumberAsync(string paymentNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next payment number
    /// </summary>
    Task<string> GetNextPaymentNumberAsync(MovementDirection direction, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payments by current account
    /// </summary>
    Task<IReadOnlyList<Payment>> GetByCurrentAccountAsync(int currentAccountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payments by direction (inbound/outbound)
    /// </summary>
    Task<IReadOnlyList<Payment>> GetByDirectionAsync(MovementDirection direction, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payments by type
    /// </summary>
    Task<IReadOnlyList<Payment>> GetByTypeAsync(PaymentType paymentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payments by status
    /// </summary>
    Task<IReadOnlyList<Payment>> GetByStatusAsync(PaymentStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payments by bank account
    /// </summary>
    Task<IReadOnlyList<Payment>> GetByBankAccountAsync(int bankAccountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payments by cash account
    /// </summary>
    Task<IReadOnlyList<Payment>> GetByCashAccountAsync(int cashAccountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payments by date range
    /// </summary>
    Task<IReadOnlyList<Payment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, MovementDirection? direction = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get unallocated payments
    /// </summary>
    Task<IReadOnlyList<Payment>> GetUnallocatedPaymentsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get checks/notes with due date in range
    /// </summary>
    Task<IReadOnlyList<Payment>> GetChecksByDueDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}
