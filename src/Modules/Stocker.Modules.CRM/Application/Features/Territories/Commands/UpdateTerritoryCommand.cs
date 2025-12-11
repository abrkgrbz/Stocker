using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Territories.Commands;

public record UpdateTerritoryCommand(
    Guid Id,
    Guid TenantId,
    string? Name = null,
    string? Code = null,
    string? Description = null,
    string? Country = null,
    string? Region = null,
    string? City = null,
    string? District = null,
    string? PostalCodeRange = null,
    decimal? SalesTarget = null,
    int? TargetYear = null,
    Guid? AssignedSalesTeamId = null,
    int? PrimarySalesRepId = null,
    string? PrimarySalesRepName = null,
    bool? IsActive = null
) : IRequest<Result<bool>>;
