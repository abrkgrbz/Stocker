using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public record AddSalesTeamMemberCommand(
    Guid SalesTeamId,
    Guid TenantId,
    int UserId,
    string? UserName = null,
    SalesTeamRole Role = SalesTeamRole.Member
) : IRequest<Result<Guid>>;
