using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for JournalEntry entity
/// Yevmiye Kaydı repository arayüzü
/// </summary>
public interface IJournalEntryRepository : IFinanceRepository<JournalEntry>
{
    /// <summary>
    /// Get journal entry with lines
    /// Yevmiye kaydını satırlarıyla birlikte getirir
    /// </summary>
    Task<JournalEntry?> GetWithLinesAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get journal entry by entry number
    /// Kayıt numarasına göre yevmiye kaydını getirir
    /// </summary>
    Task<JournalEntry?> GetByEntryNumberAsync(string entryNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next entry number
    /// Sonraki kayıt numarasını oluşturur
    /// </summary>
    Task<string> GetNextEntryNumberAsync(JournalEntryType entryType, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get journal entries by status
    /// Duruma göre yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetByStatusAsync(JournalEntryStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get journal entries by type
    /// Türe göre yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetByTypeAsync(JournalEntryType entryType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get journal entries by date range
    /// Tarih aralığına göre yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get journal entries by accounting period
    /// Muhasebe dönemine göre yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetByAccountingPeriodAsync(int accountingPeriodId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get journal entries for an account
    /// Bir hesap için yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetByAccountAsync(int accountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get draft journal entries
    /// Taslak yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetDraftEntriesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get posted journal entries
    /// Deftere kaydedilmiş yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetPostedEntriesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get reversed journal entries
    /// Ters kayıt yapılmış yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetReversedEntriesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get journal entry with reversal
    /// Yevmiye kaydını ters kaydıyla birlikte getirir
    /// </summary>
    Task<JournalEntry?> GetWithReversalAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get unbalanced journal entries
    /// Dengesiz yevmiye kayıtlarını getirir
    /// </summary>
    Task<IReadOnlyList<JournalEntry>> GetUnbalancedEntriesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get total debits and credits for a period
    /// Bir dönem için toplam borç ve alacak tutarlarını getirir
    /// </summary>
    Task<(decimal TotalDebit, decimal TotalCredit)> GetPeriodTotalsAsync(int accountingPeriodId, CancellationToken cancellationToken = default);
}
