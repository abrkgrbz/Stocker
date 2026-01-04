using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Muhasebe Hesabı (Hesap Planı) repository arayüzü
/// Repository interface for Account (Chart of Accounts) entity
/// </summary>
public interface IAccountRepository : IFinanceRepository<Account>
{
    /// <summary>
    /// Hesabı detaylarıyla birlikte getirir (üst hesap, alt hesaplar)
    /// Get account with details (parent account, sub accounts)
    /// </summary>
    Task<Account?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Hesabı koda göre getirir
    /// Get account by code
    /// </summary>
    Task<Account?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Kod mevcut mu kontrolü (validasyon için)
    /// Check if code exists (for validation)
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Hesap tipine göre hesapları getirir
    /// Get accounts by type
    /// </summary>
    Task<IReadOnlyList<Account>> GetByTypeAsync(AccountType accountType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Alt gruba göre hesapları getirir
    /// Get accounts by sub group
    /// </summary>
    Task<IReadOnlyList<Account>> GetBySubGroupAsync(AccountSubGroup subGroup, CancellationToken cancellationToken = default);

    /// <summary>
    /// Aktif hesapları getirir
    /// Get active accounts
    /// </summary>
    Task<IReadOnlyList<Account>> GetActiveAccountsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Hareket kabul eden hesapları getirir (yaprak hesaplar)
    /// Get accounts that accept transactions (leaf accounts)
    /// </summary>
    Task<IReadOnlyList<Account>> GetTransactionAccountsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Hesap adı veya koduna göre arama yapar
    /// Search accounts by name or code
    /// </summary>
    Task<IReadOnlyList<Account>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Üst hesabın alt hesaplarını getirir
    /// Get sub accounts of a parent account
    /// </summary>
    Task<IReadOnlyList<Account>> GetSubAccountsAsync(int parentAccountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Hesabın alt hesapları var mı kontrolü
    /// Check if account has sub accounts
    /// </summary>
    Task<bool> HasSubAccountsAsync(int accountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Hesabın aktif alt hesapları var mı kontrolü
    /// Check if account has active sub accounts
    /// </summary>
    Task<bool> HasActiveSubAccountsAsync(int accountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Hesabın hareketleri var mı kontrolü
    /// Check if account has transactions (journal entry lines)
    /// </summary>
    Task<bool> HasTransactionsAsync(int accountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Kök hesapları getirir (üst hesabı olmayan)
    /// Get root accounts (accounts without parent)
    /// </summary>
    Task<IReadOnlyList<Account>> GetRootAccountsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Belirli bir seviyedeki hesapları getirir
    /// Get accounts at a specific level
    /// </summary>
    Task<IReadOnlyList<Account>> GetAccountsByLevelAsync(int level, CancellationToken cancellationToken = default);

    /// <summary>
    /// Bakiyesi olan hesapları getirir
    /// Get accounts with non-zero balance
    /// </summary>
    Task<IReadOnlyList<Account>> GetAccountsWithBalanceAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Bir hesabın tüm alt hesaplarını recursive olarak getirir
    /// Get all descendant accounts recursively
    /// </summary>
    Task<IReadOnlyList<Account>> GetAllDescendantsAsync(int accountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Banka hesabına bağlı muhasebe hesabını getirir
    /// Get account linked to a bank account
    /// </summary>
    Task<Account?> GetByLinkedBankAccountAsync(int bankAccountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Kasa hesabına bağlı muhasebe hesabını getirir
    /// Get account linked to a cash account
    /// </summary>
    Task<Account?> GetByLinkedCashAccountAsync(int cashAccountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cari hesaba bağlı muhasebe hesabını getirir
    /// Get account linked to a current account
    /// </summary>
    Task<Account?> GetByLinkedCurrentAccountAsync(int currentAccountId, CancellationToken cancellationToken = default);
}
