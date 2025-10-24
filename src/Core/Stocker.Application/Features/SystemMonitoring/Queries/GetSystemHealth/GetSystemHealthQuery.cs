using MediatR;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemHealth;

public record GetSystemHealthQuery : IRequest<Result<SystemHealthDto>>;
