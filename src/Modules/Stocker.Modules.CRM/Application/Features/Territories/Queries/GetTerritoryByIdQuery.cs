using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Territories.Queries;

public record GetTerritoryByIdQuery(Guid Id) : IRequest<Result<TerritoryDto?>>;
