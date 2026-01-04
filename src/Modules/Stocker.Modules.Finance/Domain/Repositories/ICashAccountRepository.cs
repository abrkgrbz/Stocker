using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for CashAccount entity
/// </summary>
public interface ICashAccountRepository : IFinanceRepository<CashAccount>
{
    /// <summary>
    /// Get cash account with transactions
    /// </summary>
    Task<CashAccount?> GetWithTransactionsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cash account by code
    /// </summary>
    Task<CashAccount?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if code exists (for validation)
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cash accounts by type
    /// </summary>
    Task<IReadOnlyList<CashAccount>> GetByTypeAsync(CashAccountType accountType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active cash accounts
    /// </summary>
    Task<IReadOnlyList<CashAccount>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get default cash account
    /// </summary>
    Task<CashAccount?> GetDefaultAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get default cash account by currency
    /// </summary>
    Task<CashAccount?> GetDefaultByCurrencyAsync(string currency, CancellationToken cancellationToken = default);

    /// <summary>
    /// Search cash accounts by name or code
    /// </summary>
    Task<IReadOnlyList<CashAccount>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cash accounts with balance alerts (below minimum or above maximum)
    /// </summary>
    Task<IReadOnlyList<CashAccount>> GetWithBalanceAlertsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cash accounts by branch
    /// </summary>
    Task<IReadOnlyList<CashAccount>> GetByBranchAsync(int branchId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cash accounts by responsible user
    /// </summary>
    Task<IReadOnlyList<CashAccount>> GetByResponsibleUserAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if cash account has any transactions
    /// </summary>
    Task<bool> HasTransactionsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next available code for cash account
    /// </summary>
    Task<string> GetNextCodeAsync(CancellationToken cancellationToken = default);
}
