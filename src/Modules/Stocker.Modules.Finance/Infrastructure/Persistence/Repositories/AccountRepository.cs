using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Muhasebe Hesabı (Hesap Planı) repository uygulaması
/// Repository implementation for Account (Chart of Accounts) entity
/// </summary>
public class AccountRepository : FinanceGenericRepository<Account>, IAccountRepository
{
    public AccountRepository(FinanceDbContext context) : base(context)
    {
    }

    /// <inheritdoc />
    public async Task<Account?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(a => a.ParentAccount)
            .Include(a => a.SubAccounts)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Account?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(a => a.Code == code, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(a => a.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(a => a.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetByTypeAsync(AccountType accountType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.AccountType == accountType)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetBySubGroupAsync(AccountSubGroup subGroup, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.SubGroup == subGroup)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetActiveAccountsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.IsActive)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetTransactionAccountsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.IsActive && a.AcceptsTransactions)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new List<Account>();
        }

        var searchLower = searchTerm.ToLower();

        return await _dbSet
            .Where(a => a.Code.ToLower().Contains(searchLower) ||
                       a.Name.ToLower().Contains(searchLower) ||
                       (a.Description != null && a.Description.ToLower().Contains(searchLower)))
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetSubAccountsAsync(int parentAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.ParentAccountId == parentAccountId)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> HasSubAccountsAsync(int accountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(a => a.ParentAccountId == accountId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> HasActiveSubAccountsAsync(int accountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(a => a.ParentAccountId == accountId && a.IsActive, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> HasTransactionsAsync(int accountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Id == accountId)
            .SelectMany(a => a.JournalEntryLines)
            .AnyAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetRootAccountsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.ParentAccountId == null)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetAccountsByLevelAsync(int level, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Level == level)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetAccountsWithBalanceAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Balance.Amount != 0)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Account>> GetAllDescendantsAsync(int accountId, CancellationToken cancellationToken = default)
    {
        var result = new List<Account>();
        await GetDescendantsRecursiveAsync(accountId, result, cancellationToken);
        return result;
    }

    private async Task GetDescendantsRecursiveAsync(int parentId, List<Account> result, CancellationToken cancellationToken)
    {
        var children = await _dbSet
            .Where(a => a.ParentAccountId == parentId)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);

        foreach (var child in children)
        {
            result.Add(child);
            await GetDescendantsRecursiveAsync(child.Id, result, cancellationToken);
        }
    }

    /// <inheritdoc />
    public async Task<Account?> GetByLinkedBankAccountAsync(int bankAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(a => a.LinkedBankAccountId == bankAccountId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Account?> GetByLinkedCashAccountAsync(int cashAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(a => a.LinkedCashAccountId == cashAccountId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Account?> GetByLinkedCurrentAccountAsync(int currentAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(a => a.LinkedCurrentAccountId == currentAccountId, cancellationToken);
    }
}
