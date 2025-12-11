using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public record DeleteSalesTeamCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
