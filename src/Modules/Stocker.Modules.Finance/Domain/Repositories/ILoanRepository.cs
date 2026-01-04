using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for Loan entity
/// Kredi repository arayüzü
/// </summary>
public interface ILoanRepository : IFinanceRepository<Loan>
{
    /// <summary>
    /// Get loan with schedule and payments
    /// Krediyi ödeme planı ve ödemelerle birlikte getirir
    /// </summary>
    Task<Loan?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loan with schedule only
    /// Krediyi sadece ödeme planıyla getirir
    /// </summary>
    Task<Loan?> GetWithScheduleAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loan with payments only
    /// Krediyi sadece ödemelerle getirir
    /// </summary>
    Task<Loan?> GetWithPaymentsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loan by loan number
    /// Kredi numarasına göre krediyi getirir
    /// </summary>
    Task<Loan?> GetByLoanNumberAsync(string loanNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next loan number
    /// Sonraki kredi numarasını oluşturur
    /// </summary>
    Task<string> GetNextLoanNumberAsync(LoanType loanType, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loans by status
    /// Duruma göre kredileri getirir
    /// </summary>
    Task<IReadOnlyList<Loan>> GetByStatusAsync(LoanStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loans by type
    /// Türe göre kredileri getirir
    /// </summary>
    Task<IReadOnlyList<Loan>> GetByTypeAsync(LoanType loanType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loans by lender
    /// Kredi verene göre kredileri getirir
    /// </summary>
    Task<IReadOnlyList<Loan>> GetByLenderAsync(int lenderId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active loans
    /// Aktif kredileri getirir
    /// </summary>
    Task<IReadOnlyList<Loan>> GetActiveLoansAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loans with upcoming payments in date range
    /// Belirli tarih aralığında yaklaşan ödemeleri olan kredileri getirir
    /// </summary>
    Task<IReadOnlyList<Loan>> GetLoansWithUpcomingPaymentsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get overdue loans (with unpaid installments past due date)
    /// Vadesi geçmiş kredileri getirir
    /// </summary>
    Task<IReadOnlyList<Loan>> GetOverdueLoansAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loans ending in date range
    /// Belirli tarih aralığında biten kredileri getirir
    /// </summary>
    Task<IReadOnlyList<Loan>> GetLoansEndingInRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get total remaining principal for active loans
    /// Aktif kredilerin toplam kalan anaparasını getirir
    /// </summary>
    Task<decimal> GetTotalRemainingPrincipalAsync(string? currency = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get loan schedule items for a loan
    /// Bir kredinin ödeme planı kalemlerini getirir
    /// </summary>
    Task<IReadOnlyList<LoanSchedule>> GetScheduleItemsAsync(int loanId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get upcoming schedule items for all active loans
    /// Tüm aktif krediler için yaklaşan ödeme planı kalemlerini getirir
    /// </summary>
    Task<IReadOnlyList<LoanSchedule>> GetUpcomingScheduleItemsAsync(int days = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get overdue schedule items for all active loans
    /// Tüm aktif krediler için vadesi geçmiş ödeme planı kalemlerini getirir
    /// </summary>
    Task<IReadOnlyList<LoanSchedule>> GetOverdueScheduleItemsAsync(CancellationToken cancellationToken = default);
}
