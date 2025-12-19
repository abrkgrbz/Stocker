using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.Interfaces;

/// <summary>
/// Unit of Work interface specific to the HR (Human Resources) module.
/// Provides access to HR-specific repositories while inheriting
/// all base UoW functionality (transactions, generic repositories, etc.)
///
/// This interface enables:
/// - Strong typing for dependency injection in HR handlers
/// - Access to domain-specific repositories
/// - Consistent transaction management across HR operations
/// </summary>
/// <remarks>
/// Implementation: <see cref="Infrastructure.Persistence.HRUnitOfWork"/>
/// Pattern: Inherits from IUnitOfWork (Pattern A - BaseUnitOfWork)
/// </remarks>
public interface IHRUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant identifier.
    /// All operations are scoped to this tenant.
    /// </summary>
    Guid TenantId { get; }

    #region Core Employee Management Repositories

    /// <summary>
    /// Gets the Employee repository.
    /// </summary>
    IEmployeeRepository Employees { get; }

    /// <summary>
    /// Gets the Department repository.
    /// </summary>
    IDepartmentRepository Departments { get; }

    /// <summary>
    /// Gets the Position repository.
    /// </summary>
    IPositionRepository Positions { get; }

    #endregion

    #region Work Location and Shift Repositories

    /// <summary>
    /// Gets the Work Location repository.
    /// </summary>
    IWorkLocationRepository WorkLocations { get; }

    /// <summary>
    /// Gets the Shift repository.
    /// </summary>
    IShiftRepository Shifts { get; }

    /// <summary>
    /// Gets the Work Schedule repository.
    /// </summary>
    IWorkScheduleRepository WorkSchedules { get; }

    #endregion

    #region Time and Attendance Repositories

    /// <summary>
    /// Gets the Attendance repository.
    /// </summary>
    IAttendanceRepository Attendances { get; }

    /// <summary>
    /// Gets the Leave repository.
    /// </summary>
    ILeaveRepository Leaves { get; }

    /// <summary>
    /// Gets the Leave Type repository.
    /// </summary>
    ILeaveTypeRepository LeaveTypes { get; }

    /// <summary>
    /// Gets the Leave Balance repository.
    /// </summary>
    ILeaveBalanceRepository LeaveBalances { get; }

    /// <summary>
    /// Gets the Holiday repository.
    /// </summary>
    IHolidayRepository Holidays { get; }

    /// <summary>
    /// Gets the Overtime repository.
    /// </summary>
    IOvertimeRepository Overtimes { get; }

    /// <summary>
    /// Gets the Time Sheet repository.
    /// </summary>
    ITimeSheetRepository TimeSheets { get; }

    #endregion

    #region Payroll and Expenses Repositories

    /// <summary>
    /// Gets the Payroll repository.
    /// </summary>
    IPayrollRepository Payrolls { get; }

    /// <summary>
    /// Gets the Payslip repository.
    /// </summary>
    IPayslipRepository Payslips { get; }

    /// <summary>
    /// Gets the Expense repository.
    /// </summary>
    IExpenseRepository Expenses { get; }

    #endregion

    #region Performance Management Repositories

    /// <summary>
    /// Gets the Performance Review repository.
    /// </summary>
    IPerformanceReviewRepository PerformanceReviews { get; }

    /// <summary>
    /// Gets the Performance Goal repository.
    /// </summary>
    IPerformanceGoalRepository PerformanceGoals { get; }

    #endregion

    #region Training Repositories

    /// <summary>
    /// Gets the Training repository.
    /// </summary>
    ITrainingRepository Trainings { get; }

    /// <summary>
    /// Gets the Employee Training repository.
    /// </summary>
    IEmployeeTrainingRepository EmployeeTrainings { get; }

    #endregion

    #region Documents Repositories

    /// <summary>
    /// Gets the Employee Document repository.
    /// </summary>
    IEmployeeDocumentRepository EmployeeDocuments { get; }

    #endregion

    #region Announcements Repositories

    /// <summary>
    /// Gets the Announcement repository.
    /// </summary>
    IAnnouncementRepository Announcements { get; }

    /// <summary>
    /// Gets the Announcement Acknowledgment repository.
    /// </summary>
    IAnnouncementAcknowledgmentRepository AnnouncementAcknowledgments { get; }

    #endregion

    #region Career and Development Repositories

    /// <summary>
    /// Gets the Career Path repository.
    /// </summary>
    ICareerPathRepository CareerPaths { get; }

    /// <summary>
    /// Gets the Certification repository.
    /// </summary>
    ICertificationRepository Certifications { get; }

    /// <summary>
    /// Gets the Employee Skill repository.
    /// </summary>
    IEmployeeSkillRepository EmployeeSkills { get; }

    /// <summary>
    /// Gets the Succession Plan repository.
    /// </summary>
    ISuccessionPlanRepository SuccessionPlans { get; }

    #endregion

    #region Disciplinary and Grievance Repositories

    /// <summary>
    /// Gets the Disciplinary Action repository.
    /// </summary>
    IDisciplinaryActionRepository DisciplinaryActions { get; }

    /// <summary>
    /// Gets the Grievance repository.
    /// </summary>
    IGrievanceRepository Grievances { get; }

    #endregion

    #region Assets and Benefits Repositories

    /// <summary>
    /// Gets the Employee Asset repository.
    /// </summary>
    IEmployeeAssetRepository EmployeeAssets { get; }

    /// <summary>
    /// Gets the Employee Benefit repository.
    /// </summary>
    IEmployeeBenefitRepository EmployeeBenefits { get; }

    #endregion

    #region Recruitment Repositories

    /// <summary>
    /// Gets the Job Posting repository.
    /// </summary>
    IJobPostingRepository JobPostings { get; }

    /// <summary>
    /// Gets the Job Application repository.
    /// </summary>
    IJobApplicationRepository JobApplications { get; }

    /// <summary>
    /// Gets the Interview repository.
    /// </summary>
    IInterviewRepository Interviews { get; }

    /// <summary>
    /// Gets the Onboarding repository.
    /// </summary>
    IOnboardingRepository Onboardings { get; }

    #endregion
}
