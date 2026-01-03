using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.UpdateModuleDefinition;

public record UpdateModuleDefinitionCommand(
    Guid Id,
    string Name,
    string? Description,
    string? Icon,
    decimal MonthlyPrice,
    string Currency,
    bool IsCore,
    int DisplayOrder,
    string? Category) : IRequest<Result>;
