using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetRevenueAnalytics;

public record GetRevenueAnalyticsQuery(
    DateTime? StartDate,
    DateTime? EndDate,
    string Period = "monthly") : IRequest<Result<RevenueAnalyticsDto>>;
