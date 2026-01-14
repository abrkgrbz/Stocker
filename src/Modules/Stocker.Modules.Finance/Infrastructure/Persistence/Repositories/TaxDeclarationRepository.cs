using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for TaxDeclaration entity
/// Vergi Beyannamesi - KDV, Muhtasar, Geçici Vergi vb.
/// </summary>
public class TaxDeclarationRepository : FinanceGenericRepository<TaxDeclaration>, ITaxDeclarationRepository
{
    public TaxDeclarationRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<TaxDeclaration?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Details)
            .Include(d => d.Payments)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<TaxDeclaration?> GetByDeclarationNumberAsync(string declarationNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Details)
            .Include(d => d.Payments)
            .FirstOrDefaultAsync(d => d.DeclarationNumber == declarationNumber, cancellationToken);
    }

    public async Task<string> GetNextDeclarationNumberAsync(TaxDeclarationType declarationType, int year, CancellationToken cancellationToken = default)
    {
        var typePrefix = declarationType switch
        {
            TaxDeclarationType.Kdv => "KDV",
            TaxDeclarationType.Kdv2 => "KDV2",
            TaxDeclarationType.Muhtasar => "MUH",
            TaxDeclarationType.MuhtasarPrimHizmet => "MUHP",
            TaxDeclarationType.GeciciVergi => "GV",
            TaxDeclarationType.KurumlarVergisi => "KV",
            TaxDeclarationType.GelirVergisi => "GLV",
            TaxDeclarationType.DamgaVergisi => "DV",
            TaxDeclarationType.Otv => "OTV",
            TaxDeclarationType.VerasetIntikal => "VI",
            _ => "VRG"
        };

        var maxNumber = await _dbSet
            .Where(d => d.DeclarationType == declarationType && d.TaxYear == year)
            .Select(d => d.DeclarationNumber)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(maxNumber))
        {
            return $"{typePrefix}-{year}-001";
        }

        // Parse existing number and increment
        var parts = maxNumber.Split('-');
        if (parts.Length >= 3 && int.TryParse(parts[2], out var sequence))
        {
            return $"{typePrefix}-{year}-{(sequence + 1):D3}";
        }

        return $"{typePrefix}-{year}-001";
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetByTypeAsync(
        TaxDeclarationType declarationType,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.DeclarationType == declarationType)
            .OrderByDescending(d => d.TaxYear)
            .ThenByDescending(d => d.TaxMonth)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetByPeriodAsync(
        int year,
        int? month = null,
        int? quarter = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(d => d.TaxYear == year);

        if (month.HasValue)
        {
            query = query.Where(d => d.TaxMonth == month.Value);
        }

        if (quarter.HasValue)
        {
            query = query.Where(d => d.TaxQuarter == quarter.Value);
        }

        return await query
            .Include(d => d.Details)
            .Include(d => d.Payments)
            .OrderBy(d => d.DeclarationType)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetByStatusAsync(
        TaxDeclarationStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Status == status)
            .OrderByDescending(d => d.FilingDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetOverdueDeclarationsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        return await _dbSet
            .Where(d => d.FilingDeadline < today &&
                       d.Status != TaxDeclarationStatus.Filed &&
                       d.Status != TaxDeclarationStatus.Paid &&
                       d.Status != TaxDeclarationStatus.Cancelled)
            .OrderBy(d => d.FilingDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetUnpaidDeclarationsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Status == TaxDeclarationStatus.Filed && d.RemainingBalance.Amount > 0)
            .OrderBy(d => d.PaymentDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetUpcomingDeadlinesAsync(
        int daysAhead = 30,
        CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(daysAhead);

        return await _dbSet
            .Where(d => (d.FilingDeadline >= today && d.FilingDeadline <= endDate) ||
                       (d.PaymentDeadline >= today && d.PaymentDeadline <= endDate))
            .Where(d => d.Status != TaxDeclarationStatus.Paid && d.Status != TaxDeclarationStatus.Cancelled)
            .OrderBy(d => d.FilingDeadline)
            .ThenBy(d => d.PaymentDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetPendingDeclarationsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Status == TaxDeclarationStatus.Draft || d.Status == TaxDeclarationStatus.Ready)
            .OrderBy(d => d.FilingDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<TaxDeclaration?> GetOriginalDeclarationAsync(int amendmentId, CancellationToken cancellationToken = default)
    {
        var amendment = await _dbSet
            .FirstOrDefaultAsync(d => d.Id == amendmentId, cancellationToken);

        if (amendment?.AmendedDeclarationId == null)
            return null;

        return await _dbSet
            .Include(d => d.Details)
            .Include(d => d.Payments)
            .FirstOrDefaultAsync(d => d.Id == amendment.AmendedDeclarationId, cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetAmendmentsAsync(int originalDeclarationId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.AmendedDeclarationId == originalDeclarationId)
            .OrderByDescending(d => d.AmendmentSequence)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetNextAmendmentNumberAsync(int originalDeclarationId, CancellationToken cancellationToken = default)
    {
        var maxAmendmentNumber = await _dbSet
            .Where(d => d.AmendedDeclarationId == originalDeclarationId)
            .MaxAsync(d => (int?)d.AmendmentSequence, cancellationToken);

        return (maxAmendmentNumber ?? 0) + 1;
    }

    public async Task<Dictionary<string, int>> GetDeclarationCountsByStatusAsync(
        int year,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.TaxYear == year)
            .GroupBy(d => d.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);
    }

    public async Task<Dictionary<string, decimal>> GetTotalTaxByTypeAsync(
        int year,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.TaxYear == year && d.Status != TaxDeclarationStatus.Cancelled)
            .GroupBy(d => d.DeclarationType)
            .Select(g => new { Type = g.Key.ToString(), Total = g.Sum(d => d.NetTax.Amount) })
            .ToDictionaryAsync(x => x.Type, x => x.Total, cancellationToken);
    }

    public async Task<decimal> GetTotalPaidAmountAsync(
        int year,
        TaxDeclarationType? declarationType = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(d => d.TaxYear == year);

        if (declarationType.HasValue)
        {
            query = query.Where(d => d.DeclarationType == declarationType.Value);
        }

        return await query.SumAsync(d => d.PaidAmount.Amount, cancellationToken);
    }

    public async Task<decimal> GetTotalRemainingAmountAsync(
        int year,
        TaxDeclarationType? declarationType = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(d => d.TaxYear == year && d.Status != TaxDeclarationStatus.Cancelled);

        if (declarationType.HasValue)
        {
            query = query.Where(d => d.DeclarationType == declarationType.Value);
        }

        return await query.SumAsync(d => d.RemainingBalance.Amount, cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetByYearAsync(
        int year,
        TaxDeclarationType? declarationType = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(d => d.TaxYear == year);

        if (declarationType.HasValue)
        {
            query = query.Where(d => d.DeclarationType == declarationType.Value);
        }

        return await query
            .OrderByDescending(d => d.TaxMonth)
            .ThenBy(d => d.DeclarationType)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaxDeclaration>> GetPendingApprovalAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Status == TaxDeclarationStatus.Ready)
            .OrderBy(d => d.FilingDeadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsForPeriodAsync(
        TaxDeclarationType declarationType,
        int year,
        int? month,
        int? quarter,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(d => d.DeclarationType == declarationType && d.TaxYear == year);

        if (month.HasValue)
        {
            query = query.Where(d => d.TaxMonth == month.Value);
        }

        if (quarter.HasValue)
        {
            query = query.Where(d => d.TaxQuarter == quarter.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<(int TotalDeclarations, int DraftCount, int FiledCount, int PaidCount, decimal TotalTax, decimal TotalPaid)>
        GetYearlyStatsAsync(int year, CancellationToken cancellationToken = default)
    {
        var declarations = await _dbSet
            .Where(d => d.TaxYear == year)
            .ToListAsync(cancellationToken);

        return (
            TotalDeclarations: declarations.Count,
            DraftCount: declarations.Count(d => d.Status == TaxDeclarationStatus.Draft),
            FiledCount: declarations.Count(d => d.Status == TaxDeclarationStatus.Filed),
            PaidCount: declarations.Count(d => d.Status == TaxDeclarationStatus.Paid),
            TotalTax: declarations.Where(d => d.Status != TaxDeclarationStatus.Cancelled).Sum(d => d.NetTax.Amount),
            TotalPaid: declarations.Sum(d => d.PaidAmount.Amount)
        );
    }
}
