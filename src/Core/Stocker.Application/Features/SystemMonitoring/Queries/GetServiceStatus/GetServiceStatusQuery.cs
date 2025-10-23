using Stocker.Application.Abstractions.Messaging;
using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetServiceStatus;

public sealed record GetServiceStatusQuery : IQuery<List<ServiceStatusDto>>;
