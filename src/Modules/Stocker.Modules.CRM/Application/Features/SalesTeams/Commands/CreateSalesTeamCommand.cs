using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public record CreateSalesTeamCommand(
    Guid TenantId,
    string Name,
    string Code,
    string? Description = null,
    bool IsActive = true,
    int? TeamLeaderId = null,
    string? TeamLeaderName = null,
    Guid? ParentTeamId = null,
    decimal? SalesTarget = null,
    string? TargetPeriod = null,
    string Currency = "TRY",
    Guid? TerritoryId = null,
    string? TerritoryNames = null,
    string? TeamEmail = null,
    string? CommunicationChannel = null
) : IRequest<Result<Guid>>;
