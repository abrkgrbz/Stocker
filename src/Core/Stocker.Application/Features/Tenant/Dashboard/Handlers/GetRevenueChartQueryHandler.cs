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
        
        // Convert to the expected DTO format
        var result = new RevenueChartDto
        {
            Labels = chartData.Labels.ToArray(),
            Datasets = new List<ChartDatasetDto>
            {
                new() {
                    Label = "Gelir",
                    Data = chartData.Data.ToArray(),
                    BorderColor = "#10b981",
                    BackgroundColor = "rgba(16, 185, 129, 0.2)"
                },
                new() {
                    Label = "Önceki Dönem",
                    Data = chartData.Comparison.ToArray(),
                    BorderColor = "#6b7280",
                    BackgroundColor = "rgba(107, 114, 128, 0.2)"
                }
            }
        };

        return result;
    }
}