using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using AuditLog = Stocker.Domain.Tenant.Entities.AuditLog;

namespace Stocker.Modules.HR.Infrastructure.Persistence;

/// <summary>
/// Database context for the HR module
/// </summary>
public class HRDbContext : DbContext, IUnitOfWork
{
    private readonly ITenantService _tenantService;
    private Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? _currentTransaction;

    // Core Employee Management
    public DbSet<Employee> Employees { get; set; } = null!;
    public DbSet<Department> Departments { get; set; } = null!;
    public DbSet<Position> Positions { get; set; } = null!;

    // Work Location and Shift Management
    public DbSet<WorkLocation> WorkLocations { get; set; } = null!;
    public DbSet<Shift> Shifts { get; set; } = null!;
    public DbSet<WorkSchedule> WorkSchedules { get; set; } = null!;

    // Time and Attendance
    public DbSet<Attendance> Attendances { get; set; } = null!;
    public DbSet<Leave> Leaves { get; set; } = null!;
    public DbSet<LeaveType> LeaveTypes { get; set; } = null!;
    public DbSet<LeaveBalance> LeaveBalances { get; set; } = null!;
    public DbSet<Holiday> Holidays { get; set; } = null!;

    // Payroll and Expenses
    public DbSet<Payroll> Payrolls { get; set; } = null!;
    public DbSet<PayrollItem> PayrollItems { get; set; } = null!;
    public DbSet<Expense> Expenses { get; set; } = null!;

    // Performance Management
    public DbSet<PerformanceReview> PerformanceReviews { get; set; } = null!;
    public DbSet<PerformanceGoal> PerformanceGoals { get; set; } = null!;
    public DbSet<PerformanceReviewCriteria> PerformanceReviewCriterias { get; set; } = null!;

    // Training
    public DbSet<Training> Trainings { get; set; } = null!;
    public DbSet<EmployeeTraining> EmployeeTrainings { get; set; } = null!;

    // Documents
    public DbSet<EmployeeDocument> EmployeeDocuments { get; set; } = null!;

    // Announcements
    public DbSet<Announcement> Announcements { get; set; } = null!;
    public DbSet<AnnouncementAcknowledgment> AnnouncementAcknowledgments { get; set; } = null!;

    // Career and Development
    public DbSet<CareerPath> CareerPaths { get; set; } = null!;
    public DbSet<Certification> Certifications { get; set; } = null!;
    public DbSet<EmployeeSkill> EmployeeSkills { get; set; } = null!;
    public DbSet<SuccessionPlan> SuccessionPlans { get; set; } = null!;

    // Disciplinary and Grievance
    public DbSet<DisciplinaryAction> DisciplinaryActions { get; set; } = null!;
    public DbSet<Grievance> Grievances { get; set; } = null!;

    // Assets and Benefits
    public DbSet<EmployeeAsset> EmployeeAssets { get; set; } = null!;
    public DbSet<EmployeeBenefit> EmployeeBenefits { get; set; } = null!;

    // Recruitment
    public DbSet<JobPosting> JobPostings { get; set; } = null!;
    public DbSet<JobApplication> JobApplications { get; set; } = null!;
    public DbSet<Interview> Interviews { get; set; } = null!;
    public DbSet<Onboarding> Onboardings { get; set; } = null!;

    // Time Management
    public DbSet<Overtime> Overtimes { get; set; } = null!;
    public DbSet<TimeSheet> TimeSheets { get; set; } = null!;

    // Payroll Extended
    public DbSet<Payslip> Payslips { get; set; } = null!;

    // Audit Logs
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;

    public HRDbContext(
        DbContextOptions<HRDbContext> options,
        ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(HRDbContext).Assembly);

        // Set default schema for HR module
        modelBuilder.HasDefaultSchema("hr");

        // Apply global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            // Core Employee Management
            modelBuilder.Entity<Employee>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Department>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Position>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Work Location and Shift Management
            modelBuilder.Entity<WorkLocation>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Shift>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<WorkSchedule>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Time and Attendance
            modelBuilder.Entity<Attendance>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Leave>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<LeaveType>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<LeaveBalance>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Holiday>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Payroll and Expenses
            modelBuilder.Entity<Payroll>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PayrollItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Expense>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Performance Management
            modelBuilder.Entity<PerformanceReview>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PerformanceGoal>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PerformanceReviewCriteria>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Training
            modelBuilder.Entity<Training>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<EmployeeTraining>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Documents
            modelBuilder.Entity<EmployeeDocument>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Announcements
            modelBuilder.Entity<Announcement>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<AnnouncementAcknowledgment>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Career and Development
            modelBuilder.Entity<CareerPath>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Certification>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<EmployeeSkill>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SuccessionPlan>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Disciplinary and Grievance
            modelBuilder.Entity<DisciplinaryAction>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Grievance>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Assets and Benefits
            modelBuilder.Entity<EmployeeAsset>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<EmployeeBenefit>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Recruitment
            modelBuilder.Entity<JobPosting>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<JobApplication>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Interview>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Onboarding>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Time Management
            modelBuilder.Entity<Overtime>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<TimeSheet>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Payroll Extended
            modelBuilder.Entity<Payslip>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Audit Log entity
            modelBuilder.Entity<AuditLog>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }

        // Configure AuditLog entity
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs", "hr");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EntityName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EntityId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Action).HasMaxLength(50).IsRequired();
            entity.Property(e => e.UserId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.UserName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.UserEmail).HasMaxLength(255);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            entity.HasIndex(e => new { e.EntityName, e.EntityId });
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.UserId);
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        var tenantId = _tenantService.GetCurrentTenantId();

        if (tenantId.HasValue)
        {
            foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
                {
                    entry.Property(nameof(ITenantEntity.TenantId)).CurrentValue = tenantId.Value;
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }

    #region IUnitOfWork Implementation

    /// <inheritdoc />
    public bool HasActiveTransaction => _currentTransaction != null;

    /// <inheritdoc />
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }

        _currentTransaction = await Database.BeginTransactionAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction == null)
        {
            throw new InvalidOperationException("No transaction is in progress.");
        }

        try
        {
            await SaveChangesAsync(cancellationToken);
            await _currentTransaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }
    }

    /// <inheritdoc />
    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction == null)
        {
            return;
        }

        try
        {
            await _currentTransaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }
    }

    #endregion
}
