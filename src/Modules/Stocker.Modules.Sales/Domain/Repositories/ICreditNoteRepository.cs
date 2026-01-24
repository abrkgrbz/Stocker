using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for CreditNote entity
/// </summary>
public interface ICreditNoteRepository : IRepository<CreditNote>
{
    Task<CreditNote?> GetByCreditNoteNumberAsync(string creditNoteNumber, CancellationToken cancellationToken = default);
    Task<CreditNote?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CreditNote>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CreditNote>> GetByInvoiceIdAsync(Guid invoiceId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CreditNote>> GetByStatusAsync(CreditNoteStatus status, CancellationToken cancellationToken = default);
    Task<string> GenerateCreditNoteNumberAsync(CancellationToken cancellationToken = default);
}
