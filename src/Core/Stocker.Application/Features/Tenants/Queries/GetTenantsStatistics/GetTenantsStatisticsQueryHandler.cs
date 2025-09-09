using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Tenant;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantsStatistics;

public class GetTenantsStatisticsQueryHandler : IRequestHandler<GetTenantsStatisticsQuery, Result<TenantsStatisticsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetTenantsStatisticsQueryHandler> _logger;
    private readonly IDateTime _dateTime;

    public GetTenantsStatisticsQueryHandler(
        IApplicationDbContext context,
        ILogger<GetTenantsStatisticsQueryHandler> logger,
        IDateTime dateTime)
    {
        _context = context;
        _logger = logger;
        _dateTime = dateTime;
    }

    public async Task<Result<TenantsStatisticsDto>> Handle(GetTenantsStatisticsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var fromDate = request.FromDate ?? _dateTime.Now.AddMonths(-1);
            var toDate = request.ToDate ?? _dateTime.Now;
            var previousPeriodFrom = fromDate.AddMonths(-1);
            var previousPeriodTo = fromDate;

            // Get all tenants
            var allTenants = await _context.Tenants
                .ToListAsync(cancellationToken);

            // Get current period stats
            var totalTenants = allTenants.Count;
            var activeTenants = allTenants.Count(t => t.IsActive);
            var suspendedTenants = allTenants.Count(t => !t.IsActive);
            var newTenants = allTenants.Count(t => t.CreatedAt >= fromDate && t.CreatedAt <= toDate);
            
            // Get previous period for growth calculation
            var previousNewTenants = allTenants.Count(t => t.CreatedAt >= previousPeriodFrom && t.CreatedAt < previousPeriodTo);
            var monthlyGrowth = previousNewTenants > 0 
                ? ((double)(newTenants - previousNewTenants) / previousNewTenants) * 100 
                : newTenants > 0 ? 100 : 0;

            // Calculate revenue from invoices
            var invoices = await _context.Invoices
                .Where(i => i.IssueDate >= fromDate && i.IssueDate <= toDate)
                .ToListAsync(cancellationToken);
            
            var totalRevenue = invoices.Sum(i => i.TotalAmount.Amount);

            // Get subscription statistics
            var activeSubscriptions = await _context.Subscriptions
                .Include(s => s.Tenant)
                .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif)
                .ToListAsync(cancellationToken);
                
            var expiringTenants = activeSubscriptions.Count(s => 
                s.CurrentPeriodEnd >= _dateTime.Now && 
                s.CurrentPeriodEnd <= _dateTime.Now.AddDays(30));

            var expiredTenants = await _context.Subscriptions
                .CountAsync(s => s.Status == Domain.Master.Enums.SubscriptionStatus.SuresiDoldu, cancellationToken);

            // Get package distribution from subscriptions
            var subscriptions = await _context.Subscriptions
                .Include(s => s.Package)
                .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif)
                .ToListAsync(cancellationToken);
                
            var packageDistribution = subscriptions
                .GroupBy(s => s.Package?.Name ?? "Unknown")
                .Select(g => new PackageDistributionDto
                {
                    PackageName = g.Key,
                    Count = g.Count(),
                    Percentage = totalTenants > 0 ? (double)g.Count() / totalTenants * 100 : 0
                })
                .ToList();

            // Get top tenants by name for now (since UserCount doesn't exist in Tenant entity)
            var topTenantsByUsers = allTenants
                .Where(t => t.IsActive)
                .Take(5)
                .Select(t => new TopTenantDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    UserCount = 0, // Will need to implement user counting separately
                    Revenue = 0
                })
                .ToList();

            var statistics = new TenantsStatisticsDto
            {
                TotalTenants = totalTenants,
                ActiveTenants = activeTenants,
                SuspendedTenants = suspendedTenants,
                NewTenants = newTenants,
                MonthlyGrowth = Math.Round(monthlyGrowth, 2),
                TotalRevenue = totalRevenue,
                ExpiringTenants = expiringTenants,
                ExpiredTenants = expiredTenants,
                PackageDistribution = packageDistribution,
                TopTenantsByUsers = topTenantsByUsers,
                AverageUsersPerTenant = 0, // Will need to implement user counting separately
                TotalUsers = 0 // Will need to implement user counting separately
            };

            return Result<TenantsStatisticsDto>.Success(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tenants statistics");
            return Result<TenantsStatisticsDto>.Failure(Error.Failure("Tenant.Statistics", "An error occurred while getting statistics."));
        }
    }
}