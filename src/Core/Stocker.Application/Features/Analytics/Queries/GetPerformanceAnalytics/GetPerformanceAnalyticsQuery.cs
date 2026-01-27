using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetPerformanceAnalytics;

public record GetPerformanceAnalyticsQuery : IRequest<Result<PerformanceAnalyticsDto>>;
