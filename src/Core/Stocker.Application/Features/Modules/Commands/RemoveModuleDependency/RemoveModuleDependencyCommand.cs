using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.RemoveModuleDependency;

public record RemoveModuleDependencyCommand(
    Guid ModuleId,
    string DependentModuleCode) : IRequest<Result>;
