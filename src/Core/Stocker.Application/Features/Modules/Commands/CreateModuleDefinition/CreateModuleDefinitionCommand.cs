using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.CreateModuleDefinition;

public record CreateModuleDefinitionCommand(
    string Code,
    string Name,
    string? Description,
    string? Icon,
    decimal MonthlyPrice,
    string Currency,
    bool IsCore,
    int DisplayOrder,
    string? Category) : IRequest<Result<Guid>>;
