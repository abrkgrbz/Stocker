using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Territories.Queries;

public record GetTerritoriesQuery(
    TerritoryType? TerritoryType = null,
    Guid? ParentTerritoryId = null,
    bool? IsActive = null,
    string? Country = null,
    string? Region = null,
    int Skip = 0,
    int Take = 100
) : IRequest<Result<List<TerritoryDto>>>;
