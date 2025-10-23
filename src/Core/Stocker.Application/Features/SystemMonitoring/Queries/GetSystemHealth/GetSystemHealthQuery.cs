using Stocker.Application.Abstractions.Messaging;
using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemHealth;

public sealed record GetSystemHealthQuery : IQuery<SystemHealthDto>;
