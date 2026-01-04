using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for CurrentAccount entity
/// </summary>
public interface ICurrentAccountRepository : IFinanceRepository<CurrentAccount>
{
    /// <summary>
    /// Get current account with transactions
    /// </summary>
    Task<CurrentAccount?> GetWithTransactionsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get current account by code
    /// </summary>
    Task<CurrentAccount?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if code exists (for validation)
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get current accounts by type
    /// </summary>
    Task<IReadOnlyList<CurrentAccount>> GetByTypeAsync(CurrentAccountType accountType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get current accounts by CRM customer ID
    /// </summary>
    Task<CurrentAccount?> GetByCrmCustomerIdAsync(int crmCustomerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Search current accounts by name or code
    /// </summary>
    Task<IReadOnlyList<CurrentAccount>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get current accounts with balance
    /// </summary>
    Task<IReadOnlyList<CurrentAccount>> GetAccountsWithBalanceAsync(bool onlyWithBalance = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get current accounts by risk status
    /// </summary>
    Task<IReadOnlyList<CurrentAccount>> GetByRiskStatusAsync(RiskStatus riskStatus, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get overdue receivables (accounts with positive balance past due date)
    /// </summary>
    Task<IReadOnlyList<CurrentAccount>> GetOverdueReceivablesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if current account has any transactions
    /// </summary>
    Task<bool> HasTransactionsAsync(int id, CancellationToken cancellationToken = default);
}
