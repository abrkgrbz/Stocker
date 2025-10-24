using MediatR;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemMetrics;

public record GetSystemMetricsQuery : IRequest<Result<SystemMetricsDto>>;
