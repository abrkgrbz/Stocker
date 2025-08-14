using MediatR;
using Stocker.Application.DTOs.Dashboard;

namespace Stocker.Application.Features.Dashboard.Queries.GetTenantGrowth;

public class GetTenantGrowthQuery : IRequest<TenantGrowthDto>
{
    public int Months { get; set; } = 6;
}