using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Dashboard;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Application.Features.Dashboard.Queries.GetDashboardStatistics;

public class GetDashboardStatisticsQueryHandler : IRequestHandler<GetDashboardStatisticsQuery, DashboardStatisticsDto>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetDashboardStatisticsQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardStatisticsDto> Handle(GetDashboardStatisticsQuery request, CancellationToken cancellationToken)
    {
        // Get all tenants using Repository pattern
        var tenantRepo = _unitOfWork.Repository<Domain.Master.Entities.Tenant>();
        var tenantsQuery = tenantRepo.AsQueryable();
        var allTenants = await tenantsQuery.ToListAsync(cancellationToken);

        var totalTenants = allTenants.Count;
        var activeTenants = allTenants.Count(t => t.IsActive);

        // Get all subscriptions with includes
        var subscriptionRepo = _unitOfWork.Repository<Domain.Master.Entities.Subscription>();
        var subscriptionsQuery = subscriptionRepo.AsQueryable()
            .Include(s => s.Package);
        var allSubscriptions = await subscriptionsQuery.ToListAsync(cancellationToken);

        var activeSubscriptions = allSubscriptions.Count(s => s.Status == SubscriptionStatus.Active);
        var trialSubscriptions = allSubscriptions.Count(s => s.Status == SubscriptionStatus.Trial);

        // Get all users (Master Users)
        var userRepo = _unitOfWork.Repository<Domain.Master.Entities.MasterUser>();
        var usersQuery = userRepo.AsQueryable();
        var totalUsers = await usersQuery.CountAsync(cancellationToken);

        // Calculate revenue (current month and year)
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;

        // Get payments for revenue calculation using BasePrice.Amount
        var monthlyRevenue = allSubscriptions
            .Where(s => s.Status == SubscriptionStatus.Active && 
                       s.CurrentPeriodStart.Month == currentMonth && 
                       s.CurrentPeriodStart.Year == currentYear)
            .Sum(s => s.Price?.Amount ?? 0); // Use subscription's Price property

        var yearlyRevenue = allSubscriptions
            .Where(s => s.Status == SubscriptionStatus.Active && 
                       s.CurrentPeriodStart.Year == currentYear)
            .Sum(s => s.Price?.Amount ?? 0);

        // TODO: Get invoice data when Invoice entity is fully implemented
        var pendingInvoices = 0;
        var overdueInvoices = 0;

        // Get recent activity
        var recentActivity = await GetRecentActivity(cancellationToken);

        return new DashboardStatisticsDto
        {
            TotalTenants = totalTenants,
            ActiveTenants = activeTenants,
            TotalUsers = totalUsers,
            ActiveSubscriptions = activeSubscriptions,
            TrialSubscriptions = trialSubscriptions,
            MonthlyRevenue = monthlyRevenue,
            YearlyRevenue = yearlyRevenue,
            PendingInvoices = pendingInvoices,
            OverdueInvoices = overdueInvoices,
            RecentActivity = recentActivity
        };
    }

    private async Task<List<ActivityDto>> GetRecentActivity(CancellationToken cancellationToken)
    {
        var activities = new List<ActivityDto>();

        // Get recent tenant registrations using CreatedAt property
        var tenantRepo = _unitOfWork.Repository<Domain.Master.Entities.Tenant>();
        var recentTenants = await tenantRepo.AsQueryable()
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .Select(t => new ActivityDto
            {
                Timestamp = t.CreatedAt,
                Type = "TenantRegistration",
                Description = $"New tenant registered: {t.Name}",
                EntityId = t.Id.ToString(),
                EntityName = t.Name,
                UserId = t.CreatedBy,
                UserName = "System"
            })
            .ToListAsync(cancellationToken);

        activities.AddRange(recentTenants);

        // Get recent subscription activations using StartDate
        var subscriptionRepo = _unitOfWork.Repository<Domain.Master.Entities.Subscription>();
        var recentSubscriptions = await subscriptionRepo.AsQueryable()
            .Include(s => s.Tenant)
            .OrderByDescending(s => s.StartDate)
            .Take(5)
            .Select(s => new ActivityDto
            {
                Timestamp = s.StartDate,
                Type = "SubscriptionActivation",
                Description = $"Subscription activated for {s.Tenant.Name}",
                EntityId = s.Id.ToString(),
                EntityName = s.Tenant.Name,
                UserId = null,
                UserName = "System"
            })
            .ToListAsync(cancellationToken);

        activities.AddRange(recentSubscriptions);

        // Sort by timestamp and take top 10
        return activities
            .OrderByDescending(a => a.Timestamp)
            .Take(10)
            .ToList();
    }
}