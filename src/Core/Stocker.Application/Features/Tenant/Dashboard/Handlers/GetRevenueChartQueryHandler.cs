using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetRevenueChartQueryHandler : IRequestHandler<GetRevenueChartQuery, RevenueChartDto>
{
    public Task<RevenueChartDto> Handle(GetRevenueChartQuery request, CancellationToken cancellationToken)
    {
        // Mock data for now - will be replaced when modules are ready
        var result = new RevenueChartDto
        {
            Labels = new[] { "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran" },
            Datasets = new List<ChartDatasetDto>
            {
                new() {
                    Label = "Gelir",
                    Data = new[] { 85000m, 92000m, 78000m, 95000m, 105000m, 125000m },
                    BorderColor = "#10b981",
                    BackgroundColor = "rgba(16, 185, 129, 0.2)"
                },
                new() {
                    Label = "Gider",
                    Data = new[] { 45000m, 48000m, 42000m, 51000m, 55000m, 62000m },
                    BorderColor = "#ef4444",
                    BackgroundColor = "rgba(239, 68, 68, 0.2)"
                },
                new() {
                    Label = "Kar",
                    Data = new[] { 40000m, 44000m, 36000m, 44000m, 50000m, 63000m },
                    BorderColor = "#3b82f6",
                    BackgroundColor = "rgba(59, 130, 246, 0.2)"
                }
            }
        };

        return Task.FromResult(result);
    }
}