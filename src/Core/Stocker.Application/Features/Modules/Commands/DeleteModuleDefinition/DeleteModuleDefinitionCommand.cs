using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.DeleteModuleDefinition;

public record DeleteModuleDefinitionCommand(Guid Id) : IRequest<Result>;
