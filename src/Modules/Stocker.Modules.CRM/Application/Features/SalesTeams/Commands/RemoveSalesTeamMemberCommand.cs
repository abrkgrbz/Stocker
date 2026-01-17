using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public record RemoveSalesTeamMemberCommand(
    Guid SalesTeamId,
    Guid TenantId,
    int UserId
) : IRequest<Result<bool>>;
