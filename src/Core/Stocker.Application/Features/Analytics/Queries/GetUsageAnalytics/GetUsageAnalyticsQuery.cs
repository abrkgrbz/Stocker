using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetUsageAnalytics;

public record GetUsageAnalyticsQuery : IRequest<Result<UsageAnalyticsDto>>;
