using Stocker.Application.Abstractions.Messaging;
using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemMetrics;

public sealed record GetSystemMetricsQuery : IQuery<SystemMetricsDto>;
