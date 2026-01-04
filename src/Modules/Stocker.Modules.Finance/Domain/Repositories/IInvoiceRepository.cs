using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for Invoice entity
/// </summary>
public interface IInvoiceRepository : IFinanceRepository<Invoice>
{
    /// <summary>
    /// Get invoice with lines and taxes
    /// </summary>
    Task<Invoice?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get invoice by invoice number
    /// </summary>
    Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next sequence number for a series
    /// </summary>
    Task<int> GetNextSequenceNumberAsync(string series, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if invoice number exists
    /// </summary>
    Task<bool> ExistsWithInvoiceNumberAsync(string invoiceNumber, int? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get invoices by current account
    /// </summary>
    Task<IReadOnlyList<Invoice>> GetByCurrentAccountAsync(int currentAccountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get invoices by status
    /// </summary>
    Task<IReadOnlyList<Invoice>> GetByStatusAsync(InvoiceStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get invoices by type
    /// </summary>
    Task<IReadOnlyList<Invoice>> GetByTypeAsync(InvoiceType invoiceType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get unpaid invoices for a current account
    /// </summary>
    Task<IReadOnlyList<Invoice>> GetUnpaidByCurrentAccountAsync(int currentAccountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get overdue invoices
    /// </summary>
    Task<IReadOnlyList<Invoice>> GetOverdueInvoicesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get invoices by date range
    /// </summary>
    Task<IReadOnlyList<Invoice>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, InvoiceType? invoiceType = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get invoices pending GIB response
    /// </summary>
    Task<IReadOnlyList<Invoice>> GetPendingGibResponseAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Search invoices
    /// </summary>
    Task<IReadOnlyList<Invoice>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);
}
