using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Finance.Interfaces;

/// <summary>
/// Unit of Work interface specific to the Finance module.
/// Provides access to finance-specific repositories while inheriting
/// all base UoW functionality (transactions, generic repositories, etc.)
///
/// This interface enables:
/// - Strong typing for dependency injection in Finance handlers
/// - Access to domain-specific repositories
/// - Consistent transaction management across Finance operations
/// </summary>
/// <remarks>
/// Implementation: <see cref="Infrastructure.Persistence.FinanceUnitOfWork"/>
/// Pattern: Inherits from IUnitOfWork (Pattern A - BaseUnitOfWork)
///
/// IMPORTANT: The Finance module uses BaseEntity with int Id (not Entity&lt;Guid&gt;),
/// so the generic Repository&lt;T&gt; and ReadRepository&lt;T&gt; methods from IUnitOfWork
/// are not supported. Use the domain-specific repository properties instead.
/// </remarks>
public interface IFinanceUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant identifier.
    /// All operations are scoped to this tenant.
    /// </summary>
    Guid TenantId { get; }

    #region Domain-Specific Repositories

    /// <summary>
    /// Gets the Account (Chart of Accounts / Hesap Planı) repository.
    /// </summary>
    IAccountRepository Accounts { get; }

    /// <summary>
    /// Gets the CurrentAccount repository.
    /// </summary>
    ICurrentAccountRepository CurrentAccounts { get; }

    /// <summary>
    /// Gets the Invoice repository.
    /// </summary>
    IInvoiceRepository Invoices { get; }

    /// <summary>
    /// Gets the Expense repository.
    /// </summary>
    IExpenseRepository Expenses { get; }

    /// <summary>
    /// Gets the Payment repository.
    /// </summary>
    IPaymentRepository Payments { get; }

    /// <summary>
    /// Gets the CashAccount repository.
    /// </summary>
    ICashAccountRepository CashAccounts { get; }

    /// <summary>
    /// Gets the Budget repository.
    /// </summary>
    IBudgetRepository Budgets { get; }

    /// <summary>
    /// Gets the CostCenter (Masraf Merkezi) repository.
    /// </summary>
    ICostCenterRepository CostCenters { get; }

    /// <summary>
    /// Gets the Loan (Kredi) repository.
    /// </summary>
    ILoanRepository Loans { get; }

    /// <summary>
    /// Gets the FixedAsset (Sabit Kıymet) repository.
    /// </summary>
    IFixedAssetRepository FixedAssets { get; }

    /// <summary>
    /// Gets the ExchangeRate (Döviz Kuru) repository.
    /// </summary>
    IExchangeRateRepository ExchangeRates { get; }

    /// <summary>
    /// Gets the AccountingPeriod (Muhasebe Dönemi) repository.
    /// </summary>
    IAccountingPeriodRepository AccountingPeriods { get; }

    /// <summary>
    /// Gets the JournalEntry (Yevmiye Kaydı) repository.
    /// </summary>
    IJournalEntryRepository JournalEntries { get; }

    #endregion
}
