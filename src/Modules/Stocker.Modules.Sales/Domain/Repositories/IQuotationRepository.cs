using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for Quotation entity
/// </summary>
public interface IQuotationRepository : IRepository<Quotation>
{
    Task<Quotation?> GetByQuotationNumberAsync(string quotationNumber, CancellationToken cancellationToken = default);
    Task<Quotation?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Quotation>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Quotation>> GetBySalesPersonIdAsync(Guid salesPersonId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Quotation>> GetByStatusAsync(QuotationStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Quotation>> GetExpiringQuotationsAsync(int daysUntilExpiry = 7, CancellationToken cancellationToken = default);
    Task<string> GenerateQuotationNumberAsync(CancellationToken cancellationToken = default);
}
