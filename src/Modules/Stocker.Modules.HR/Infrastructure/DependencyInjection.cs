using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Domain.Services;
using Stocker.Modules.HR.Infrastructure.BackgroundJobs;
using Stocker.Modules.HR.Infrastructure.Persistence;
using Stocker.Modules.HR.Infrastructure.Repositories;
using Stocker.Modules.HR.Infrastructure.Services;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.Infrastructure;

/// <summary>
/// Dependency injection configuration for HR Infrastructure
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds HR infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddHRInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // HRDbContext is registered dynamically per request based on tenant
        // using ITenantService to get the current tenant's connection string
        services.AddScoped<HRDbContext>(serviceProvider =>
        {
            var tenantService = serviceProvider.GetRequiredService<ITenantService>();
            var connectionString = tenantService.GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<HRDbContext>();
            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(HRDbContext).Assembly.FullName);
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });

            return new HRDbContext(optionsBuilder.Options, tenantService);
        });

        // Register HRUnitOfWork (Pattern A - separate UnitOfWork class)
        services.AddScoped<HRUnitOfWork>();
        services.AddScoped<IHRUnitOfWork>(sp => sp.GetRequiredService<HRUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<HRUnitOfWork>());

        // IMPORTANT: Repository registrations now delegate to IHRUnitOfWork
        // to ensure the same DbContext instance is used for both repository operations
        // and SaveChanges(). This fixes the bug where entities were added to one DbContext
        // but SaveChanges() was called on a different DbContext instance.
        //
        // Handlers can use either:
        //   - IHRUnitOfWork.Employees (recommended for new code)
        //   - IEmployeeRepository (legacy, still supported - now correctly shares DbContext)

        // Core Repositories
        services.AddScoped<IEmployeeRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Employees);
        services.AddScoped<IDepartmentRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Departments);
        services.AddScoped<IPositionRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Positions);

        // Work Location and Shift Repositories
        services.AddScoped<IWorkLocationRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().WorkLocations);
        services.AddScoped<IShiftRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Shifts);
        services.AddScoped<IWorkScheduleRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().WorkSchedules);

        // Time and Attendance Repositories
        services.AddScoped<IAttendanceRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Attendances);
        services.AddScoped<ILeaveRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Leaves);
        services.AddScoped<ILeaveBalanceRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().LeaveBalances);
        services.AddScoped<IHolidayRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Holidays);

        // Performance Management Repositories
        services.AddScoped<IPerformanceReviewRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().PerformanceReviews);
        services.AddScoped<IPerformanceGoalRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().PerformanceGoals);

        // Training and Documents Repositories
        services.AddScoped<ITrainingRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Trainings);
        services.AddScoped<IEmployeeTrainingRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().EmployeeTrainings);
        services.AddScoped<IEmployeeDocumentRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().EmployeeDocuments);

        // Payroll and Expense Repositories
        services.AddScoped<IPayrollRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Payrolls);
        services.AddScoped<IExpenseRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Expenses);

        // Leave Type Repository
        services.AddScoped<ILeaveTypeRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().LeaveTypes);

        // Announcement Repositories
        services.AddScoped<IAnnouncementRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Announcements);
        services.AddScoped<IAnnouncementAcknowledgmentRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().AnnouncementAcknowledgments);

        // Career and Development Repositories
        services.AddScoped<ICareerPathRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().CareerPaths);
        services.AddScoped<ICertificationRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Certifications);
        services.AddScoped<IEmployeeSkillRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().EmployeeSkills);
        services.AddScoped<ISuccessionPlanRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().SuccessionPlans);

        // Disciplinary and Grievance Repositories
        services.AddScoped<IDisciplinaryActionRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().DisciplinaryActions);
        services.AddScoped<IGrievanceRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Grievances);

        // Asset and Benefit Repositories
        services.AddScoped<IEmployeeAssetRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().EmployeeAssets);
        services.AddScoped<IEmployeeBenefitRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().EmployeeBenefits);

        // Recruitment Repositories
        services.AddScoped<IJobPostingRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().JobPostings);
        services.AddScoped<IJobApplicationRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().JobApplications);
        services.AddScoped<IInterviewRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Interviews);
        services.AddScoped<IOnboardingRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Onboardings);

        // Time Management Repositories
        services.AddScoped<IOvertimeRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Overtimes);
        services.AddScoped<ITimeSheetRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().TimeSheets);

        // Payroll Repositories
        services.AddScoped<IPayslipRepository>(sp => sp.GetRequiredService<IHRUnitOfWork>().Payslips);

        // Notification Service
        services.AddScoped<IHrNotificationService, HrNotificationService>();

        // Register Hangfire Background Jobs
        services.AddScoped<LeaveBalanceAccrualJob>();

        return services;
    }

    /// <summary>
    /// Schedules HR module recurring Hangfire jobs.
    /// Called from HangfireConfiguration after Hangfire is initialized.
    /// </summary>
    public static void ScheduleHRJobs()
    {
        // Leave balance accrual - runs monthly on 1st at 00:30 UTC
        LeaveBalanceAccrualJob.Schedule();
    }
}
