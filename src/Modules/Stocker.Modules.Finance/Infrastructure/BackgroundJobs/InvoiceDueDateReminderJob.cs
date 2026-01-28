using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Finance.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for sending invoice due date reminders.
/// Runs daily at 09:00 UTC to identify invoices due soon or overdue.
/// </summary>
public class InvoiceDueDateReminderJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<InvoiceDueDateReminderJob> _logger;

    public InvoiceDueDateReminderJob(
        IServiceProvider serviceProvider,
        ILogger<InvoiceDueDateReminderJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Checks invoice due dates across all tenants and logs reminders.
    /// Identifies invoices due in 7, 3, 1 days and overdue invoices.
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    [Queue("default")]
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting invoice due date reminder job");

        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var tenants = await tenantResolver.GetAllActiveTenantsAsync();

            _logger.LogInformation("Processing invoices for {TenantCount} tenants", tenants.Count);

            var totalReminders = 0;
            var totalOverdue = 0;

            foreach (var tenant in tenants)
            {
                try
                {
                    var (reminders, overdue) = await ProcessTenantInvoices(tenant);
                    totalReminders += reminders;
                    totalOverdue += overdue;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error processing invoices for tenant {TenantId} ({TenantName})",
                        tenant.Id, tenant.Name);
                }
            }

            _logger.LogInformation(
                "Invoice due date reminder job completed. Reminders: {Reminders}, Overdue: {Overdue}",
                totalReminders, totalOverdue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in invoice due date reminder job");
            throw;
        }
    }

    private async Task<(int reminders, int overdue)> ProcessTenantInvoices(TenantInfo tenant)
    {
        var reminderCount = 0;
        var overdueCount = 0;
        var today = DateTime.UtcNow.Date;

        using var tenantScope = _serviceProvider.CreateScope();
        var scopedProvider = tenantScope.ServiceProvider;

        // Set tenant context
        var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();
        backgroundTenantService.SetTenantInfo(tenant.Id, tenant.Name, tenant.ConnectionString);

        var financeContext = scopedProvider.GetRequiredService<FinanceDbContext>();

        try
        {
            // Reminder thresholds: 7 days, 3 days, 1 day before due date
            var reminderDays = new[] { 7, 3, 1 };

            foreach (var days in reminderDays)
            {
                var targetDate = today.AddDays(days);

                var invoicesDue = await financeContext.Invoices
                    .Where(i => i.InvoiceDate.Date == targetDate)
                    .Where(i => i.Status == InvoiceStatus.Approved ||
                               i.Status == InvoiceStatus.SentToTaxAuthority)
                    .Select(i => new
                    {
                        i.InvoiceNumber,
                        CustomerName = i.CurrentAccountName,
                        i.InvoiceDate,
                        TotalAmount = i.GrandTotal.Amount
                    })
                    .ToListAsync();

                foreach (var invoice in invoicesDue)
                {
                    _logger.LogWarning(
                        "Invoice due in {Days} day(s) - Tenant: {TenantName}, Invoice: {InvoiceNo}, " +
                        "Customer: {Customer}, Due: {DueDate:yyyy-MM-dd}, Amount: {Amount:N2}",
                        days, tenant.Name, invoice.InvoiceNumber,
                        invoice.CustomerName, invoice.InvoiceDate, invoice.TotalAmount);
                    reminderCount++;
                }
            }

            // Find overdue invoices
            var overdueInvoices = await financeContext.Invoices
                .Where(i => i.InvoiceDate.Date < today)
                .Where(i => i.Status == InvoiceStatus.Approved ||
                           i.Status == InvoiceStatus.SentToTaxAuthority)
                .Select(i => new
                {
                    i.InvoiceNumber,
                    CustomerName = i.CurrentAccountName,
                    i.InvoiceDate,
                    TotalAmount = i.GrandTotal.Amount,
                    DaysOverdue = (today - i.InvoiceDate.Date).Days
                })
                .ToListAsync();

            foreach (var invoice in overdueInvoices)
            {
                _logger.LogError(
                    "OVERDUE Invoice - Tenant: {TenantName}, Invoice: {InvoiceNo}, Customer: {Customer}, " +
                    "Due: {DueDate:yyyy-MM-dd}, Days Overdue: {DaysOverdue}, Amount: {Amount:N2}",
                    tenant.Name, invoice.InvoiceNumber, invoice.CustomerName,
                    invoice.InvoiceDate, invoice.DaysOverdue, invoice.TotalAmount);
                overdueCount++;
            }

            // Log summary for the tenant
            if (overdueInvoices.Any())
            {
                var totalOverdueAmount = overdueInvoices.Sum(i => i.TotalAmount);
                _logger.LogWarning(
                    "Tenant {TenantName}: {Count} overdue invoices totaling {Amount:N2}",
                    tenant.Name, overdueInvoices.Count, totalOverdueAmount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error processing invoices for tenant {TenantName}", tenant.Name);
        }

        return (reminderCount, overdueCount);
    }

    /// <summary>
    /// Schedules the recurring invoice due date reminder job
    /// </summary>
    public static void Schedule()
    {
        RecurringJob.AddOrUpdate<InvoiceDueDateReminderJob>(
            "invoice-due-date-reminder",
            job => job.ExecuteAsync(),
            "0 9 * * *", // Daily at 09:00 UTC
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
