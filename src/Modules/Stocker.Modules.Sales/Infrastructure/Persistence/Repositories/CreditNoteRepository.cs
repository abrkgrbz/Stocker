using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for CreditNote entity
/// </summary>
public class CreditNoteRepository : BaseRepository<CreditNote>, ICreditNoteRepository
{
    public CreditNoteRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<CreditNote?> GetByCreditNoteNumberAsync(string creditNoteNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(cn => cn.CreditNoteNumber == creditNoteNumber, cancellationToken);
    }

    public async Task<CreditNote?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(cn => cn.Items)
            .FirstOrDefaultAsync(cn => cn.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<CreditNote>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(cn => cn.Items)
            .Where(cn => cn.CustomerId == customerId)
            .OrderByDescending(cn => cn.CreditNoteDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CreditNote>> GetByInvoiceIdAsync(Guid invoiceId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(cn => cn.Items)
            .Where(cn => cn.InvoiceId == invoiceId)
            .OrderByDescending(cn => cn.CreditNoteDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CreditNote>> GetByStatusAsync(CreditNoteStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(cn => cn.Items)
            .Where(cn => cn.Status == status)
            .OrderByDescending(cn => cn.CreditNoteDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateCreditNoteNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"CN-{today:yyyyMMdd}-";

        var lastNote = await _dbSet
            .Where(cn => cn.CreditNoteNumber.StartsWith(prefix))
            .OrderByDescending(cn => cn.CreditNoteNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastNote == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastNote.CreditNoteNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
