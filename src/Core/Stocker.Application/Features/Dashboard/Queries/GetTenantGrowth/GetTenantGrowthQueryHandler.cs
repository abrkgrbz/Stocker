using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Dashboard;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Application.Features.Dashboard.Queries.GetTenantGrowth;

public class GetTenantGrowthQueryHandler : IRequestHandler<GetTenantGrowthQuery, TenantGrowthDto>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetTenantGrowthQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantGrowthDto> Handle(GetTenantGrowthQuery request, CancellationToken cancellationToken)
    {
        var currentDate = DateTime.UtcNow;
        var startDate = currentDate.AddMonths(-request.Months);

        // Get all tenants created in the specified period using CreatedAt
        var tenantRepo = _unitOfWork.Repository<Domain.Master.Entities.Tenant>();
        var tenants = await tenantRepo.AsQueryable()
            .Where(t => t.CreatedAt >= startDate)
            .ToListAsync(cancellationToken);

        // Current month statistics
        var currentMonthStart = new DateTime(currentDate.Year, currentDate.Month, 1);
        var currentMonthNewTenants = tenants.Count(t => t.CreatedAt >= currentMonthStart);

        // Last month statistics
        var lastMonthStart = currentMonthStart.AddMonths(-1);
        var lastMonthEnd = currentMonthStart.AddDays(-1);
        var lastMonthNewTenants = tenants.Count(t => t.CreatedAt >= lastMonthStart && t.CreatedAt <= lastMonthEnd);

        // Calculate growth rate
        var growthRate = lastMonthNewTenants > 0
            ? ((decimal)(currentMonthNewTenants - lastMonthNewTenants) / lastMonthNewTenants) * 100
            : currentMonthNewTenants > 0 ? 100 : 0;

        // Calculate churn rate (tenants that became inactive)
        var inactiveTenants = tenants.Count(t => !t.IsActive);
        var totalTenants = tenants.Count;
        var churnRate = totalTenants > 0 ? ((decimal)inactiveTenants / totalTenants) * 100 : 0;

        // Monthly growth breakdown
        var monthlyGrowth = new List<MonthlyGrowthDto>();
        
        for (int i = request.Months - 1; i >= 0; i--)
        {
            var monthStart = currentDate.AddMonths(-i);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);
            var monthStartDate = new DateTime(monthStart.Year, monthStart.Month, 1);
            var monthEndDate = new DateTime(monthEnd.Year, monthEnd.Month, DateTime.DaysInMonth(monthEnd.Year, monthEnd.Month));

            var newTenantsInMonth = tenants.Count(t => 
                t.CreatedAt >= monthStartDate && 
                t.CreatedAt <= monthEndDate);

            var churnedTenantsInMonth = tenants.Count(t => 
                !t.IsActive && 
                t.UpdatedAt.HasValue &&
                t.UpdatedAt >= monthStartDate && 
                t.UpdatedAt <= monthEndDate);

            monthlyGrowth.Add(new MonthlyGrowthDto
            {
                Month = monthStart.ToString("MMM yyyy"),
                NewTenants = newTenantsInMonth,
                ChurnedTenants = churnedTenantsInMonth,
                NetGrowth = newTenantsInMonth - churnedTenantsInMonth
            });
        }

        return new TenantGrowthDto
        {
            CurrentMonthNewTenants = currentMonthNewTenants,
            LastMonthNewTenants = lastMonthNewTenants,
            GrowthRate = Math.Round(growthRate, 2),
            ChurnRate = Math.Round(churnRate, 2),
            MonthlyGrowth = monthlyGrowth
        };
    }
}