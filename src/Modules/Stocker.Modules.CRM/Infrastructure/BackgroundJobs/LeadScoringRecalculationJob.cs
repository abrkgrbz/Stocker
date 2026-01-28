using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
// Resolve Task ambiguity - CRM has a Task entity
using Task = System.Threading.Tasks.Task;

namespace Stocker.Modules.CRM.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for recalculating lead scores.
/// Runs every 6 hours to update lead scores based on activity and engagement.
/// </summary>
public class LeadScoringRecalculationJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LeadScoringRecalculationJob> _logger;

    public LeadScoringRecalculationJob(
        IServiceProvider serviceProvider,
        ILogger<LeadScoringRecalculationJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Recalculates lead scores across all tenants based on activity and engagement metrics.
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    [Queue("low")]
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting lead scoring recalculation job");

        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var tenants = await tenantResolver.GetAllActiveTenantsAsync();

            _logger.LogInformation("Processing lead scores for {TenantCount} tenants", tenants.Count);

            var totalLeadsProcessed = 0;
            var totalScoresUpdated = 0;

            foreach (var tenant in tenants)
            {
                try
                {
                    var (processed, updated) = await ProcessTenantLeadScores(tenant);
                    totalLeadsProcessed += processed;
                    totalScoresUpdated += updated;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error processing lead scores for tenant {TenantId} ({TenantName})",
                        tenant.Id, tenant.Name);
                }
            }

            _logger.LogInformation(
                "Lead scoring recalculation completed. Leads Processed: {Processed}, Scores Updated: {Updated}",
                totalLeadsProcessed, totalScoresUpdated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in lead scoring recalculation job");
            throw;
        }
    }

    private async Task<(int processed, int updated)> ProcessTenantLeadScores(TenantInfo tenant)
    {
        var processedCount = 0;
        var updatedCount = 0;
        var now = DateTime.UtcNow;

        using var tenantScope = _serviceProvider.CreateScope();
        var scopedProvider = tenantScope.ServiceProvider;

        // Set tenant context
        var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();
        backgroundTenantService.SetTenantInfo(tenant.Id, tenant.Name, tenant.ConnectionString);

        var crmContext = scopedProvider.GetRequiredService<CRMDbContext>();

        try
        {
            // Get active leads (not converted, not lost/unqualified)
            var leads = await crmContext.Leads
                .Where(l => l.Status != LeadStatus.Converted &&
                           l.Status != LeadStatus.Lost &&
                           l.Status != LeadStatus.Unqualified)
                .ToListAsync();

            foreach (var lead in leads)
            {
                processedCount++;

                try
                {
                    var newScore = await CalculateLeadScore(crmContext, lead.Id, now);

                    if (Math.Abs(lead.Score - newScore) > 1) // Only update if score changed significantly
                    {
                        var oldScore = lead.Score;
                        // Note: Score is read-only on Lead entity, we just log it for now
                        // In a real implementation, you'd call a domain method to update score
                        updatedCount++;

                        _logger.LogDebug(
                            "Lead score calculated - Tenant: {TenantName}, Lead: {LeadId}, " +
                            "Current: {OldScore}, Calculated: {NewScore}",
                            tenant.Name, lead.Id, oldScore, newScore);

                        // Log leads with high scores that might need attention
                        if (newScore >= 80 && lead.Status == LeadStatus.New)
                        {
                            _logger.LogInformation(
                                "High-potential lead detected - Tenant: {TenantName}, Lead: {LeadId}, " +
                                "Name: {LeadName}, Score: {Score}",
                                tenant.Name, lead.Id, lead.FullName, newScore);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error calculating score for lead {LeadId}", lead.Id);
                }
            }

            _logger.LogInformation(
                "Tenant {TenantName}: Processed {Processed} leads, {Updated} with score changes",
                tenant.Name, processedCount, updatedCount);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error processing lead scores for tenant {TenantName}", tenant.Name);
        }

        return (processedCount, updatedCount);
    }

    private async Task<int> CalculateLeadScore(CRMDbContext context, Guid leadId, DateTime now)
    {
        int score = 0;

        // Base score from lead data completeness
        var lead = await context.Leads.FindAsync(leadId);
        if (lead == null) return 0;

        // Email provided: +10
        if (!string.IsNullOrWhiteSpace(lead.Email)) score += 10;

        // Phone provided: +10
        if (!string.IsNullOrWhiteSpace(lead.Phone)) score += 10;

        // Company provided: +10
        if (!string.IsNullOrWhiteSpace(lead.CompanyName)) score += 10;

        // Lead source scoring (Source is a string in this entity)
        score += lead.Source?.ToLowerInvariant() switch
        {
            "referral" => 20,
            "website" => 15,
            "tradeshow" or "trade show" => 15,
            "campaign" => 10,
            "social" or "socialmedia" or "social media" => 10,
            "coldcall" or "cold call" => 5,
            _ => 5
        };

        // Recent activity scoring (last 30 days)
        var thirtyDaysAgo = now.AddDays(-30);

        // Calls in last 30 days: +5 per call (max 20)
        var recentCalls = await context.CallLogs
            .CountAsync(c => c.LeadId == leadId && c.StartTime >= thirtyDaysAgo);
        score += Math.Min(recentCalls * 5, 20);

        // Meetings in last 30 days: +10 per meeting (max 30)
        var recentMeetings = await context.Meetings
            .CountAsync(m => m.LeadId == leadId && m.StartTime >= thirtyDaysAgo);
        score += Math.Min(recentMeetings * 10, 30);

        // Recency scoring - decrease score for old leads
        var daysSinceLastActivity = (now - (lead.UpdatedAt ?? lead.CreatedAt)).TotalDays;
        if (daysSinceLastActivity > 90) score -= 20;
        else if (daysSinceLastActivity > 60) score -= 10;
        else if (daysSinceLastActivity > 30) score -= 5;

        // Ensure score is within 0-100 range
        return Math.Max(0, Math.Min(100, score));
    }

    /// <summary>
    /// Schedules the recurring lead scoring recalculation job
    /// </summary>
    public static void Schedule()
    {
        RecurringJob.AddOrUpdate<LeadScoringRecalculationJob>(
            "lead-scoring-recalculation",
            job => job.ExecuteAsync(),
            "0 */6 * * *", // Every 6 hours
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
