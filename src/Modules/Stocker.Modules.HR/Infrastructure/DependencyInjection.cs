using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;
using Stocker.Modules.HR.Infrastructure.Repositories;
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

        // Register Core Repositories
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<IPositionRepository, PositionRepository>();

        // Register Work Location and Shift Repositories
        services.AddScoped<IWorkLocationRepository, WorkLocationRepository>();
        services.AddScoped<IShiftRepository, ShiftRepository>();
        services.AddScoped<IWorkScheduleRepository, WorkScheduleRepository>();

        // Register Time and Attendance Repositories
        services.AddScoped<IAttendanceRepository, AttendanceRepository>();
        services.AddScoped<ILeaveRepository, LeaveRepository>();
        services.AddScoped<ILeaveBalanceRepository, LeaveBalanceRepository>();
        services.AddScoped<IHolidayRepository, HolidayRepository>();

        // Register Performance Management Repositories
        services.AddScoped<IPerformanceReviewRepository, PerformanceReviewRepository>();
        services.AddScoped<IPerformanceGoalRepository, PerformanceGoalRepository>();

        // Register Training and Documents Repositories
        services.AddScoped<ITrainingRepository, TrainingRepository>();
        services.AddScoped<IEmployeeTrainingRepository, EmployeeTrainingRepository>();
        services.AddScoped<IEmployeeDocumentRepository, EmployeeDocumentRepository>();

        // Register Payroll and Expense Repositories
        services.AddScoped<IPayrollRepository, PayrollRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();

        // Register Leave Type Repository
        services.AddScoped<ILeaveTypeRepository, LeaveTypeRepository>();

        // Register Announcement Repositories
        services.AddScoped<IAnnouncementRepository, AnnouncementRepository>();
        services.AddScoped<IAnnouncementAcknowledgmentRepository, AnnouncementAcknowledgmentRepository>();

        // Register Career and Development Repositories
        services.AddScoped<ICareerPathRepository, CareerPathRepository>();
        services.AddScoped<ICertificationRepository, CertificationRepository>();
        services.AddScoped<IEmployeeSkillRepository, EmployeeSkillRepository>();
        services.AddScoped<ISuccessionPlanRepository, SuccessionPlanRepository>();

        // Register Disciplinary and Grievance Repositories
        services.AddScoped<IDisciplinaryActionRepository, DisciplinaryActionRepository>();
        services.AddScoped<IGrievanceRepository, GrievanceRepository>();

        // Register Asset and Benefit Repositories
        services.AddScoped<IEmployeeAssetRepository, EmployeeAssetRepository>();
        services.AddScoped<IEmployeeBenefitRepository, EmployeeBenefitRepository>();

        // Register Recruitment Repositories
        services.AddScoped<IJobPostingRepository, JobPostingRepository>();
        services.AddScoped<IJobApplicationRepository, JobApplicationRepository>();
        services.AddScoped<IInterviewRepository, InterviewRepository>();
        services.AddScoped<IOnboardingRepository, OnboardingRepository>();

        // Register Time Management Repositories
        services.AddScoped<IOvertimeRepository, OvertimeRepository>();
        services.AddScoped<ITimeSheetRepository, TimeSheetRepository>();

        // Register Payroll Repositories
        services.AddScoped<IPayslipRepository, PayslipRepository>();

        return services;
    }
}
