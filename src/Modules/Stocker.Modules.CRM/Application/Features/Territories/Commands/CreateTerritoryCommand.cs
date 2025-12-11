using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Features.Territories.Commands;

public record CreateTerritoryCommand(
    Guid TenantId,
    string Name,
    string Code,
    TerritoryType TerritoryType = TerritoryType.Region,
    string? Description = null,
    Guid? ParentTerritoryId = null,
    string? Country = null,
    string? CountryCode = null,
    string? Region = null,
    string? City = null,
    string? District = null,
    string? PostalCodeRange = null,
    decimal? SalesTarget = null,
    int? TargetYear = null,
    string Currency = "TRY",
    Guid? AssignedSalesTeamId = null,
    int? PrimarySalesRepId = null,
    string? PrimarySalesRepName = null,
    bool IsActive = true
) : IRequest<Result<Guid>>;
