using MediatR;
using Stocker.Application.DTOs.Module;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Queries.GetAvailableModules;

public record GetAvailableModulesQuery : IRequest<Result<List<ModuleDefinitionDto>>>;
