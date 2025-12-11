using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Territories.Commands;

public record DeleteTerritoryCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
