using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence.Repositories;
using Stocker.Modules.HR.Infrastructure.Repositories;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using System.Collections.Concurrent;

namespace Stocker.Modules.HR.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for the HR (Human Resources) module.
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
/// - Exposes ALL HR repositories
///
/// Usage in handlers:
/// <code>
/// public class CreateEmployeeHandler
/// {
///     private readonly IHRUnitOfWork _unitOfWork;
///
///     public async Task Handle(CreateEmployeeCommand command)
///     {
///         await _unitOfWork.BeginTransactionAsync();
///         try
///         {
///             var employee = new Employee(...);
///             await _unitOfWork.Employees.AddAsync(employee);
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
public sealed class HRUnitOfWork : IHRUnitOfWork, IAsyncDisposable
{
    #region Fields

    private readonly HRDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<HRUnitOfWork>? _logger;

    private IDbContextTransaction? _transaction;
    private bool _disposed;
    private Guid _transactionCorrelationId;

    /// <summary>
    /// Thread-safe cache for repository instances.
    /// </summary>
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    // Core Employee Management repositories
    private IEmployeeRepository? _employees;
    private IDepartmentRepository? _departments;
    private IPositionRepository? _positions;

    // Work Location and Shift repositories
    private IWorkLocationRepository? _workLocations;
    private IShiftRepository? _shifts;
    private IWorkScheduleRepository? _workSchedules;

    // Time and Attendance repositories
    private IAttendanceRepository? _attendances;
    private ILeaveRepository? _leaves;
    private ILeaveTypeRepository? _leaveTypes;
    private ILeaveBalanceRepository? _leaveBalances;
    private IHolidayRepository? _holidays;
    private IOvertimeRepository? _overtimes;
    private ITimeSheetRepository? _timeSheets;

    // Payroll and Expenses repositories
    private IPayrollRepository? _payrolls;
    private IPayslipRepository? _payslips;
    private IExpenseRepository? _expenses;

    // Performance Management repositories
    private IPerformanceReviewRepository? _performanceReviews;
    private IPerformanceGoalRepository? _performanceGoals;

    // Training repositories
    private ITrainingRepository? _trainings;
    private IEmployeeTrainingRepository? _employeeTrainings;

    // Documents repositories
    private IEmployeeDocumentRepository? _employeeDocuments;

    // Announcements repositories
    private IAnnouncementRepository? _announcements;
    private IAnnouncementAcknowledgmentRepository? _announcementAcknowledgments;

    // Career and Development repositories
    private ICareerPathRepository? _careerPaths;
    private ICertificationRepository? _certifications;
    private IEmployeeSkillRepository? _employeeSkills;
    private ISuccessionPlanRepository? _successionPlans;

    // Disciplinary and Grievance repositories
    private IDisciplinaryActionRepository? _disciplinaryActions;
    private IGrievanceRepository? _grievances;

    // Assets and Benefits repositories
    private IEmployeeAssetRepository? _employeeAssets;
    private IEmployeeBenefitRepository? _employeeBenefits;

    // Recruitment repositories
    private IJobPostingRepository? _jobPostings;
    private IJobApplicationRepository? _jobApplications;
    private IInterviewRepository? _interviews;
    private IOnboardingRepository? _onboardings;

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="HRUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The HR database context.</param>
    /// <param name="tenantService">The tenant service for multi-tenancy support.</param>
    /// <param name="logger">Optional logger for transaction lifecycle events.</param>
    /// <exception cref="ArgumentNullException">Thrown when context or tenantService is null.</exception>
    public HRUnitOfWork(
        HRDbContext context,
        ITenantService tenantService,
        ILogger<HRUnitOfWork>? logger = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
        _logger = logger;
    }

    #endregion

    #region IHRUnitOfWork Implementation

    /// <inheritdoc />
    public Guid TenantId => _tenantService.GetCurrentTenantId()
        ?? throw new InvalidOperationException("No tenant context available. Ensure tenant middleware is configured.");

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
            "Transaction started. CorrelationId: {CorrelationId}, Context: HRDbContext",
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
                "Transaction committed successfully. CorrelationId: {CorrelationId}, Context: HRDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction commit failed. Rolling back. CorrelationId: {CorrelationId}, Context: HRDbContext",
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
                "Transaction rolled back. CorrelationId: {CorrelationId}, Context: HRDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction rollback failed. CorrelationId: {CorrelationId}, Context: HRDbContext",
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
            _ => new HRGenericRepository<TEntity>(_context));
    }

    private IReadRepository<TEntity> GetOrAddReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        var entityType = typeof(TEntity);
        // Use same cache key but cast to IReadRepository - HRGenericRepository implements both
        return (IReadRepository<TEntity>)_repositories.GetOrAdd(
            entityType,
            _ => new HRGenericRepository<TEntity>(_context));
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

    #region Core Employee Management Repositories

    /// <inheritdoc />
    public IEmployeeRepository Employees =>
        _employees ??= GetOrAddSpecificRepository<IEmployeeRepository, EmployeeRepository>();

    /// <inheritdoc />
    public IDepartmentRepository Departments =>
        _departments ??= GetOrAddSpecificRepository<IDepartmentRepository, DepartmentRepository>();

    /// <inheritdoc />
    public IPositionRepository Positions =>
        _positions ??= GetOrAddSpecificRepository<IPositionRepository, PositionRepository>();

    #endregion

    #region Work Location and Shift Repositories

    /// <inheritdoc />
    public IWorkLocationRepository WorkLocations =>
        _workLocations ??= GetOrAddSpecificRepository<IWorkLocationRepository, WorkLocationRepository>();

    /// <inheritdoc />
    public IShiftRepository Shifts =>
        _shifts ??= GetOrAddSpecificRepository<IShiftRepository, ShiftRepository>();

    /// <inheritdoc />
    public IWorkScheduleRepository WorkSchedules =>
        _workSchedules ??= GetOrAddSpecificRepository<IWorkScheduleRepository, WorkScheduleRepository>();

    #endregion

    #region Time and Attendance Repositories

    /// <inheritdoc />
    public IAttendanceRepository Attendances =>
        _attendances ??= GetOrAddSpecificRepository<IAttendanceRepository, AttendanceRepository>();

    /// <inheritdoc />
    public ILeaveRepository Leaves =>
        _leaves ??= GetOrAddSpecificRepository<ILeaveRepository, LeaveRepository>();

    /// <inheritdoc />
    public ILeaveTypeRepository LeaveTypes =>
        _leaveTypes ??= GetOrAddSpecificRepository<ILeaveTypeRepository, LeaveTypeRepository>();

    /// <inheritdoc />
    public ILeaveBalanceRepository LeaveBalances =>
        _leaveBalances ??= GetOrAddSpecificRepository<ILeaveBalanceRepository, LeaveBalanceRepository>();

    /// <inheritdoc />
    public IHolidayRepository Holidays =>
        _holidays ??= GetOrAddSpecificRepository<IHolidayRepository, HolidayRepository>();

    /// <inheritdoc />
    public IOvertimeRepository Overtimes =>
        _overtimes ??= GetOrAddSpecificRepository<IOvertimeRepository, OvertimeRepository>();

    /// <inheritdoc />
    public ITimeSheetRepository TimeSheets =>
        _timeSheets ??= GetOrAddSpecificRepository<ITimeSheetRepository, TimeSheetRepository>();

    #endregion

    #region Payroll and Expenses Repositories

    /// <inheritdoc />
    public IPayrollRepository Payrolls =>
        _payrolls ??= GetOrAddSpecificRepository<IPayrollRepository, PayrollRepository>();

    /// <inheritdoc />
    public IPayslipRepository Payslips =>
        _payslips ??= GetOrAddSpecificRepository<IPayslipRepository, PayslipRepository>();

    /// <inheritdoc />
    public IExpenseRepository Expenses =>
        _expenses ??= GetOrAddSpecificRepository<IExpenseRepository, ExpenseRepository>();

    #endregion

    #region Performance Management Repositories

    /// <inheritdoc />
    public IPerformanceReviewRepository PerformanceReviews =>
        _performanceReviews ??= GetOrAddSpecificRepository<IPerformanceReviewRepository, PerformanceReviewRepository>();

    /// <inheritdoc />
    public IPerformanceGoalRepository PerformanceGoals =>
        _performanceGoals ??= GetOrAddSpecificRepository<IPerformanceGoalRepository, PerformanceGoalRepository>();

    #endregion

    #region Training Repositories

    /// <inheritdoc />
    public ITrainingRepository Trainings =>
        _trainings ??= GetOrAddSpecificRepository<ITrainingRepository, TrainingRepository>();

    /// <inheritdoc />
    public IEmployeeTrainingRepository EmployeeTrainings =>
        _employeeTrainings ??= GetOrAddSpecificRepository<IEmployeeTrainingRepository, EmployeeTrainingRepository>();

    #endregion

    #region Documents Repositories

    /// <inheritdoc />
    public IEmployeeDocumentRepository EmployeeDocuments =>
        _employeeDocuments ??= GetOrAddSpecificRepository<IEmployeeDocumentRepository, EmployeeDocumentRepository>();

    #endregion

    #region Announcements Repositories

    /// <inheritdoc />
    public IAnnouncementRepository Announcements =>
        _announcements ??= GetOrAddSpecificRepository<IAnnouncementRepository, AnnouncementRepository>();

    /// <inheritdoc />
    public IAnnouncementAcknowledgmentRepository AnnouncementAcknowledgments =>
        _announcementAcknowledgments ??= GetOrAddSpecificRepository<IAnnouncementAcknowledgmentRepository, AnnouncementAcknowledgmentRepository>();

    #endregion

    #region Career and Development Repositories

    /// <inheritdoc />
    public ICareerPathRepository CareerPaths =>
        _careerPaths ??= GetOrAddSpecificRepository<ICareerPathRepository, CareerPathRepository>();

    /// <inheritdoc />
    public ICertificationRepository Certifications =>
        _certifications ??= GetOrAddSpecificRepository<ICertificationRepository, CertificationRepository>();

    /// <inheritdoc />
    public IEmployeeSkillRepository EmployeeSkills =>
        _employeeSkills ??= GetOrAddSpecificRepository<IEmployeeSkillRepository, EmployeeSkillRepository>();

    /// <inheritdoc />
    public ISuccessionPlanRepository SuccessionPlans =>
        _successionPlans ??= GetOrAddSpecificRepository<ISuccessionPlanRepository, SuccessionPlanRepository>();

    #endregion

    #region Disciplinary and Grievance Repositories

    /// <inheritdoc />
    public IDisciplinaryActionRepository DisciplinaryActions =>
        _disciplinaryActions ??= GetOrAddSpecificRepository<IDisciplinaryActionRepository, DisciplinaryActionRepository>();

    /// <inheritdoc />
    public IGrievanceRepository Grievances =>
        _grievances ??= GetOrAddSpecificRepository<IGrievanceRepository, GrievanceRepository>();

    #endregion

    #region Assets and Benefits Repositories

    /// <inheritdoc />
    public IEmployeeAssetRepository EmployeeAssets =>
        _employeeAssets ??= GetOrAddSpecificRepository<IEmployeeAssetRepository, EmployeeAssetRepository>();

    /// <inheritdoc />
    public IEmployeeBenefitRepository EmployeeBenefits =>
        _employeeBenefits ??= GetOrAddSpecificRepository<IEmployeeBenefitRepository, EmployeeBenefitRepository>();

    #endregion

    #region Recruitment Repositories

    /// <inheritdoc />
    public IJobPostingRepository JobPostings =>
        _jobPostings ??= GetOrAddSpecificRepository<IJobPostingRepository, JobPostingRepository>();

    /// <inheritdoc />
    public IJobApplicationRepository JobApplications =>
        _jobApplications ??= GetOrAddSpecificRepository<IJobApplicationRepository, JobApplicationRepository>();

    /// <inheritdoc />
    public IInterviewRepository Interviews =>
        _interviews ??= GetOrAddSpecificRepository<IInterviewRepository, InterviewRepository>();

    /// <inheritdoc />
    public IOnboardingRepository Onboardings =>
        _onboardings ??= GetOrAddSpecificRepository<IOnboardingRepository, OnboardingRepository>();

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
                "CorrelationId: {CorrelationId}, Context: HRDbContext. " +
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
                    "CorrelationId: {CorrelationId}, Context: HRDbContext. " +
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
