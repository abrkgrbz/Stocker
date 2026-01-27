using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetGrowthAnalytics;

public record GetGrowthAnalyticsQuery : IRequest<Result<GrowthAnalyticsDto>>;
