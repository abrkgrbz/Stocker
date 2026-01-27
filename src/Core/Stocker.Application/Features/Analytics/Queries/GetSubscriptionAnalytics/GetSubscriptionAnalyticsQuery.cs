using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetSubscriptionAnalytics;

public record GetSubscriptionAnalyticsQuery : IRequest<Result<SubscriptionAnalyticsDto>>;
