using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetRevenueChartQueryHandler : IRequestHandler<GetRevenueChartQuery, RevenueChartDto>
{
    private readonly IDashboardRepository _dashboardRepository;

    public GetRevenueChartQueryHandler(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<RevenueChartDto> Handle(GetRevenueChartQuery request, CancellationToken cancellationToken)
    {
        var chartData = await _dashboardRepository.GetRevenueChartDataAsync(request.TenantId, request.Period, cancellationToken);
        
        // Data is already in the correct format
        return chartData;
    }
}