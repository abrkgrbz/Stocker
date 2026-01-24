using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Quotation entity
/// </summary>
public class QuotationRepository : BaseRepository<Quotation>, IQuotationRepository
{
    public QuotationRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<Quotation?> GetByQuotationNumberAsync(string quotationNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.QuotationNumber == quotationNumber, cancellationToken);
    }

    public async Task<Quotation?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Quotation>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(q => q.Items)
            .Where(q => q.CustomerId == customerId)
            .OrderByDescending(q => q.QuotationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Quotation>> GetBySalesPersonIdAsync(Guid salesPersonId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(q => q.Items)
            .Where(q => q.SalesPersonId == salesPersonId)
            .OrderByDescending(q => q.QuotationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Quotation>> GetByStatusAsync(QuotationStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(q => q.Items)
            .Where(q => q.Status == status)
            .OrderByDescending(q => q.QuotationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Quotation>> GetExpiringQuotationsAsync(int daysUntilExpiry = 7, CancellationToken cancellationToken = default)
    {
        var expiryDate = DateTime.UtcNow.AddDays(daysUntilExpiry);
        return await _dbSet
            .Include(q => q.Items)
            .Where(q => q.ExpirationDate.HasValue && q.ExpirationDate.Value <= expiryDate &&
                        q.Status == QuotationStatus.Sent)
            .OrderBy(q => q.ExpirationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateQuotationNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"QTN-{today:yyyyMMdd}-";

        var lastQuotation = await _dbSet
            .Where(q => q.QuotationNumber.StartsWith(prefix))
            .OrderByDescending(q => q.QuotationNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastQuotation == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastQuotation.QuotationNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
