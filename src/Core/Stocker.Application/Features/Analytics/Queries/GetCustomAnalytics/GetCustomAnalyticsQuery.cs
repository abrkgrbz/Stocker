using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetCustomAnalytics;

public record GetCustomAnalyticsQuery(CustomAnalyticsRequest Request) : IRequest<Result<CustomAnalyticsResultDto>>;
