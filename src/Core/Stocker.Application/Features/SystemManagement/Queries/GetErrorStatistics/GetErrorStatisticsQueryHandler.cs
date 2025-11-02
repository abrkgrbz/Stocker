using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Queries.GetErrorStatistics;

public class GetErrorStatisticsQueryHandler : IRequestHandler<GetErrorStatisticsQuery, Result<ErrorStatisticsDto>>
{
    public async Task<Result<ErrorStatisticsDto>> Handle(GetErrorStatisticsQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement actual statistics calculation from logging system or database
        // For now, return mock data for UI testing
        var statistics = new ErrorStatisticsDto
        {
            TotalErrors = 1247,
            UnresolvedErrors = 23,
            CriticalErrors = 5,
            ErrorsBySeverity = new Dictionary<string, int>
            {
                { "Critical", 5 },
                { "Error", 18 },
                { "Warning", 234 },
                { "Info", 990 }
            },
            ErrorsBySource = new Dictionary<string, int>
            {
                { "Stocker.Application", 450 },
                { "Stocker.Persistence", 320 },
                { "Stocker.Infrastructure", 277 },
                { "Stocker.API", 200 }
            },
            Last7Days = Enumerable.Range(0, 7).Select(i => new ErrorTrendDto
            {
                Date = DateTime.UtcNow.Date.AddDays(-6 + i),
                Count = Random.Shared.Next(10, 50)
            }).ToList()
        };

        return Result<ErrorStatisticsDto>.Success(statistics);
    }
}
