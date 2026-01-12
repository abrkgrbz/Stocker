using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;
using Stocker.Modules.Manufacturing.Infrastructure.Repositories;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using System.Collections.Concurrent;

namespace Stocker.Modules.Manufacturing.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for the Manufacturing module.
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
/// - Exposes ALL Manufacturing repositories
///
/// IMPORTANT: The Manufacturing module uses BaseEntity with int Id (not Entity&lt;Guid&gt;),
/// so the generic Repository&lt;T&gt; and ReadRepository&lt;T&gt; methods are not supported.
/// Use the domain-specific repository properties instead.
///
/// Usage in handlers:
/// <code>
/// public class CreateMaintenancePlanHandler
/// {
///     private readonly IManufacturingUnitOfWork _unitOfWork;
///
///     public async Task Handle(CreateMaintenancePlanCommand command)
///     {
///         await _unitOfWork.BeginTransactionAsync();
///         try
///         {
///             var plan = new MaintenancePlan(...);
///             await _unitOfWork.MaintenancePlans.AddAsync(plan);
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
public sealed class ManufacturingUnitOfWork : IManufacturingUnitOfWork, IAsyncDisposable
{
    #region Fields

    private readonly ManufacturingDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ManufacturingUnitOfWork>? _logger;

    private IDbContextTransaction? _transaction;
    private bool _disposed;
    private Guid _transactionCorrelationId;

    /// <summary>
    /// Thread-safe cache for repository instances.
    /// </summary>
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    // Lazy-initialized repository backing fields - Core Manufacturing
    private IWorkCenterRepository? _workCenters;
    private IMachineRepository? _machines;
    private IBillOfMaterialRepository? _billOfMaterials;
    private IRoutingRepository? _routings;
    private IProductionOrderRepository? _productionOrders;
    private IQualityInspectionRepository? _qualityInspections;

    // MRP/MPS
    private IMrpPlanRepository? _mrpPlans;
    private IMasterProductionScheduleRepository? _masterProductionSchedules;

    // CRP
    private ICapacityPlanRepository? _capacityPlans;

    // Subcontract
    private ISubcontractOrderRepository? _subcontractOrders;

    // Cost Accounting
    private IProductionCostRecordRepository? _productionCostRecords;
    private ICostCenterRepository? _costCenters;
    private IStandardCostCardRepository? _standardCostCards;

    // KPI Dashboard
    private IKpiDefinitionRepository? _kpiDefinitions;
    private IKpiValueRepository? _kpiValues;
    private IKpiTargetRepository? _kpiTargets;
    private IDashboardConfigurationRepository? _dashboardConfigurations;
    private IOeeRecordRepository? _oeeRecords;
    private IProductionPerformanceSummaryRepository? _productionPerformanceSummaries;

    // Maintenance
    private IMaintenancePlanRepository? _maintenancePlans;
    private IMaintenanceTaskRepository? _maintenanceTasks;
    private IMaintenanceRecordRepository? _maintenanceRecords;
    private ISparePartRepository? _spareParts;
    private IMachineCounterRepository? _machineCounters;

    // Quality Management (NCR/CAPA)
    private INonConformanceReportRepository? _nonConformanceReports;
    private ICorrectivePreventiveActionRepository? _correctivePreventiveActions;

    // Material Management
    private IMaterialReservationRepository? _materialReservations;

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="ManufacturingUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The Manufacturing database context.</param>
    /// <param name="tenantService">The tenant service for multi-tenancy support.</param>
    /// <param name="logger">Optional logger for transaction lifecycle events.</param>
    /// <exception cref="ArgumentNullException">Thrown when context or tenantService is null.</exception>
    public ManufacturingUnitOfWork(
        ManufacturingDbContext context,
        ITenantService tenantService,
        ILogger<ManufacturingUnitOfWork>? logger = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
        _logger = logger;
    }

    #endregion

    #region IManufacturingUnitOfWork Implementation

    /// <inheritdoc />
    public Guid TenantId => _tenantService.GetCurrentTenantId()
        ?? throw new InvalidOperationException("No tenant context available. Ensure tenant middleware is configured.");

    #endregion

    #region Core Manufacturing Repositories

    /// <inheritdoc />
    public IWorkCenterRepository WorkCenters =>
        _workCenters ??= GetOrAddSpecificRepository<IWorkCenterRepository, WorkCenterRepository>();

    /// <inheritdoc />
    public IMachineRepository Machines =>
        _machines ??= GetOrAddSpecificRepository<IMachineRepository, MachineRepository>();

    /// <inheritdoc />
    public IBillOfMaterialRepository BillOfMaterials =>
        _billOfMaterials ??= GetOrAddSpecificRepository<IBillOfMaterialRepository, BillOfMaterialRepository>();

    /// <inheritdoc />
    public IRoutingRepository Routings =>
        _routings ??= GetOrAddSpecificRepository<IRoutingRepository, RoutingRepository>();

    /// <inheritdoc />
    public IProductionOrderRepository ProductionOrders =>
        _productionOrders ??= GetOrAddSpecificRepository<IProductionOrderRepository, ProductionOrderRepository>();

    /// <inheritdoc />
    public IQualityInspectionRepository QualityInspections =>
        _qualityInspections ??= GetOrAddSpecificRepository<IQualityInspectionRepository, QualityInspectionRepository>();

    #endregion

    #region MRP/MPS Repositories

    /// <inheritdoc />
    public IMrpPlanRepository MrpPlans =>
        _mrpPlans ??= GetOrAddSpecificRepository<IMrpPlanRepository, MrpPlanRepository>();

    /// <inheritdoc />
    public IMasterProductionScheduleRepository MasterProductionSchedules =>
        _masterProductionSchedules ??= GetOrAddSpecificRepository<IMasterProductionScheduleRepository, MasterProductionScheduleRepository>();

    #endregion

    #region CRP Repositories

    /// <inheritdoc />
    public ICapacityPlanRepository CapacityPlans =>
        _capacityPlans ??= GetOrAddSpecificRepository<ICapacityPlanRepository, CapacityPlanRepository>();

    #endregion

    #region Subcontract Repositories

    /// <inheritdoc />
    public ISubcontractOrderRepository SubcontractOrders =>
        _subcontractOrders ??= GetOrAddSpecificRepository<ISubcontractOrderRepository, SubcontractOrderRepository>();

    #endregion

    #region Cost Accounting Repositories

    /// <inheritdoc />
    public IProductionCostRecordRepository ProductionCostRecords =>
        _productionCostRecords ??= GetOrAddSpecificRepository<IProductionCostRecordRepository, ProductionCostRecordRepository>();

    /// <inheritdoc />
    public ICostCenterRepository CostCenters =>
        _costCenters ??= GetOrAddSpecificRepository<ICostCenterRepository, CostCenterRepository>();

    /// <inheritdoc />
    public IStandardCostCardRepository StandardCostCards =>
        _standardCostCards ??= GetOrAddSpecificRepository<IStandardCostCardRepository, StandardCostCardRepository>();

    #endregion

    #region KPI Dashboard Repositories

    /// <inheritdoc />
    public IKpiDefinitionRepository KpiDefinitions =>
        _kpiDefinitions ??= GetOrAddSpecificRepository<IKpiDefinitionRepository, KpiDefinitionRepository>();

    /// <inheritdoc />
    public IKpiValueRepository KpiValues =>
        _kpiValues ??= GetOrAddSpecificRepository<IKpiValueRepository, KpiValueRepository>();

    /// <inheritdoc />
    public IKpiTargetRepository KpiTargets =>
        _kpiTargets ??= GetOrAddSpecificRepository<IKpiTargetRepository, KpiTargetRepository>();

    /// <inheritdoc />
    public IDashboardConfigurationRepository DashboardConfigurations =>
        _dashboardConfigurations ??= GetOrAddSpecificRepository<IDashboardConfigurationRepository, DashboardConfigurationRepository>();

    /// <inheritdoc />
    public IOeeRecordRepository OeeRecords =>
        _oeeRecords ??= GetOrAddSpecificRepository<IOeeRecordRepository, OeeRecordRepository>();

    /// <inheritdoc />
    public IProductionPerformanceSummaryRepository ProductionPerformanceSummaries =>
        _productionPerformanceSummaries ??= GetOrAddSpecificRepository<IProductionPerformanceSummaryRepository, ProductionPerformanceSummaryRepository>();

    #endregion

    #region Maintenance Repositories

    /// <inheritdoc />
    public IMaintenancePlanRepository MaintenancePlans =>
        _maintenancePlans ??= GetOrAddSpecificRepository<IMaintenancePlanRepository, MaintenancePlanRepository>();

    /// <inheritdoc />
    public IMaintenanceTaskRepository MaintenanceTasks =>
        _maintenanceTasks ??= GetOrAddSpecificRepository<IMaintenanceTaskRepository, MaintenanceTaskRepository>();

    /// <inheritdoc />
    public IMaintenanceRecordRepository MaintenanceRecords =>
        _maintenanceRecords ??= GetOrAddSpecificRepository<IMaintenanceRecordRepository, MaintenanceRecordRepository>();

    /// <inheritdoc />
    public ISparePartRepository SpareParts =>
        _spareParts ??= GetOrAddSpecificRepository<ISparePartRepository, SparePartRepository>();

    /// <inheritdoc />
    public IMachineCounterRepository MachineCounters =>
        _machineCounters ??= GetOrAddSpecificRepository<IMachineCounterRepository, MachineCounterRepository>();

    #endregion

    #region Quality Management (NCR/CAPA) Repositories

    /// <inheritdoc />
    public INonConformanceReportRepository NonConformanceReports =>
        _nonConformanceReports ??= GetOrAddSpecificRepository<INonConformanceReportRepository, NonConformanceReportRepository>();

    /// <inheritdoc />
    public ICorrectivePreventiveActionRepository CorrectivePreventiveActions =>
        _correctivePreventiveActions ??= GetOrAddSpecificRepository<ICorrectivePreventiveActionRepository, CorrectivePreventiveActionRepository>();

    #endregion

    #region Material Management Repositories

    /// <inheritdoc />
    public IMaterialReservationRepository MaterialReservations =>
        _materialReservations ??= GetOrAddSpecificRepository<IMaterialReservationRepository, MaterialReservationRepository>();

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
            "Transaction started. CorrelationId: {CorrelationId}, Context: ManufacturingDbContext",
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
                "Transaction committed successfully. CorrelationId: {CorrelationId}, Context: ManufacturingDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction commit failed. Rolling back. CorrelationId: {CorrelationId}, Context: ManufacturingDbContext",
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
                "Transaction rolled back. CorrelationId: {CorrelationId}, Context: ManufacturingDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction rollback failed. CorrelationId: {CorrelationId}, Context: ManufacturingDbContext",
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
    /// NOT SUPPORTED in Manufacturing module - use domain-specific repository properties instead.
    /// </summary>
    /// <remarks>
    /// The Manufacturing module uses BaseEntity with int Id, not Entity&lt;Guid&gt;.
    /// Use the typed repository properties like WorkCenters, Machines, etc.
    /// </remarks>
    /// <exception cref="NotSupportedException">
    /// Always thrown. Manufacturing module uses int-based IDs and does not support generic Entity&lt;Guid&gt; repositories.
    /// </exception>
    public IRepository<TEntity> Repository<TEntity>() where TEntity : Entity<Guid>
    {
        throw new NotSupportedException(
            "Manufacturing module uses BaseEntity with int Id, not Entity<Guid>. " +
            "Use the domain-specific repository properties (WorkCenters, Machines, etc.) instead.");
    }

    /// <summary>
    /// Gets a read-only repository for the specified entity type.
    /// NOT SUPPORTED in Manufacturing module - use domain-specific repository properties instead.
    /// </summary>
    /// <remarks>
    /// The Manufacturing module uses BaseEntity with int Id, not Entity&lt;Guid&gt;.
    /// Use the typed repository properties like WorkCenters, Machines, etc.
    /// </remarks>
    /// <exception cref="NotSupportedException">
    /// Always thrown. Manufacturing module uses int-based IDs and does not support generic Entity&lt;Guid&gt; repositories.
    /// </exception>
    public IReadRepository<TEntity> ReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        throw new NotSupportedException(
            "Manufacturing module uses BaseEntity with int Id, not Entity<Guid>. " +
            "Use the domain-specific repository properties (WorkCenters, Machines, etc.) instead.");
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
                "CorrelationId: {CorrelationId}, Context: ManufacturingDbContext. " +
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
                    "CorrelationId: {CorrelationId}, Context: ManufacturingDbContext. " +
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
