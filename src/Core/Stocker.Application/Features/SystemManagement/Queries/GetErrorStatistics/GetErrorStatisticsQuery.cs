using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Queries.GetErrorStatistics;

public record ErrorStatisticsDto
{
    public int TotalErrors { get; init; }
    public int UnresolvedErrors { get; init; }
    public int CriticalErrors { get; init; }
    public Dictionary<string, int> ErrorsBySeverity { get; init; } = new();
    public Dictionary<string, int> ErrorsBySource { get; init; } = new();
    public List<ErrorTrendDto> Last7Days { get; init; } = new();
}

public record ErrorTrendDto
{
    public DateTime Date { get; init; }
    public int Count { get; init; }
}

public class GetErrorStatisticsQuery : IRequest<Result<ErrorStatisticsDto>>
{
}
