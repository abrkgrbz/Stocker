using MediatR;
using Stocker.Application.DTOs.Module;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Queries.GetModuleDefinitionsList;

public record GetModuleDefinitionsListQuery(
    bool? IsActive = null,
    string? Category = null) : IRequest<Result<List<ModuleDefinitionDto>>>;
