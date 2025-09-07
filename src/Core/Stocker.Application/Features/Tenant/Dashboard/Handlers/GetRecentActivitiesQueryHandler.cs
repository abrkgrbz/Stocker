using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetRecentActivitiesQueryHandler : IRequestHandler<GetRecentActivitiesQuery, List<ActivityDto>>
{
    private readonly IDashboardRepository _dashboardRepository;

    public GetRecentActivitiesQueryHandler(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<List<ActivityDto>> Handle(GetRecentActivitiesQuery request, CancellationToken cancellationToken)
    {
        return await _dashboardRepository.GetRecentActivitiesAsync(request.TenantId, 10, cancellationToken);
    }
}