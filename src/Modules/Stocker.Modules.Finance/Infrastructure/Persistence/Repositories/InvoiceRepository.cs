using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Invoice entity
/// </summary>
public class InvoiceRepository : FinanceGenericRepository<Invoice>, IInvoiceRepository
{
    public InvoiceRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<Invoice?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(i => i.Lines)
            .Include(i => i.Taxes)
            .Include(i => i.CurrentAccount)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(i => i.Lines)
            .Include(i => i.Taxes)
            .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber, cancellationToken);
    }

    public async Task<int> GetNextSequenceNumberAsync(string series, CancellationToken cancellationToken = default)
    {
        var currentYear = DateTime.UtcNow.Year;
        var maxSequence = await _dbSet
            .Where(i => i.Series == series && i.InvoiceDate.Year == currentYear)
            .MaxAsync(i => (int?)i.SequenceNumber, cancellationToken);

        return (maxSequence ?? 0) + 1;
    }

    public async Task<bool> ExistsWithInvoiceNumberAsync(string invoiceNumber, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(i => i.InvoiceNumber == invoiceNumber);

        if (excludeId.HasValue)
        {
            query = query.Where(i => i.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>> GetByCurrentAccountAsync(int currentAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(i => i.CurrentAccountId == currentAccountId)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>> GetByStatusAsync(InvoiceStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(i => i.Status == status)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>> GetByTypeAsync(InvoiceType invoiceType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(i => i.InvoiceType == invoiceType)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>> GetUnpaidByCurrentAccountAsync(int currentAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(i => i.CurrentAccountId == currentAccountId &&
                       (i.Status == InvoiceStatus.Approved || i.Status == InvoiceStatus.PartiallyPaid))
            .OrderBy(i => i.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>> GetOverdueInvoicesAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        return await _dbSet
            .Where(i => i.DueDate < today &&
                       (i.Status == InvoiceStatus.Approved || i.Status == InvoiceStatus.PartiallyPaid))
            .OrderBy(i => i.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>> GetByDateRangeAsync(
        DateTime startDate,
        DateTime endDate,
        InvoiceType? invoiceType = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(i => i.InvoiceDate >= startDate && i.InvoiceDate <= endDate);

        if (invoiceType.HasValue)
        {
            query = query.Where(i => i.InvoiceType == invoiceType.Value);
        }

        return await query
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>> GetPendingGibResponseAsync(CancellationToken cancellationToken = default)
    {
        // Filter by EInvoiceType (not eArchive) and pending GIB response
        return await _dbSet
            .Where(i => i.EInvoiceType == EInvoiceType.EInvoice &&
                       i.GibSendDate != null &&
                       i.GibResponseDate == null &&
                       i.Status == InvoiceStatus.Approved)
            .OrderBy(i => i.GibSendDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new List<Invoice>();
        }

        var searchLower = searchTerm.ToLower();

        return await _dbSet
            .Include(i => i.CurrentAccount)
            .Where(i => i.InvoiceNumber.ToLower().Contains(searchLower) ||
                       (i.CurrentAccount != null && i.CurrentAccount.Name.ToLower().Contains(searchLower)) ||
                       (i.GibUuid != null && i.GibUuid.ToString().Contains(searchTerm)))
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync(cancellationToken);
    }
}
