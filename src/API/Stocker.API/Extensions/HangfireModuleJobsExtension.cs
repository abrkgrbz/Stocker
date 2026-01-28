using Stocker.Modules.CRM.Infrastructure;
using Stocker.Modules.Finance.Infrastructure;
using Stocker.Modules.HR.Infrastructure;
using Stocker.Modules.Inventory.Infrastructure;
using Stocker.Modules.Purchase.Infrastructure;
using Stocker.Modules.Sales.Infrastructure;

namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for scheduling module-specific Hangfire jobs.
/// This file exists in the API layer where all modules are referenced.
/// </summary>
public static class HangfireModuleJobsExtension
{
    /// <summary>
    /// Schedules all module-specific recurring Hangfire jobs.
    /// Called after Hangfire is initialized in the middleware pipeline.
    /// </summary>
    public static void ScheduleModuleHangfireJobs()
    {
        // ═══════════════════════════════════════════════════════════════
        // MODULE-SPECIFIC HANGFIRE JOBS
        // ═══════════════════════════════════════════════════════════════

        // Inventory Module Jobs
        // - StockReorderAlertJob: Every 4 hours - Checks stock levels and alerts for low stock
        Stocker.Modules.Inventory.Infrastructure.DependencyInjection.ScheduleInventoryJobs();

        // Sales Module Jobs
        // - QuotationExpiryCheckJob: Daily at 01:00 UTC - Expires old quotations
        Stocker.Modules.Sales.Infrastructure.DependencyInjection.ScheduleSalesJobs();

        // Purchase Module Jobs
        // - PurchaseOrderFollowupJob: Daily at 10:00 UTC - Follows up on pending POs
        Stocker.Modules.Purchase.Infrastructure.DependencyInjection.SchedulePurchaseJobs();

        // HR Module Jobs
        // - LeaveBalanceAccrualJob: Monthly on 1st at 00:30 UTC - Accrues leave balances
        Stocker.Modules.HR.Infrastructure.DependencyInjection.ScheduleHRJobs();

        // Finance Module Jobs
        // - InvoiceDueDateReminderJob: Daily at 09:00 UTC - Reminds about due invoices
        Stocker.Modules.Finance.Infrastructure.DependencyInjection.ScheduleFinanceJobs();

        // CRM Module Jobs
        // - LeadScoringRecalculationJob: Every 6 hours - Recalculates lead scores
        // - ReminderJob: Every minute - Processes due reminders
        Stocker.Modules.CRM.Infrastructure.DependencyInjection.ScheduleCRMJobs();

        Console.WriteLine("[Hangfire] Module-specific recurring jobs scheduled");
    }
}
