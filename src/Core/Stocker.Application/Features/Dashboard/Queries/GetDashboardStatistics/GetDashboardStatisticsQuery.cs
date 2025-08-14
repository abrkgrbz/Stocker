using MediatR;
using Stocker.Application.DTOs.Dashboard;

namespace Stocker.Application.Features.Dashboard.Queries.GetDashboardStatistics;

public class GetDashboardStatisticsQuery : IRequest<DashboardStatisticsDto>
{
    // No parameters needed for general statistics
}