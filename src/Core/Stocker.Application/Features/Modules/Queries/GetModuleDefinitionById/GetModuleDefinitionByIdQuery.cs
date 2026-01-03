using MediatR;
using Stocker.Application.DTOs.Module;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Queries.GetModuleDefinitionById;

public record GetModuleDefinitionByIdQuery(Guid Id) : IRequest<Result<ModuleDefinitionDto>>;
