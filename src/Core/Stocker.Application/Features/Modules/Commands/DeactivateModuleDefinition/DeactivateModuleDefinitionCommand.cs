using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.DeactivateModuleDefinition;

public record DeactivateModuleDefinitionCommand(Guid Id) : IRequest<Result>;
