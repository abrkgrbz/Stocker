using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for the Finance module.
/// Implements IUnitOfWork directly to avoid circular dependency with Stocker.Persistence.
///
/// This class provides:
/// - Transaction management with strict mode
/// - Repository access with caching
/// - Domain-specific repository properties for type-safe dependency injection
/// - Multi-tenancy support via TenantId property
/// - IAsyncDisposable for proper async cleanup
/// </summary>
/// <remarks>
/// Key features:
/// - Thread-safe repository caching using ConcurrentDictionary
/// - Strict transaction management (throws on duplicate begin, instead of silent return)
/// - Correlation ID logging for transaction lifecycle
/// - Exposes ALL Finance repositories
///
/// IMPORTANT: The Finance module uses BaseEntity with int Id (not Entity&lt;Guid&gt;),
/// so the generic Repository&lt;T&gt; and ReadRepository&lt;T&gt; methods are not supported.
/// Use the domain-specific repository properties instead.
///
/// Usage in handlers:
/// <code>
/// public class CreateInvoiceHandler
/// {
///     private readonly IFinanceUnitOfWork _unitOfWork;
///
///     public async Task Handle(CreateInvoiceCommand command)
///     {
///         await _unitOfWork.BeginTransactionAsync();
///         try
///         {
///             var invoice = new Invoice(...);
///             await _unitOfWork.Invoices.AddAsync(invoice);
///             await _unitOfWork.CommitTransactionAsync();
///         }
///         catch
///         {
///             await _unitOfWork.RollbackTransactionAsync();
///             throw;
///         }
///     }
/// }
/// </code>
/// </remarks>
public sealed class FinanceUnitOfWork : IFinanceUnitOfWork, IAsyncDisposable
{
    #region Fields

    private readonly FinanceDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<FinanceUnitOfWork>? _logger;

    private IDbContextTransaction? _transaction;
    private bool _disposed;
    private Guid _transactionCorrelationId;

    /// <summary>
    /// Thread-safe cache for repository instances.
    /// </summary>
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    // Lazy-initialized repository backing fields
    private IAccountRepository? _accounts;
    private ICurrentAccountRepository? _currentAccounts;
    private IInvoiceRepository? _invoices;
    private IExpenseRepository? _expenses;
    private IPaymentRepository? _payments;
    private ICashAccountRepository? _cashAccounts;
    private IBudgetRepository? _budgets;
    private ICostCenterRepository? _costCenters;
    private ILoanRepository? _loans;
    private IFixedAssetRepository? _fixedAssets;
    private IExchangeRateRepository? _exchangeRates;
    private IAccountingPeriodRepository? _accountingPeriods;
    private IJournalEntryRepository? _journalEntries;

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="FinanceUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The Finance database context.</param>
    /// <param name="tenantService">The tenant service for multi-tenancy support.</param>
    /// <param name="logger">Optional logger for transaction lifecycle events.</param>
    /// <exception cref="ArgumentNullException">Thrown when context or tenantService is null.</exception>
    public FinanceUnitOfWork(
        FinanceDbContext context,
        ITenantService tenantService,
        ILogger<FinanceUnitOfWork>? logger = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
        _logger = logger;
    }

    #endregion

    #region IFinanceUnitOfWork Implementation

    /// <inheritdoc />
    public Guid TenantId => _tenantService.GetCurrentTenantId()
        ?? throw new InvalidOperationException("No tenant context available. Ensure tenant middleware is configured.");

    #endregion

    #region Domain-Specific Repositories

    /// <inheritdoc />
    public IAccountRepository Accounts =>
        _accounts ??= GetOrAddSpecificRepository<IAccountRepository, AccountRepository>();

    /// <inheritdoc />
    public ICurrentAccountRepository CurrentAccounts =>
        _currentAccounts ??= GetOrAddSpecificRepository<ICurrentAccountRepository, CurrentAccountRepository>();

    /// <inheritdoc />
    public IInvoiceRepository Invoices =>
        _invoices ??= GetOrAddSpecificRepository<IInvoiceRepository, InvoiceRepository>();

    /// <inheritdoc />
    public IExpenseRepository Expenses =>
        _expenses ??= GetOrAddSpecificRepository<IExpenseRepository, ExpenseRepository>();

    /// <inheritdoc />
    public IPaymentRepository Payments =>
        _payments ??= GetOrAddSpecificRepository<IPaymentRepository, PaymentRepository>();

    /// <inheritdoc />
    public ICashAccountRepository CashAccounts =>
        _cashAccounts ??= GetOrAddSpecificRepository<ICashAccountRepository, CashAccountRepository>();

    /// <inheritdoc />
    public IBudgetRepository Budgets =>
        _budgets ??= GetOrAddSpecificRepository<IBudgetRepository, BudgetRepository>();

    /// <inheritdoc />
    public ICostCenterRepository CostCenters =>
        _costCenters ??= GetOrAddSpecificRepository<ICostCenterRepository, CostCenterRepository>();

    /// <inheritdoc />
    public ILoanRepository Loans =>
        _loans ??= GetOrAddSpecificRepository<ILoanRepository, LoanRepository>();

    /// <inheritdoc />
    public IFixedAssetRepository FixedAssets =>
        _fixedAssets ??= GetOrAddSpecificRepository<IFixedAssetRepository, FixedAssetRepository>();

    /// <inheritdoc />
    public IExchangeRateRepository ExchangeRates =>
        _exchangeRates ??= GetOrAddSpecificRepository<IExchangeRateRepository, ExchangeRateRepository>();

    /// <inheritdoc />
    public IAccountingPeriodRepository AccountingPeriods =>
        _accountingPeriods ??= GetOrAddSpecificRepository<IAccountingPeriodRepository, AccountingPeriodRepository>();

    /// <inheritdoc />
    public IJournalEntryRepository JournalEntries =>
        _journalEntries ??= GetOrAddSpecificRepository<IJournalEntryRepository, JournalEntryRepository>();

    #endregion

    #region IUnitOfWork Implementation - Persistence Operations

    /// <inheritdoc />
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();
        return await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public int SaveChanges()
    {
        ThrowIfDisposed();
        return _context.SaveChanges();
    }

    /// <inheritdoc />
    public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();
        var result = await _context.SaveChangesAsync(cancellationToken);
        return result > 0;
    }

    #endregion

    #region IUnitOfWork Implementation - Transaction Management

    /// <inheritdoc />
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction != null)
        {
            _transactionCorrelationId = Guid.NewGuid();
            var message = $"Cannot begin transaction. A transaction is already active. CorrelationId: {_transactionCorrelationId}";
            _logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        _transactionCorrelationId = Guid.NewGuid();
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        _logger?.LogDebug(
            "Transaction started. CorrelationId: {CorrelationId}, Context: FinanceDbContext",
            _transactionCorrelationId);
    }

    /// <inheritdoc />
    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction == null)
        {
            var message = $"Cannot commit transaction. No active transaction found. CorrelationId: {_transactionCorrelationId}";
            _logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        try
        {
            await SaveChangesAsync(cancellationToken);
            await _transaction.CommitAsync(cancellationToken);

            _logger?.LogInformation(
                "Transaction committed successfully. CorrelationId: {CorrelationId}, Context: FinanceDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction commit failed. Rolling back. CorrelationId: {CorrelationId}, Context: FinanceDbContext",
                _transactionCorrelationId);

            await RollbackTransactionInternalAsync(cancellationToken);
            throw;
        }
        finally
        {
            await DisposeTransactionAsync();
        }
    }

    /// <inheritdoc />
    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction == null)
        {
            var message = $"Cannot rollback transaction. No active transaction found. CorrelationId: {_transactionCorrelationId}";
            _logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        await RollbackTransactionInternalAsync(cancellationToken);
        await DisposeTransactionAsync();
    }

    /// <inheritdoc />
    public bool HasActiveTransaction => _transaction != null;

    private async Task RollbackTransactionInternalAsync(CancellationToken cancellationToken)
    {
        if (_transaction == null) return;

        try
        {
            await _transaction.RollbackAsync(cancellationToken);
            _logger?.LogWarning(
                "Transaction rolled back. CorrelationId: {CorrelationId}, Context: FinanceDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction rollback failed. CorrelationId: {CorrelationId}, Context: FinanceDbContext",
                _transactionCorrelationId);
            throw;
        }
    }

    private async Task DisposeTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    #endregion

    #region IUnitOfWork Implementation - Repository Access

    /// <summary>
    /// Gets a repository for the specified entity type.
    /// NOT SUPPORTED in Finance module - use domain-specific repository properties instead.
    /// </summary>
    /// <remarks>
    /// The Finance module uses BaseEntity with int Id, not Entity&lt;Guid&gt;.
    /// Use the typed repository properties like CurrentAccounts, Invoices, etc.
    /// </remarks>
    /// <exception cref="NotSupportedException">
    /// Always thrown. Finance module uses int-based IDs and does not support generic Entity&lt;Guid&gt; repositories.
    /// </exception>
    public IRepository<TEntity> Repository<TEntity>() where TEntity : Entity<Guid>
    {
        throw new NotSupportedException(
            "Finance module uses BaseEntity with int Id, not Entity<Guid>. " +
            "Use the domain-specific repository properties (CurrentAccounts, Invoices, etc.) instead.");
    }

    /// <summary>
    /// Gets a read-only repository for the specified entity type.
    /// NOT SUPPORTED in Finance module - use domain-specific repository properties instead.
    /// </summary>
    /// <remarks>
    /// The Finance module uses BaseEntity with int Id, not Entity&lt;Guid&gt;.
    /// Use the typed repository properties like CurrentAccounts, Invoices, etc.
    /// </remarks>
    /// <exception cref="NotSupportedException">
    /// Always thrown. Finance module uses int-based IDs and does not support generic Entity&lt;Guid&gt; repositories.
    /// </exception>
    public IReadRepository<TEntity> ReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        throw new NotSupportedException(
            "Finance module uses BaseEntity with int Id, not Entity<Guid>. " +
            "Use the domain-specific repository properties (CurrentAccounts, Invoices, etc.) instead.");
    }

    /// <summary>
    /// Gets or creates a cached instance of a specific repository type.
    /// </summary>
    private TRepository GetOrAddSpecificRepository<TRepository, TImplementation>()
        where TRepository : class
        where TImplementation : TRepository
    {
        var repositoryType = typeof(TRepository);
        return (TRepository)_repositories.GetOrAdd(
            repositoryType,
            _ => Activator.CreateInstance(typeof(TImplementation), _context)
                 ?? throw new InvalidOperationException(
                     $"Failed to create repository instance of type {typeof(TImplementation).Name}"));
    }

    #endregion

    #region Disposal

    /// <inheritdoc />
    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();
        Dispose(disposing: false);
        GC.SuppressFinalize(this);
    }

    private async ValueTask DisposeAsyncCore()
    {
        if (_disposed) return;

        if (_transaction != null)
        {
            _logger?.LogError(
                "UnitOfWork disposed with uncommitted transaction! " +
                "CorrelationId: {CorrelationId}, Context: FinanceDbContext. " +
                "This may indicate a bug - transactions should be explicitly committed or rolled back.",
                _transactionCorrelationId);

            await _transaction.DisposeAsync();
            _transaction = null;
        }

        await _context.DisposeAsync();
        _repositories.Clear();
    }

    private void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            if (_transaction != null)
            {
                _logger?.LogError(
                    "UnitOfWork disposed with uncommitted transaction! " +
                    "CorrelationId: {CorrelationId}, Context: FinanceDbContext. " +
                    "This may indicate a bug - transactions should be explicitly committed or rolled back.",
                    _transactionCorrelationId);

                _transaction.Dispose();
                _transaction = null;
            }

            _context.Dispose();
            _repositories.Clear();
        }

        _disposed = true;
    }

    private void ThrowIfDisposed()
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(GetType().Name);
        }
    }

    #endregion
}
