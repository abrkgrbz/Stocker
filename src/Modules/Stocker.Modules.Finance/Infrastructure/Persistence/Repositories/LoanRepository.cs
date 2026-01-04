using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Loan entity
/// Kredi repository implementasyonu
/// </summary>
public class LoanRepository : FinanceGenericRepository<Loan>, ILoanRepository
{
    public LoanRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<Loan?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(l => l.Schedule)
            .Include(l => l.Payments)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<Loan?> GetWithScheduleAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(l => l.Schedule.OrderBy(s => s.InstallmentNumber))
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<Loan?> GetWithPaymentsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(l => l.Payments.OrderByDescending(p => p.PaymentDate))
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<Loan?> GetByLoanNumberAsync(string loanNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(l => l.LoanNumber == loanNumber, cancellationToken);
    }

    public async Task<string> GetNextLoanNumberAsync(LoanType loanType, int year, CancellationToken cancellationToken = default)
    {
        var prefix = loanType switch
        {
            LoanType.BusinessLoan => "IS",
            LoanType.InvestmentLoan => "YT",
            LoanType.SpotCredit => "SP",
            LoanType.RevolvingCredit => "RV",
            LoanType.Leasing => "LS",
            LoanType.Factoring => "FK",
            LoanType.Forfaiting => "FF",
            _ => "KR"
        };

        var maxNumber = await _dbSet
            .Where(l => l.LoanType == loanType && l.StartDate.Year == year)
            .Select(l => l.LoanNumber)
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

    public async Task<IReadOnlyList<Loan>> GetByStatusAsync(LoanStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.Status == status)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Loan>> GetByTypeAsync(LoanType loanType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.LoanType == loanType)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Loan>> GetByLenderAsync(int lenderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.LenderId == lenderId)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Loan>> GetActiveLoansAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.Status == LoanStatus.Active)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Loan>> GetLoansWithUpcomingPaymentsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(l => l.Schedule.Where(s => !s.IsPaid && s.DueDate >= startDate && s.DueDate <= endDate))
            .Where(l => l.Status == LoanStatus.Active &&
                        l.Schedule.Any(s => !s.IsPaid && s.DueDate >= startDate && s.DueDate <= endDate))
            .OrderBy(l => l.Schedule.Where(s => !s.IsPaid).Min(s => s.DueDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Loan>> GetOverdueLoansAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await _dbSet
            .Include(l => l.Schedule.Where(s => !s.IsPaid && s.DueDate < today))
            .Where(l => l.Status == LoanStatus.Active &&
                        l.Schedule.Any(s => !s.IsPaid && s.DueDate < today))
            .OrderBy(l => l.Schedule.Where(s => !s.IsPaid).Min(s => s.DueDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Loan>> GetLoansEndingInRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.EndDate >= startDate && l.EndDate <= endDate)
            .OrderBy(l => l.EndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalRemainingPrincipalAsync(string? currency = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(l => l.Status == LoanStatus.Active);

        if (!string.IsNullOrEmpty(currency))
        {
            query = query.Where(l => l.PrincipalAmount.Currency == currency);
        }

        return await query.SumAsync(l => l.RemainingPrincipal.Amount, cancellationToken);
    }

    public async Task<IReadOnlyList<LoanSchedule>> GetScheduleItemsAsync(int loanId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<LoanSchedule>()
            .Where(s => s.LoanId == loanId)
            .OrderBy(s => s.InstallmentNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LoanSchedule>> GetUpcomingScheduleItemsAsync(int days = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(days);

        return await _context.Set<LoanSchedule>()
            .Include(s => s.Loan)
            .Where(s => !s.IsPaid && s.DueDate >= today && s.DueDate <= endDate &&
                        s.Loan.Status == LoanStatus.Active)
            .OrderBy(s => s.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LoanSchedule>> GetOverdueScheduleItemsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        return await _context.Set<LoanSchedule>()
            .Include(s => s.Loan)
            .Where(s => !s.IsPaid && s.DueDate < today &&
                        s.Loan.Status == LoanStatus.Active)
            .OrderBy(s => s.DueDate)
            .ToListAsync(cancellationToken);
    }
}
