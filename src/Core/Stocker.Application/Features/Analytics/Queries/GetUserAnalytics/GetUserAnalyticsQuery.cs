using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetUserAnalytics;

public record GetUserAnalyticsQuery(string Period = "monthly") : IRequest<Result<UserAnalyticsDto>>;
