using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for JournalEntry entity
/// Yevmiye Kaydı repository implementasyonu
/// </summary>
public class JournalEntryRepository : FinanceGenericRepository<JournalEntry>, IJournalEntryRepository
{
    public JournalEntryRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<JournalEntry?> GetWithLinesAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(j => j.Lines)
                .ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);
    }

    public async Task<JournalEntry?> GetByEntryNumberAsync(string entryNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(j => j.EntryNumber == entryNumber, cancellationToken);
    }

    public async Task<string> GetNextEntryNumberAsync(JournalEntryType entryType, int year, CancellationToken cancellationToken = default)
    {
        var prefix = entryType switch
        {
            JournalEntryType.Opening => "AC",
            JournalEntryType.Collection => "TH",
            JournalEntryType.Payment => "TD",
            JournalEntryType.Offset => "MH",
            JournalEntryType.SalesInvoice => "ST",
            JournalEntryType.PurchaseInvoice => "AL",
            JournalEntryType.ReturnInvoice => "ID",
            JournalEntryType.General => "GN",
            JournalEntryType.Depreciation => "AMR",
            JournalEntryType.Closing => "KP",
            JournalEntryType.ExchangeRateDifference => "KFR",
            _ => "YM"
        };

        var maxNumber = await _dbSet
            .Where(j => j.EntryType == entryType && j.EntryDate.Year == year)
            .Select(j => j.EntryNumber)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(maxNumber))
        {
            return $"{prefix}-{year}-000001";
        }

        var parts = maxNumber.Split('-');
        if (parts.Length >= 3 && int.TryParse(parts[2], out var sequence))
        {
            return $"{prefix}-{year}-{(sequence + 1):D6}";
        }

        return $"{prefix}-{year}-000001";
    }

    public async Task<IReadOnlyList<JournalEntry>> GetByStatusAsync(JournalEntryStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(j => j.Status == status)
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JournalEntry>> GetByTypeAsync(JournalEntryType entryType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(j => j.EntryType == entryType)
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JournalEntry>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(j => j.EntryDate >= startDate && j.EntryDate <= endDate)
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JournalEntry>> GetByAccountingPeriodAsync(int accountingPeriodId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(j => j.AccountingPeriodId == accountingPeriodId)
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JournalEntry>> GetByAccountAsync(int accountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(j => j.Lines)
            .Where(j => j.Lines.Any(l => l.AccountId == accountId))
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JournalEntry>> GetDraftEntriesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(j => j.Status == JournalEntryStatus.Draft)
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JournalEntry>> GetPostedEntriesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(j => j.Status == JournalEntryStatus.Posted)
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JournalEntry>> GetReversedEntriesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(j => j.Status == JournalEntryStatus.Voided || j.IsReversal)
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<JournalEntry?> GetWithReversalAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(j => j.Lines)
            .Include(j => j.ReversedEntry)
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<JournalEntry>> GetUnbalancedEntriesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(j => j.Lines)
            .Where(j => j.TotalDebit.Amount != j.TotalCredit.Amount)
            .OrderByDescending(j => j.EntryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(decimal TotalDebit, decimal TotalCredit)> GetPeriodTotalsAsync(int accountingPeriodId, CancellationToken cancellationToken = default)
    {
        var entries = await _dbSet
            .Where(j => j.AccountingPeriodId == accountingPeriodId && j.Status == JournalEntryStatus.Posted)
            .ToListAsync(cancellationToken);

        var totalDebit = entries.Sum(j => j.TotalDebit.Amount);
        var totalCredit = entries.Sum(j => j.TotalCredit.Amount);

        return (totalDebit, totalCredit);
    }
}
