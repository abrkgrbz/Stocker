using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.ActivateModuleDefinition;

public record ActivateModuleDefinitionCommand(Guid Id) : IRequest<Result>;
