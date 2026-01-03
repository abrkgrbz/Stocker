using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.AddModuleDependency;

public record AddModuleDependencyCommand(
    Guid ModuleId,
    string DependentModuleCode) : IRequest<Result>;
