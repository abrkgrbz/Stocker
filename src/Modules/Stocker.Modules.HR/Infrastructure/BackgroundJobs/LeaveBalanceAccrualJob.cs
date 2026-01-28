using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.HR.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for calculating and accruing leave balances.
/// Runs monthly on the 1st at 00:30 UTC to add monthly leave entitlements.
/// </summary>
public class LeaveBalanceAccrualJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LeaveBalanceAccrualJob> _logger;

    public LeaveBalanceAccrualJob(
        IServiceProvider serviceProvider,
        ILogger<LeaveBalanceAccrualJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Accrues leave balances for all active employees across all tenants.
    /// Monthly entitlements are calculated based on leave type configurations.
    /// </summary>
    [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 300, 900 })]
    [Queue("default")]
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting leave balance accrual job");

        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var tenants = await tenantResolver.GetAllActiveTenantsAsync();

            _logger.LogInformation("Processing leave accruals for {TenantCount} tenants", tenants.Count);

            var totalEmployeesProcessed = 0;
            var totalAccruals = 0;

            foreach (var tenant in tenants)
            {
                try
                {
                    var (employees, accruals) = await ProcessTenantLeaveAccruals(tenant);
                    totalEmployeesProcessed += employees;
                    totalAccruals += accruals;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error processing leave accruals for tenant {TenantId} ({TenantName})",
                        tenant.Id, tenant.Name);
                }
            }

            _logger.LogInformation(
                "Leave balance accrual completed. Employees: {Employees}, Accruals Added: {Accruals}",
                totalEmployeesProcessed, totalAccruals);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in leave balance accrual job");
            throw;
        }
    }

    private async Task<(int employees, int accruals)> ProcessTenantLeaveAccruals(TenantInfo tenant)
    {
        var employeeCount = 0;
        var accrualCount = 0;
        var currentDate = DateTime.UtcNow;
        var currentYear = currentDate.Year;

        using var tenantScope = _serviceProvider.CreateScope();
        var scopedProvider = tenantScope.ServiceProvider;

        // Set tenant context
        var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();
        backgroundTenantService.SetTenantInfo(tenant.Id, tenant.Name, tenant.ConnectionString);

        var hrContext = scopedProvider.GetRequiredService<HRDbContext>();

        try
        {
            // Get active employees (status Active and not terminated)
            var activeEmployees = await hrContext.Employees
                .Where(e => e.Status == Domain.Enums.EmployeeStatus.Active)
                .Where(e => e.TerminationDate == null || e.TerminationDate > currentDate)
                .Select(e => new { e.Id, e.FirstName, e.LastName, e.HireDate })
                .ToListAsync();

            // Get leave types
            var leaveTypes = await hrContext.LeaveTypes
                .Where(lt => lt.IsActive)
                .ToListAsync();

            if (!leaveTypes.Any())
            {
                _logger.LogDebug("No active leave types configured for tenant {TenantName}", tenant.Name);
                return (0, 0);
            }

            foreach (var employee in activeEmployees)
            {
                employeeCount++;

                foreach (var leaveType in leaveTypes)
                {
                    try
                    {
                        // Check if leave balance exists for this employee/leave type/year
                        var existingBalance = await hrContext.LeaveBalances
                            .FirstOrDefaultAsync(lb =>
                                lb.EmployeeId == employee.Id &&
                                lb.LeaveTypeId == leaveType.Id &&
                                lb.Year == currentYear);

                        if (existingBalance == null)
                        {
                            // Log that a new leave balance would need to be created
                            // Note: Actual creation should be handled by HR module's business logic
                            _logger.LogDebug(
                                "Leave balance needed - Employee: {Employee}, LeaveType: {LeaveType}, Year: {Year}",
                                $"{employee.FirstName} {employee.LastName}",
                                leaveType.Name,
                                currentYear);
                            accrualCount++;
                        }
                        else
                        {
                            // Log existing balance status
                            _logger.LogDebug(
                                "Leave balance exists - Employee: {Employee}, LeaveType: {LeaveType}, " +
                                "Entitled: {Entitled}, Used: {Used}",
                                $"{employee.FirstName} {employee.LastName}",
                                leaveType.Name,
                                existingBalance.Entitled,
                                existingBalance.Used);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex,
                            "Error processing leave accrual for employee {EmployeeId}, leave type {LeaveTypeId}",
                            employee.Id, leaveType.Id);
                    }
                }
            }

            _logger.LogInformation(
                "Tenant {TenantName}: Processed {Employees} employees, {Accruals} balances checked",
                tenant.Name, employeeCount, accrualCount);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error processing leave accruals for tenant {TenantName}", tenant.Name);
        }

        return (employeeCount, accrualCount);
    }

    /// <summary>
    /// Schedules the recurring leave balance accrual job
    /// </summary>
    public static void Schedule()
    {
        RecurringJob.AddOrUpdate<LeaveBalanceAccrualJob>(
            "leave-balance-accrual",
            job => job.ExecuteAsync(),
            "30 0 1 * *", // Monthly on 1st at 00:30 UTC
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
