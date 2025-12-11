using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Commands.CreateCompetitor;

public record CreateCompetitorCommand(
    Guid TenantId,
    string Name,
    string? Code = null,
    string? Description = null,
    ThreatLevel ThreatLevel = ThreatLevel.Medium) : IRequest<Result<Guid>>;
