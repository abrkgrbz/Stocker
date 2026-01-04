using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for CurrentAccount entity
/// </summary>
public class CurrentAccountRepository : FinanceGenericRepository<CurrentAccount>, ICurrentAccountRepository
{
    public CurrentAccountRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<CurrentAccount?> GetWithTransactionsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(ca => ca.Transactions.OrderByDescending(t => t.TransactionDate))
            .FirstOrDefaultAsync(ca => ca.Id == id, cancellationToken);
    }

    public async Task<CurrentAccount?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(ca => ca.Code == code, cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(ca => ca.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(ca => ca.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CurrentAccount>> GetByTypeAsync(CurrentAccountType accountType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.AccountType == accountType)
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<CurrentAccount?> GetByCrmCustomerIdAsync(int crmCustomerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(ca => ca.CrmCustomerId == crmCustomerId, cancellationToken);
    }

    public async Task<IReadOnlyList<CurrentAccount>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new List<CurrentAccount>();
        }

        var searchLower = searchTerm.ToLower();

        return await _dbSet
            .Where(ca => ca.Name.ToLower().Contains(searchLower) ||
                        ca.Code.ToLower().Contains(searchLower) ||
                        (ca.ShortName != null && ca.ShortName.ToLower().Contains(searchLower)) ||
                        (ca.TaxNumber != null && ca.TaxNumber.Contains(searchTerm)))
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CurrentAccount>> GetAccountsWithBalanceAsync(bool onlyWithBalance = true, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        if (onlyWithBalance)
        {
            query = query.Where(ca => ca.Balance.Amount != 0);
        }

        return await query
            .OrderByDescending(ca => Math.Abs(ca.Balance.Amount))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CurrentAccount>> GetByRiskStatusAsync(RiskStatus riskStatus, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.RiskStatus == riskStatus)
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CurrentAccount>> GetOverdueReceivablesAsync(CancellationToken cancellationToken = default)
    {
        // Get accounts with positive balance (receivables)
        // Note: Actual due date tracking should come from transactions/invoices
        return await _dbSet
            .Where(ca => ca.Balance.Amount > 0 && ca.Status == CurrentAccountStatus.Active)
            .OrderByDescending(ca => ca.Balance.Amount)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasTransactionsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.Id == id)
            .SelectMany(ca => ca.Transactions)
            .AnyAsync(cancellationToken);
    }
}
