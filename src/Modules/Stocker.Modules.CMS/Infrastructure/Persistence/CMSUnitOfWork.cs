using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence.Repositories;
using Stocker.Modules.CMS.Infrastructure.Repositories;
using Stocker.Modules.CMS.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using System.Collections.Concurrent;

namespace Stocker.Modules.CMS.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for the CMS (Content Management System) module.
/// Implements IUnitOfWork directly to avoid circular dependency with Stocker.Persistence.
///
/// This class provides:
/// - Transaction management with strict mode
/// - Repository access with caching
/// - Domain-specific repository properties for type-safe dependency injection
/// - IAsyncDisposable for proper async cleanup
/// </summary>
/// <remarks>
/// NOTE: CMS module is stored in master database (not tenant-specific)
/// So there's no TenantId property unlike other module UnitOfWorks.
///
/// Key features:
/// - Thread-safe repository caching using ConcurrentDictionary
/// - Strict transaction management (throws on duplicate begin, instead of silent return)
/// - Correlation ID logging for transaction lifecycle
/// - Exposes ALL CMS repositories
///
/// Usage in handlers:
/// <code>
/// public class CreatePageHandler
/// {
///     private readonly ICMSUnitOfWork _unitOfWork;
///
///     public async Task Handle(CreatePageCommand command)
///     {
///         await _unitOfWork.BeginTransactionAsync();
///         try
///         {
///             var page = new CMSPage(...);
///             await _unitOfWork.Pages.AddAsync(page);
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
public sealed class CMSUnitOfWork : ICMSUnitOfWork, IAsyncDisposable
{
    #region Fields

    private readonly CMSDbContext _context;
    private readonly ILogger<CMSUnitOfWork>? _logger;

    private IDbContextTransaction? _transaction;
    private bool _disposed;
    private Guid _transactionCorrelationId;

    /// <summary>
    /// Thread-safe cache for repository instances.
    /// </summary>
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    // Core CMS repositories
    private ICMSPageRepository? _pages;
    private IBlogRepository? _blog;
    private IFAQRepository? _faq;
    private ICMSSettingRepository? _settings;

    // Landing Page repositories
    private ITestimonialRepository? _testimonials;
    private IPricingPlanRepository? _pricingPlans;
    private IPricingFeatureRepository? _pricingFeatures;
    private IFeatureRepository? _features;
    private IIndustryRepository? _industries;
    private IIntegrationRepository? _integrations;
    private IIntegrationItemRepository? _integrationItems;
    private IStatRepository? _stats;
    private IPartnerRepository? _partners;
    private IAchievementRepository? _achievements;

    // Company Page repositories
    private ITeamMemberRepository? _teamMembers;
    private ICompanyValueRepository? _companyValues;
    private IContactInfoRepository? _contactInfo;
    private ISocialLinkRepository? _socialLinks;

    // Documentation repositories
    private IDocCategoryRepository? _docCategories;
    private IDocArticleRepository? _docArticles;

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="CMSUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The CMS database context.</param>
    /// <param name="logger">Optional logger for transaction lifecycle events.</param>
    /// <exception cref="ArgumentNullException">Thrown when context is null.</exception>
    public CMSUnitOfWork(
        CMSDbContext context,
        ILogger<CMSUnitOfWork>? logger = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger;
    }

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
            "Transaction started. CorrelationId: {CorrelationId}, Context: CMSDbContext",
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
                "Transaction committed successfully. CorrelationId: {CorrelationId}, Context: CMSDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction commit failed. Rolling back. CorrelationId: {CorrelationId}, Context: CMSDbContext",
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
                "Transaction rolled back. CorrelationId: {CorrelationId}, Context: CMSDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction rollback failed. CorrelationId: {CorrelationId}, Context: CMSDbContext",
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

    /// <inheritdoc />
    public IRepository<TEntity> Repository<TEntity>() where TEntity : Entity<Guid>
    {
        ThrowIfDisposed();
        return GetOrAddRepository<TEntity>();
    }

    /// <inheritdoc />
    public IReadRepository<TEntity> ReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        ThrowIfDisposed();
        return GetOrAddReadRepository<TEntity>();
    }

    private IRepository<TEntity> GetOrAddRepository<TEntity>() where TEntity : Entity<Guid>
    {
        var entityType = typeof(TEntity);
        return (IRepository<TEntity>)_repositories.GetOrAdd(
            entityType,
            _ => new CMSGenericRepository<TEntity>(_context));
    }

    private IReadRepository<TEntity> GetOrAddReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        var entityType = typeof(TEntity);
        // Use same cache key but cast to IReadRepository - CMSGenericRepository implements both
        return (IReadRepository<TEntity>)_repositories.GetOrAdd(
            entityType,
            _ => new CMSGenericRepository<TEntity>(_context));
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

    #region Core CMS Repositories

    /// <inheritdoc />
    public ICMSPageRepository Pages =>
        _pages ??= GetOrAddSpecificRepository<ICMSPageRepository, CMSPageRepository>();

    /// <inheritdoc />
    public IBlogRepository Blog =>
        _blog ??= GetOrAddSpecificRepository<IBlogRepository, BlogRepository>();

    /// <inheritdoc />
    public IFAQRepository FAQ =>
        _faq ??= GetOrAddSpecificRepository<IFAQRepository, FAQRepository>();

    /// <inheritdoc />
    public ICMSSettingRepository Settings =>
        _settings ??= GetOrAddSpecificRepository<ICMSSettingRepository, CMSSettingRepository>();

    #endregion

    #region Landing Page Repositories

    /// <inheritdoc />
    public ITestimonialRepository Testimonials =>
        _testimonials ??= GetOrAddSpecificRepository<ITestimonialRepository, TestimonialRepository>();

    /// <inheritdoc />
    public IPricingPlanRepository PricingPlans =>
        _pricingPlans ??= GetOrAddSpecificRepository<IPricingPlanRepository, PricingPlanRepository>();

    /// <inheritdoc />
    public IPricingFeatureRepository PricingFeatures =>
        _pricingFeatures ??= GetOrAddSpecificRepository<IPricingFeatureRepository, PricingFeatureRepository>();

    /// <inheritdoc />
    public IFeatureRepository Features =>
        _features ??= GetOrAddSpecificRepository<IFeatureRepository, FeatureRepository>();

    /// <inheritdoc />
    public IIndustryRepository Industries =>
        _industries ??= GetOrAddSpecificRepository<IIndustryRepository, IndustryRepository>();

    /// <inheritdoc />
    public IIntegrationRepository Integrations =>
        _integrations ??= GetOrAddSpecificRepository<IIntegrationRepository, IntegrationRepository>();

    /// <inheritdoc />
    public IIntegrationItemRepository IntegrationItems =>
        _integrationItems ??= GetOrAddSpecificRepository<IIntegrationItemRepository, IntegrationItemRepository>();

    /// <inheritdoc />
    public IStatRepository Stats =>
        _stats ??= GetOrAddSpecificRepository<IStatRepository, StatRepository>();

    /// <inheritdoc />
    public IPartnerRepository Partners =>
        _partners ??= GetOrAddSpecificRepository<IPartnerRepository, PartnerRepository>();

    /// <inheritdoc />
    public IAchievementRepository Achievements =>
        _achievements ??= GetOrAddSpecificRepository<IAchievementRepository, AchievementRepository>();

    #endregion

    #region Company Page Repositories

    /// <inheritdoc />
    public ITeamMemberRepository TeamMembers =>
        _teamMembers ??= GetOrAddSpecificRepository<ITeamMemberRepository, TeamMemberRepository>();

    /// <inheritdoc />
    public ICompanyValueRepository CompanyValues =>
        _companyValues ??= GetOrAddSpecificRepository<ICompanyValueRepository, CompanyValueRepository>();

    /// <inheritdoc />
    public IContactInfoRepository ContactInfo =>
        _contactInfo ??= GetOrAddSpecificRepository<IContactInfoRepository, ContactInfoRepository>();

    /// <inheritdoc />
    public ISocialLinkRepository SocialLinks =>
        _socialLinks ??= GetOrAddSpecificRepository<ISocialLinkRepository, SocialLinkRepository>();

    #endregion

    #region Documentation Repositories

    /// <inheritdoc />
    public IDocCategoryRepository DocCategories =>
        _docCategories ??= GetOrAddSpecificRepository<IDocCategoryRepository, DocCategoryRepository>();

    /// <inheritdoc />
    public IDocArticleRepository DocArticles =>
        _docArticles ??= GetOrAddSpecificRepository<IDocArticleRepository, DocArticleRepository>();

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
                "CorrelationId: {CorrelationId}, Context: CMSDbContext. " +
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
                    "CorrelationId: {CorrelationId}, Context: CMSDbContext. " +
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
