using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for CashAccount entity
/// </summary>
public class CashAccountRepository : FinanceGenericRepository<CashAccount>, ICashAccountRepository
{
    public CashAccountRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<CashAccount?> GetWithTransactionsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(ca => ca.Transactions.OrderByDescending(t => t.TransactionDate))
            .FirstOrDefaultAsync(ca => ca.Id == id, cancellationToken);
    }

    public async Task<CashAccount?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
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

    public async Task<IReadOnlyList<CashAccount>> GetByTypeAsync(CashAccountType accountType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.AccountType == accountType)
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CashAccount>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.IsActive)
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<CashAccount?> GetDefaultAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(ca => ca.IsDefault && ca.IsActive, cancellationToken);
    }

    public async Task<CashAccount?> GetDefaultByCurrencyAsync(string currency, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(ca => ca.IsDefault && ca.IsActive && ca.Currency == currency, cancellationToken);
    }

    public async Task<IReadOnlyList<CashAccount>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new List<CashAccount>();
        }

        var searchLower = searchTerm.ToLower();

        return await _dbSet
            .Where(ca => ca.Name.ToLower().Contains(searchLower) ||
                        ca.Code.ToLower().Contains(searchLower) ||
                        (ca.Description != null && ca.Description.ToLower().Contains(searchLower)))
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CashAccount>> GetWithBalanceAlertsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.IsActive &&
                        ((ca.MinimumBalance != null && ca.Balance.Amount < ca.MinimumBalance.Amount) ||
                         (ca.MaximumBalance != null && ca.Balance.Amount > ca.MaximumBalance.Amount)))
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CashAccount>> GetByBranchAsync(int branchId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.BranchId == branchId)
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CashAccount>> GetByResponsibleUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.ResponsibleUserId == userId)
            .OrderBy(ca => ca.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasTransactionsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ca => ca.Id == id)
            .SelectMany(ca => ca.Transactions)
            .AnyAsync(cancellationToken);
    }

    public async Task<string> GetNextCodeAsync(CancellationToken cancellationToken = default)
    {
        var lastCode = await _dbSet
            .Where(ca => ca.Code.StartsWith("KASA"))
            .OrderByDescending(ca => ca.Code)
            .Select(ca => ca.Code)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(lastCode))
        {
            return "KASA001";
        }

        // Extract number from code like "KASA001"
        var numberPart = lastCode.Replace("KASA", "");
        if (int.TryParse(numberPart, out var number))
        {
            return $"KASA{(number + 1):D3}";
        }

        return $"KASA{DateTime.UtcNow.Ticks % 1000:D3}";
    }
}
