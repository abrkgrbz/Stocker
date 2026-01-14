using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for BaBsForm entity
/// Ba-Bs Formu - 5.000 TL ve üzeri mal/hizmet alım-satım bildirimi
/// </summary>
public class BaBsFormRepository : FinanceGenericRepository<BaBsForm>, IBaBsFormRepository
{
    public BaBsFormRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<BaBsForm?> GetWithItemsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Items)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<BaBsForm?> GetByFormNumberAsync(string formNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Items)
            .FirstOrDefaultAsync(f => f.FormNumber == formNumber, cancellationToken);
    }

    public async Task<string> GetNextFormNumberAsync(BaBsFormType formType, int year, int month, CancellationToken cancellationToken = default)
    {
        var prefix = formType == BaBsFormType.Ba ? "BA" : "BS";

        var maxNumber = await _dbSet
            .Where(f => f.FormType == formType && f.PeriodYear == year && f.PeriodMonth == month)
            .Select(f => f.FormNumber)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(maxNumber))
        {
            return $"{prefix}-{year}{month:D2}-001";
        }

        // Parse existing number and increment
        var parts = maxNumber.Split('-');
        if (parts.Length >= 3 && int.TryParse(parts[2], out var sequence))
        {
            return $"{prefix}-{year}{month:D2}-{(sequence + 1):D3}";
        }

        return $"{prefix}-{year}{month:D2}-001";
    }

    public async Task<IReadOnlyList<BaBsForm>> GetByPeriodAsync(
        int year,
        int month,
        BaBsFormType? formType = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(f => f.PeriodYear == year && f.PeriodMonth == month);

        if (formType.HasValue)
        {
            query = query.Where(f => f.FormType == formType.Value);
        }

        return await query
            .Include(f => f.Items)
            .OrderByDescending(f => f.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BaBsForm>> GetByStatusAsync(
        BaBsFormStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.Status == status)
            .OrderByDescending(f => f.PeriodYear)
            .ThenByDescending(f => f.PeriodMonth)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BaBsForm>> GetOverdueFormsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        return await _dbSet
            .Where(f => f.FilingDeadline < today &&
                       f.Status != BaBsFormStatus.Filed &&
                       f.Status != BaBsFormStatus.Accepted &&
                       f.Status != BaBsFormStatus.Cancelled)
            .OrderBy(f => f.FilingDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BaBsForm>> GetPendingFormsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.Status == BaBsFormStatus.Draft || f.Status == BaBsFormStatus.Ready)
            .OrderBy(f => f.FilingDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<BaBsForm?> GetOriginalFormAsync(int correctionFormId, CancellationToken cancellationToken = default)
    {
        var correctionForm = await _dbSet
            .FirstOrDefaultAsync(f => f.Id == correctionFormId, cancellationToken);

        if (correctionForm?.CorrectedFormId == null)
            return null;

        return await _dbSet
            .Include(f => f.Items)
            .FirstOrDefaultAsync(f => f.Id == correctionForm.CorrectedFormId, cancellationToken);
    }

    public async Task<IReadOnlyList<BaBsForm>> GetCorrectionsAsync(int originalFormId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.CorrectedFormId == originalFormId)
            .OrderByDescending(f => f.CorrectionSequence)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetNextCorrectionNumberAsync(int originalFormId, CancellationToken cancellationToken = default)
    {
        var maxCorrectionNumber = await _dbSet
            .Where(f => f.CorrectedFormId == originalFormId)
            .MaxAsync(f => (int?)f.CorrectionSequence, cancellationToken);

        return (maxCorrectionNumber ?? 0) + 1;
    }

    public async Task<Dictionary<string, int>> GetFormCountsByStatusAsync(
        int year,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.PeriodYear == year)
            .GroupBy(f => f.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);
    }

    public async Task<decimal> GetTotalAmountByPeriodAsync(
        int year,
        int month,
        BaBsFormType formType,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.PeriodYear == year && f.PeriodMonth == month && f.FormType == formType)
            .SelectMany(f => f.Items)
            .SumAsync(i => i.TotalAmountIncludingVat.Amount, cancellationToken);
    }

    public async Task<IReadOnlyList<BaBsForm>> GetByYearAsync(
        int year,
        BaBsFormType? formType = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(f => f.PeriodYear == year);

        if (formType.HasValue)
        {
            query = query.Where(f => f.FormType == formType.Value);
        }

        return await query
            .OrderByDescending(f => f.PeriodMonth)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BaBsForm>> GetPendingApprovalAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.Status == BaBsFormStatus.Ready)
            .OrderBy(f => f.FilingDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsForPeriodAsync(
        BaBsFormType formType,
        int year,
        int month,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(f => f.FormType == formType && f.PeriodYear == year && f.PeriodMonth == month, cancellationToken);
    }

    public async Task<IReadOnlyList<BaBsForm>> GetByTaxIdAsync(string taxId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.Items.Any(i => i.CounterpartyTaxId == taxId))
            .Include(f => f.Items)
            .OrderByDescending(f => f.PeriodYear)
            .ThenByDescending(f => f.PeriodMonth)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BaBsForm>> GetDraftFormsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.Status == BaBsFormStatus.Draft)
            .OrderBy(f => f.FilingDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<(int TotalForms, int DraftForms, int FiledForms, int AcceptedForms, decimal TotalBaAmount, decimal TotalBsAmount)>
        GetYearlyStatsAsync(int year, CancellationToken cancellationToken = default)
    {
        var forms = await _dbSet
            .Where(f => f.PeriodYear == year)
            .Include(f => f.Items)
            .ToListAsync(cancellationToken);

        return (
            TotalForms: forms.Count,
            DraftForms: forms.Count(f => f.Status == BaBsFormStatus.Draft),
            FiledForms: forms.Count(f => f.Status == BaBsFormStatus.Filed),
            AcceptedForms: forms.Count(f => f.Status == BaBsFormStatus.Accepted),
            TotalBaAmount: forms.Where(f => f.FormType == BaBsFormType.Ba).SelectMany(f => f.Items).Sum(i => i.TotalAmountIncludingVat.Amount),
            TotalBsAmount: forms.Where(f => f.FormType == BaBsFormType.Bs).SelectMany(f => f.Items).Sum(i => i.TotalAmountIncludingVat.Amount)
        );
    }
}
